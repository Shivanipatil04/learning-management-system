const express = require("express");
const protect = require("../auth/auth.middleware");
const reviewController = require("./review.controller");

const router = express.Router();

const restrictToStudent = (req, res, next) => {
  if (req.user && req.user.userType === "student") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Only students can perform this action" });
  }
};

// All review routes are protected and only for students
router.use(protect);
router.use(restrictToStudent);

router.post("/", reviewController.createReview);
router.get("/mine", reviewController.getStudentReviews);
router.get("/reviewable", reviewController.getReviewableItems);
router.put("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;
