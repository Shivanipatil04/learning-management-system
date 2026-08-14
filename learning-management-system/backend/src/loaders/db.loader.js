const connectDB = require("../config/db");
const loadDB = async () => {
  await connectDB();
};

module.exports = loadDB;