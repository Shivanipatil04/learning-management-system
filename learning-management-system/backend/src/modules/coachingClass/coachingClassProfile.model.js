const mongoose = require("mongoose");

const coachingClassProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    instituteName: {
      type: String,
      required: true,
      trim: true,
    },
    registrationDetails: {
      registrationNumber: {
        type: String,
        default: "",
      },
      address: {
        type: String,
        default: "",
      },
    },
    contractedTeachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contract",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CoachingClassProfile", coachingClassProfileSchema);
