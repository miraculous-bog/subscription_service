jest.mock("../../../src/infrastructure/repositories/github-repository.repository.impl", () => ({
	findByFullName: jest.fn(),
	create: jest.fn(),
  }));
  
  jest.mock("../../../src/infrastructure/repositories/subscription.repository.impl", () => ({
	findByEmailAndRepositoryId: jest.fn(),
	create: jest.fn(),
	reactivateById: jest.fn(),
  }));
  
  jest.mock("../../../src/infrastructure/services/github.service", () => ({
	checkRepositoryExists: jest.fn(),
  }));
  
  jest.mock("../../../src/infrastructure/services/email.service", () => ({
	sendConfirmationEmail: jest.fn(),
  }));
  
  jest.mock("../../../src/shared/utils/tokens", () => ({
	generateToken: jest
	  .fn()
	  .mockReturnValueOnce("confirm-token")
	  .mockReturnValueOnce("unsubscribe-token"),
  }));
  
  const {
	findByFullName,
	create: createGithubRepository,
  } = require("../../../src/infrastructure/repositories/github-repository.repository.impl");
  const {
	findByEmailAndRepositoryId,
	create: createSubscription,
	reactivateById,
  } = require("../../../src/infrastructure/repositories/subscription.repository.impl");
  const { checkRepositoryExists } = require("../../../src/infrastructure/services/github.service");
  const { sendConfirmationEmail } = require("../../../src/infrastructure/services/email.service");
  const { subscribeToRepo } = require("../../../src/application/use-cases/subscribe-to-repo");
  const { AppError } = require("../../../src/shared/errors/app-error");
  
  describe("subscribeToRepo", () => {
	beforeEach(() => {
	  jest.clearAllMocks();
	});
  
	it("creates new pending subscription and sends confirmation email", async () => {
	  checkRepositoryExists.mockResolvedValue(true);
	  findByFullName.mockResolvedValue(null);
	  createGithubRepository.mockResolvedValue({
		_id: "repo-id-1",
		fullName: "facebook/react",
	  });
	  findByEmailAndRepositoryId.mockResolvedValue(null);
	  createSubscription.mockResolvedValue({ _id: "sub-id-1" });
	  sendConfirmationEmail.mockResolvedValue({});
  
	  const result = await subscribeToRepo({
		email: "TEST@EXAMPLE.COM",
		repo: "facebook/react",
	  });
  
	  expect(checkRepositoryExists).toHaveBeenCalledWith("facebook/react");
	  expect(createGithubRepository).toHaveBeenCalledWith({
		owner: "facebook",
		name: "react",
		fullName: "facebook/react",
	  });
	  expect(createSubscription).toHaveBeenCalledWith({
		email: "test@example.com",
		repositoryId: "repo-id-1",
		status: "pending",
		confirmToken: "confirm-token",
		unsubscribeToken: "unsubscribe-token",
	  });
	  expect(sendConfirmationEmail).toHaveBeenCalledWith(
		"test@example.com",
		"confirm-token",
		"unsubscribe-token"
	  );
	  expect(result).toEqual({
		message: "Subscription successful. Confirmation email sent.",
	  });
	});
  
	it("throws 400 for invalid repo format", async () => {
	  await expect(
		subscribeToRepo({
		  email: "test@example.com",
		  repo: "invalid-repo-name",
		})
	  ).rejects.toMatchObject({
		message: "Invalid input",
		statusCode: 400,
	  });
	});
  
	it("throws 404 when repository does not exist on GitHub", async () => {
	  checkRepositoryExists.mockResolvedValue(false);
  
	  await expect(
		subscribeToRepo({
		  email: "test@example.com",
		  repo: "unknown/repo",
		})
	  ).rejects.toMatchObject({
		message: "Repository not found on GitHub",
		statusCode: 404,
	  });
	});
  
	it("throws 409 when active subscription already exists", async () => {
	  checkRepositoryExists.mockResolvedValue(true);
	  findByFullName.mockResolvedValue({
		_id: "repo-id-1",
		fullName: "facebook/react",
	  });
	  findByEmailAndRepositoryId.mockResolvedValue({
		_id: "sub-id-1",
		status: "active",
	  });
  
	  await expect(
		subscribeToRepo({
		  email: "test@example.com",
		  repo: "facebook/react",
		})
	  ).rejects.toMatchObject({
		message: "Email already subscribed to this repository",
		statusCode: 409,
	  });
	});
  
	it("reactivates unsubscribed subscription instead of creating duplicate", async () => {
	  checkRepositoryExists.mockResolvedValue(true);
	  findByFullName.mockResolvedValue({
		_id: "repo-id-1",
		fullName: "facebook/react",
	  });
	  findByEmailAndRepositoryId.mockResolvedValue({
		_id: "sub-id-1",
		status: "unsubscribed",
	  });
	  sendConfirmationEmail.mockResolvedValue({});
	  reactivateById.mockResolvedValue({ _id: "sub-id-1", status: "pending" });
  
	  const result = await subscribeToRepo({
		email: "test@example.com",
		repo: "facebook/react",
	  });
  
	  expect(createSubscription).not.toHaveBeenCalled();
	  expect(reactivateById).toHaveBeenCalled();
	  expect(result).toEqual({
		message: "Subscription successful. Confirmation email sent.",
	  });
	});
  });