const { GithubRepository } = require("../models/github-repository.model");

const findByFullName = async (fullName) => {
  return GithubRepository.findOne({ fullName });
};

const create = async (payload) => {
  return GithubRepository.create(payload);
};

module.exports = {
  findByFullName,
  create,
};