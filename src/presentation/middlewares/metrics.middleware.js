const { httpRequestsTotal } = require("../../infrastructure/metrics/metrics");

const metricsMiddleware = (req, res, next) => {
  res.on("finish", () => {
    const route =
      req.route?.path ||
      req.baseUrl + (req.path || "") ||
      req.originalUrl;

    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: String(res.statusCode),
    });
  });

  next();
};

module.exports = { metricsMiddleware };