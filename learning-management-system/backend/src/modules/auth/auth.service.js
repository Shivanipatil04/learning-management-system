const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../users/user.model");
const { jwtSecret, jwtExpiresIn } = require("../../config/env");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  userType: user.userType,
  permissions: user.permissions,
  isVerified: user.isVerified,
});

const signup = async ({ name, email, phone, password, userType = "student" }) => {
  if (!name || !email || !password) {
    const error = new Error("Name, email, and password are required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const error = new Error("User already exists with this email");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone,
    password: hashedPassword,
    userType,
    permissions: [],
    isVerified: true,
  });

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      userType: user.userType,
      permissions: user.permissions,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  return {
    user: sanitizeUser(user),
    token,
  };
};

const login = async ({ email, password }) => {
  if (!email || !password) {
    const error = new Error("Email and password are required");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  // TODO: single-device + OTP logic

  const token = jwt.sign(
    {
      id: user._id,
      email: user.email,
      userType: user.userType,
      permissions: user.permissions,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  return {
    user: sanitizeUser(user),
    token,
  };
};

module.exports = {
  signup,
  login,
};
