const client = require("prom-client");

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const subscriptionsCreatedTotal = new client.Counter({
  name: "subscriptions_created_total",
  help: "Total number of created subscriptions",
  registers: [register],
});

const subscriptionsConfirmedTotal = new client.Counter({
  name: "subscriptions_confirmed_total",
  help: "Total number of confirmed subscriptions",
  registers: [register],
});

const subscriptionsUnsubscribedTotal = new client.Counter({
  name: "subscriptions_unsubscribed_total",
  help: "Total number of unsubscribed subscriptions",
  registers: [register],
});

const subscriptionReactivatedTotal = new client.Counter({
  name: "subscriptions_reactivated_total",
  help: "Total number of reactivated subscriptions",
  registers: [register],
});

const emailsSentTotal = new client.Counter({
  name: "emails_sent_total",
  help: "Total number of sent emails",
  labelNames: ["type"],
  registers: [register],
});

const emailsFailedTotal = new client.Counter({
  name: "emails_failed_total",
  help: "Total number of failed emails",
  labelNames: ["type"],
  registers: [register],
});

const scanRunsTotal = new client.Counter({
  name: "scan_runs_total",
  help: "Total number of release scanner runs",
  registers: [register],
});

const releasesDetectedTotal = new client.Counter({
  name: "releases_detected_total",
  help: "Total number of detected new releases",
  registers: [register],
});

const githubApiRateLimitTotal = new client.Counter({
  name: "github_api_rate_limit_total",
  help: "Total number of GitHub API rate limit hits",
  registers: [register],
});

module.exports = {
  register,
  httpRequestsTotal,
  subscriptionsCreatedTotal,
  subscriptionsConfirmedTotal,
  subscriptionsUnsubscribedTotal,
  subscriptionReactivatedTotal,
  emailsSentTotal,
  emailsFailedTotal,
  scanRunsTotal,
  releasesDetectedTotal,
  githubApiRateLimitTotal,
};