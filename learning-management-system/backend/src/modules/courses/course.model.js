const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
    description: { type: String, default: "", trim: true, maxlength: 5000 },
    thumbnail: { type: String, default: "", trim: true, maxlength: 2048 },
    price: { type: Number, required: true, min: 0 },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    coachingClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoachingClassProfile",
      required: false,
      index: true,
    },
    status: { type: String, enum: ["DRAFT", "PUBLISHED"], default: "DRAFT", index: true },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

courseSchema.index({ coachingClassId: 1, teacherId: 1 });
courseSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Course", courseSchema);
