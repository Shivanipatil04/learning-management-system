const User = require("./user.model");
const StudentProfile = require("./studentProfile.model");
const TeacherProfile = require("./teacherProfile.model");
const CoachingClassProfile = require("../coachingClass/coachingClassProfile.model");

exports.getUsers = async (req, res, next) => {
  try {
    const { userType } = req.query;
    let query = {};
    if (userType) {
      query.userType = userType;
    }
    
    const users = await User.find(query).select("-password -activeDevice -otp");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select("name email phone userType").lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const Profile = user.userType === "student" ? StudentProfile : user.userType === "teacher" ? TeacherProfile : user.userType === "coachingClassAdmin" ? CoachingClassProfile : null;
    const profile = Profile ? await Profile.findOne({ userId }).lean() : null;
    return res.status(200).json({ success: true, data: { user, profile } });
  } catch (error) { return next(error); }
};

exports.updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await User.findById(userId).select("name email phone userType");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const { name, phone } = req.body;
    if (name !== undefined) { if (typeof name !== "string" || name.trim().length < 2) return res.status(400).json({ success: false, message: "Name must be at least 2 characters" }); user.name = name.trim(); }
    if (phone !== undefined) user.phone = String(phone).trim();
    await user.save();
    const profileData = req.body.profile || {};
    const Profile = user.userType === "student" ? StudentProfile : user.userType === "teacher" ? TeacherProfile : user.userType === "coachingClassAdmin" ? CoachingClassProfile : null;
    if (Profile) {
      const allowed = user.userType === "student" ? ["education", "interests", "preferredCategories"] : user.userType === "teacher" ? ["bio", "education", "qualifications", "expertise", "experience"] : ["instituteName", "registrationDetails"];
      const update = {};
      allowed.forEach((key) => { if (profileData[key] !== undefined) update[key] = profileData[key]; });
      await Profile.findOneAndUpdate({ userId }, { $set: update }, { new: true, upsert: true, setDefaultsOnInsert: true });
    }
    return exports.getMyProfile(req, res, next);
  } catch (error) { return next(error); }
};
