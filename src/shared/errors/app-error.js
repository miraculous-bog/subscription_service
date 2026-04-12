class AppError extends Error {
	constructor(message, statusCode, meta = {}) {
	  super(message);
	  this.statusCode = statusCode;
	  this.meta = meta;
	}
  }
  
  module.exports = {
	AppError,
  };