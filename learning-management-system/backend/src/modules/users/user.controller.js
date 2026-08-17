const User = require("./user.model");

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
