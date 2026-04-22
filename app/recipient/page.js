"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import FoodListingCard from "../_components/FoodListingCard";
import FoodMap from "../_components/FoodMap";
import PickupTracker from "../_components/PickupTracker";
import Button from "../_components/Button";
import { Search, MapPin, List, Grid } from "lucide-react";

const sectionCard =
  "bg-white/80 backdrop-blur-sm border border-accent-rust/60 rounded-2xl shadow-sm p-6";

const inputBase =
  "w-full px-3 py-2 rounded-xl border border-accent-rust bg-white text-primary placeholder:text-primary/40 transition focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary";

export default function RecipientPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("browse");

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    search: "",
    foodType: "",
    radius: 10,
    maxPrice: "",
  });
  const [selectedListing, setSelectedListing] = useState(null);

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

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

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setUserLocation({ lat: 19.076, lng: 72.8777 });
        }
      );
    }
  };

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: "available" });
      if (userLocation) {
        params.append("lat", userLocation.lat.toString());
        params.append("lng", userLocation.lng.toString());
        params.append("radius", filters.radius.toString());
      }
      if (filters.foodType) params.append("foodType", filters.foodType);

      const response = await fetch(`/api/listings?${params}`);
      const result = await response.json();
      if (result.success) {
        setListings(result.data);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  }, [userLocation, filters.radius, filters.foodType]);

  const fetchMyPickups = useCallback(async () => {
    if (!user?._id) return;
    setRequestsLoading(true);
    try {
      const response = await fetch(
        `/api/pickup-requests?userId=${user._id}&role=recipient&limit=100`
      );
      const result = await response.json();
      if (result.success) {
        setRequests(result.data);
      }
    } catch (error) {
      console.error("Error fetching my pickups:", error);
    } finally {
      setRequestsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    if (session) {
      fetchUserProfile();
      requestLocation();
    }
  }, [session, fetchUserProfile]);

  useEffect(() => {
    if (activeTab === "browse") fetchListings();
  }, [activeTab, fetchListings]);

  useEffect(() => {
    if (activeTab === "pickups") fetchMyPickups();
  }, [activeTab, fetchMyPickups]);

  const handleListingClick = (listing) => {
    setSelectedListing(listing);
    setViewMode("grid");
  };

  const handleRequestStatusUpdate = (updated) => {
    setRequests((prev) =>
      prev.map((r) => (r._id === updated._id ? updated : r))
    );
    setSelectedRequest(updated);
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      !filters.search ||
      listing.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      listing.description
        ?.toLowerCase()
        .includes(filters.search.toLowerCase());
    const matchesPrice =
      !filters.maxPrice ||
      !listing.estimatedValue ||
      listing.estimatedValue <= parseFloat(filters.maxPrice);
    return matchesSearch && matchesPrice;
  });

  if (!session) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className={`${sectionCard} text-center max-w-md`}>
          <h1 className="text-2xl font-anton text-primary mb-4">
            Please log in to browse food listings
          </h1>
          <Button onClick={() => (window.location.href = "/login")}>
            Login
          </Button>
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
    { id: "browse", label: "Browse" },
    { id: "pickups", label: "My Pickups" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-anton text-primary mb-2">
          Find Food Near You
        </h1>
        <p className="text-primary/70">
          Discover surplus food and track your pickups.
        </p>
      </div>

      <div className="mb-8 border-b border-accent-rust">
        <nav className="flex flex-wrap gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
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

      {activeTab === "browse" && (
        <>
          <div className={`${sectionCard} mb-8`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search food listings..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  className={`${inputBase} pl-10`}
                />
              </div>

              <select
                value={filters.foodType}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    foodType: e.target.value,
                  }))
                }
                className={inputBase}
              >
                <option value="">All Food Types</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Packaged Food">Packaged Food</option>
                <option value="Fresh Produce">Fresh Produce</option>
                <option value="Bakery">Bakery</option>
              </select>

              <select
                value={filters.radius}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    radius: parseInt(e.target.value),
                  }))
                }
                className={inputBase}
              >
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={25}>Within 25 km</option>
                <option value={50}>Within 50 km</option>
              </select>

              <input
                type="number"
                placeholder="Max price (₹)"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    maxPrice: e.target.value,
                  }))
                }
                className={inputBase}
              />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3">
              <span className="text-sm text-primary/70 font-semibold">
                {filteredListings.length} listing
                {filteredListings.length === 1 ? "" : "s"} found
              </span>

              <div className="flex bg-accent-light rounded-full p-1 border border-accent-rust">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-full transition ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-primary"
                      : "text-primary/60 hover:text-primary"
                  }`}
                  title="Grid View"
                  aria-label="Grid view"
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-full transition ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-primary"
                      : "text-primary/60 hover:text-primary"
                  }`}
                  title="List View"
                  aria-label="List view"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`p-2 rounded-full transition ${
                    viewMode === "map"
                      ? "bg-white shadow-sm text-primary"
                      : "text-primary/60 hover:text-primary"
                  }`}
                  title="Map View"
                  aria-label="Map view"
                >
                  <MapPin className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : (
            <>
              {viewMode === "map" && (
                <div className="bg-white border border-accent-rust rounded-2xl shadow-sm overflow-hidden">
                  <FoodMap
                    listings={filteredListings}
                    userLocation={userLocation}
                    onListingClick={handleListingClick}
                  />
                </div>
              )}

              {(viewMode === "grid" || viewMode === "list") && (
                <div
                  className={`grid gap-6 ${
                    viewMode === "grid"
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                      : "grid-cols-1"
                  }`}
                >
                  {filteredListings.map((listing) => (
                    <FoodListingCard
                      key={listing._id}
                      listing={listing}
                      user={user}
                      onRequestPickup={() => {
                        fetchListings();
                        fetchMyPickups();
                      }}
                    />
                  ))}
                </div>
              )}

              {filteredListings.length === 0 && !loading && (
                <div className={`${sectionCard} text-center py-12`}>
                  <div className="text-6xl mb-4">🍽️</div>
                  <h3 className="text-xl font-anton text-primary mb-2">
                    No listings found
                  </h3>
                  <p className="text-primary/70 mb-4">
                    Try adjusting your search criteria or expanding your search
                    radius.
                  </p>
                  <Button
                    onClick={() =>
                      setFilters({
                        search: "",
                        foodType: "",
                        radius: 10,
                        maxPrice: "",
                      })
                    }
                    className="!w-auto"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </>
          )}

          {selectedListing && viewMode === "map" && (
            <div className="fixed inset-0 bg-primary/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-accent-rust shadow-lg">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-anton text-primary">
                      {selectedListing.title}
                    </h2>
                    <button
                      onClick={() => setSelectedListing(null)}
                      className="text-primary/50 hover:text-primary text-2xl leading-none"
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>
                  <FoodListingCard
                    listing={selectedListing}
                    user={user}
                    onRequestPickup={() => {
                      fetchListings();
                      fetchMyPickups();
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "pickups" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className={sectionCard}>
              <h3 className="font-anton text-lg text-primary mb-3">Pending</h3>
              {requestsLoading ? (
                <p className="text-sm text-primary/60">Loading...</p>
              ) : groupedRequests.pending.length === 0 ? (
                <p className="text-sm text-primary/60">No pending requests.</p>
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
              <h3 className="font-anton text-lg text-primary mb-3">History</h3>
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
                user={{ ...user, role: "recipient" }}
                onStatusUpdate={handleRequestStatusUpdate}
              />
            ) : (
              <div className={`${sectionCard} text-primary/70`}>
                Select a pickup to view details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RequestSummary({ request, selected, onSelect }) {
  const title = request.listingId?.title || "Untitled";
  const who = request.donorId?.name || "Unknown donor";
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
