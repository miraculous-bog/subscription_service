const axios = require("axios");
const { redisClient } = require("../cache/redis.client");
const { AppError } = require("../../shared/errors/app-error");

let githubRateLimitBlockedUntil = 0;
const GITHUB_CACHE_TTL_SECONDS = 600;

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

const getRateLimitDelaySeconds = (headers = {}) => {
  const retryAfterHeader = headers["retry-after"];
  const remainingHeader = headers["x-ratelimit-remaining"];
  const resetHeader = headers["x-ratelimit-reset"];

  if (retryAfterHeader) {
    return Number(retryAfterHeader);
  }

  if (remainingHeader === "0" && resetHeader) {
    const resetAtMs = Number(resetHeader) * 1000;
    const delayMs = Math.max(resetAtMs - Date.now(), 0);

    return Math.ceil(delayMs / 1000);
  }

  return 60;
};

const ensureGithubRateLimitWindowIsOpen = () => {
  if (Date.now() < githubRateLimitBlockedUntil) {
    const retryAfterSeconds = Math.ceil(
      (githubRateLimitBlockedUntil - Date.now()) / 1000
    );

    throw new AppError("GitHub API rate limit exceeded. Try again later.", 503, {
      retryAfterSeconds,
    });
  }
};

const handleGithubApiError = (error) => {
  const status = error.response?.status;
  const headers = error.response?.headers || {};
  const message = error.response?.data?.message || "";

  const isRateLimitError =
    status === 429 ||
    (status === 403 &&
      (headers["x-ratelimit-remaining"] === "0" ||
        message.toLowerCase().includes("rate limit")));

  if (isRateLimitError) {
    const retryAfterSeconds = getRateLimitDelaySeconds(headers);

    githubRateLimitBlockedUntil = Date.now() + retryAfterSeconds * 1000;

    throw new AppError("GitHub API rate limit exceeded. Try again later.", 503, {
      retryAfterSeconds,
    });
  }

  throw error;
};

const getCachedJson = async (key) => {
  const cachedValue = await redisClient.get(key);

  if (cachedValue === null) {
    return { hasValue: false, value: null };
  }

  return {
    hasValue: true,
    value: JSON.parse(cachedValue),
  };
};

const setCachedJson = async (key, value) => {
  await redisClient.set(key, JSON.stringify(value), {
    EX: GITHUB_CACHE_TTL_SECONDS,
  });
};

const checkRepositoryExists = async (fullName) => {
  ensureGithubRateLimitWindowIsOpen();

  const cacheKey = `github:repo-exists:${fullName.toLowerCase()}`;
  const cached = await getCachedJson(cacheKey);
  if (cached.hasValue) {
    return cached.value;
  }

  try {
    await githubClient.get(`/repos/${fullName}`);
    await setCachedJson(cacheKey, true);
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      await setCachedJson(cacheKey, false);
      return false;
    }

    handleGithubApiError(error);
  }
};

const getLatestRelease = async (fullName) => {
  ensureGithubRateLimitWindowIsOpen();

  const cacheKey = `github:latest-release:${fullName.toLowerCase()}`;
  const cached = await getCachedJson(cacheKey);

  if (cached.hasValue) {
    return cached.value;
  }

  try {
	
    const { data } = await githubClient.get(`/repos/${fullName}/releases/latest`);

    const release = {
      tagName: data.tag_name,
      name: data.name,
      htmlUrl: data.html_url,
      publishedAt: data.published_at,
      body: data.body,
    };

    await setCachedJson(cacheKey, release);
    return release;
  } catch (error) {
    if (error.response?.status === 404) {
      await setCachedJson(cacheKey, null);
      return null;
    }

    handleGithubApiError(error);
  }
};

const __resetGithubRateLimitStateForTests = () => {
  githubRateLimitBlockedUntil = 0;
};

module.exports = {
  checkRepositoryExists,
  getLatestRelease,
  __resetGithubRateLimitStateForTests,
};