const { subscribeToRepo } = require("../use-cases/subscribe-to-repo");
const { confirmSubscription } = require("../use-cases/confirm-subscription");
const { unsubscribe } = require("../use-cases/unsubscribe");
const { getSubscriptionsByEmail } = require("../use-cases/get-subscriptions-by-email");
const {
	unsubscribeByEmailAndRepo,
  } = require("../use-cases/unsubscribe-by-email-and-repo");
const subscribeController = async (req, res, next) => {
  try {
    const result = await subscribeToRepo(req.body);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
const unsubscribeByEmailAndRepoHandler = async (req, res, next) => {
	try {
	  const result = await unsubscribeByEmailAndRepo(req.body);
	  res.status(200).json(result);
	} catch (error) {
	  next(error);
	}
  };
const confirmSubscriptionController = async (req, res, next) => {
  try {
    const result = await confirmSubscription(req.params.token);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const unsubscribeController = async (req, res, next) => {
  try {
    const result = await unsubscribe(req.params.token);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getSubscriptionsController = async (req, res, next) => {
  try {
    const result = await getSubscriptionsByEmail(req.query.email);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  subscribeController,
  confirmSubscriptionController,
  unsubscribeController,
  getSubscriptionsController,
  unsubscribeByEmailAndRepoHandler
};