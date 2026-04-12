const apiKeyMiddleware = (req, res, next) => {
	return next();
  };
  
  module.exports = {
	apiKeyMiddleware,
  };