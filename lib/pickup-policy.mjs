export const ACTIVE_PICKUP_STATUSES = [
  "pending",
  "accepted",
  "en_route",
  "arrived",
];

const TRANSITIONS = {
  donor: {
    pending: ["accepted", "rejected"],
    accepted: ["en_route"],
    en_route: ["en_route", "arrived", "delayed"],
    arrived: ["completed"],
  },
  recipient: {
    pending: ["cancelled"],
    accepted: ["cancelled"],
  },
};

export function canTransition(role, currentStatus, nextStatus) {
  return Boolean(TRANSITIONS[role]?.[currentStatus]?.includes(nextStatus));
}

export function isListingExpired(listing, now = new Date()) {
  return Boolean(listing?.expiryTime && new Date(listing.expiryTime) <= now);
}

export function shouldReopenListing(currentRequestStatus, nextStatus) {
  return currentRequestStatus === "accepted" && nextStatus === "cancelled";
}

export function canSubmitRating({ status, existingRating }) {
  return status === "completed" && !existingRating;
}
