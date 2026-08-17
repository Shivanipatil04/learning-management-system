const Contract = require("../modules/contracts/contract.model");

const requireActiveContract = async (req, res, next) => {
  try {
    // If user is not a teacher, bypass this check
    if (req.user.userType !== "teacher") {
      return next();
    }

    // Find the teacher's latest contract
    const userId = req.user.id || req.user._id;
    const contract = await Contract.findOne({ teacherId: userId })
      .sort({ createdAt: -1 });

    if (!contract) {
      return res.status(403).json({ success: false, message: "Your teaching contract is not currently active. Please contact your Class Admin." });
    }

    const now = new Date();

    if (contract.status !== "Active" && contract.status !== "Accepted") {
      return res.status(403).json({ success: false, message: "Your teaching contract is not currently active. Please contact your Class Admin." });
    }

    if (now < contract.startDate || now > contract.endDate) {
      // If it passed end date, we could update status to Expired here, but just block for now.
      if (now > contract.endDate && contract.status !== "Expired") {
         contract.status = "Expired";
         await contract.save();
      }
      return res.status(403).json({ success: false, message: "Your teaching contract is not currently active. Please contact your Class Admin." });
    }
    
    if (contract.status === "Accepted" && now >= contract.startDate) {
        contract.status = "Active";
        await contract.save();
    }

    req.activeContract = contract;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error while validating contract" });
  }
};

module.exports = requireActiveContract;
