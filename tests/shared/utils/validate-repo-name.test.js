const { isValidRepoName } = require("../../../src/shared/utils/validate-repo-name");

describe("isValidRepoName", () => {
  it("returns true for valid owner/repo format", () => {
    expect(isValidRepoName("golang/go")).toBe(true);
    expect(isValidRepoName("owner/repo-name")).toBe(true);
  });

  it("returns false for missing slash", () => {
    expect(isValidRepoName("golang")).toBe(false);
  });

  it("returns false for empty owner or repository", () => {
    expect(isValidRepoName("/repo")).toBe(false);
    expect(isValidRepoName("owner/")).toBe(false);
  });

  it("returns false for extra path segments", () => {
    expect(isValidRepoName("owner/repo/extra")).toBe(false);
  });

  it("returns false for empty or non-string input", () => {
    expect(isValidRepoName("")).toBe(false);
    expect(isValidRepoName(null)).toBe(false);
    expect(isValidRepoName(undefined)).toBe(false);
    expect(isValidRepoName(123)).toBe(false);
  });
});
