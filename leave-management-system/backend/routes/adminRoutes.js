const express = require("express");
const router = express.Router();
const {
  getAllLeaves,
  takeAdminAction,
  getAdminStats,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/verifyAdmin");

router.get("/leaves", authMiddleware, verifyAdmin, getAllLeaves);
router.put("/leave/:id", authMiddleware, verifyAdmin, takeAdminAction);
router.get("/stats", authMiddleware, verifyAdmin, getAdminStats);
module.exports = router;