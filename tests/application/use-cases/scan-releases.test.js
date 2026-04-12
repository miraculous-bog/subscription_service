jest.mock("../../../src/infrastructure/repositories/github-repository.repository.impl", () => ({
	findAll: jest.fn(),
	updateLastSeenTagById: jest.fn(),
	touchLastCheckedAtById: jest.fn(),
  }));
  
  jest.mock("../../../src/infrastructure/repositories/subscription.repository.impl", () => ({
	findActiveByRepositoryId: jest.fn(),
  }));
  
  jest.mock("../../../src/infrastructure/services/github.service", () => ({
	getLatestRelease: jest.fn(),
  }));
  
  jest.mock("../../../src/infrastructure/services/email.service", () => ({
	sendReleaseNotificationEmail: jest.fn(),
  }));
  
  const {
	findAll,
	updateLastSeenTagById,
	touchLastCheckedAtById,
  } = require("../../../src/infrastructure/repositories/github-repository.repository.impl");
  const {
	findActiveByRepositoryId,
  } = require("../../../src/infrastructure/repositories/subscription.repository.impl");
  const {
	getLatestRelease,
  } = require("../../../src/infrastructure/services/github.service");
  const {
	sendReleaseNotificationEmail,
  } = require("../../../src/infrastructure/services/email.service");
  const { scanReleases } = require("../../../src/application/use-cases/scan-releases");
  
  describe("scanReleases", () => {
	beforeEach(() => {
	  jest.clearAllMocks();
	});
  
	it("stores initial lastSeenTag without sending email on first scan", async () => {
	  findAll.mockResolvedValue([
		{
		  _id: "repo-1",
		  fullName: "facebook/react",
		  lastSeenTag: null,
		},
	  ]);
	  getLatestRelease.mockResolvedValue({
		tagName: "v1.0.0",
		name: "Release v1.0.0",
		htmlUrl: "https://github.com/facebook/react/releases/tag/v1.0.0",
	  });
  
	  await scanReleases();
  
	  expect(updateLastSeenTagById).toHaveBeenCalledWith("repo-1", "v1.0.0");
	  expect(sendReleaseNotificationEmail).not.toHaveBeenCalled();
	});
  
	it("sends emails when new release is detected", async () => {
	  findAll.mockResolvedValue([
		{
		  _id: "repo-1",
		  fullName: "facebook/react",
		  lastSeenTag: "v1.0.0",
		},
	  ]);
	  getLatestRelease.mockResolvedValue({
		tagName: "v1.1.0",
		name: "Release v1.1.0",
		htmlUrl: "https://github.com/facebook/react/releases/tag/v1.1.0",
		publishedAt: "2026-04-12T10:00:00Z",
	  });
	  findActiveByRepositoryId.mockResolvedValue([
		{
		  email: "user@example.com",
		  unsubscribeToken: "unsubscribe-token",
		},
	  ]);
  
	  await scanReleases();
  
	  expect(sendReleaseNotificationEmail).toHaveBeenCalledWith(
		"user@example.com",
		"unsubscribe-token",
		"facebook/react",
		expect.objectContaining({ tagName: "v1.1.0" })
	  );
	  expect(updateLastSeenTagById).toHaveBeenCalledWith("repo-1", "v1.1.0");
	});
  
	it("does nothing when release tag has not changed", async () => {
	  findAll.mockResolvedValue([
		{
		  _id: "repo-1",
		  fullName: "facebook/react",
		  lastSeenTag: "v1.1.0",
		},
	  ]);
	  getLatestRelease.mockResolvedValue({
		tagName: "v1.1.0",
	  });
  
	  await scanReleases();
  
	  expect(sendReleaseNotificationEmail).not.toHaveBeenCalled();
	  expect(touchLastCheckedAtById).toHaveBeenCalledWith("repo-1");
	});
  });