const {
	findByUnsubscribeToken,
	unsubscribeById,
  } = require("../../infrastructure/repositories/subscription.repository.impl");
  
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
	  return {
		message: "Unsubscribed successfully",
	  };
	}
  
	await unsubscribeById(subscription._id);
  
	return {
	  message: "Unsubscribed successfully",
	};
  };
  
  module.exports = {
	unsubscribe,
  };