const {
	findByConfirmToken,
	confirmById,
  } = require("../../infrastructure/repositories/subscription.repository.impl");
  
  const confirmSubscription = async (token) => {
	if (!token) {
	  const error = new Error("Invalid token");
	  error.statusCode = 400;
	  throw error;
	}
  
	const subscription = await findByConfirmToken(token);
  
	if (!subscription) {
	  const error = new Error("Token not found");
	  error.statusCode = 404;
	  throw error;
	}
  
	if (subscription.status === "active") {
	  return {
		message: "Subscription confirmed successfully",
	  };
	}
  
	await confirmById(subscription._id);
  
	return {
	  message: "Subscription confirmed successfully",
	};
  };
  
  module.exports = {
	confirmSubscription,
  };