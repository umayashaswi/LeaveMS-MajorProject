const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ⛔ make hod optional for now
    hod: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    leaveType: {
      type: String,
      enum: [
        "Casual",
        "Vacation",
        "Medical",
        "Maternity",
        "Paternity",
        "Research",
        "Study",
        "Special",
      ],
      required: true,
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    reason: { type: String, required: true },

    substituteFaculty: {
      type: String,
      required: true,
    },

    rejectionReason: {
      type: String,
      default: "",
    },
    status: {
  type: String,
  enum: ["PENDING", "APPROVED", "REJECTED", "FORWARDED"],
  default: "PENDING",
},

hodComment: {
  type: String,
  default: "",
},

forwardedToAdmin: {
  type: Boolean,
  default: false,
},

  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveRequest", leaveRequestSchema);
