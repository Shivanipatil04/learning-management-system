const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 160,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },

    thumbnail: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2048,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // Course ownership / authorization
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    coachingClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoachingClassProfile",
      required: false,
      index: true,
    },

    // Course lifecycle
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED"],
      default: "DRAFT",
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    // Course metadata
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    language: {
      type: String,
      default: "English",
      trim: true,
    },

    category: {
      type: String,
      default: "",
      trim: true,
    },

    // Analytics / course statistics
    rating: {
      type: Number,
      default: 0,
      min: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    duration: {
      type: String,
      default: "0 hours",
    },

    totalLessons: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Keep curriculum metadata if it is used by the student UI.
    curriculum: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },

        lessons: [
          {
            title: {
              type: String,
              required: true,
              trim: true,
            },

            duration: {
              type: String,
              default: "",
            },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// Ownership / tenant lookup
courseSchema.index({ coachingClassId: 1, teacherId: 1 });

// Published / recent course lookup
courseSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Course", courseSchema);