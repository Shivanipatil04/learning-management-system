const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract" },
    totalAmount: { type: Number, required: true },
    teacherPercentage: { type: Number, required: true },
    adminPercentage: { type: Number, required: true },
    teacherAmount: { type: Number, required: true },
    adminAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Completed" },
    transactionDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
