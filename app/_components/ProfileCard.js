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

const inputBase =
  "w-full px-3 py-2 rounded-xl border border-accent-rust bg-white text-primary placeholder:text-primary/40 transition focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary disabled:bg-accent-light/60 disabled:cursor-not-allowed";

const sectionCard =
  "bg-white/80 backdrop-blur-sm border border-accent-rust/60 rounded-2xl shadow-sm p-6";

export default function ProfileCard() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const [locationPermission, setLocationPermission] = useState(false);

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
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserProfile();
    }
  }, [session, fetchUserProfile]);

  const requestLocation = () => {
    if (!navigator.geolocation) return;
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
      () => setLocationPermission(false)
    );
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFoodTypeChange = (foodType) => {
    setFormData((prev) => ({
      ...prev,
      foodTypes: prev.foodTypes.includes(foodType)
        ? prev.foodTypes.filter((t) => t !== foodType)
        : [...prev.foodTypes, foodType],
    }));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/donor/${session.user.email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      pincode: user.pincode || "",
      coordinates: user.coordinates || { latitude: 0, longitude: 0 },
      foodTypes: user.foodTypes || [],
      pickupNotes: user.pickupNotes || "",
      avgServings: user.avgServings || "",
    });
    setIsEditing(false);
    setError("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={sectionCard}>
        <p className="text-red-700">Failed to load profile data</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header card */}
      <div className="relative bg-accent-mango border border-accent-rust rounded-2xl shadow-sm p-6 mb-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-pink/40 rounded-full blur-2xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-pink to-secondary rounded-full flex items-center justify-center shadow-sm">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-anton text-primary">
                {user.name}
              </h2>
              <p className="text-primary/70 text-sm">Donor Profile</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-1 text-base bg-white text-primary border border-accent-rust rounded-full p-2 px-4 font-bold hover:bg-accent-light transition"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <Button onClick={handleSubmit} disabled={saving}>
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-xl mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className={sectionCard}>
          <h3 className="text-xl font-anton mb-4 flex items-center gap-2 text-primary">
            <User className="w-5 h-5 text-secondary" />
            Personal Information
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-primary/80 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing}
                className={inputBase}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary/80 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-primary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className={`${inputBase} pl-9`}
                />
              </div>
              <p className="text-xs text-primary/50 mt-1">
                Email cannot be changed
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary/80 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-primary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                  className={`${inputBase} pl-9`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-primary/80 mb-1">
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
                className={inputBase}
              />
            </div>
          </form>
        </div>

        {/* Location Information */}
        <div className={sectionCard}>
          <h3 className="text-xl font-anton mb-4 flex items-center gap-2 text-primary">
            <MapPin className="w-5 h-5 text-secondary" />
            Location Information
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-primary/80 mb-1">
                Address
              </label>
              <div className="relative">
                <Home className="w-4 h-4 text-primary/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    handleInputChange("address", e.target.value)
                  }
                  disabled={!isEditing}
                  className={`${inputBase} pl-9`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-primary/80 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  disabled={!isEditing}
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-primary/80 mb-1">
                  Pincode
                </label>
                <input
                  type="number"
                  value={formData.pincode}
                  onChange={(e) =>
                    handleInputChange("pincode", e.target.value)
                  }
                  disabled={!isEditing}
                  className={inputBase}
                />
              </div>
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-semibold text-primary/80 mb-2">
                  Current Location
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button type="button" onClick={requestLocation}>
                    <MapPin className="w-4 h-4" />
                    Update Location
                  </Button>
                  {locationPermission && (
                    <span className="text-sm text-green-700 font-semibold">
                      Location updated
                    </span>
                  )}
                </div>
                {(formData.coordinates.latitude !== 0 ||
                  formData.coordinates.longitude !== 0) && (
                  <div className="mt-2 p-2 bg-accent-light rounded-lg text-sm text-primary/80">
                    <p>Lat: {formData.coordinates.latitude.toFixed(6)}</p>
                    <p>Lng: {formData.coordinates.longitude.toFixed(6)}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className={sectionCard}>
          <h3 className="text-xl font-anton mb-4 flex items-center gap-2 text-primary">
            <MapPin className="w-5 h-5 text-secondary" />
            Location Map
          </h3>
          <div className="h-64 rounded-xl overflow-hidden border border-accent-rust">
            <ProfileMap
              coordinates={formData.coordinates}
              address={`${formData.address}, ${formData.city}, ${formData.pincode}`}
              className="h-full"
            />
          </div>
        </div>

        {/* Food Preferences */}
        <div className={sectionCard}>
          <h3 className="text-xl font-anton mb-4 text-primary">
            Food Types You Donate
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {FOOD_TYPES.map((type) => (
              <label
                key={type}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition cursor-pointer ${
                  formData.foodTypes.includes(type)
                    ? "bg-accent-mango border-secondary"
                    : "bg-white border-accent-rust hover:bg-accent-light"
                } ${!isEditing && "cursor-default"}`}
              >
                <input
                  type="checkbox"
                  checked={formData.foodTypes.includes(type)}
                  onChange={() => handleFoodTypeChange(type)}
                  disabled={!isEditing}
                  className="checkbox"
                />
                <span className="text-sm text-primary font-semibold">
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Information */}
        <div className={`${sectionCard} lg:col-span-2`}>
          <h3 className="text-xl font-anton mb-4 text-primary">
            Additional Information
          </h3>
          <label className="block text-sm font-semibold text-primary/80 mb-1">
            Pickup Notes
          </label>
          <textarea
            value={formData.pickupNotes}
            onChange={(e) => handleInputChange("pickupNotes", e.target.value)}
            disabled={!isEditing}
            rows={4}
            className={inputBase}
            placeholder="Special instructions for food pickup..."
          />
        </div>
      </div>

      {/* Stats */}
      <div className={`${sectionCard} mt-6`}>
        <h3 className="text-xl font-anton mb-4 text-primary">
          Donation Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-accent-mango rounded-xl">
            <div className="text-3xl font-anton text-primary">
              {user.totalMealsShared || 0}
            </div>
            <div className="text-sm text-primary/70 mt-1">
              Total Meals Shared
            </div>
          </div>
          <div className="text-center p-4 bg-accent-rust rounded-xl">
            <div className="text-3xl font-anton text-primary">
              {formData.avgServings || 0}
            </div>
            <div className="text-sm text-primary/70 mt-1">Average Servings</div>
          </div>
          <div className="text-center p-4 bg-accent-pink/50 rounded-xl">
            <div className="text-3xl font-anton text-primary">
              {user.foodTypes?.length || 0}
            </div>
            <div className="text-sm text-primary/70 mt-1">Food Types</div>
          </div>
        </div>
      </div>
    </div>
  );
}
