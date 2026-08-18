const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructions: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
    },
    passingPercentage: {
      type: Number,
      required: true,
      default: 50,
    },
    timeLimit: {
      type: Number, // in minutes
      default: null,
    },
    maxAttempts: {
      type: Number,
      default: 1,
    },
    startDate: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    questions: [
      {
        questionText: { type: String, required: true },
        questionType: { 
          type: String, 
          enum: ["mcq", "multi-select", "true-false"],
          default: "mcq"
        },
        options: [{ type: String, required: true }],
        correctOptions: [{ type: Number, required: true }], // Array of correct option indices
        marks: { type: Number, default: 1 }
      }
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quiz", quizSchema);
