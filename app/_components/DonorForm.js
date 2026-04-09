"use client";

import { useState, useEffect } from "react";
import Button from "./Button";

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

const ALLERGENS = [
  "Nuts",
  "Dairy",
  "Gluten",
  "Eggs",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
  "Mustard",
  "None",
];

export default function DonorForm({ user }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    foodTypes: [],
    servings: "",
    expiryTime: "",
    pickupTime: "",
    location: {
      address: user?.address || "",
      city: user?.city || "",
      pincode: user?.pincode || "",
      coordinates: user?.coordinates || { latitude: 0, longitude: 0 },
    },
    pickupNotes: "",
    specialInstructions: "",
    allergens: [],
    isVegetarian: false,
    isVegan: false,
    estimatedValue: "",
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);

  useEffect(() => {
    // Request location permission
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              coordinates: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
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
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleArrayChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (formData.foodTypes.length === 0)
      newErrors.foodTypes = "At least one food type is required";
    if (!formData.servings || formData.servings <= 0)
      newErrors.servings = "Valid serving count is required";
    if (!formData.expiryTime) newErrors.expiryTime = "Expiry time is required";
    if (!formData.pickupTime) newErrors.pickupTime = "Pickup time is required";
    if (!formData.location.address.trim())
      newErrors.address = "Address is required";
    if (!formData.location.city.trim()) newErrors.city = "City is required";
    if (!formData.location.pincode) newErrors.pincode = "Pincode is required";

    // Validate dates
    const now = new Date();
    const expiry = new Date(formData.expiryTime);
    const pickup = new Date(formData.pickupTime);

    if (expiry <= now)
      newErrors.expiryTime = "Expiry time must be in the future";
    if (pickup <= now)
      newErrors.pickupTime = "Pickup time must be in the future";
    if (pickup >= expiry)
      newErrors.pickupTime = "Pickup time must be before expiry time";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          donorId: user._id,
          servings: parseInt(formData.servings),
          estimatedValue: formData.estimatedValue
            ? parseFloat(formData.estimatedValue)
            : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Food listing created successfully!");
        // Reset form
        setFormData({
          title: "",
          description: "",
          foodTypes: [],
          servings: "",
          expiryTime: "",
          pickupTime: "",
          location: {
            address: user?.address || "",
            city: user?.city || "",
            pincode: user?.pincode || "",
            coordinates: user?.coordinates || { latitude: 0, longitude: 0 },
          },
          pickupNotes: "",
          specialInstructions: "",
          allergens: [],
          isVegetarian: false,
          isVegan: false,
          estimatedValue: "",
          images: [],
        });
      } else {
        alert("Failed to create listing: " + result.message);
      }
    } catch (error) {
      console.error("Error creating listing:", error);
      alert("An error occurred while creating the listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-center">
        Create Food Listing
      </h2>

      {!locationPermission && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
          <p className="text-yellow-800">
            Location access is required for accurate pickup coordination. Please
            enable location services.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Fresh Vegetable Curry"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servings *
            </label>
            <input
              type="number"
              name="servings"
              value={formData.servings}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Number of people it can serve"
            />
            {errors.servings && (
              <p className="text-red-500 text-sm mt-1">{errors.servings}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the food item, ingredients, and condition..."
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        {/* Food Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Food Types * (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {FOOD_TYPES.map((type) => (
              <label key={type} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.foodTypes.includes(type)}
                  onChange={() => handleArrayChange("foodTypes", type)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
          {errors.foodTypes && (
            <p className="text-red-500 text-sm mt-1">{errors.foodTypes}</p>
          )}
        </div>

        {/* Dietary Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isVegetarian"
                checked={formData.isVegetarian}
                onChange={handleInputChange}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Vegetarian</span>
            </label>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="isVegan"
                checked={formData.isVegan}
                onChange={handleInputChange}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">Vegan</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Value (₹)
            </label>
            <input
              type="number"
              name="estimatedValue"
              value={formData.estimatedValue}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Allergens */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contains Allergens (Select all that apply)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {ALLERGENS.map((allergen) => (
              <label key={allergen} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.allergens.includes(allergen)}
                  onChange={() => handleArrayChange("allergens", allergen)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{allergen}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Timing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expiry Time *
            </label>
            <input
              type="datetime-local"
              name="expiryTime"
              value={formData.expiryTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.expiryTime && (
              <p className="text-red-500 text-sm mt-1">{errors.expiryTime}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Pickup Time *
            </label>
            <input
              type="datetime-local"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.pickupTime && (
              <p className="text-red-500 text-sm mt-1">{errors.pickupTime}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pickup Location</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pincode *
            </label>
            <input
              type="number"
              name="location.pincode"
              value={formData.location.pincode}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.pincode && (
              <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Notes
            </label>
            <textarea
              name="pickupNotes"
              value={formData.pickupNotes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Special instructions for pickup..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              name="specialInstructions"
              value={formData.specialInstructions}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional information..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating Listing..." : "Create Food Listing"}
          </Button>
        </div>
      </form>
    </div>
  );
}


