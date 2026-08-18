const mongoose = require("mongoose");
const Enrollment = require("./enrollment.model");
const Course = require("../courses/course.model");
const Lesson = require("../courses/lesson.model");
const StudentProfile = require("../users/studentProfile.model");
const Payment = require("../payments/payment.model");

const httpError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const studentIdFor = (user) => user?.id || user?._id;

const assertStudent = (user) => {
  const studentId = studentIdFor(user);
  if (!studentId || user?.userType !== "student") {
    throw httpError("Only authenticated students can use enrollment services", 403);
  }
  if (!mongoose.isValidObjectId(studentId)) throw httpError("Invalid student id", 400);
  return studentId;
};

const assertObjectId = (value, label) => {
  if (!mongoose.isValidObjectId(value)) throw httpError(`Invalid ${label}`, 400);
};

const courseProjection = "title description thumbnail price teacherId coachingClassId status";

const enrollStudent = async (user, courseId) => {
  const studentId = assertStudent(user);
  assertObjectId(courseId, "course id");

  const course = await Course.findById(courseId).lean();
  if (!course || course.status !== "PUBLISHED") throw httpError("Published course not found", 404);

  const existing = await Enrollment.findOne({ studentId, courseId }).lean();
  if (existing) throw httpError("You are already enrolled in this course", 409);

  if (course.price > 0) {
    const payment = await Payment.findOne({
      studentId,
      courseId,
      paymentStatus: "Completed",
    }).lean();
    if (!payment) throw httpError("Payment is required before enrolling in this course", 402);
  }

  let enrollment;
  try {
    enrollment = await Enrollment.create({ studentId, courseId });
  } catch (error) {
    if (error.code === 11000) throw httpError("You are already enrolled in this course", 409);
    throw error;
  }

  await StudentProfile.findOneAndUpdate(
    { userId: studentId },
    { $addToSet: { enrolledCourses: courseId } },
    { upsert: true, setDefaultsOnInsert: true }
  );

  return Enrollment.findById(enrollment._id)
    .populate({ path: "courseId", select: courseProjection })
    .lean();
};

const getStudentEnrollments = async (user) => {
  const studentId = assertStudent(user);
  return Enrollment.find({ studentId })
    .populate({ path: "courseId", select: courseProjection })
    .sort({ enrolledAt: -1 })
    .lean();
};

const getEnrollment = async (user, enrollmentId) => {
  const studentId = assertStudent(user);
  assertObjectId(enrollmentId, "enrollment id");
  const enrollment = await Enrollment.findOne({ _id: enrollmentId, studentId })
    .populate({ path: "courseId", select: courseProjection })
    .lean();
  if (!enrollment) throw httpError("Enrollment not found", 404);
  return enrollment;
};

const getCourseEnrollment = async (user, courseId) => {
  const studentId = assertStudent(user);
  assertObjectId(courseId, "course id");
  const enrollment = await Enrollment.findOne({ studentId, courseId })
    .populate({ path: "courseId", select: courseProjection })
    .lean();
  return enrollment || null;
};

const updateLessonProgress = async (user, courseId, lessonId) => {
  const studentId = assertStudent(user);
  assertObjectId(courseId, "course id");
  assertObjectId(lessonId, "lesson id");

  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment) throw httpError("Enrollment not found", 404);

  const lesson = await Lesson.findOne({ _id: lessonId, courseId }).lean();
  if (!lesson) throw httpError("Lesson not found for this course", 404);

  const alreadyCompleted = enrollment.completedLessons.some((id) => String(id) === String(lessonId));
  if (!alreadyCompleted) enrollment.completedLessons.push(lessonId);

  const totalLessons = await Lesson.countDocuments({ courseId });
  const completedCount = enrollment.completedLessons.length;
  const progress = totalLessons ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;
  enrollment.progress = progress;
  enrollment.lastAccessedLesson = lessonId;
  enrollment.status = progress === 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "ENROLLED";
  enrollment.completedAt = progress === 100 ? (enrollment.completedAt || new Date()) : null;
  await enrollment.save();

  return Enrollment.findById(enrollment._id)
    .populate({ path: "courseId", select: courseProjection })
    .populate({ path: "lastAccessedLesson", select: "title description videoUrl order" })
    .lean();
};

const getCourseProgress = async (user, courseId) => {
  const enrollment = await getCourseEnrollment(user, courseId);
  if (!enrollment) throw httpError("Enrollment not found", 404);
  return {
    enrollmentId: enrollment._id,
    courseId: enrollment.courseId,
    status: enrollment.status,
    progress: enrollment.progress,
    completedLessons: enrollment.completedLessons,
    lastAccessedLesson: enrollment.lastAccessedLesson,
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completedAt,
  };
};

module.exports = {
  enrollStudent,
  getStudentEnrollments,
  getEnrollment,
  getCourseEnrollment,
  updateLessonProgress,
  getCourseProgress,
};
