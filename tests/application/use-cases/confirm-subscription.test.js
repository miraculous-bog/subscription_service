jest.mock("../../../src/infrastructure/repositories/subscription.repository.impl", () => ({
  findByConfirmToken: jest.fn(),
  confirmById: jest.fn(),
}));

const {
  findByConfirmToken,
  confirmById,
} = require("../../../src/infrastructure/repositories/subscription.repository.impl");
const {
  confirmSubscription,
} = require("../../../src/application/use-cases/confirm-subscription");

describe("confirmSubscription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("confirms pending subscription", async () => {
    findByConfirmToken.mockResolvedValue({
      _id: "sub-id-1",
      status: "pending",
    });
    confirmById.mockResolvedValue({
      _id: "sub-id-1",
      status: "active",
    });

    const result = await confirmSubscription("token-123");

    expect(findByConfirmToken).toHaveBeenCalledWith("token-123");
    expect(confirmById).toHaveBeenCalledWith("sub-id-1");
    expect(result).toEqual({
      message: "Subscription confirmed successfully",
    });
  });

  it("throws 400 when token is missing", async () => {
    await expect(confirmSubscription("")).rejects.toMatchObject({
      message: "Invalid token",
      statusCode: 400,
    });

    expect(findByConfirmToken).not.toHaveBeenCalled();
  });

  it("throws 404 when token is not found", async () => {
    findByConfirmToken.mockResolvedValue(null);

    await expect(confirmSubscription("missing-token")).rejects.toMatchObject({
      message: "Token not found",
      statusCode: 404,
    });

    expect(confirmById).not.toHaveBeenCalled();
  });

  it("returns success without updating already active subscription", async () => {
    findByConfirmToken.mockResolvedValue({
      _id: "sub-id-1",
      status: "active",
    });

    const result = await confirmSubscription("token-123");

    expect(confirmById).not.toHaveBeenCalled();
    expect(result).toEqual({
      message: "Subscription confirmed successfully",
    });
  });
});
