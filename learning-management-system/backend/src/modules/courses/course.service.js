const Course = require("./course.model");
const Lesson = require("./lesson.model");
const Enrollment = require("../enrollments/enrollment.model");
const StudentProfile = require("../users/studentProfile.model");
const { validateCourseInput, validateLessonInput, isObjectId } = require("./course.validation");
const { resolveManagementContext, assertCourseAccess } = require("./course.authorization");
const { removeStoredFile } = require("../../utils/fileUpload");
const { videoReadyFilter } = require("./lessonAvailability");

const httpError = (message, statusCode) => { const error = new Error(message); error.statusCode = statusCode; return error; };
const teacherPopulate = { path: "teacherId", select: "name email" };
const addAvailableLessonCounts = async (courses) => {
  const courseIds = courses.map((course) => course._id);
  if (!courseIds.length) return courses;
  const counts = await Lesson.aggregate([
    { $match: { courseId: { $in: courseIds }, ...videoReadyFilter } },
    { $group: { _id: "$courseId", count: { $sum: 1 } } },
  ]);
  const countByCourse = new Map(counts.map((item) => [String(item._id), item.count]));
  return courses.map((course) => ({ ...course, availableLessonCount: countByCourse.get(String(course._id)) || 0, totalLessons: countByCourse.get(String(course._id)) || 0 }));
};
const byId = async (id) => {
  if (!isObjectId(id)) throw httpError("Invalid course id", 400);
  const course = await Course.findById(id).lean();
  if (!course) throw httpError("Course not found", 404);
  return course;
};

const createCourse = async (user, body) => {
  validateCourseInput(body);
  const context = await resolveManagementContext(user, "create");
  if (!context.allowed) throw httpError(context.message, context.statusCode);
  const course = await Course.create({ title: body.title.trim(), description: body.description || "", thumbnail: body.thumbnail || "", price: body.price, teacherId: context.isAdmin ? null : user.id, coachingClassId: context.tenantId, status: "DRAFT" });
  return Course.findById(course._id).populate(teacherPopulate).lean();
};

const listCourses = async (user, query = {}) => {
  const filter = { status: "PUBLISHED" };
  if (["teacher", "coachingClassAdmin", "superAdmin"].includes(user?.userType) && query.manage === "true") {
    const context = await resolveManagementContext(user, "edit");
    if (!context.allowed) throw httpError(context.message, context.statusCode);
    if (context.tenantId) filter.coachingClassId = context.tenantId;
    if (!context.isAdmin) filter.teacherId = user.id;
    delete filter.status;
  }
  const courses = await Course.find(filter).populate(teacherPopulate).sort({ createdAt: -1 }).lean();
  return user?.userType === "student" ? addAvailableLessonCounts(courses) : courses;
};

const listRecommendations = async (user) => {
  if (!user?.id || user.userType !== "student") { const error = httpError("Only students can view recommendations", 403); throw error; }
  const profile = await StudentProfile.findOne({ userId: user.id }).lean();
  const interests = [...(profile?.interests || []), ...(profile?.preferredCategories || [])].map((value) => value.toLowerCase()).filter(Boolean);
  if (!interests.length) return [];
  const courses = await Course.find({ status: "PUBLISHED" }).populate(teacherPopulate).sort({ createdAt: -1 }).lean();
  const recommended = courses.map((course) => {
    const searchable = [course.title, course.description, course.category, course.level, course.language].join(" ").toLowerCase();
    const score = interests.reduce((total, interest) => total + (searchable.includes(interest) ? 1 : 0), 0);
    return { ...course, recommendationScore: score };
  }).filter((course) => course.recommendationScore > 0).sort((a, b) => b.recommendationScore - a.recommendationScore).slice(0, 12);
  return addAvailableLessonCounts(recommended);
};

const getCourseDashboard = async (user) => {
  const context = await resolveManagementContext(user, "edit");
  if (!context.allowed) throw httpError(context.message, context.statusCode);
  const courseFilter = context.tenantId ? { coachingClassId: context.tenantId } : { teacherId: user.id };
  if (!context.isAdmin) courseFilter.teacherId = user.id;
  const courses = await Course.find(courseFilter).populate(teacherPopulate).sort({ updatedAt: -1 }).lean();
  const courseIds = courses.map((course) => course._id);
  const lessons = courseIds.length ? await Lesson.find({ courseId: { $in: courseIds } }).select("courseId videoUrl video").lean() : [];
  const lessonsWithVideo = lessons.filter((lesson) => lesson.videoUrl || lesson.video?.url).length;
  const totalLessons = lessons.length;
  return {
    totalCourses: courses.length,
    publishedCourses: courses.filter((course) => course.status === "PUBLISHED").length,
    draftCourses: courses.filter((course) => course.status === "DRAFT").length,
    totalLessons,
    lessonsWithVideo,
    videosUploaded: lessonsWithVideo,
    contentProgress: totalLessons ? Math.round((lessonsWithVideo / totalLessons) * 100) : 0,
    recentCourses: courses.slice(0, 5),
  };
};

const getCourse = async (user, id) => {
  const course = await byId(id);
  if (course.status !== "PUBLISHED" && !["teacher", "coachingClassAdmin", "superAdmin"].includes(user?.userType)) throw httpError("Course not found", 404);
  if (course.status !== "PUBLISHED") await assertCourseAccess(user, course, "edit");
  const responseCourse = await Course.findById(id).populate(teacherPopulate).lean();
  if (user?.userType === "student" && responseCourse?.status === "PUBLISHED") {
    responseCourse.availableLessonCount = await Lesson.countDocuments({ courseId: id, ...videoReadyFilter });
  }
  return responseCourse;
};

const updateCourse = async (user, id, body) => {
  const course = await byId(id); await assertCourseAccess(user, course, "edit");
  const allowed = {}; ["title", "description", "thumbnail", "price"].forEach((key) => { if (body[key] !== undefined) allowed[key] = body[key]; });
  validateCourseInput({ title: allowed.title ?? course.title, description: allowed.description ?? course.description, price: allowed.price ?? course.price, thumbnail: allowed.thumbnail ?? course.thumbnail });
  return Course.findByIdAndUpdate(id, allowed, { new: true, runValidators: true }).populate(teacherPopulate).lean();
};

const deleteCourse = async (user, id) => { const course = await byId(id); await assertCourseAccess(user, course, "delete"); const lessons = await Lesson.find({ courseId: id }).select("video.storageKey").lean(); await Lesson.deleteMany({ courseId: id }); await Course.findByIdAndDelete(id); await Promise.all(lessons.map((lesson) => removeStoredFile(lesson.video?.storageKey))); };

const publishCourse = async (user, id) => {
  const course = await byId(id); await assertCourseAccess(user, course, "publish");
  if (course.status === "PUBLISHED") return course;
  return Course.findByIdAndUpdate(id, { status: "PUBLISHED", publishedAt: new Date() }, { new: true }).populate(teacherPopulate).lean();
};

const listLessons = async (user, courseId) => {
  const course = await byId(courseId);
  if (course.status !== "PUBLISHED") await assertCourseAccess(user, course, "lesson");
  const filter = { courseId };
  if (user?.userType === "student") {
    const studentId = user.id || user._id;
    const enrollment = await Enrollment.findOne({ studentId, courseId }).select("_id").lean();
    if (!enrollment) throw httpError("Enrollment required to access course lessons", 403);
    Object.assign(filter, videoReadyFilter);
  }
  return Lesson.find(filter).sort({ order: 1 }).lean();
};
const createLesson = async (user, courseId, body) => { const course = await byId(courseId); await assertCourseAccess(user, course, "lesson"); validateLessonInput(body); try { return await Lesson.create({ ...body, courseId, title: body.title.trim() }); } catch (error) { if (error.code === 11000) throw httpError("Lesson order is already in use for this course", 409); throw error; } };
const updateLesson = async (user, courseId, lessonId, body) => { const course = await byId(courseId); await assertCourseAccess(user, course, "lesson"); if (!isObjectId(lessonId)) throw httpError("Invalid lesson id", 400); const lesson = await Lesson.findOne({ _id: lessonId, courseId }); if (!lesson) throw httpError("Lesson not found", 404); validateLessonInput({ ...lesson.toObject(), ...body }); try { return await Lesson.findByIdAndUpdate(lessonId, body, { new: true, runValidators: true }).lean(); } catch (error) { if (error.code === 11000) throw httpError("Lesson order is already in use for this course", 409); throw error; } };
const deleteLesson = async (user, courseId, lessonId) => { const course = await byId(courseId); await assertCourseAccess(user, course, "lesson"); if (!isObjectId(lessonId)) throw httpError("Invalid lesson id", 400); const lesson = await Lesson.findOne({ _id: lessonId, courseId }).select("video.storageKey").lean(); if (!lesson) throw httpError("Lesson not found", 404); await Lesson.deleteOne({ _id: lessonId, courseId }); await removeStoredFile(lesson.video?.storageKey); };

const uploadLessonVideo = async (user, courseId, lessonId, file) => {
  const course = await byId(courseId);
  await assertCourseAccess(user, course, "lesson");
  if (!isObjectId(lessonId)) throw httpError("Invalid lesson id", 400);
  const lesson = await Lesson.findOne({ _id: lessonId, courseId });
  if (!lesson) throw httpError("Lesson not found for this course", 404);
  if (!file) throw httpError("A video file is required", 400);

  const previousStorageKey = lesson.video?.storageKey;
  const storageKey = `videos/${file.filename}`;
  const videoUrl = `/uploads/${storageKey}`;
  try {
    const updatedLesson = await Lesson.findByIdAndUpdate(lessonId, {
      videoUrl,
      video: { storageKey, url: videoUrl, originalFileName: file.originalname, mimeType: file.mimetype, fileSize: file.size, uploadedAt: new Date() },
    }, { new: true, runValidators: true }).lean();
    if (previousStorageKey && previousStorageKey !== storageKey) {
      try { await removeStoredFile(previousStorageKey); } catch (cleanupError) { console.error("Unable to remove replaced lesson video:", cleanupError); }
    }
    return updatedLesson;
  } catch (error) {
    await removeStoredFile(storageKey);
    throw error;
  }
};

const deleteLessonVideo = async (user, courseId, lessonId) => {
  const course = await byId(courseId);
  await assertCourseAccess(user, course, "lesson");
  if (!isObjectId(lessonId)) throw httpError("Invalid lesson id", 400);
  const lesson = await Lesson.findOne({ _id: lessonId, courseId });
  if (!lesson) throw httpError("Lesson not found for this course", 404);

  const storageKey = lesson.video?.storageKey;
  if (storageKey) await removeStoredFile(storageKey);
  lesson.videoUrl = "";
  lesson.video = { storageKey: "", url: "", originalFileName: "", mimeType: "", fileSize: 0, uploadedAt: null };
  await lesson.save();
  return lesson.toObject();
};

module.exports = { createCourse, listCourses, listRecommendations, getCourseDashboard, getCourse, updateCourse, deleteCourse, publishCourse, listLessons, createLesson, updateLesson, deleteLesson, uploadLessonVideo, deleteLessonVideo };
