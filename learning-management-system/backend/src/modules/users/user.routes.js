const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const protect = require("../auth/auth.middleware");

router.get("/", protect, userController.getUsers);

module.exports = router;
