const service = require("./enrollment.service");

const respond = (res, data, status = 200) => res.status(status).json({ success: true, data });

const enroll = async (req, res, next) => {
  try { return respond(res, await service.enrollStudent(req.user, req.params.courseId), 201); } catch (error) { return next(error); }
};

const list = async (req, res, next) => {
  try { return respond(res, await service.getStudentEnrollments(req.user)); } catch (error) { return next(error); }
};

const get = async (req, res, next) => {
  try { return respond(res, await service.getEnrollment(req.user, req.params.id)); } catch (error) { return next(error); }
};

const getCourse = async (req, res, next) => {
  try { return respond(res, await service.getCourseEnrollment(req.user, req.params.courseId)); } catch (error) { return next(error); }
};

const updateProgress = async (req, res, next) => {
  try { return respond(res, await service.updateLessonProgress(req.user, req.params.courseId, req.params.lessonId)); } catch (error) { return next(error); }
};

const progress = async (req, res, next) => {
  try { return respond(res, await service.getCourseProgress(req.user, req.params.courseId)); } catch (error) { return next(error); }
};

module.exports = { enroll, list, get, getCourse, updateProgress, progress };
