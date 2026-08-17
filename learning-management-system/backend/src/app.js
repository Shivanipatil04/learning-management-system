const express = require("express");
const path = require("path");
const loadExpress = require("./loaders/express.loader");

const app = express();

app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

loadExpress(app);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", require("./modules/auth/auth.routes"));
app.use("/api/courses", require("./modules/courses/course.routes"));
app.use(require("./middlewares/errorHandler.middleware"));

module.exports = app;
