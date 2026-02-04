const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const leaveController = require("../controllers/leaveController");

// Faculty applies leave
router.post("/apply", authMiddleware, leaveController.applyLeave);

router.get("/hod", authMiddleware, leaveController.getLeavesForHOD);
router.put("/:id/action", authMiddleware, leaveController.updateLeaveStatus);
router.get("/my", authMiddleware, leaveController.getMyLeaves);


module.exports = router;
