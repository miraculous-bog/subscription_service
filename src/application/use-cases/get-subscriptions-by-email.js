const { findActiveByEmail } = require("../../infrastructure/repositories/subscription.repository.impl");
const { AppError } = require("../../shared/errors/app-error");

const isValidEmail = (email) => {
  if (!email || typeof email !== "string") {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getSubscriptionsByEmail = async (email) => {
  if (!isValidEmail(email)) {
    throw new AppError("Invalid email", 400);
  }

  const normalizedEmail = email.toLowerCase();

  const subscriptions = await findActiveByEmail(normalizedEmail);

  return subscriptions.map((subscription) => ({
    email: subscription.email,
    repo: subscription.repositoryId.fullName,
    confirmed: subscription.status === "active",
    last_seen_tag: subscription.repositoryId.lastSeenTag,
  }));
};

module.exports = {
  getSubscriptionsByEmail,
};