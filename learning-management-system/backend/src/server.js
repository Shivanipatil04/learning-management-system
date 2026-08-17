const app = require("./app");
const loadDB = require("./loaders/db.loader");
const { port } = require("./config/env");

const startServer = async () => {
  await loadDB();
  require("./jobs/contractExpiry.job")();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();