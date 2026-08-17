const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
    description: { type: String, default: "", trim: true, maxlength: 5000 },
    content: { type: String, default: "", maxlength: 100000 },
    videoUrl: { type: String, default: "", trim: true, maxlength: 2048 },
    video: {
      storageKey: { type: String, default: "" },
      url: { type: String, default: "" },
      originalFileName: { type: String, default: "" },
      mimeType: { type: String, default: "" },
      fileSize: { type: Number, default: 0, min: 0 },
      uploadedAt: { type: Date, default: null },
    },
    order: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

lessonSchema.index({ courseId: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("Lesson", lessonSchema);
