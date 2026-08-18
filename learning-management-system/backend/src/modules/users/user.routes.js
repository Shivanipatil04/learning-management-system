const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const protect = require("../auth/auth.middleware");

router.get("/", protect, userController.getUsers);
router.get("/me", protect, userController.getMyProfile);
router.patch("/me", protect, userController.updateMyProfile);

module.exports = router;
