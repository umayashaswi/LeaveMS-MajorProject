const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  type: { type: String, enum: ["broadcast", "direct"], required: true },
  category: { type: String, enum: ["general", "leave-lock", "fest", "exam", "urgent"], default: "general" },
  title: { type: String, required: true },
  content: { type: String, required: true },
  recipientDept: { type: String }, // For Direct Messages
  recipientName: { type: String },
  pinned: { type: Boolean, default: false },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin ID
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", messageSchema);