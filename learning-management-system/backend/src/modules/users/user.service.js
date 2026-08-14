const User = require("./user.model");
const StudentProfile = require("./studentProfile.model");
const TeacherProfile = require("./teacherProfile.model");
const CoachingClassProfile = require("../coachingClass/coachingClassProfile.model");

const getUserWithProfile = async (userId) => {
  const user = await User.findById(userId).lean();

  if (!user) {
    return null;
  }

  if (user.userType === "student") {
    const profile = await StudentProfile.findOne({ userId }).lean();
    return { ...user, profile: profile || null };
  }

  if (user.userType === "teacher") {
    const profile = await TeacherProfile.findOne({ userId }).lean();
    return { ...user, profile: profile || null };
  }

  if (user.userType === "coachingClassAdmin") {
    const profile = await CoachingClassProfile.findOne({ userId }).lean();
    return { ...user, profile: profile || null };
  }

  return { ...user, profile: null };
};

module.exports = {
  getUserWithProfile,
};
