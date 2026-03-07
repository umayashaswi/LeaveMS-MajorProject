const LeaveRequest = require("../models/LeaveRequest");

/* ===============================================
   ADMIN VIEW ALL LEAVES
=============================================== */
const Leave = require("../models/LeaveRequest");

exports.getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("faculty", "name subject department")
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

/* ===============================================
   ADMIN TAKE ACTION
=============================================== */
exports.takeAdminAction = async (req, res) => {
  try {
    const { status, comment } = req.body;

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: "Leave not found" });
    }

    // Only forwarded leaves can be processed by Admin
    if (leave.status !== "FORWARDED") {
      return res.status(400).json({
        message: "Only forwarded leaves can be processed by Admin",
      });
    }

    if (status === "REJECTED" && !comment) {
      return res.status(400).json({
        message: "Rejection reason required",
      });
    }

    leave.status = status;
    leave.adminComment = comment || "";
    leave.forwardedToAdmin = false;

    await leave.save();

    res.json({
      message: `Leave ${status.toLowerCase()} by Admin`,
      leave,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
/* ===============================================
   ADMIN STATS
=============================================== */

exports.getAdminStats = async (req, res) => {
  try {
    const total = await LeaveRequest.countDocuments();

    const pending = await LeaveRequest.countDocuments({
      status: "PENDING",
    });

    const approved = await LeaveRequest.countDocuments({
      status: "APPROVED",
    });

    const rejected = await LeaveRequest.countDocuments({
      status: "REJECTED",
    });

    // Department analytics
    const byDepartment = await LeaveRequest.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "faculty",
          foreignField: "_id",
          as: "faculty",
        },
      },
      { $unwind: "$faculty" },
      {
        $group: {
          _id: "$faculty.department",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      total,
      pending,
      approved,
      rejected,
      byDepartment: byDepartment.map((d) => ({
        department: d._id,
        count: d.count,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};