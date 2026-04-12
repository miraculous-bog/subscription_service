const errorHandler = (error, req, res, next) => {
	return res.status(error.statusCode || 500).json({
	  message: error.message || "Internal Server Error",
	});
  };
  
  module.exports = {
	errorHandler,
  };