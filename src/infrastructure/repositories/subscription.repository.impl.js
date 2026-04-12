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

module.exports = {
  findByEmailAndRepositoryId,
  create,
};