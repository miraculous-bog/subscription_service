jest.mock("../../../src/infrastructure/repositories/subscription.repository.impl", () => ({
	findByEmailAndRepositoryFullName: jest.fn(),
  }));
  
  jest.mock("../../../src/application/use-cases/unsubscribe", () => ({
	unsubscribe: jest.fn(),
  }));
  
  const {
	findByEmailAndRepositoryFullName,
  } = require("../../../src/infrastructure/repositories/subscription.repository.impl");
  
  const {
	unsubscribe,
  } = require("../../../src/application/use-cases/unsubscribe");
  
  const {
	unsubscribeByEmailAndRepo,
  } = require("../../../src/application/use-cases/unsubscribe-by-email-and-repo");
  
  describe("unsubscribeByEmailAndRepo", () => {
	beforeEach(() => {
	  jest.clearAllMocks();
	});
  
	it("unsubscribes by email and repo using existing unsubscribe token", async () => {
	  findByEmailAndRepositoryFullName.mockResolvedValue({
		_id: "sub-1",
		email: "test@example.com",
		unsubscribeToken: "token-123",
	  });
  
	  unsubscribe.mockResolvedValue({
		message: "Unsubscribed successfully",
	  });
  
	  const result = await unsubscribeByEmailAndRepo({
		email: "TEST@EXAMPLE.COM",
		repo: "facebook/react",
	  });
  
	  expect(findByEmailAndRepositoryFullName).toHaveBeenCalledWith(
		"test@example.com",
		"facebook/react"
	  );
	  expect(unsubscribe).toHaveBeenCalledWith("token-123");
	  expect(result).toEqual({
		message: "Unsubscribed successfully",
	  });
	});
  
	it("throws 400 when email or repo is missing", async () => {
	  await expect(
		unsubscribeByEmailAndRepo({ email: "", repo: "facebook/react" })
	  ).rejects.toMatchObject({
		message: "Email and repo are required",
		statusCode: 400,
	  });
  
	  await expect(
		unsubscribeByEmailAndRepo({ email: "test@example.com", repo: "" })
	  ).rejects.toMatchObject({
		message: "Email and repo are required",
		statusCode: 400,
	  });
	});
  
	it("throws 400 for invalid repo format", async () => {
	  await expect(
		unsubscribeByEmailAndRepo({
		  email: "test@example.com",
		  repo: "invalid-repo",
		})
	  ).rejects.toMatchObject({
		message: "Invalid input",
		statusCode: 400,
	  });
	});
  
	it("throws 404 when subscription is not found", async () => {
	  findByEmailAndRepositoryFullName.mockResolvedValue(null);
  
	  await expect(
		unsubscribeByEmailAndRepo({
		  email: "test@example.com",
		  repo: "facebook/react",
		})
	  ).rejects.toMatchObject({
		message: "Subscription not found",
		statusCode: 404,
	  });
  
	  expect(unsubscribe).not.toHaveBeenCalled();
	});
  
	it("throws 404 when unsubscribe token is missing", async () => {
	  findByEmailAndRepositoryFullName.mockResolvedValue({
		_id: "sub-1",
		email: "test@example.com",
		unsubscribeToken: null,
	  });
  
	  await expect(
		unsubscribeByEmailAndRepo({
		  email: "test@example.com",
		  repo: "facebook/react",
		})
	  ).rejects.toMatchObject({
		message: "Unsubscribe token not found",
		statusCode: 404,
	  });
  
	  expect(unsubscribe).not.toHaveBeenCalled();
	});
  });