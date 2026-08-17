const Course = require("./course.model");
const Lesson = require("./lesson.model");
const { validateCourseInput, validateLessonInput, isObjectId } = require("./course.validation");
const { resolveManagementContext, assertCourseAccess } = require("./course.authorization");
const { removeStoredFile } = require("../../utils/fileUpload");

const httpError = (message, statusCode) => { const error = new Error(message); error.statusCode = statusCode; return error; };
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
  return Course.create({ title: body.title.trim(), description: body.description || "", thumbnail: body.thumbnail || "", price: body.price, teacherId: context.isAdmin ? null : user.id, coachingClassId: context.tenantId, status: "DRAFT" });
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
  return Course.find(filter).sort({ createdAt: -1 }).lean();
};

const getCourseDashboard = async (user) => {
  const context = await resolveManagementContext(user, "edit");
  if (!context.allowed) throw httpError(context.message, context.statusCode);
  const courseFilter = context.tenantId ? { coachingClassId: context.tenantId } : { teacherId: user.id };
  if (!context.isAdmin) courseFilter.teacherId = user.id;
  const courses = await Course.find(courseFilter).sort({ updatedAt: -1 }).lean();
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
  return course;
};

const updateCourse = async (user, id, body) => {
  const course = await byId(id); await assertCourseAccess(user, course, "edit");
  const allowed = {}; ["title", "description", "thumbnail", "price"].forEach((key) => { if (body[key] !== undefined) allowed[key] = body[key]; });
  validateCourseInput({ title: allowed.title ?? course.title, description: allowed.description ?? course.description, price: allowed.price ?? course.price, thumbnail: allowed.thumbnail ?? course.thumbnail });
  return Course.findByIdAndUpdate(id, allowed, { new: true, runValidators: true }).lean();
};

const deleteCourse = async (user, id) => { const course = await byId(id); await assertCourseAccess(user, course, "delete"); const lessons = await Lesson.find({ courseId: id }).select("video.storageKey").lean(); await Lesson.deleteMany({ courseId: id }); await Course.findByIdAndDelete(id); await Promise.all(lessons.map((lesson) => removeStoredFile(lesson.video?.storageKey))); };

const publishCourse = async (user, id) => {
  const course = await byId(id); await assertCourseAccess(user, course, "publish");
  if (course.status === "PUBLISHED") return course;
  return Course.findByIdAndUpdate(id, { status: "PUBLISHED", publishedAt: new Date() }, { new: true }).lean();
};

const listLessons = async (user, courseId) => { const course = await byId(courseId); if (course.status !== "PUBLISHED") await assertCourseAccess(user, course, "lesson"); return Lesson.find({ courseId }).sort({ order: 1 }).lean(); };
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

module.exports = { createCourse, listCourses, getCourseDashboard, getCourse, updateCourse, deleteCourse, publishCourse, listLessons, createLesson, updateLesson, deleteLesson, uploadLessonVideo };
