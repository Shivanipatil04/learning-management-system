const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
      required: true,
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
certificateSchema.index({ teacherId: 1 });
certificateSchema.index({ studentId: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
