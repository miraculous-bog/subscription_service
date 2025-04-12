const mongoose = require("mongoose");
const { Subscription } = require("../../models/subscription.model");
const { GithubRepository } = require("../../models/github-repository.model");

const migrationName = "001-create-indexes";

const up = async () => {
  await GithubRepository.collection.createIndex(
    { fullName: 1 },
    { unique: true }
  );

  await Subscription.collection.createIndex(
    { email: 1, repositoryId: 1 },
    { unique: true }
  );

  await Subscription.collection.createIndex(
    { confirmToken: 1 },
    { unique: true }
  );

  await Subscription.collection.createIndex(
    { unsubscribeToken: 1 },
    { unique: true }
  );

  await Subscription.collection.createIndex({ email: 1 });
  await Subscription.collection.createIndex({ repositoryId: 1 });
};

module.exports = {
  migrationName,
  up,
};