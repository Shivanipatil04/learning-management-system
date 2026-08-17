const mongoose = require("mongoose");

const contractSchema = new mongoose.Schema(
  {
    contractId: { type: String, required: true, unique: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    classAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["Draft", "Sent", "Accepted", "Active", "Expired", "Rejected", "Terminated"],
      default: "Draft"
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    assignedClass: { type: String },
    paymentTerms: { type: String },
    terminationTerms: { type: String },
    otherTerms: { type: String },
    teacherRevenuePercentage: { type: Number, required: true },
    adminRevenuePercentage: { type: Number, required: true },
    termsAndConditions: { type: String },
    acceptedDate: { type: Date },
    previousContractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contract", contractSchema);
