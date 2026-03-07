const LeaveRequest = require("../models/LeaveRequest");

exports.getHodAnalytics = async (req, res) => {
  try {
    const { department } = req.user;

    const data = await LeaveRequest.aggregate([
      {
        $lookup: {
          from: "users", // collection name (usually lowercase plural)
          localField: "faculty",
          foreignField: "_id",
          as: "facultyData",
        },
      },
      { $unwind: "$facultyData" },

      {
        $match: {
          "facultyData.department": department,
        },
      },

      {
        $group: {
          _id: { $month: "$startDate" },
          count: { $sum: 1 },
        },
      },

      { $sort: { _id: 1 } },
    ]);

    const formatted = data.map((item) => ({
      month: new Date(0, item._id - 1).toLocaleString("en-IN", {
        month: "short",
      }),
      count: item.count,
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};