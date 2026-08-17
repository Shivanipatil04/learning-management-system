const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    price: { type: Number, default: 0 },
    level: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    language: { type: String, default: "English" },
    category: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    duration: { type: String, default: "0 hours" },
    totalLessons: { type: Number, default: 0 },
    thumbnail: { type: String, default: "" },
    curriculum: [
      {
        title: { type: String, required: true },
        lessons: [
          {
            title: { type: String, required: true },
            duration: { type: String },
          }
        ]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
