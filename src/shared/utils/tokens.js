const crypto = require("crypto");

const generateToken = () => {
  return crypto.randomUUID();
};

module.exports = {
  generateToken,
};