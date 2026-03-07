const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const leaveController = require("../controllers/leaveController");

/* ---------- Faculty ---------- */
router.post(
  "/apply",
  authMiddleware,
  roleMiddleware(["Faculty"]),
  leaveController.applyLeave
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware(["Faculty"]),
  leaveController.getMyLeaves
);

router.get("/available-faculty", authMiddleware, leaveController.getAvailableFacultyDynamic);

// 🔥 NEW: Get substitution requests assigned to me
router.get(
  "/substitutions",
  authMiddleware,
  roleMiddleware(["Faculty"]),
  leaveController.getSubstitutionRequests
);
router.put("/reassign/:leaveId/:subId", authMiddleware, roleMiddleware(["Faculty"]), leaveController.reassignSubstitute);
// 🔥 NEW: Respond to a substitution request (Accept/Decline)
router.put(
  "/substitution/:leaveId/:subId",
  authMiddleware,
  roleMiddleware(["Faculty"]),
  leaveController.respondToSubstitution
);

/* ---------- HOD ---------- */

// View department leaves
router.get(
  "/hod",
  authMiddleware,
  roleMiddleware(["HOD"]),
  leaveController.getLeavesForHOD
);

// Approve / Reject / Forward (Unified)
router.put(
  "/:id/action",
  authMiddleware,
  roleMiddleware(["HOD"]),
  leaveController.updateLeaveStatus
);

module.exports = router;