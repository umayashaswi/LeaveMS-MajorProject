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

    subject: { type: String },
    dob: { type: Date },
    joiningDate: { type: Date },
    maritalStatus: { type: String },

    isVerified: { type: Boolean, default: false },
    emailOtp: { type: String },
    otpExpiry: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
