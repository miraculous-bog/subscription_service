const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    repositoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GithubRepository",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "unsubscribed"],
      default: "pending",
    },
    confirmToken: {
      type: String,
      required: true,
      unique: true,
    },
    unsubscribeToken: {
      type: String,
      required: true,
      unique: true,
    },
    confirmedAt: {
      type: Date,
      default: null,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ email: 1 });
subscriptionSchema.index({ repositoryId: 1 });
subscriptionSchema.index({ email: 1, repositoryId: 1 }, { unique: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = {
  Subscription,
};