require("dotenv").config();

const { app } = require("./app");
const { connectDB } = require("./infrastructure/db/mongoose");
const { startReleaseScannerJob } = require("./jobs/release-scanner.job");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  startReleaseScannerJob();

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

startServer();