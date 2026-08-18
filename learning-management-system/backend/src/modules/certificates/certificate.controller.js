const Certificate = require('./certificate.model');
const Course = require('../courses/course.model');
const Enrollment = require('../enrollments/enrollment.model');
const Quiz = require('../quizzes/quiz.model');
const QuizAttempt = require('../quizzes/quizAttempt.model');
const Contract = require('../contracts/contract.model');
const crypto = require('crypto');

exports.getEligibleStudents = async (req, res, next) => {
  try {
    const teacherId = req.user._id || req.user.id;

    // Get all courses owned by teacher
    const courses = await Course.find({ teacherId });
    const courseIds = courses.map(c => c._id);

    // Get all completed enrollments for these courses
    const enrollments = await Enrollment.find({
      courseId: { : courseIds },
      : [{ status: 'COMPLETED' }, { progress: { : 100 } }]
    }).populate('studentId', 'name email').populate('courseId', 'title');

    // Get all quizzes for these courses
    const quizzes = await Quiz.find({ courseId: { : courseIds } });
    
    // Group quizzes by courseId
    const quizzesByCourse = {};
    quizzes.forEach(q => {
      if (!quizzesByCourse[q.courseId.toString()]) {
        quizzesByCourse[q.courseId.toString()] = [];
      }
      quizzesByCourse[q.courseId.toString()].push(q._id.toString());
    });

    const eligibleStudents = [];

    for (const enrollment of enrollments) {
      if (!enrollment.studentId || !enrollment.courseId) continue;
      
      const courseIdStr = enrollment.courseId._id.toString();
      const courseQuizzes = quizzesByCourse[courseIdStr] || [];
      
      let allQuizzesPassed = true;
      let totalQuizScore = 0;
      let quizCount = 0;

      if (courseQuizzes.length > 0) {
        // Check if student has passed all quizzes
        const passedAttempts = await QuizAttempt.find({
          studentId: enrollment.studentId._id,
          quizId: { : courseQuizzes },
          status: 'passed'
        });

        const passedQuizIds = new Set(passedAttempts.map(a => a.quizId.toString()));
        allQuizzesPassed = courseQuizzes.every(qId => passedQuizIds.has(qId));
        
        passedAttempts.forEach(a => { totalQuizScore += a.percentage; });
        quizCount = passedAttempts.length;
      }

      if (allQuizzesPassed) {
        // Check if certificate already issued
        const existingCert = await Certificate.findOne({
          studentId: enrollment.studentId._id,
          courseId: enrollment.courseId._id
        });

        if (!existingCert) {
          eligibleStudents.push({
            studentId: enrollment.studentId,
            courseId: enrollment.courseId,
            progress: enrollment.progress,
            quizScore: quizCount > 0 ? Math.round(totalQuizScore / quizCount) : null,
            completionDate: enrollment.updatedAt
          });
        }
      }
    }

    res.status(200).json({ success: true, data: eligibleStudents });
  } catch (error) {
    next(error);
  }
};

exports.issueCertificate = async (req, res, next) => {
  try {
    const teacherId = req.user._id || req.user.id;
    const { studentId, courseId, completionDate } = req.body;

    // Verify active contract
    const activeContract = await Contract.findOne({ teacherId, status: 'Active' });
    if (!activeContract) {
      return res.status(403).json({ success: false, message: 'You must have an active contract to issue certificates.' });
    }

    // Verify course belongs to teacher
    const course = await Course.findOne({ _id: courseId, teacherId });
    if (!course) {
      return res.status(403).json({ success: false, message: 'Course not found or not owned by you.' });
    }

    // Check duplicate
    const existingCert = await Certificate.findOne({ studentId, courseId });
    if (existingCert) {
      return res.status(400).json({ success: false, message: 'Certificate already issued for this student and course.' });
    }

    const certificateId = 'CERT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const verificationCode = crypto.randomBytes(16).toString('hex');

    const certificate = await Certificate.create({
      certificateId,
      studentId,
      teacherId,
      courseId,
      completionDate: completionDate || new Date(),
      verificationCode
    });

    res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    next(error);
  }
};

exports.getIssuedCertificates = async (req, res, next) => {
  try {
    const teacherId = req.user._id || req.user.id;
    
    const certificates = await Certificate.find({ teacherId })
      .populate('studentId', 'name email')
      .populate('courseId', 'title')
      .sort({ issueDate: -1 });

    res.status(200).json({ success: true, data: certificates });
  } catch (error) {
    next(error);
  }
};

exports.getMyCertificates = async (req, res, next) => {
  try {
    const studentId = req.user._id || req.user.id;
    
    const certificates = await Certificate.find({ studentId })
      .populate('teacherId', 'name')
      .populate('courseId', 'title')
      .sort({ issueDate: -1 });

    res.status(200).json({ success: true, data: certificates });
  } catch (error) {
    next(error);
  }
};
