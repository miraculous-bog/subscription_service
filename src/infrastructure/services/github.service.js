const axios = require("axios");

const checkRepositoryExists = async (fullName) => {
  try {
    await axios.get(`https://api.github.com/repos/${fullName}`);
    return true;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return false;
    }

    throw error;
  }
};

module.exports = {
  checkRepositoryExists,
};