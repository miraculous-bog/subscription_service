const { generateToken } = require("../../../src/shared/utils/tokens");

describe("generateToken", () => {
  it("returns a non-empty string token", () => {
    const token = generateToken();

    expect(typeof token).toBe("string");
    expect(token).toBeTruthy();
  });

  it("returns different tokens on consecutive calls", () => {
    const firstToken = generateToken();
    const secondToken = generateToken();

    expect(firstToken).not.toBe(secondToken);
  });

  it("returns a UUID-like token shape", () => {
    const token = generateToken();

    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});
