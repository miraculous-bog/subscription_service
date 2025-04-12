const { AppError } = require("../../shared/errors/app-error");

const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    throw new AppError("API key is required", 401);
  }

  if (apiKey !== process.env.API_KEY) {
    throw new AppError("Invalid API key", 403);
  }

  next();
};

module.exports = { apiKeyMiddleware };