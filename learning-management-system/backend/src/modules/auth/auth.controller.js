const authService = require("./auth.service");

const signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);
    return res.status(201).json({
      message: "User registered successfully",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json({
      message: "Login successful",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  signup,
  login,
};
