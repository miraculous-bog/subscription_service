const axios = require("axios");

const checkRepositoryExists = async (fullName) => {
  const url = `https://api.github.com/repos/${fullName}`;

  try {
    const response = await axios.get(url);

    return {
      exists: true,
      data: response.data,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return { exists: false };
    }

    throw error;
  }
};

module.exports = {
  checkRepositoryExists,
};