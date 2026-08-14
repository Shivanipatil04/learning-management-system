const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    userType: {
      type: String,
      enum: ["student", "teacher", "coachingClassAdmin", "superAdmin"],
      default: "student",
    },
    activeDevice: {
      deviceId: {
        type: String,
        default: null,
      },
      lastLoginAt: {
        type: Date,
        default: null,
      },
    },
    otp: {
      code: {
        type: String,
        default: null,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
