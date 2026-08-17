const mongoose = require("mongoose");

const isObjectId = (value) => mongoose.isValidObjectId(value);
const fail = (message) => { const error = new Error(message); error.statusCode = 400; throw error; };

const validateCourseInput = (body = {}) => {
  if (typeof body.title !== "string" || body.title.trim().length < 2 || body.title.trim().length > 160) fail("Title must be between 2 and 160 characters");
  if (body.description !== undefined && (typeof body.description !== "string" || body.description.length > 5000)) fail("Description must not exceed 5000 characters");
  if (body.thumbnail !== undefined && typeof body.thumbnail !== "string") fail("Thumbnail must be a string");
  if (body.price === undefined || typeof body.price !== "number" || !Number.isFinite(body.price) || body.price < 0) fail("Price must be a non-negative number");
};

const validateLessonInput = (body = {}) => {
  if (typeof body.title !== "string" || body.title.trim().length < 2 || body.title.trim().length > 160) fail("Lesson title must be between 2 and 160 characters");
  if (body.description !== undefined && (typeof body.description !== "string" || body.description.length > 5000)) fail("Lesson description must not exceed 5000 characters");
  if (body.content !== undefined && typeof body.content !== "string") fail("Lesson content must be a string");
  if (body.videoUrl !== undefined && typeof body.videoUrl !== "string") fail("Video URL must be a string");
  if (!Number.isInteger(body.order) || body.order < 1) fail("Lesson order must be a positive integer");
};

module.exports = { isObjectId, validateCourseInput, validateLessonInput };
