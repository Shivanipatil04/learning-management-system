const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["passed", "failed"],
      required: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    answers: [
      {
        questionId: { type: mongoose.Schema.Types.ObjectId },
        selectedOptions: [{ type: Number }], // Array of selected option indices
        isCorrect: { type: Boolean }
      }
    ]
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
