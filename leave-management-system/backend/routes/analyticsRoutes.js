const express = require("express");
const router = express.Router();
const { getHodAnalytics } = require("../controllers/analyticsController");
const protect = require("../middleware/authMiddleware");

router.get("/hod", protect, getHodAnalytics);

module.exports = router;