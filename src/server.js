require("dotenv").config();

const { app } = require("./app");
const { connectDB } = require("./infrastructure/db/mongoose");
const { runMigrations } = require("./infrastructure/db/migrations/run-migrations");
const { startReleaseScannerJob } = require("./jobs/release-scanner.job");
const { redisClient, connectRedis } = require("./infrastructure/cache/redis.client");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    await redisClient.set("ping", "pong", { EX: 60 });
    const value = await redisClient.get("ping");
    console.log("Redis test:", value);

    await runMigrations();
    startReleaseScannerJob();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();