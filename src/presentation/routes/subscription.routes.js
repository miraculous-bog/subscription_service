const express = require("express");
const {
  subscribeController,
  confirmSubscriptionController,
  unsubscribeController,
  getSubscriptionsController,
  unsubscribeByEmailAndRepoHandler
} = require("../../application/controllers/subscription.controller");

const router = express.Router();

router.post("/subscribe", subscribeController);
router.get("/confirm/:token", confirmSubscriptionController);
router.get("/unsubscribe/:token", unsubscribeController);
router.get("/subscriptions", getSubscriptionsController);
router.post("/subscriptions/unsubscribe", unsubscribeByEmailAndRepoHandler);

module.exports = {
  subscriptionRoutes: router,
};