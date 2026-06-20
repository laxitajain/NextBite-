"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DonorForm from "../_components/DonorForm";
import DonorListingRow from "../_components/DonorListingRow";
import PickupTracker from "../_components/PickupTracker";
import ConfirmDialog from "../_components/ConfirmDialog";
import Button from "../_components/Button";
import { useToast } from "../_components/ToastProvider";
import { RowListSkeleton, EmptyState } from "../_components/Skeleton";
import Link from "next/link";

const sectionCard =
  "bg-white/80 backdrop-blur-sm border border-accent-rust/60 rounded-2xl shadow-sm p-6";

export default function DonorPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("create");

  const [listings, setListings] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const response = await fetch(`/api/donor/${session.user.email}`);
      const result = await response.json();
      if (result.success) {
        setUser(result.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  }, [session?.user?.email]);

  const fetchMyListings = useCallback(async () => {
    if (!user?._id) return;
    setListingsLoading(true);
    try {
      const response = await fetch(
        `/api/listings?donorId=${user._id}&includeAllStatuses=true&limit=100`
      );
      const result = await response.json();
      if (result.success) {
        setListings(result.data);
      }
    } catch (error) {
      console.error("Error fetching my listings:", error);
    } finally {
      setListingsLoading(false);
    }
  }, [user?._id]);

  const fetchRequests = useCallback(async () => {
    if (!user?._id) return;
    setRequestsLoading(true);
    try {
      const response = await fetch(
        `/api/pickup-requests?userId=${user._id}&role=donor&limit=100`
      );
      const result = await response.json();
      if (result.success) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error("Error fetching pickup requests:", error);
    } finally {
      setRequestsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  useEffect(() => {
    if (activeTab === "my-listings") fetchMyListings();
    if (activeTab === "requests") fetchRequests();
  }, [activeTab, fetchMyListings, fetchRequests]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/listings/${deleteTarget._id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setListings((prev) => prev.filter((l) => l._id !== deleteTarget._id));
        toast("Listing deleted", "success");
      } else {
        toast("Failed to delete: " + result.message, "error");
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
      toast("Failed to delete listing", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleEditDone = (updated) => {
    setEditingListing(null);
    if (updated) fetchMyListings();
  };

  const handleRequestStatusUpdate = (updated) => {
    setRequests((prev) =>
      prev.map((r) => (r._id === updated._id ? updated : r))
    );
    setSelectedRequest(updated);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className={`${sectionCard} text-center max-w-md`}>
          <h1 className="text-2xl font-anton text-primary mb-4">
            Please log in to access donor features
          </h1>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const groupedRequests = {
    pending: requests.filter((r) => r.status === "pending"),
    active: requests.filter((r) =>
      ["accepted", "en_route", "arrived"].includes(r.status)
    ),
    history: requests.filter((r) =>
      ["completed", "rejected", "cancelled"].includes(r.status)
    ),
  };

  const tabs = [
    { id: "create", label: "Create Listing" },
    { id: "my-listings", label: "My Listings" },
    { id: "requests", label: "Pickup Requests" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-anton text-primary mb-2">
          Welcome, {user?.name || session.user.name}!
        </h1>
        <p className="text-primary/70">
          Help reduce food waste by sharing your surplus food with those in
          need.
        </p>
      </div>

      <div className="mb-8 border-b border-accent-rust">
        <nav className="flex flex-wrap gap-2 md:gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setEditingListing(null);
                setSelectedRequest(null);
              }}
              className={`py-3 px-1 -mb-px border-b-2 font-semibold text-sm md:text-base transition ${
                activeTab === tab.id
                  ? "border-secondary text-primary"
                  : "border-transparent text-primary/60 hover:text-primary hover:border-accent-rust"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === "create" && <DonorForm user={user} />}

        {activeTab === "my-listings" && (
          <div>
            {editingListing ? (
              <DonorForm
                user={user}
                listing={editingListing}
                onDone={handleEditDone}
              />
            ) : (
              <div className={sectionCard}>
                <h2 className="text-2xl font-anton text-primary mb-4">
                  My Food Listings
                </h2>
                {listingsLoading ? (
                  <RowListSkeleton count={3} />
                ) : listings.length === 0 ? (
                  <EmptyState
                    icon="🍲"
                    title="No listings yet"
                    message="You haven't created any food listings yet. Share your surplus food to get started!"
                    action={
                      <Button onClick={() => setActiveTab("create")} className="!w-auto">
                        Create your first listing
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-3">
                    {listings.map((l) => (
                      <DonorListingRow
                        key={l._id}
                        listing={l}
                        onEdit={setEditingListing}
                        onDelete={setDeleteTarget}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className={sectionCard}>
                <h3 className="font-anton text-lg text-primary mb-3">
                  Pending
                </h3>
                {requestsLoading ? (
                  <p className="text-sm text-primary/60">Loading...</p>
                ) : groupedRequests.pending.length === 0 ? (
                  <p className="text-sm text-primary/60">
                    No pending requests.
                  </p>
                ) : (
                  groupedRequests.pending.map((r) => (
                    <RequestSummary
                      key={r._id}
                      request={r}
                      selected={selectedRequest?._id === r._id}
                      onSelect={setSelectedRequest}
                    />
                  ))
                )}
              </div>

              <div className={sectionCard}>
                <h3 className="font-anton text-lg text-primary mb-3">Active</h3>
                {groupedRequests.active.length === 0 ? (
                  <p className="text-sm text-primary/60">No active pickups.</p>
                ) : (
                  groupedRequests.active.map((r) => (
                    <RequestSummary
                      key={r._id}
                      request={r}
                      selected={selectedRequest?._id === r._id}
                      onSelect={setSelectedRequest}
                    />
                  ))
                )}
              </div>

              <div className={sectionCard}>
                <h3 className="font-anton text-lg text-primary mb-3">
                  History
                </h3>
                {groupedRequests.history.length === 0 ? (
                  <p className="text-sm text-primary/60">No history yet.</p>
                ) : (
                  groupedRequests.history.map((r) => (
                    <RequestSummary
                      key={r._id}
                      request={r}
                      selected={selectedRequest?._id === r._id}
                      onSelect={setSelectedRequest}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              {selectedRequest ? (
                <PickupTracker
                  pickupRequest={selectedRequest}
                  user={{ ...user, role: "donor" }}
                  onStatusUpdate={handleRequestStatusUpdate}
                />
              ) : (
                <div className={`${sectionCard} text-primary/70`}>
                  Select a pickup request to manage it.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete listing"
        message={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        pending={deleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function RequestSummary({ request, selected, onSelect }) {
  const title = request.listingId?.title || "Untitled";
  const who = request.recipientId?.name || "Unknown recipient";
  return (
    <button
      type="button"
      onClick={() => onSelect(request)}
      className={`w-full text-left p-3 mb-2 rounded-xl border transition ${
        selected
          ? "border-secondary bg-accent-mango/60"
          : "border-accent-rust bg-white hover:bg-accent-light"
      }`}
    >
      <div className="font-semibold text-sm text-primary line-clamp-1">
        {title}
      </div>
      <div className="text-xs text-primary/70">from {who}</div>
      <div className="text-xs text-primary/50 mt-1 capitalize">
        {request.status.replace("_", " ")}
      </div>
    </button>
  );
}
