const LeaveRequest = require("../models/LeaveRequest");
const LockedPeriod = require("../models/LockedPeriod");

exports.applyLeave = async (req, res) => {
  try {
    // 🔐 Role check
    if (req.user.role !== "Faculty") {
      return res.status(403).json({
        message: "Only Faculty can apply for leave",
      });
    }

    const { leaveType, startDate, endDate } = req.body;
    const { gender, maritalStatus } = req.user;

    // 🚫 Maternity rule
    if (
      leaveType === "Maternity" &&
      (gender !== "Female" || maritalStatus !== "Married")
    ) {
      return res.status(400).json({
        message:
          "Maternity leave is only applicable for married female employees",
      });
    }

    // 🚫 Paternity rule
    if (
      leaveType === "Paternity" &&
      (gender !== "Male" || maritalStatus !== "Married")
    ) {
      return res.status(400).json({
        message:
          "Paternity leave is only applicable for married male employees",
      });
    }

    // 🔒 Locked period check
    const clash = await LockedPeriod.findOne({
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    if (clash) {
      return res.status(400).json({
        message: `Leave blocked: ${clash.reason}`,
      });
    }

    // ✅ Create leave
    const leave = await LeaveRequest.create({
      faculty: req.user.id,
      leaveType,
      startDate,
      endDate,
      reason: req.body.reason,
      substituteFaculty: req.body.substituteFaculty,
      status: "PENDING",
    });

    return res.status(201).json({
      message: "Leave applied successfully",
      leave,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



exports.getLeavesForHOD = async (req, res) => {
  try {
    if (req.user.role !== "HOD") {
      return res.status(403).json({ message: "Access denied" });
    }

    const leaves = await LeaveRequest.find({ status: "PENDING" })
      .populate("faculty", "name email subject");

    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * HOD: Approve or Reject leave
 */
exports.updateLeaveStatus = async (req, res) => {
  try {
    if (req.user.role !== "HOD") {
      return res.status(403).json({ message: "Access denied" });
    }

    const { status, rejectionReason } = req.body;

    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    leave.status = status;

    if (status === "REJECTED") {
      leave.rejectionReason = rejectionReason || "Not specified";
    }

    await leave.save();

    res.status(200).json({
      message: `Leave ${status.toLowerCase()} successfully`,
      leave,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({
      faculty: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(leaves);
  } catch (err) {
    console.error("GET MY LEAVES ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
