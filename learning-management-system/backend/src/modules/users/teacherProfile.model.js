const mongoose = require("mongoose");

const teacherProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: "",
    },
    qualifications: {
      type: [String],
      default: [],
    },
    payoutDetails: {
      bankAccountNumber: {
        type: String,
        default: "",
      },
      ifscCode: {
        type: String,
        default: "",
      },
      accountHolderName: {
        type: String,
        default: "",
      },
    },
    activeContracts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contract",
      },
    ],
    rating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TeacherProfile", teacherProfileSchema);
