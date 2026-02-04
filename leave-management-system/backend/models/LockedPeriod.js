const mongoose = require("mongoose");

const lockedPeriodSchema = new mongoose.Schema({
  startDate: Date,
  endDate: Date,
  reason: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // HOD
  },
});

module.exports = mongoose.model("LockedPeriod", lockedPeriodSchema);
