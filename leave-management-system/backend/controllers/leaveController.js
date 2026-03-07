const LeaveRequest = require("../models/LeaveRequest");
const LockedPeriod = require("../models/LockedPeriod");

/* =====================================================
    FACULTY APPLY LEAVE (with Loop Prevention)
===================================================== */
exports.applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason, substitutions } = req.body;
    const { gender, maritalStatus, id: userId } = req.user; // Get userId from req.user

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }

    // 🔥 1. SUBSTITUTION-TO-LEAVE LOOP PREVENTION 🔥
    // Check if this faculty is already an "ACCEPTED" substitute for someone else during these dates
    const substitutionConflict = await LeaveRequest.findOne({
      status: { $ne: "REJECTED" }, // Ignore rejected leaves
      "substitutions": {
        $elemMatch: {
          substituteFaculty: userId,
          status: "ACCEPTED",
          date: { $gte: start, $lte: end } // Falls within the new leave period
        }
      }
    });

    if (substitutionConflict) {
      // Find the specific date from the array to show in the error message
      const conflictSlot = substitutionConflict.substitutions.find(
        s => s.substituteFaculty.toString() === userId && 
        s.status === "ACCEPTED" &&
        s.date >= start && s.date <= end
      );

      const formattedDate = new Date(conflictSlot.date).toLocaleDateString("en-IN");
      
      return res.status(400).json({
        message: `Application Blocked: You have already accepted a substitution duty for ${substitutionConflict.faculty?.name || 'another faculty'} on ${formattedDate}. Please revoke that commitment or contact the faculty before applying for leave.`
      });
    }

    // 2. Maternity rule
    if (leaveType === "Maternity" && (gender !== "Female" || maritalStatus !== "Married")) {
      return res.status(400).json({ message: "Maternity leave is only applicable for married female employees" });
    }

    // 3. Paternity rule
    if (leaveType === "Paternity" && (gender !== "Male" || maritalStatus !== "Married")) {
      return res.status(400).json({ message: "Paternity leave is only applicable for married male employees" });
    }

    // 4. Locked period check
    const clash = await LockedPeriod.findOne({
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (clash) {
      return res.status(400).json({ message: `Leave blocked: ${clash.reason}` });
    }

    // 5. Create Leave Request
    const leave = await LeaveRequest.create({
      faculty: userId,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      substitutions: substitutions.map(sub => ({
        ...sub,
        status: "PENDING"
      })),
      status: "PENDING",
    });

    res.status(201).json({
      message: "Leave applied successfully",
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* =====================================================
   HOD VIEW DEPARTMENT LEAVES
===================================================== */
exports.getLeavesForHOD = async (req, res) => {
  try {
    const { department } = req.user;

    // 1. If HOD has no department, return an error or a message
    if (!department) {
       console.log("Warning: HOD has no department assigned.");
       // Optional: return res.status(400).json({ message: "HOD department not assigned" });
    }

    const leaves = await LeaveRequest.find()
      .populate({
        path: "faculty",
        // We only match if department exists, otherwise it might filter everything out
        match: department ? { department } : {}, 
        select: "name email subject department",
      })
      .populate({
        path: "substitutions.substituteFaculty",
        select: "name subject"
      })
      .sort({ createdAt: -1 });

    // 2. Filter out leaves where the faculty didn't match the HOD's department
    // If HOD department is missing, this filter might remove everything.
    const filteredLeaves = leaves.filter((l) => l.faculty !== null);

    res.json(filteredLeaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
    HOD APPROVE / REJECT / FORWARD
===================================================== */
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status, hodComment } = req.body;
    const allowedStatuses = ["APPROVED", "REJECTED", "FORWARDED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leave = await LeaveRequest.findById(req.params.id).populate("faculty");

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    // SECURITY checks...
    if (leave.faculty.department !== req.user.department) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    if (leave.status !== "PENDING") {
      return res.status(400).json({ message: "Only pending leaves can be updated" });
    }

    if (status === "APPROVED" || status === "FORWARDED") {
      const allSubsAccepted = leave.substitutions.every(sub => sub.status === "ACCEPTED");
      if (!allSubsAccepted && leave.substitutions.length > 0) {
        return res.status(400).json({ 
          message: "Cannot approve until all substitutes have accepted." 
        });
      }
    }

    if ((status === "REJECTED" || status === "FORWARDED") && !hodComment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    // Update the leave status
    leave.status = status;
    leave.hodComment = hodComment || "";

    if (status === "FORWARDED") {
      leave.forwardedToAdmin = true;
    }

    // 🔥 COLLISION LOGIC START 🔥
    if (status === "APPROVED") {
      for (const sub of leave.substitutions) {
        if (sub.status === "ACCEPTED") {
          // Find ANY OTHER leave request that is PENDING and uses this same person for this slot
          const conflictingLeaves = await LeaveRequest.find({
            _id: { $ne: leave._id }, // Don't target current leave
            status: "PENDING",
            "substitutions": {
              $elemMatch: {
                date: sub.date,
                period: sub.period,
                substituteFaculty: sub.substituteFaculty,
                status: { $ne: "DECLINED" }
              }
            }
          });

          // Mark those specific slots in OTHER leaves as DECLINED
          for (const conflict of conflictingLeaves) {
            let wasModified = false;
            conflict.substitutions.forEach(s => {
              // Convert to ISO string to compare dates accurately
              if (
                s.date.toISOString() === sub.date.toISOString() &&
                s.period === sub.period &&
                s.substituteFaculty.toString() === sub.substituteFaculty.toString()
              ) {
                s.status = "DECLINED";
                wasModified = true;
              }
            });

            if (wasModified) {
              conflict.markModified('substitutions');
              await conflict.save();
            }
          }
        }
      }
    }
    // 🔥 COLLISION LOGIC END 🔥

    await leave.save();

    res.status(200).json({
      message: `Leave ${status.toLowerCase()} successfully`,
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/* =====================================================
   FACULTY VIEW OWN LEAVES
===================================================== */
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({
      faculty: req.user.id,
    })
      .populate({
        path: "substitutions.substituteFaculty",
        select: "name subject",
      })
      .sort({ createdAt: -1 });

    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* =====================================================
   FACULTY VIEW SUBSTITUTION REQUESTS (Assigned to them)
===================================================== */
exports.getSubstitutionRequests = async (req, res) => {
  try {
    // Find leaves where this user is listed in the substitutions array
    const leaves = await LeaveRequest.find({
      "substitutions.substituteFaculty": req.user.id,
      // 🔥 Get both Pending and Rejected so we can show "Cancelled"
      status: { $in: ["PENDING", "REJECTED"] }
    })
      .populate("faculty", "name subject department")
      .sort({ createdAt: -1 });

    res.status(200).json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =====================================================
    FACULTY ACCEPT / DECLINE / REVOKE SUBSTITUTION
===================================================== */
exports.respondToSubstitution = async (req, res) => {
  try {
    const { leaveId, subId } = req.params;
    const { status } = req.body; // Status will be "ACCEPTED", "DECLINED" (Revoke uses DECLINED)

    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) return res.status(404).json({ message: "Leave request not found" });

    if (leave.status === "APPROVED" || leave.status === "FORWARDED") {
      return res.status(400).json({ 
        message: "This leave is already Approved. You cannot revoke substitution now. Please contact the HOD." 
      });
    }

    // 🛡️ SAFETY CHECK: Locked after HOD Approval
    if (leave.status === "APPROVED" || leave.status === "FORWARDED") {
      return res.status(400).json({ 
        message: "Action blocked: This leave has already been processed by the HOD. Please contact your HOD to make changes." 
      });
    }

    const substitution = leave.substitutions.id(subId);
    if (!substitution) return res.status(404).json({ message: "Substitution slot not found" });

    // 🛡️ SECURITY CHECK: Is this the assigned substitute?
    if (substitution.substituteFaculty.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized: This substitution is not assigned to you." });
    }

    // 🔄 LOGIC: If the user is Revoking (changing ACCEPTED -> DECLINED)
    const isRevoking = substitution.status === "ACCEPTED" && status === "DECLINED";

    // Update the status
    substitution.status = status;
    
    // Explicitly mark as modified for Mongoose
    leave.markModified('substitutions'); 
    await leave.save();

    res.status(200).json({ 
      message: isRevoking ? "Substitution revoked successfully" : `Substitution ${status.toLowerCase()} successfully`, 
      leave 
    });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* =====================================================
   FACULTY RE-ASSIGN SUBSTITUTE (After a Decline)
===================================================== */
exports.reassignSubstitute = async (req, res) => {
  try {
    const { leaveId, subId } = req.params;
    const { newSubstituteId } = req.body;

    const leave = await LeaveRequest.findById(leaveId);
    if (!leave) return res.status(404).json({ message: "Leave not found" });

    // Security: Only the owner of the leave can re-assign
    if (leave.faculty.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const substitution = leave.substitutions.id(subId);
    if (!substitution) return res.status(404).json({ message: "Slot not found" });

    // Update with the new faculty and reset status to PENDING
    substitution.substituteFaculty = newSubstituteId;
    substitution.status = "PENDING";

    leave.markModified('substitutions');
    await leave.save();

    res.status(200).json({ message: "Substitute re-assigned successfully", leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* =====================================================
   GET TRULY AVAILABLE FACULTY (Conflict Aware)
===================================================== */
exports.getAvailableFacultyDynamic = async (req, res) => {
  try {
    const { date, period } = req.query; // e.g. ?date=2026-03-05&period=2
    const currentUserId = req.user.id;

    // 1. Get all faculty (except the one applying)
    const allFaculty = await User.find({ 
      role: "Faculty", 
      role: {$ne:"HOD"},
      _id: { $ne: currentUserId } 
    }).select("name subject timetable");

    // 2. Find all substitutions already "booked" for this date and period
    // This looks across ALL leave requests in the system
    const bookedSubstitutions = await LeaveRequest.find({
      status: { $in: ["PENDING", "APPROVED", "FORWARDED"] },
      "substitutions": {
        $elemMatch: {
          date: new Date(date),
          period: parseInt(period),
          status: { $ne: "DECLINED" } // Ignore if the substitute already said no
        }
      }
    }).select("substitutions.substituteFaculty");

    // Extract just the IDs of busy substitutes
    const busySubstituteIds = bookedSubstitutions.flatMap(leave => 
      leave.substitutions
        .filter(s => s.period === parseInt(period)) // match specific period
        .map(s => s.substituteFaculty.toString())
    );

    // 3. Filter the faculty list
    const availableFaculty = allFaculty.filter(f => {
      // Check A: Are they already substituting for someone else?
      if (f.role === "HOD") return false;
      if (busySubstituteIds.includes(f._id.toString())) return false;

      // Check B: Does their static timetable show them as busy?
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayName = days[new Date(date).getDay()];
      
      if (f.timetable && f.timetable[dayName]) {
        const subject = f.timetable[dayName][period.toString()];
        if (subject && subject.trim() !== "") return false; // They have a class
      }

      return true; // They are truly free!
    });

    res.json(availableFaculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};