const Contract = require("../modules/contracts/contract.model");
const CoachingClassProfile = require("../modules/coachingClass/coachingClassProfile.model");

const requireActiveContract = async (req, res, next) => {
  try {
    // If user is not a teacher, bypass this check
    if (req.user.userType !== "teacher") {
      return next();
    }

    const userId = req.user.id || req.user._id;
    const now = new Date();
    const contract = await Contract.findOne({
      teacherId: userId,
      status: { $in: ["Active", "Accepted"] },
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ endDate: -1, createdAt: -1 });

    if (!contract) {
      return res.status(403).json({ success: false, message: "Your teaching contract is not currently active. Please contact your Class Admin." });
    }

    if (contract.status === "Accepted" && now >= contract.startDate) {
      contract.status = "Active";
      await contract.save();
    }

    const coachingClass = await CoachingClassProfile.findOne({ userId: contract.classAdminId }).select("_id").lean();
    if (!coachingClass) {
      return res.status(403).json({ success: false, message: "Your Coaching Class context is not currently available." });
    }

    req.activeContract = contract;
    req.user.coachingClassId = coachingClass._id;
    return next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while validating contract" });
  }
};

module.exports = requireActiveContract;
