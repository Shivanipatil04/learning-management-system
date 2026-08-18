const Quiz = require("./quiz.model");
const QuizAttempt = require("./quizAttempt.model");
const Course = require("../courses/course.model");
const StudentProfile = require("../users/studentProfile.model");


exports.createQuiz = async (req, res, next) => {
  try {
    const teacherId = req.user.id || req.user._id;
    const { title, courseId, instructions, status, totalMarks, passingPercentage, timeLimit, maxAttempts, startDate, dueDate, questions } = req.body;

    const course = await Course.findOne({ _id: courseId, teacher: teacherId });
    if (!course) {
      return res.status(403).json({ success: false, message: "You can only create quizzes for your own courses." });
    }

    const quiz = await Quiz.create({
      title, courseId, teacherId, instructions, status, totalMarks, passingPercentage, timeLimit, maxAttempts, startDate, dueDate, questions
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

exports.updateQuiz = async (req, res, next) => {
  try {
    const teacherId = req.user.id || req.user._id;
    const quizId = req.params.id;

    const quiz = await Quiz.findOne({ _id: quizId, teacherId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found or you don't have permission to edit it." });
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(quizId, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updatedQuiz });
  } catch (error) {
    next(error);
  }
};

exports.deleteQuiz = async (req, res, next) => {
  try {
    const teacherId = req.user.id || req.user._id;
    const quizId = req.params.id;

    const quiz = await Quiz.findOneAndDelete({ _id: quizId, teacherId });
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found or unauthorized." });
    }

    // Delete associated attempts
    await QuizAttempt.deleteMany({ quizId });

    res.status(200).json({ success: true, message: "Quiz deleted successfully." });
  } catch (error) {
    next(error);
  }
};

exports.getTeacherQuizzes = async (req, res, next) => {
  try {
    const teacherId = req.user.id || req.user._id;
    const quizzes = await Quiz.find({ teacherId }).populate("courseId", "title").sort("-createdAt");
    res.status(200).json({ success: true, data: quizzes });
  } catch (error) {
    next(error);
  }
};

exports.getTeacherQuizResults = async (req, res, next) => {
  try {
    const teacherId = req.user.id || req.user._id;
    const quizId = req.params.id;

    const quiz = await Quiz.findOne({ _id: quizId, teacherId });
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });

    const attempts = await QuizAttempt.find({ quizId }).populate("studentId", "name email").sort("-createdAt");
    res.status(200).json({ success: true, data: attempts });
  } catch (error) {
    next(error);
  }
};

exports.getTeacherQuizAnalytics = async (req, res, next) => {
  try {
    const teacherId = req.user.id || req.user._id;
    const quizId = req.params.id;

    const quiz = await Quiz.findOne({ _id: quizId, teacherId });
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });

    const attempts = await QuizAttempt.find({ quizId });
    
    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter(a => a.status === "passed").length;
    const averageScore = totalAttempts > 0 
      ? attempts.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts 
      : 0;
    
    const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

    res.status(200).json({ 
      success: true, 
      data: { totalAttempts, averageScore, passRate } 
    });
  } catch (error) {
    next(error);
  }
};


exports.getStudentQuizzes = async (req, res, next) => {
  try {
    const studentId = req.user.id || req.user._id;

    const profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile || !profile.enrolledCourses || profile.enrolledCourses.length === 0) {
      return res.status(200).json({ success: true, data: { available: [], upcoming: [], completed: [], results: [] } });
    }

    const quizzes = await Quiz.find({
      courseId: { $in: profile.enrolledCourses },
      status: "published"
    }).populate("courseId", "title").populate("teacherId", "name");

    const attempts = await QuizAttempt.find({ studentId }).populate({
      path: "quizId",
      populate: { path: "courseId teacherId", select: "title name" }
    });

    const attemptCounts = {};
    attempts.forEach(a => {
      attemptCounts[a.quizId._id] = (attemptCounts[a.quizId._id] || 0) + 1;
    });

    const available = [];
    const upcoming = [];
    const completed = [];
    const results = attempts;

    const now = new Date();

    quizzes.forEach(quiz => {
      const attemptsCount = attemptCounts[quiz._id] || 0;
      const isCompleted = attemptsCount >= quiz.maxAttempts;
      
      if (isCompleted) {
        completed.push(quiz);
      } else {
        if (quiz.startDate && new Date(quiz.startDate) > now) {
          upcoming.push(quiz);
        } else if (quiz.dueDate && new Date(quiz.dueDate) < now) {
          completed.push(quiz); // Overdue but maybe incomplete, treat as closed for new attempts
        } else {
          available.push(quiz);
        }
      }
    });

    res.status(200).json({ success: true, data: { available, upcoming, completed, results } });
  } catch (error) {
    next(error);
  }
};

exports.getQuizDetails = async (req, res, next) => {
  try {
    const studentId = req.user.id || req.user._id;
    const quiz = await Quiz.findById(req.params.id).populate("courseId", "title").populate("teacherId", "name");
    
    if (!quiz || quiz.status !== "published") return res.status(404).json({ success: false, message: "Quiz not found or not published" });

    const profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile || !profile.enrolledCourses.includes(quiz.courseId._id)) {
      return res.status(403).json({ success: false, message: "You are not enrolled in this course." });
    }

    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    next(error);
  }
};

exports.submitQuizAttempt = async (req, res, next) => {
  try {
    const studentId = req.user.id || req.user._id;
    const quizId = req.params.id;
    const { answers } = req.body; // array of { questionId, selectedOptions: [0, 1] }

    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.status !== "published") return res.status(404).json({ success: false, message: "Quiz not available." });

    const now = new Date();
    if (quiz.startDate && new Date(quiz.startDate) > now) return res.status(403).json({ success: false, message: "Quiz has not started yet." });
    if (quiz.dueDate && new Date(quiz.dueDate) < now) return res.status(403).json({ success: false, message: "Quiz has already ended." });

    const profile = await StudentProfile.findOne({ userId: studentId });
    if (!profile || !profile.enrolledCourses.includes(quiz.courseId)) {
      return res.status(403).json({ success: false, message: "You are not enrolled." });
    }

    const previousAttemptsCount = await QuizAttempt.countDocuments({ studentId, quizId });
    if (previousAttemptsCount >= quiz.maxAttempts) {
      return res.status(403).json({ success: false, message: "Maximum attempts reached." });
    }

    let score = 0;
    const processedAnswers = [];

    quiz.questions.forEach(question => {
      const studentAnswer = answers.find(a => a.questionId === question._id.toString());
      const selected = studentAnswer ? studentAnswer.selectedOptions || [] : [];
      
      
      const isCorrect = question.correctOptions.length === selected.length && 
                        question.correctOptions.every(val => selected.includes(val));
      
      if (isCorrect) score += question.marks;

      processedAnswers.push({
        questionId: question._id,
        selectedOptions: selected,
        isCorrect
      });
    });

    const percentage = (score / quiz.totalMarks) * 100;
    const status = percentage >= quiz.passingPercentage ? "passed" : "failed";

    const attempt = await QuizAttempt.create({
      studentId,
      quizId,
      score,
      percentage,
      status,
      attemptNumber: previousAttemptsCount + 1,
      answers: processedAnswers
    });

    res.status(201).json({ success: true, data: attempt, percentage, status });
  } catch (error) {
    next(error);
  }
};
