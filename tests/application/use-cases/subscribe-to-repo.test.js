jest.mock("axios", () => {
  const get = jest.fn();
  return {
    create: jest.fn(() => ({
      get,
    })),
  };
});

jest.mock("../../../src/infrastructure/cache/redis.client", () => ({
  redisClient: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

const axios = require("axios");
const { redisClient } = require("../../../src/infrastructure/cache/redis.client");
const { AppError } = require("../../../src/shared/errors/app-error");

const {
  checkRepositoryExists,
  getLatestRelease,
  __resetGithubRateLimitStateForTests,
} = require("../../../src/infrastructure/services/github.service");

describe("github.service", () => {
  const githubClient = axios.create();

  beforeEach(() => {
    jest.clearAllMocks();
    __resetGithubRateLimitStateForTests();
  });

  describe("checkRepositoryExists", () => {
    it("returns cached repository existence when present in Redis", async () => {
      redisClient.get.mockResolvedValue("true");

      const result = await checkRepositoryExists("facebook/react");

      expect(result).toBe(true);
      expect(redisClient.get).toHaveBeenCalledWith(
        "github:repo-exists:facebook/react"
      );
      expect(githubClient.get).not.toHaveBeenCalled();
    });

    it("calls GitHub API and caches true when repository exists", async () => {
      redisClient.get.mockResolvedValue(null);
      githubClient.get.mockResolvedValue({ data: {} });
      redisClient.set.mockResolvedValue("OK");

      const result = await checkRepositoryExists("facebook/react");

      expect(result).toBe(true);
      expect(githubClient.get).toHaveBeenCalledWith("/repos/facebook/react");
      expect(redisClient.set).toHaveBeenCalledWith(
        "github:repo-exists:facebook/react",
        JSON.stringify(true),
        { EX: 600 }
      );
    });

    it("returns false and caches it when GitHub returns 404", async () => {
      redisClient.get.mockResolvedValue(null);
      githubClient.get.mockRejectedValue({
        response: {
          status: 404,
        },
      });
      redisClient.set.mockResolvedValue("OK");

      const result = await checkRepositoryExists("unknown/repo");

      expect(result).toBe(false);
      expect(redisClient.set).toHaveBeenCalledWith(
        "github:repo-exists:unknown/repo",
        JSON.stringify(false),
        { EX: 600 }
      );
    });

    it("throws AppError 503 and blocks next requests on GitHub rate limit", async () => {
      redisClient.get.mockResolvedValue(null);
      githubClient.get.mockRejectedValue({
        response: {
          status: 429,
          headers: {
            "retry-after": "120",
          },
          data: {
            message: "API rate limit exceeded",
          },
        },
      });

      await expect(
        checkRepositoryExists("facebook/react")
      ).rejects.toMatchObject({
        message: "GitHub API rate limit exceeded. Try again later.",
        statusCode: 503,
        meta: { retryAfterSeconds: 120 },
      });

      await expect(
        checkRepositoryExists("facebook/react")
      ).rejects.toMatchObject({
        message: "GitHub API rate limit exceeded. Try again later.",
        statusCode: 503,
      });

      expect(githubClient.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getLatestRelease", () => {
    it("returns cached latest release when present in Redis", async () => {
      const cachedRelease = {
        tagName: "v1.0.0",
        name: "Release 1",
        htmlUrl: "https://github.com/facebook/react/releases/tag/v1.0.0",
        publishedAt: "2026-01-01T00:00:00Z",
        body: "notes",
      };

      redisClient.get.mockResolvedValue(JSON.stringify(cachedRelease));

      const result = await getLatestRelease("facebook/react");

      expect(result).toEqual(cachedRelease);
      expect(redisClient.get).toHaveBeenCalledWith(
        "github:latest-release:facebook/react"
      );
      expect(githubClient.get).not.toHaveBeenCalled();
    });

    it("calls GitHub API and caches latest release for 600 seconds", async () => {
      redisClient.get.mockResolvedValue(null);
      githubClient.get.mockResolvedValue({
        data: {
          tag_name: "v1.0.0",
          name: "Release 1",
          html_url: "https://github.com/facebook/react/releases/tag/v1.0.0",
          published_at: "2026-01-01T00:00:00Z",
          body: "notes",
        },
      });
      redisClient.set.mockResolvedValue("OK");

      const result = await getLatestRelease("facebook/react");

      expect(result).toEqual({
        tagName: "v1.0.0",
        name: "Release 1",
        htmlUrl: "https://github.com/facebook/react/releases/tag/v1.0.0",
        publishedAt: "2026-01-01T00:00:00Z",
        body: "notes",
      });

      expect(githubClient.get).toHaveBeenCalledWith(
        "/repos/facebook/react/releases/latest"
      );

      expect(redisClient.set).toHaveBeenCalledWith(
        "github:latest-release:facebook/react",
        JSON.stringify({
          tagName: "v1.0.0",
          name: "Release 1",
          htmlUrl: "https://github.com/facebook/react/releases/tag/v1.0.0",
          publishedAt: "2026-01-01T00:00:00Z",
          body: "notes",
        }),
        { EX: 600 }
      );
    });

    it("returns cached null release result when Redis stores null", async () => {
      redisClient.get.mockResolvedValue("null");

      const result = await getLatestRelease("repo/without-releases");

      expect(result).toBeNull();
      expect(githubClient.get).not.toHaveBeenCalled();
    });

    it("returns null and caches it when GitHub returns 404", async () => {
      redisClient.get.mockResolvedValue(null);
      githubClient.get.mockRejectedValue({
        response: {
          status: 404,
        },
      });
      redisClient.set.mockResolvedValue("OK");

      const result = await getLatestRelease("repo/without-releases");

      expect(result).toBeNull();
      expect(redisClient.set).toHaveBeenCalledWith(
        "github:latest-release:repo/without-releases",
        JSON.stringify(null),
        { EX: 600 }
      );
    });

    it("throws AppError 503 on GitHub 403 rate limit with x-ratelimit headers", async () => {
      redisClient.get.mockResolvedValue(null);
      githubClient.get.mockRejectedValue({
        response: {
          status: 403,
          headers: {
            "x-ratelimit-remaining": "0",
            "x-ratelimit-reset": String(Math.floor(Date.now() / 1000) + 90),
          },
          data: {
            message: "API rate limit exceeded",
          },
        },
      });

      await expect(
        getLatestRelease("facebook/react")
      ).rejects.toBeInstanceOf(AppError);

      await expect(
        getLatestRelease("facebook/react")
      ).rejects.toMatchObject({
        statusCode: 503,
      });

      expect(githubClient.get).toHaveBeenCalledTimes(1);
    });

    it("rethrows non-rate-limit non-404 errors", async () => {
      redisClient.get.mockResolvedValue(null);
      const networkError = new Error("Network failed");
      githubClient.get.mockRejectedValue(networkError);

      await expect(
        getLatestRelease("facebook/react")
      ).rejects.toThrow("Network failed");
    });
  });
});