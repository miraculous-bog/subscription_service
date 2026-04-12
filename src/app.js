const express = require("express");
const { subscriptionRoutes } = require("./presentation/routes/subscription.routes");
const { apiKeyMiddleware } = require("./presentation/middlewares/apiKey.middleware");
const { errorHandler } = require("./presentation/middlewares/error-handler");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  return res.status(200).json({
    message: "Server is running",
  });
});

app.use(apiKeyMiddleware);
app.use("/api", subscriptionRoutes);

app.use(errorHandler);

module.exports = {
  app,
};