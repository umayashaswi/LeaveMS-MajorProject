const express = require("express");
const router = express.Router();

// 1. We must import the ENTIRE controller object here
const facultyController = require("../controllers/facultyController"); 

// 2. Import your middleware (Make sure your folder is named 'middleware', no 's')
const authMiddleware = require("../middleware/authMiddleware");

// 3. Your routes
router.get("/all", authMiddleware, facultyController.getAllFaculty);
router.get("/me", authMiddleware, facultyController.getMe);
router.put("/update", authMiddleware, facultyController.updateProfile);
router.put("/timetable", authMiddleware, facultyController.updateTimetable);

module.exports = router;