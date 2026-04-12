jest.mock("../../../src/infrastructure/repositories/subscription.repository.impl", () => ({
	findActiveByEmail: jest.fn(),
  }));
  
  const {
	findActiveByEmail,
  } = require("../../../src/infrastructure/repositories/subscription.repository.impl");
  const {
	getSubscriptionsByEmail,
  } = require("../../../src/application/use-cases/get-subscriptions-by-email");
  
  describe("getSubscriptionsByEmail", () => {
	beforeEach(() => {
	  jest.clearAllMocks();
	});
  
	it("returns active subscriptions in swagger format", async () => {
	  findActiveByEmail.mockResolvedValue([
		{
		  email: "test@example.com",
		  status: "active",
		  repositoryId: {
			fullName: "facebook/react",
			lastSeenTag: "v1.2.3",
		  },
		},
	  ]);
  
	  const result = await getSubscriptionsByEmail("test@example.com");
  
	  expect(result).toEqual([
		{
		  email: "test@example.com",
		  repo: "facebook/react",
		  confirmed: true,
		  last_seen_tag: "v1.2.3",
		},
	  ]);
	});
  
	it("throws 400 for invalid email", async () => {
	  await expect(getSubscriptionsByEmail("bad-email")).rejects.toMatchObject({
		message: "Invalid email",
		statusCode: 400,
	  });
	});
  });