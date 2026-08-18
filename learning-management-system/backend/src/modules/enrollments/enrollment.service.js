const mongoose = require("mongoose");
const Enrollment = require("./enrollment.model");
const Course = require("../courses/course.model");
const Lesson = require("../courses/lesson.model");
const StudentProfile = require("../users/studentProfile.model");
const CoachingClassProfile = require("../coachingClass/coachingClassProfile.model");
const Payment = require("../payments/payment.model");
const { createNotification } = require("../notifications/notification.service");
const { videoReadyFilter, isVideoReady } = require("../courses/lessonAvailability");

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

const refreshEnrollmentProgress = async (enrollment) => {
  const availableLessons = await Lesson.find({ courseId: enrollment.courseId, ...videoReadyFilter }).select("_id order").sort({ order: 1 }).lean();
  const availableIds = new Set(availableLessons.map((lesson) => String(lesson._id)));
  const completedLessons = enrollment.completedLessons.filter((lessonId) => availableIds.has(String(lessonId)));
  const progress = availableLessons.length ? Math.min(100, Math.round((completedLessons.length / availableLessons.length) * 100)) : 0;
  const completedSet = new Set(completedLessons.map(String));
  const currentLast = enrollment.lastAccessedLesson && availableIds.has(String(enrollment.lastAccessedLesson)) && !completedSet.has(String(enrollment.lastAccessedLesson))
    ? enrollment.lastAccessedLesson
    : availableLessons.find((lesson) => !completedSet.has(String(lesson._id)))?._id || availableLessons[0]?._id || null;
  enrollment.completedLessons = completedLessons;
  enrollment.progress = progress;
  enrollment.lastAccessedLesson = currentLast;
  enrollment.status = progress === 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "ENROLLED";
  enrollment.completedAt = progress === 100 ? (enrollment.completedAt || new Date()) : null;
  await enrollment.save();
  return enrollment;
};

const getLearningData = async (user, courseId) => {
  const studentId = assertStudent(user);
  assertObjectId(courseId, "course id");
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment) throw httpError("Enrollment required to access course learning", 403);
  await refreshEnrollmentProgress(enrollment);
  const course = await Course.findOne({ _id: courseId, status: "PUBLISHED" }).select(courseProjection).lean();
  if (!course) throw httpError("Published course not found", 404);
  const lessons = await Lesson.find({ courseId, ...videoReadyFilter }).sort({ order: 1 }).select("title description content videoUrl video order").lean();
  return { course, lessons, enrollment: enrollment.toObject() };
};

const getStudentProgress = async (user) => {
  const studentId = assertStudent(user);
  const enrollments = await Enrollment.find({ studentId });
  await Promise.all(enrollments.map(refreshEnrollmentProgress));
  return Enrollment.find({ studentId })
    .populate({ path: "courseId", select: courseProjection, populate: { path: "teacherId", select: "name email" } })
    .populate({ path: "lastAccessedLesson", select: "title order" })
    .sort({ updatedAt: -1 })
    .lean();
};

const getCourseStudents = async (user, courseId) => {
  const userId = studentIdFor(user);
  assertObjectId(courseId, "course id");
  if (!userId || !["teacher", "coachingClassAdmin", "superAdmin"].includes(user?.userType)) throw httpError("Insufficient permission", 403);
  const course = await Course.findById(courseId).select("teacherId coachingClassId title").lean();
  if (!course) throw httpError("Course not found", 404);
  if (user.userType === "teacher" && String(course.teacherId) !== String(userId)) throw httpError("You do not own this course", 403);
  if (user.userType === "coachingClassAdmin") { const profile = await CoachingClassProfile.findOne({ userId }).select("_id").lean(); if (!profile || String(course.coachingClassId) !== String(profile._id)) throw httpError("Course is outside your class scope", 403); }
  return Enrollment.find({ courseId })
    .populate({ path: "studentId", select: "name email phone" })
    .populate({ path: "lastAccessedLesson", select: "title order" })
    .sort({ enrolledAt: -1 })
    .lean();
};

const getAdminEnrollments = async (user) => {
  if (!user?.id || !["coachingClassAdmin", "superAdmin"].includes(user.userType)) throw httpError("Insufficient permission", 403);
  const filter = {};
  if (user.userType === "coachingClassAdmin") {
    const profile = await CoachingClassProfile.findOne({ userId: user.id }).select("_id").lean();
    const courses = profile ? await Course.find({ coachingClassId: profile._id }).select("_id").lean() : [];
    filter.courseId = { $in: courses.map((course) => course._id) };
  }
  return Enrollment.find(filter)
    .populate({ path: "studentId", select: "name email" })
    .populate({ path: "courseId", select: "title teacherId coachingClassId" , populate: { path: "teacherId", select: "name email" } })
    .populate({ path: "lastAccessedLesson", select: "title order" })
    .sort({ enrolledAt: -1 })
    .lean();
};

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

  await Promise.all([
    createNotification({ eventKey: `COURSE_ENROLLED:student:${studentId}:course:${courseId}`, recipientId: studentId, recipientRole: "student", courseId, type: "COURSE_ENROLLED", title: "Course enrollment confirmed", message: `You are now enrolled in ${course.title}.` }),
    course.teacherId ? createNotification({ eventKey: `COURSE_ENROLLED:teacher:${course.teacherId}:student:${studentId}:course:${courseId}`, recipientId: course.teacherId, recipientRole: "teacher", courseId, type: "COURSE_ENROLLED", title: "New course enrollment", message: `A student enrolled in ${course.title}.` }) : null,
  ]).catch((error) => console.error("Unable to create enrollment notification:", error));

  return Enrollment.findById(enrollment._id)
    .populate({ path: "courseId", select: courseProjection })
    .lean();
};

const getStudentEnrollments = async (user) => {
  const studentId = assertStudent(user);
  const enrollments = await Enrollment.find({ studentId });
  await Promise.all(enrollments.map(refreshEnrollmentProgress));
  return Enrollment.find({ studentId })
    .populate({ path: "courseId", select: courseProjection, populate: { path: "teacherId", select: "name email" } })
    .sort({ enrolledAt: -1 })
    .lean();
};

const getEnrollment = async (user, enrollmentId) => {
  const studentId = assertStudent(user);
  assertObjectId(enrollmentId, "enrollment id");
  const enrollment = await Enrollment.findOne({ _id: enrollmentId, studentId });
  if (!enrollment) throw httpError("Enrollment not found", 404);
  await refreshEnrollmentProgress(enrollment);
  return Enrollment.findById(enrollment._id)
    .populate({ path: "courseId", select: courseProjection, populate: { path: "teacherId", select: "name email" } })
    .lean();
};

const getCourseEnrollment = async (user, courseId) => {
  const studentId = assertStudent(user);
  assertObjectId(courseId, "course id");
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (enrollment) await refreshEnrollmentProgress(enrollment);
  const populatedEnrollment = enrollment && await Enrollment.findById(enrollment._id)
    .populate({ path: "courseId", select: courseProjection, populate: { path: "teacherId", select: "name email" } })
    .lean();
  return populatedEnrollment || null;
};

const updateLessonProgress = async (user, courseId, lessonId) => {
  const studentId = assertStudent(user);
  assertObjectId(courseId, "course id");
  assertObjectId(lessonId, "lesson id");

  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment) throw httpError("Enrollment not found", 404);

  const lesson = await Lesson.findOne({ _id: lessonId, courseId }).lean();
  if (!lesson) throw httpError("Lesson not found for this course", 404);

  if (!isVideoReady(lesson)) throw httpError("Lesson video is not available yet.", 409);
  await refreshEnrollmentProgress(enrollment);
  const alreadyCompleted = enrollment.completedLessons.some((id) => String(id) === String(lessonId));
  if (!alreadyCompleted) enrollment.completedLessons.push(lessonId);

  const totalLessons = await Lesson.countDocuments({ courseId, ...videoReadyFilter });
  const completedCount = enrollment.completedLessons.length;
  const progress = totalLessons ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;
  enrollment.progress = progress;
  enrollment.lastAccessedLesson = lessonId;
  enrollment.status = progress === 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "ENROLLED";
  enrollment.completedAt = progress === 100 ? (enrollment.completedAt || new Date()) : null;
  await enrollment.save();

  if (progress === 100) {
    const course = await Course.findById(courseId).select("title teacherId").lean();
    await Promise.all([
      createNotification({ eventKey: `COURSE_COMPLETED:student:${studentId}:course:${courseId}`, recipientId: studentId, recipientRole: "student", courseId, type: "COURSE_COMPLETED", title: "Course completed", message: `You completed ${course?.title || "your course"}.` }),
      course?.teacherId ? createNotification({ eventKey: `COURSE_COMPLETED:teacher:${course.teacherId}:student:${studentId}:course:${courseId}`, recipientId: course.teacherId, recipientRole: "teacher", courseId, type: "COURSE_COMPLETED", title: "Course completed by a student", message: `A student completed ${course.title}.` }) : null,
    ]).catch((error) => console.error("Unable to create completion notification:", error));
  }

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
  getLearningData,
  getStudentProgress,
  getCourseStudents,
  getAdminEnrollments,
};
