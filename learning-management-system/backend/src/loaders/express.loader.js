const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { clientUrl } = require("../config/env");
const loadExpress = (app) => {
  app.use(
    cors({
      origin: clientUrl,
      credentials: true, // needed if you store the JWT in an httpOnly cookie
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
};

module.exports = loadExpress;