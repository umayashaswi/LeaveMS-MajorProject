const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: {
      type: String,
      enum: ["Faculty", "HOD", "Admin"],
      required: true,
    },

     gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    department: {
  type: String,
  required: true
}, 
    subject: { type: String },
    dob: { type: Date },
    joiningDate: { type: Date },
    maritalStatus: { type: String },

    // 🔥 NEW FIELDS FOR PROFILE PAGE 🔥
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    employeeId: { type: String, default: "" },
    designation: { type: String, default: "" },
    experience: { type: String, default: "" },
    qualification: { type: String, default: "" },
    
    // Timetable is stored as an object to match the frontend structure
    timetable: { type: Object, default: {} },
    
    isVerified: { type: Boolean, default: false },
    emailOtp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
