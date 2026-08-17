const express = require("express");
const { signup, login } = require("./auth.controller");
const {validateSignup, validateLogin} = require("./auth.validation");

const router = express.Router();

router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);

module.exports = router;
