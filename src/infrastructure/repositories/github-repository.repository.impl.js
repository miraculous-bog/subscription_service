const { GithubRepository } = require("../models/github-repository.model");

const findByFullName = async (fullName) => {
  return GithubRepository.findOne({ fullName });
};

const create = async (payload) => {
  return GithubRepository.create(payload);
};

const findAll = async () => {
  return GithubRepository.find();
};

const updateLastSeenTagById = async (id, lastSeenTag) => {
  return GithubRepository.findByIdAndUpdate(
    id,
    {
      lastSeenTag,
      lastCheckedAt: new Date(),
    },
    { new: true }
  );
};

const touchLastCheckedAtById = async (id) => {
  return GithubRepository.findByIdAndUpdate(
    id,
    {
      lastCheckedAt: new Date(),
    },
    { new: true }
  );
};

module.exports = {
  findByFullName,
  create,
  findAll,
  updateLastSeenTagById,
  touchLastCheckedAtById,
};