const Contract = require("./contract.model");
const User = require("../users/user.model");

exports.createContract = async (req, res, next) => {
  try {
    const { teacherId, teacherRevenuePercentage, adminRevenuePercentage } = req.body;

    if (teacherRevenuePercentage + adminRevenuePercentage !== 100) {
      return res.status(400).json({ success: false, message: "Revenue percentages must total exactly 100%" });
    }

    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.userType !== "teacher") {
      return res.status(400).json({ success: false, message: "Invalid teacher selected" });
    }

    const contract = await Contract.create({
      ...req.body,
      classAdminId: req.user.id || req.user._id,
      status: "Draft"
    });

    res.status(201).json({ success: true, data: contract });
  } catch (error) {
    next(error);
  }
};

exports.updateContract = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

    if (contract.status !== "Draft") {
      return res.status(400).json({ success: false, message: "Only Draft contracts can be edited" });
    }

    if (req.body.teacherRevenuePercentage !== undefined && req.body.adminRevenuePercentage !== undefined) {
      if (req.body.teacherRevenuePercentage + req.body.adminRevenuePercentage !== 100) {
        return res.status(400).json({ success: false, message: "Revenue percentages must total exactly 100%" });
      }
    }

    const updated = await Contract.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.changeStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });

    if (req.user.userType === "coachingClassAdmin") {
      if (!["Sent", "Terminated"].includes(status)) {
        return res.status(403).json({ success: false, message: "Admin can only set status to Sent or Terminated" });
      }
    } else if (req.user.userType === "teacher") {
      const userId = req.user.id || req.user._id;
      if (contract.teacherId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized" });
      }
      if (!["Accepted", "Rejected"].includes(status)) {
        return res.status(403).json({ success: false, message: "Teacher can only Accept or Reject" });
      }
      if (contract.status !== "Sent") {
        return res.status(400).json({ success: false, message: "You can only respond to Sent contracts" });
      }
    }

    contract.status = status;

    if (status === "Accepted") {
      contract.acceptedDate = new Date();
      const now = new Date();
      if (now >= contract.startDate && now <= contract.endDate) {
        contract.status = "Active";
      }
    }

    await contract.save();
    res.status(200).json({ success: true, data: contract });
  } catch (error) {
    next(error);
  }
};

exports.getAllContracts = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const contracts = await Contract.find({ classAdminId: userId }).populate("teacherId", "name email");
    res.status(200).json({ success: true, data: contracts });
  } catch (error) {
    next(error);
  }
};

exports.getMyContract = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const contract = await Contract.findOne({ teacherId: userId })
      .sort({ createdAt: -1 })
      .populate("classAdminId", "name email");

    if (!contract) return res.status(404).json({ success: false, message: "No contract found" });
    res.status(200).json({ success: true, data: contract });
  } catch (error) {
    next(error);
  }
};

exports.getContractById = async (req, res, next) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate("teacherId", "name email")
      .populate("classAdminId", "name email");

    if (!contract) return res.status(404).json({ success: false, message: "Contract not found" });
    res.status(200).json({ success: true, data: contract });
  } catch (error) {
    next(error);
  }
};
