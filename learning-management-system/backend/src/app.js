const express = require("express");
const loadExpress = require("./loaders/express.loader");

const app = express();

loadExpress(app);

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", require("./modules/auth/auth.routes"));
app.use("/api/courses", require("./modules/courses/course.routes"));
app.use("/api/contracts", require("./modules/contracts/contract.routes"));
app.use("/api/users", require("./modules/users/user.routes"));
app.use("/api/notifications", require("./modules/notifications/notification.routes"));
app.use(require("./middlewares/errorHandler.middleware"));

module.exports = app;