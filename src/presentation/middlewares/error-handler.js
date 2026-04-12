const { AppError } = require("../../shared/errors/app-error");

const errorHandler = (error, req, res, next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      ...(error.meta?.retryAfterSeconds
        ? { retry_after_seconds: error.meta.retryAfterSeconds }
        : {}),
    });
  }

  return res.status(500).json({
    message: error.message || "Internal Server Error",
  });
};

module.exports = {
  errorHandler,
};