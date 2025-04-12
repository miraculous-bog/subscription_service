const express = require("express");
const cors = require("cors");
const { subscriptionRoutes } = require("./presentation/routes/subscription.routes");
const { apiKeyMiddleware } = require("./presentation/middlewares/apiKey.middleware");
const { errorHandler } = require("./presentation/middlewares/error-handler");
const { metricsMiddleware } = require("./presentation/middlewares/metrics.middleware");
const { register } = require("./infrastructure/metrics/metrics");

const app = express();
app.use(cors({
	origin: [
	  "http://localhost:5173",
	  process.env.FRONTEND_URL,
	].filter(Boolean),
	methods: ["GET", "POST", "OPTIONS"],
	allowedHeaders: ["Content-Type", "x-api-key"],
  }));

app.use(express.json());

app.use(metricsMiddleware);

app.use("/api",apiKeyMiddleware, subscriptionRoutes);

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.use(errorHandler);

module.exports = {
  app,
};