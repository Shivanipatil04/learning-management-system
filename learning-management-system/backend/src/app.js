const express = require("express");
const loadExpress = require("./loaders/express.loader");

const app = express();

loadExpress(app);
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use(require("./middlewares/errorHandler.middleware"));

module.exports = app;