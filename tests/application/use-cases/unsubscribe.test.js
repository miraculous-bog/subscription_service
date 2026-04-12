jest.mock("../../../src/infrastructure/repositories/subscription.repository.impl", () => ({
	findByUnsubscribeToken: jest.fn(),
	unsubscribeById: jest.fn(),
  }));
  
  const {
	findByUnsubscribeToken,
	unsubscribeById,
  } = require("../../../src/infrastructure/repositories/subscription.repository.impl");
  const { unsubscribe } = require("../../../src/application/use-cases/unsubscribe");
  
  describe("unsubscribe", () => {
	beforeEach(() => {
	  jest.clearAllMocks();
	});
  
	it("marks subscription as unsubscribed", async () => {
	  findByUnsubscribeToken.mockResolvedValue({
		_id: "sub-id-1",
		status: "active",
	  });
	  unsubscribeById.mockResolvedValue({
		_id: "sub-id-1",
		status: "unsubscribed",
	  });
  
	  const result = await unsubscribe("unsubscribe-token");
  
	  expect(unsubscribeById).toHaveBeenCalledWith("sub-id-1");
	  expect(result).toEqual({
		message: "Unsubscribed successfully",
	  });
	});
  
	it("throws 404 when unsubscribe token not found", async () => {
	  findByUnsubscribeToken.mockResolvedValue(null);
  
	  await expect(unsubscribe("missing-token")).rejects.toMatchObject({
		message: "Token not found",
		statusCode: 404,
	  });
	});
  });