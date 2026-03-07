const User = require("../models/User");

// Existing function (UPDATED FOR SMART FILTERING)
// facultyController.js

exports.getAllFaculty = async (req, res) => {
  try {
    // 🔥 CHANGE: allow both Faculty AND HOD roles
    const faculty = await User.find({ 
      role: { $in: ["Faculty", "HOD"] } 
    }).select(
      "name subject _id timetable role department" // 🔥 ADDED role and department here!
    );
    
    res.status(200).json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔥 NEW: Get logged-in user profile
exports.getMe = async (req, res) => {
  try {
    const faculty = await User.findById(req.user.id).select("-password");
    if (!faculty) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 NEW: Update profile details
// 🔥 NEW: Update profile details
exports.updateProfile = async (req, res) => {
  try {
    // 👇 ADDED department, subject, and joiningDate here 👇
    const { 
      name, phone, dob, address, maritalStatus, gender, 
      employeeId, designation, experience, qualification,
      department, subject, joiningDate 
    } = req.body;
    
    const updatedFaculty = await User.findByIdAndUpdate(
      req.user.id,
      { 
        // 👇 AND ADDED them here so they get saved to MongoDB 👇
        name, phone, dob, address, maritalStatus, gender,
        employeeId, designation, experience, qualification,
        department, subject, joiningDate
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedFaculty) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedFaculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 🔥 NEW: Update timetable
exports.updateTimetable = async (req, res) => {
  try {
    const { timetable } = req.body;
    
    const updatedFaculty = await User.findByIdAndUpdate(
      req.user.id,
      { timetable },
      { new: true }
    ).select("-password");

    if (!updatedFaculty) {
        return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedFaculty);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};