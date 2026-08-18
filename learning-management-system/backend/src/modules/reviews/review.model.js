const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewType: {
      type: String,
      enum: ["course", "teacher"],
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a student can only review a specific course or teacher once
reviewSchema.index({ studentId: 1, courseId: 1 }, { unique: true, partialFilterExpression: { reviewType: "course" } });
reviewSchema.index({ studentId: 1, teacherId: 1 }, { unique: true, partialFilterExpression: { reviewType: "teacher" } });

module.exports = mongoose.model("Review", reviewSchema);
