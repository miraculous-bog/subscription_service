const mongoose = require("mongoose");

const githubRepositorySchema = new mongoose.Schema(
  {
    owner: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    lastSeenTag: {
      type: String,
      default: null,
    },
    lastCheckedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const GithubRepository = mongoose.model("GithubRepository", githubRepositorySchema);

module.exports = {
  GithubRepository,
};