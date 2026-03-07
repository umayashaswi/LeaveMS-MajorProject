const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Helper for Admin Check
const adminOnly = roleMiddleware(["Admin"]);

// Admin: Send Message
router.post("/send", authMiddleware, adminOnly, async (req, res) => {
  try {
    const newMessage = new Message({ ...req.body, sender: req.user.id });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get All Messages
router.get("/admin/all", authMiddleware, adminOnly, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Toggle Pin
router.put("/pin/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Not found" });
    msg.pinned = !msg.pinned;
    await msg.save();
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Delete
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ... (your existing Admin routes)

// 🔥 ADD THIS: HOD specific route to get notices
// 🔥 ADD THIS BLOCK - HOD Route to get notices
router.get("/hod/my", authMiddleware, async (req, res) => {
  try {
    // This finds Broadcasts OR messages sent to this HOD's specific department
    const messages = await Message.find({
      $or: [
        { type: "broadcast" },
        { recipientDept: req.user.department }
      ]
    }).sort({ pinned: -1, createdAt: -1 });

    res.json(messages);
  } catch (err) {
    console.error("Error fetching HOD notices:", err);
    res.status(500).json({ message: "Server error fetching notices" });
  }
});

module.exports = router;