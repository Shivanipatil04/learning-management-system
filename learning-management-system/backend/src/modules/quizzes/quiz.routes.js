const express = require("express");
const protect = require("../auth/auth.middleware");
const activeContractGuard = require("../../middlewares/activeContractGuard");
const quizController = require("./quiz.controller");

const router = express.Router();

router.use(protect);

const restrictToTeacher = (req, res, next) => {
  if (req.user && req.user.userType === "teacher") next();
  else res.status(403).json({ success: false, message: "Only teachers can perform this action" });
};

const restrictToStudent = (req, res, next) => {
  if (req.user && req.user.userType === "student") next();
  else res.status(403).json({ success: false, message: "Only students can perform this action" });
};

// Teacher Routes
// activeContractGuard is applied only to state-modifying endpoints
router.post("/teacher", restrictToTeacher, activeContractGuard, quizController.createQuiz);
router.put("/teacher/:id", restrictToTeacher, activeContractGuard, quizController.updateQuiz);
router.delete("/teacher/:id", restrictToTeacher, activeContractGuard, quizController.deleteQuiz);
router.get("/teacher", restrictToTeacher, quizController.getTeacherQuizzes);
router.get("/teacher/:id/results", restrictToTeacher, quizController.getTeacherQuizResults);
router.get("/teacher/:id/analytics", restrictToTeacher, quizController.getTeacherQuizAnalytics);

// Student Routes
router.get("/student", restrictToStudent, quizController.getStudentQuizzes);
router.get("/student/:id", restrictToStudent, quizController.getQuizDetails);
router.post("/student/:id/attempt", restrictToStudent, quizController.submitQuizAttempt);

module.exports = router;
