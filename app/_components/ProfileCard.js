// import Image from "next/image";

// function ProfileCard() {
//   return (
//     <div className="relative w-fit m-auto bg-accent-mango rounded-lg px-8 py-12 text-center">
//       <div className="absolute -top-12 left-1/2 -translate-x-1/2 rounded-full bg-accent-pink w-24 h-24 z-0" />

//       {/* <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-10">
//         <Image
//           src="/pfp.png"
//           height={80}
//           width={80}
//           alt="pfp"
//           className="rounded-full border-4 border-white"
//         />
//       </div> */}

//       {/* Content */}
//       <div className="pt-16">
//         <h2 className="font-bold text-xl">Your Name</h2>
//         <p className="text-gray-700">Role / Bio / etc.</p>
//       </div>
//     </div>
//   );
// }

// export default ProfileCard;

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Button from "./Button";
import ProfileMap from "./ProfileMap";
import { MapPin, User, Mail, Phone, Home, Edit3, Save, X } from "lucide-react";

const FOOD_TYPES = [
  "Vegetarian",
  "Non-Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Packaged Food",
  "Fresh Produce",
  "Bakery",
  "Beverages",
  "Snacks",
  "Desserts",
  "Leftovers",
  "Canned Food",
];

export default function ProfileCard() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    coordinates: { latitude: 0, longitude: 0 },
    foodTypes: [],
    pickupNotes: "",
    avgServings: "",
  });

  // Location state
  const [locationPermission, setLocationPermission] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserProfile();
    }
  }, [session, fetchUserProfile]);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/donor/${session.user.email}`);
      const result = await response.json();

      if (result.success) {
        setUser(result.data);
        setFormData({
          name: result.data.name || "",
          phone: result.data.phone || "",
          address: result.data.address || "",
          city: result.data.city || "",
          pincode: result.data.pincode || "",
          coordinates: result.data.coordinates || { latitude: 0, longitude: 0 },
          foodTypes: result.data.foodTypes || [],
          pickupNotes: result.data.pickupNotes || "",
          avgServings: result.data.avgServings || "",
        });
      } else {
        setError("Failed to load profile data");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }));
          setLocationPermission(true);
        },
        (error) => {
          console.error("Location access denied:", error);
          setLocationPermission(false);
        }
      );
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFoodTypeChange = (foodType) => {
    setFormData((prev) => ({
      ...prev,
      foodTypes: prev.foodTypes.includes(foodType)
        ? prev.foodTypes.filter((type) => type !== foodType)
        : [...prev.foodTypes, foodType],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/donor/${session.user.email}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          avgServings: parseInt(formData.avgServings) || 0,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Profile updated successfully!");
        setUser(result.data);
        setIsEditing(false);
        // Refresh after 2 seconds
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    setFormData({
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      pincode: user?.pincode || "",
      coordinates: user?.coordinates || { latitude: 0, longitude: 0 },
      foodTypes: user?.foodTypes || [],
      pickupNotes: user?.pickupNotes || "",
      avgServings: user?.avgServings || "",
    });
    setIsEditing(false);
    setError("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-red-600">Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">Donor Profile</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Average Servings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Servings per Donation
              </label>
              <input
                type="number"
                value={formData.avgServings}
                onChange={(e) =>
                  handleInputChange("avgServings", e.target.value)
                }
                disabled={!isEditing}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </form>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Information
          </h3>

          <div className="space-y-4">
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* City and Pincode */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  type="number"
                  value={formData.pincode}
                  onChange={(e) => handleInputChange("pincode", e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>

            {/* Location Coordinates */}
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={requestLocation}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Update Location
                  </Button>
                  {locationPermission && (
                    <span className="text-sm text-green-600">
                      Location updated successfully
                    </span>
                  )}
                </div>
                {(formData.coordinates.latitude !== 0 ||
                  formData.coordinates.longitude !== 0) && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                    <p>Lat: {formData.coordinates.latitude.toFixed(6)}</p>
                    <p>Lng: {formData.coordinates.longitude.toFixed(6)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Map Display */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location Map
          </h3>
          <div className="h-64">
            <ProfileMap
              coordinates={formData.coordinates}
              address={`${formData.address}, ${formData.city}, ${formData.pincode}`}
              className="h-full"
            />
          </div>
        </div>

        {/* Food Preferences */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Food Types You Donate</h3>

          <div className="grid grid-cols-2 gap-2">
            {FOOD_TYPES.map((type) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.foodTypes.includes(type)}
                  onChange={() => handleFoodTypeChange(type)}
                  disabled={!isEditing}
                  className="rounded border-gray-300 disabled:opacity-50"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Additional Information</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pickup Notes
            </label>
            <textarea
              value={formData.pickupNotes}
              onChange={(e) => handleInputChange("pickupNotes", e.target.value)}
              disabled={!isEditing}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="Special instructions for food pickup..."
            />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
        <h3 className="text-xl font-bold mb-4">Donation Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {user.totalMealsShared || 0}
            </div>
            <div className="text-sm text-gray-600">Total Meals Shared</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {formData.avgServings || 0}
            </div>
            <div className="text-sm text-gray-600">Average Servings</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {user.foodTypes?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Food Types</div>
          </div>
        </div>
      </div>
    </div>
  );
}
