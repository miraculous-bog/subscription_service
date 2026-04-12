const { Subscription } = require("../models/subscription.model");

const findByEmailAndRepositoryId = async (email, repositoryId) => {
  return Subscription.findOne({
    email,
    repositoryId,
  });
};

const create = async (payload) => {
  return Subscription.create(payload);
};

const findByConfirmToken = async (confirmToken) => {
  return Subscription.findOne({ confirmToken });
};

const findByUnsubscribeToken = async (unsubscribeToken) => {
  return Subscription.findOne({ unsubscribeToken });
};

const confirmById = async (id) => {
  return Subscription.findByIdAndUpdate(
    id,
    {
      status: "active",
      confirmedAt: new Date(),
    },
    { new: true }
  );
};

const unsubscribeById = async (id) => {
  return Subscription.findByIdAndUpdate(
    id,
    {
      status: "unsubscribed",
      unsubscribedAt: new Date(),
    },
    { new: true }
  );
};

const reactivateById = async (id, payload) => {
  return Subscription.findByIdAndUpdate(
    id,
    {
      status: "pending",
      confirmToken: payload.confirmToken,
      unsubscribeToken: payload.unsubscribeToken,
      confirmedAt: null,
      unsubscribedAt: null,
    },
    { new: true }
  );
};

const findActiveByEmail = async (email) => {
  return Subscription.find({
    email,
    status: "active",
  }).populate("repositoryId");
};

const findActiveByRepositoryId = async (repositoryId) => {
  return Subscription.find({
    repositoryId,
    status: "active",
  });
};

module.exports = {
  findByEmailAndRepositoryId,
  create,
  findByConfirmToken,
  findByUnsubscribeToken,
  confirmById,
  unsubscribeById,
  reactivateById,
  findActiveByEmail,
  findActiveByRepositoryId,
};