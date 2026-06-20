import {
  ACTIVE_PICKUP_STATUSES,
  canTransition,
  isListingExpired,
  shouldReopenListing,
  canSubmitRating,
} from "../lib/pickup-policy.mjs";

// ── Active status list ──────────────────────────────────────────────
describe("ACTIVE_PICKUP_STATUSES", () => {
  it("includes the four active states", () => {
    expect(ACTIVE_PICKUP_STATUSES).toEqual(
      expect.arrayContaining(["pending", "accepted", "en_route", "arrived"])
    );
    expect(ACTIVE_PICKUP_STATUSES).toHaveLength(4);
  });
});

// ── canTransition ───────────────────────────────────────────────────
describe("canTransition", () => {
  describe("donor transitions", () => {
    it("allows pending → accepted", () => {
      expect(canTransition("donor", "pending", "accepted")).toBe(true);
    });

    it("allows pending → rejected", () => {
      expect(canTransition("donor", "pending", "rejected")).toBe(true);
    });

    it("blocks pending → cancelled for donor", () => {
      expect(canTransition("donor", "pending", "cancelled")).toBe(false);
    });

    it("allows accepted → en_route", () => {
      expect(canTransition("donor", "accepted", "en_route")).toBe(true);
    });

    it("blocks accepted → completed (must arrive first)", () => {
      expect(canTransition("donor", "accepted", "completed")).toBe(false);
    });

    it("allows en_route → arrived", () => {
      expect(canTransition("donor", "en_route", "arrived")).toBe(true);
    });

    it("allows arrived → completed", () => {
      expect(canTransition("donor", "arrived", "completed")).toBe(true);
    });

    it("blocks completed → anything", () => {
      expect(canTransition("donor", "completed", "pending")).toBe(false);
    });
  });

  describe("recipient transitions", () => {
    it("allows pending → cancelled", () => {
      expect(canTransition("recipient", "pending", "cancelled")).toBe(true);
    });

    it("allows accepted → cancelled", () => {
      expect(canTransition("recipient", "accepted", "cancelled")).toBe(true);
    });

    it("blocks recipient from accepting", () => {
      expect(canTransition("recipient", "pending", "accepted")).toBe(false);
    });

    it("blocks recipient from completing", () => {
      expect(canTransition("recipient", "arrived", "completed")).toBe(false);
    });
  });

  it("returns false for unknown role", () => {
    expect(canTransition("admin", "pending", "accepted")).toBe(false);
  });
});

// ── isListingExpired ────────────────────────────────────────────────
describe("isListingExpired", () => {
  it("returns true for expired listing", () => {
    const listing = { expiryTime: "2020-01-01T00:00:00Z" };
    expect(isListingExpired(listing)).toBe(true);
  });

  it("returns false for future expiry", () => {
    const listing = { expiryTime: "2099-01-01T00:00:00Z" };
    expect(isListingExpired(listing)).toBe(false);
  });

  it("returns false when expiryTime is missing", () => {
    expect(isListingExpired({})).toBe(false);
    expect(isListingExpired(null)).toBe(false);
  });
});

// ── shouldReopenListing ─────────────────────────────────────────────
describe("shouldReopenListing", () => {
  it("reopens when accepted request is cancelled", () => {
    expect(shouldReopenListing("accepted", "cancelled")).toBe(true);
  });

  it("does not reopen for other transitions", () => {
    expect(shouldReopenListing("pending", "cancelled")).toBe(false);
    expect(shouldReopenListing("accepted", "completed")).toBe(false);
    expect(shouldReopenListing("en_route", "cancelled")).toBe(false);
  });
});

// ── canSubmitRating ─────────────────────────────────────────────────
describe("canSubmitRating", () => {
  it("allows rating on completed without existing rating", () => {
    expect(canSubmitRating({ status: "completed", existingRating: null })).toBe(true);
  });

  it("blocks rating if already rated", () => {
    expect(canSubmitRating({ status: "completed", existingRating: 4 })).toBe(false);
  });

  it("blocks rating on non-completed", () => {
    expect(canSubmitRating({ status: "accepted", existingRating: null })).toBe(false);
  });
});
