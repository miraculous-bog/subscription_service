const axios = require("axios");

const githubClient = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
    ...(process.env.GITHUB_TOKEN
      ? {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        }
      : {}),
  },
});

const checkRepositoryExists = async (fullName) => {
  try {
    await githubClient.get(`/repos/${fullName}`);
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      return false;
    }

    throw error;
  }
};

const getLatestRelease = async (fullName) => {
  try {
    const { data } = await githubClient.get(`/repos/${fullName}/releases/latest`);

    return {
      tagName: data.tag_name,
      name: data.name,
      htmlUrl: data.html_url,
      publishedAt: data.published_at,
      body: data.body,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }

    if (error.response?.status === 429) {
      console.error(`GitHub rate limit reached while checking ${fullName}`);
      return null;
    }

    throw error;
  }
};

module.exports = {
  checkRepositoryExists,
  getLatestRelease,
};