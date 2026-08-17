const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../users/user.model");
const StudentProfile = require("../users/studentProfile.model");
const TeacherProfile = require("../users/teacherProfile.model");
const CoachingClassProfile = require("../coachingClass/coachingClassProfile.model");
const { DEFAULT_PERMISSIONS_BY_ROLE } = require("../permissions/permission.service");
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

const createProfileForUser = async (userId, userType) => {
  if (userType === "student") {
    await StudentProfile.create({ userId });
    return;
  }

  if (userType === "teacher") {
    await TeacherProfile.create({ userId });
    return;
  }

  if (userType === "coachingClassAdmin") {
    await CoachingClassProfile.create({
      userId,
      instituteName: "Pending institute registration",
    });
    return;
  }
};

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

  // NOTE: no MongoDB session/transaction here. session.withTransaction()
  // requires MongoDB to be running as a replica set — a local standalone
  // MongoDB install doesn't support it, which was the cause of the earlier
  // 500 error (MongoServerError: Transaction numbers are only allowed on
  // a replica set member or mongos). MongoDB Atlas runs as a replica set
  // automatically, so this can be revisited if/when this app moves to
  // Atlas — for now we create the user, then the profile, and manually
  // roll back the user if profile creation fails.

  const hashedPassword = await bcrypt.hash(password, 10);

  let createdUser;
  try {
    createdUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      userType,
      permissions: DEFAULT_PERMISSIONS_BY_ROLE[userType] || [],
      isVerified: true,
    });
  } catch (error) {
    console.log("REAL ERROR:", error);
    const wrappedError = new Error("Signup failed while creating account");
    wrappedError.statusCode = 500;
    throw wrappedError;
  }

  try {
    if (userType === "student" || userType === "teacher" || userType === "coachingClassAdmin") {
      await createProfileForUser(createdUser._id, userType);
    }
  } catch (error) {
    // Roll back the user manually since we're not inside a transaction —
    // avoids ending up with a User that has no matching profile.
    await User.findByIdAndDelete(createdUser._id);
    console.log("REAL ERROR:", error);
    const wrappedError = new Error("Signup failed while creating account profile");
    wrappedError.statusCode = 500;
    throw wrappedError;
  }

  const token = jwt.sign(
    {
      id: createdUser._id,
      email: createdUser.email,
      userType: createdUser.userType,
      permissions: createdUser.permissions,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );

  return {
    user: sanitizeUser(createdUser),
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
      permissions: user.permissions?.length ? user.permissions : (DEFAULT_PERMISSIONS_BY_ROLE[user.userType] || []),
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
