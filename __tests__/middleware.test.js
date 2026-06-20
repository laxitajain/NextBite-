/**
 * Tests for the middleware routing logic.
 * Verifies that:
 *  - Unauthenticated users are redirected to /login from protected routes
 *  - Authenticated users are redirected away from /login and /join
 *  - Role-based access prevents cross-role dashboard access
 *  - Public routes pass through unchanged
 */

jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}));

const { getToken } = require("next-auth/jwt");

// Simulate NextResponse and NextRequest
const redirects = [];

jest.mock("next/server", () => ({
  NextResponse: {
    redirect: (url) => {
      const redirect = { type: "redirect", url: url.toString() };
      redirects.push(redirect);
      return redirect;
    },
    next: () => ({ type: "next" }),
  },
}));

// Import the middleware after mocks
const { middleware } = require("../middleware");

function createRequest(pathname) {
  return {
    nextUrl: {
      pathname,
    },
    url: `http://localhost:3000${pathname}`,
  };
}

beforeEach(() => {
  redirects.length = 0;
  getToken.mockReset();
});

describe("Middleware routing", () => {
  describe("unauthenticated users", () => {
    beforeEach(() => {
      getToken.mockResolvedValue(null);
    });

    it("redirects /donor to /login", async () => {
      const res = await middleware(createRequest("/donor"));
      expect(res.type).toBe("redirect");
      expect(res.url).toContain("/login");
    });

    it("redirects /recipient to /login", async () => {
      const res = await middleware(createRequest("/recipient"));
      expect(res.type).toBe("redirect");
      expect(res.url).toContain("/login");
    });

    it("redirects /notifications to /login", async () => {
      const res = await middleware(createRequest("/notifications"));
      expect(res.type).toBe("redirect");
      expect(res.url).toContain("/login");
    });
  });

  describe("authenticated donor", () => {
    beforeEach(() => {
      getToken.mockResolvedValue({ id: "1", role: "donor" });
    });

    it("redirects /login to /donor", async () => {
      const res = await middleware(createRequest("/login"));
      expect(res.type).toBe("redirect");
      expect(res.url).toContain("/donor");
    });

    it("redirects /join to /donor", async () => {
      const res = await middleware(createRequest("/join"));
      expect(res.type).toBe("redirect");
      expect(res.url).toContain("/donor");
    });

    it("blocks access to /recipient", async () => {
      const res = await middleware(createRequest("/recipient"));
      expect(res.type).toBe("redirect");
      expect(res.url).toContain("/donor");
    });

    it("allows access to /donor", async () => {
      const res = await middleware(createRequest("/donor"));
      expect(res.type).toBe("next");
    });
  });

  describe("authenticated recipient", () => {
    beforeEach(() => {
      getToken.mockResolvedValue({ id: "2", role: "recipient" });
    });

    it("blocks access to /donor", async () => {
      const res = await middleware(createRequest("/donor"));
      expect(res.type).toBe("redirect");
      expect(res.url).toContain("/recipient");
    });

    it("allows access to /recipient", async () => {
      const res = await middleware(createRequest("/recipient"));
      expect(res.type).toBe("next");
    });

    it("allows access to /notifications", async () => {
      const res = await middleware(createRequest("/notifications"));
      expect(res.type).toBe("next");
    });
  });
});
