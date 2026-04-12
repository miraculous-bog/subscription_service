const express = require("express");
const { subscribeController } = require("../../application/controllers/subscription.controller");

const router = express.Router();

router.post("/subscribe", subscribeController);

module.exports = {
  subscriptionRoutes: router,
};