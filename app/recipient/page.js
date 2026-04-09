"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import FoodListingCard from "../_components/FoodListingCard";
import FoodMap from "../_components/FoodMap";
import Button from "../_components/Button";
import { Search, Filter, MapPin, List, Grid } from "lucide-react";

export default function RecipientPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid", "map", "list"
  const [filters, setFilters] = useState({
    search: "",
    foodType: "",
    radius: 10,
    maxPrice: "",
  });
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserProfile();
      requestLocation();
    }
  }, [session]);

  useEffect(() => {
    fetchListings();
  }, [userLocation, filters]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`/api/donor/${session.user.email}`);
      const result = await response.json();
      if (result.success) {
        setUser(result.data);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
        },
        (error) => {
          console.error("Location access denied:", error);
          // Fallback to default location (Mumbai)
          setUserLocation({ lat: 19.076, lng: 72.8777 });
        }
      );
    }
  };

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: "available",
      });

      if (userLocation) {
        params.append("lat", userLocation.lat.toString());
        params.append("lng", userLocation.lng.toString());
        params.append("radius", filters.radius.toString());
      }

      if (filters.foodType) {
        params.append("foodType", filters.foodType);
      }

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
  };

  const handleListingClick = (listing) => {
    setSelectedListing(listing);
    setViewMode("grid"); // Switch to grid view to show details
  };

  const handleRequestPickup = (requestData) => {
    // Refresh listings after successful request
    fetchListings();
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      !filters.search ||
      listing.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      listing.description.toLowerCase().includes(filters.search.toLowerCase());

    const matchesPrice =
      !filters.maxPrice ||
      !listing.estimatedValue ||
      listing.estimatedValue <= parseFloat(filters.maxPrice);

    return matchesSearch && matchesPrice;
  });

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Please log in to browse food listings
          </h1>
          <Button onClick={() => (window.location.href = "/login")}>
            Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Find Food Near You
          </h1>
          <p className="text-gray-600">
            Discover surplus food from donors in your area and help reduce food
            waste.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search food listings..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Food Type Filter */}
            <select
              value={filters.foodType}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, foodType: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Food Types</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Packaged Food">Packaged Food</option>
              <option value="Fresh Produce">Fresh Produce</option>
              <option value="Bakery">Bakery</option>
            </select>

            {/* Radius Filter */}
            <select
              value={filters.radius}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  radius: parseInt(e.target.value),
                }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={25}>Within 25 km</option>
              <option value={50}>Within 50 km</option>
            </select>

            {/* Max Price Filter */}
            <input
              type="number"
              placeholder="Max price (₹)"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredListings.length} listings found
              </span>
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${
                  viewMode === "grid" ? "bg-white shadow-sm" : ""
                }`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${
                  viewMode === "list" ? "bg-white shadow-sm" : ""
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`p-2 rounded ${
                  viewMode === "map" ? "bg-white shadow-sm" : ""
                }`}
                title="Map View"
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Map View */}
            {viewMode === "map" && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <FoodMap
                  listings={filteredListings}
                  userLocation={userLocation}
                  onListingClick={handleListingClick}
                />
              </div>
            )}

            {/* Grid/List View */}
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
                    onRequestPickup={handleRequestPickup}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {filteredListings.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No listings found
                </h3>
                <p className="text-gray-600 mb-4">
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
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}

        {/* Selected Listing Modal (for map view) */}
        {selectedListing && viewMode === "map" && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold">
                    {selectedListing.title}
                  </h2>
                  <button
                    onClick={() => setSelectedListing(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <FoodListingCard
                  listing={selectedListing}
                  user={user}
                  onRequestPickup={handleRequestPickup}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


