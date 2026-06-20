/**
 * Tests for the shared auth helpers used across API routes.
 * These are pure-function tests — no network/DB required.
 */

// Mock next-auth/jwt so `getRequestUser` can be tested without a running server
jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

// Mock next/server since it's a server-side module
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body, init) => ({ body, status: init?.status ?? 200 }),
  },
}));

const { getToken } = require("next-auth/jwt");
const { getRequestUser, authError, hasRole, owns } = require("../lib/auth");

// ── getRequestUser ──────────────────────────────────────────────────
describe("getRequestUser", () => {
  const fakeRequest = {};

  it("returns null when no token", async () => {
    getToken.mockResolvedValueOnce(null);
    const user = await getRequestUser(fakeRequest);
    expect(user).toBeNull();
  });

  it("returns null when token has no id", async () => {
    getToken.mockResolvedValueOnce({ email: "a@b.com" });
    const user = await getRequestUser(fakeRequest);
    expect(user).toBeNull();
  });

  it("returns user object from valid token", async () => {
    getToken.mockResolvedValueOnce({
      id: "abc123",
      email: "donor@test.com",
      name: "Test Donor",
      role: "donor",
    });
    const user = await getRequestUser(fakeRequest);
    expect(user).toEqual({
      id: "abc123",
      email: "donor@test.com",
      name: "Test Donor",
      role: "donor",
    });
  });

  it("coerces id to string", async () => {
    getToken.mockResolvedValueOnce({ id: 123, email: "x@y.com", name: "X", role: "recipient" });
    const user = await getRequestUser(fakeRequest);
    expect(user.id).toBe("123");
  });
});

// ── authError ───────────────────────────────────────────────────────
describe("authError", () => {
  it("returns 401 with login message by default", () => {
    const res = authError();
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/log in/i);
  });

  it("returns 403 with permission message", () => {
    const res = authError(403);
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/permission/i);
  });
});

// ── hasRole ─────────────────────────────────────────────────────────
describe("hasRole", () => {
  const donor = { id: "1", role: "donor" };
  const recipient = { id: "2", role: "recipient" };

  it("returns true when role matches", () => {
    expect(hasRole(donor, "donor")).toBe(true);
  });

  it("returns true when any role matches", () => {
    expect(hasRole(recipient, "donor", "recipient")).toBe(true);
  });

  it("returns false when role doesn't match", () => {
    expect(hasRole(donor, "recipient")).toBe(false);
  });

  it("returns false for null user", () => {
    expect(hasRole(null, "donor")).toBe(false);
  });
});

// ── owns ────────────────────────────────────────────────────────────
describe("owns", () => {
  const user = { id: "abc123" };

  it("returns true when IDs match", () => {
    expect(owns(user, "abc123")).toBe(true);
  });

  it("coerces ObjectId-like values to string for comparison", () => {
    // Simulating a Mongoose ObjectId-like object with toString
    const objectId = { toString: () => "abc123" };
    expect(owns(user, String(objectId))).toBe(true);
  });

  it("returns false when IDs differ", () => {
    expect(owns(user, "xyz789")).toBe(false);
  });

  it("returns false for null user", () => {
    expect(owns(null, "abc123")).toBe(false);
  });

  it("returns false for null ownerId", () => {
    expect(owns(user, null)).toBe(false);
  });
});
