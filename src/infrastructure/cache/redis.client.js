const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL;
const isTls = redisUrl?.startsWith("rediss://");

const redisClient = createClient({
  url: redisUrl,
  socket: isTls
    ? {
        tls: true,
        rejectUnauthorized: false,
      }
    : undefined,
});

redisClient.on("error", (error) => {
  console.error("Redis client error:", error);
});

const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Redis connected");
  }
};

module.exports = {
  redisClient,
  connectRedis,
};