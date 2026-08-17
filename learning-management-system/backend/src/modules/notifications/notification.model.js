const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipientRole: { type: String, required: true }, // 'teacher', 'coachingClassAdmin'
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract" },
    type: {
      type: String,
      enum: [
        "CONTRACT_EXPIRING_30_DAYS",
        "CONTRACT_EXPIRING_7_DAYS",
        "CONTRACT_EXPIRING_1_DAY",
        "CONTRACT_RENEWED",
        "CONTRACT_EXPIRED"
      ],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    isIgnored: { type: Boolean, default: false } // Admin can ignore renewal reminder
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
