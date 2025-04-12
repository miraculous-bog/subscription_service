const {
	findByUnsubscribeToken,
	unsubscribeById,
  } = require("../../infrastructure/repositories/subscription.repository.impl");
  const {
	subscriptionsUnsubscribedTotal,
  } = require("../../infrastructure/metrics/metrics");
  
  const unsubscribe = async (token) => {
	if (!token) {
	  const error = new Error("Invalid token");
	  error.statusCode = 400;
	  throw error;
	}
  
	const subscription = await findByUnsubscribeToken(token);
  
	if (!subscription) {
	  const error = new Error("Token not found");
	  error.statusCode = 404;
	  throw error;
	}
  
	if (subscription.status === "unsubscribed") {
		subscriptionsUnsubscribedTotal.inc();
	  return {
		message: "Unsubscribed successfully",
	  };
	}
  
	await unsubscribeById(subscription._id);
	subscriptionsUnsubscribedTotal.inc();
	return {
	  message: "Unsubscribed successfully",
	};
  };
  
  module.exports = {
	unsubscribe,
  };