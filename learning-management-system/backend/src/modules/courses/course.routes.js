const express = require("express");
const router = express.Router();
const courseController = require("./course.controller");
const protect = require("../auth/auth.middleware");
const activeContractGuard = require("../../middlewares/activeContractGuard");

router.get("/", courseController.getAllCourses);
router.get("/:id", courseController.getCourseById);
router.post("/:id/enroll", protect, courseController.enrollInCourse);

// Teacher content creation routes (protected by activeContractGuard)
router.post("/", protect, activeContractGuard, (req, res) => res.status(201).json({ success: true, message: "Course created" }));
router.put("/:id", protect, activeContractGuard, (req, res) => res.status(200).json({ success: true, message: "Course updated" }));

module.exports = router;
