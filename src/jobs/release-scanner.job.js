const schedule = require("node-schedule");
const { scanReleases } = require("../application/use-cases/scan-releases");

const startReleaseScannerJob = () => {
  const cronExpression = process.env.RELEASE_SCAN_CRON || "*/10 * * * *";

  console.log(`Release scanner scheduled with cron: ${cronExpression}`);

  schedule.scheduleJob(cronExpression, async () => {
    console.log("Release scanner started");

    try {
      await scanReleases();
      console.log("Release scanner finished");
    } catch (error) {
      console.error("Release scanner failed:", error.message);
    }
  });
};

module.exports = {
  startReleaseScannerJob,
};