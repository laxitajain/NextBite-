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

const inputBase =
  "w-full px-3 py-2 rounded-xl border border-accent-rust bg-white text-primary placeholder:text-primary/40 transition focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary";

const labelBase = "block text-sm font-semibold text-primary/80 mb-1";

const sectionCard =
  "bg-white/80 backdrop-blur-sm border border-accent-rust/60 rounded-2xl shadow-sm p-6";

function toInputDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function coordsFromSource(c) {
  if (!c) return { latitude: 0, longitude: 0 };
  if (Array.isArray(c.coordinates) && c.coordinates.length === 2) {
    return { latitude: c.coordinates[1], longitude: c.coordinates[0] };
  }
  if (c.latitude !== undefined && c.longitude !== undefined) {
    return { latitude: c.latitude, longitude: c.longitude };
  }
  return { latitude: 0, longitude: 0 };
}

export default function DonorForm({ user, listing = null, onDone }) {
  const isEdit = Boolean(listing);
  const initialCoords = coordsFromSource(
    listing?.location?.coordinates || user?.coordinates
  );

  const [formData, setFormData] = useState({
    title: listing?.title || "",
    description: listing?.description || "",
    foodTypes: listing?.foodTypes || [],
    servings: listing?.servings?.toString() || "",
    expiryTime: toInputDateTime(listing?.expiryTime),
    pickupTime: toInputDateTime(listing?.pickupTime),
    location: {
      address: listing?.location?.address || user?.address || "",
      city: listing?.location?.city || user?.city || "",
      pincode: listing?.location?.pincode || user?.pincode || "",
      coordinates: initialCoords,
    },
    pickupNotes: listing?.pickupNotes || "",
    specialInstructions: listing?.specialInstructions || "",
    allergens: listing?.allergens || [],
    isVegetarian: listing?.isVegetarian || false,
    isVegan: listing?.isVegan || false,
    estimatedValue: listing?.estimatedValue?.toString() || "",
    images: listing?.images || [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationPermission, setLocationPermission] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
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

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingImage(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const result = await res.json();
        if (result.success && result.url) {
          uploaded.push(result.url);
        } else {
          alert("Upload failed: " + (result.message || "unknown"));
        }
      }
      if (uploaded.length > 0) {
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, ...uploaded],
        }));
      }
    } catch (err) {
      console.error("Image upload error:", err);
      alert("An error occurred while uploading");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const removeImage = (url) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img !== url),
    }));
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

    const now = new Date();
    const expiry = new Date(formData.expiryTime);
    const pickup = new Date(formData.pickupTime);

    if (!isEdit && expiry <= now)
      newErrors.expiryTime = "Expiry time must be in the future";
    if (!isEdit && pickup <= now)
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
      const { latitude, longitude } = formData.location.coordinates;
      const payload = {
        ...formData,
        servings: parseInt(formData.servings),
        estimatedValue: formData.estimatedValue
          ? parseFloat(formData.estimatedValue)
          : null,
        location: {
          ...formData.location,
          coordinates: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        },
      };

      if (!isEdit) {
        payload.donorId = user._id;
      }

      const url = isEdit ? `/api/listings/${listing._id}` : "/api/listings";
      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          isEdit
            ? "Food listing updated successfully!"
            : "Food listing created successfully!"
        );
        if (!isEdit) {
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
              coordinates: initialCoords,
            },
            pickupNotes: "",
            specialInstructions: "",
            allergens: [],
            isVegetarian: false,
            isVegan: false,
            estimatedValue: "",
            images: [],
          });
        }
        onDone?.(result.data);
      } else {
        alert(
          (isEdit ? "Failed to update listing: " : "Failed to create listing: ") +
            result.message
        );
      }
    } catch (error) {
      console.error("Error saving listing:", error);
      alert("An error occurred while saving the listing");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative bg-accent-mango border border-accent-rust rounded-2xl shadow-sm p-6 mb-6 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-pink/40 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-anton text-primary">
            {isEdit ? "Edit Food Listing" : "Create a Food Listing"}
          </h2>
          <p className="text-primary/70 text-sm mt-1">
            Share the details of the surplus food you&apos;d like to donate.
          </p>
        </div>
      </div>

      {!locationPermission && (
        <div className="mb-4 p-3 bg-accent-mango/60 border border-secondary/40 rounded-xl text-primary/80 text-sm">
          Location access is required for accurate pickup coordination. Please
          enable location services in your browser.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className={sectionCard}>
          <h3 className="text-lg font-anton text-primary mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelBase}>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={inputBase}
                placeholder="e.g., Fresh Vegetable Curry"
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className={labelBase}>Servings *</label>
              <input
                type="number"
                name="servings"
                value={formData.servings}
                onChange={handleInputChange}
                min="1"
                className={inputBase}
                placeholder="Number of people it can serve"
              />
              {errors.servings && (
                <p className="text-red-600 text-sm mt-1">{errors.servings}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className={labelBase}>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className={inputBase}
              placeholder="Describe the food item, ingredients, and condition..."
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Food Types */}
        <div className={sectionCard}>
          <h3 className="text-lg font-anton text-primary mb-4">
            Food Types *
          </h3>
          <p className="text-sm text-primary/60 mb-3">
            Select all categories that apply.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {FOOD_TYPES.map((type) => {
              const active = formData.foodTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleArrayChange("foodTypes", type)}
                  className={`text-sm text-left px-3 py-2 rounded-xl border transition ${
                    active
                      ? "bg-secondary/20 border-secondary text-primary font-semibold"
                      : "bg-white border-accent-rust text-primary/80 hover:bg-accent-light"
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
          {errors.foodTypes && (
            <p className="text-red-600 text-sm mt-2">{errors.foodTypes}</p>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isVegetarian"
                checked={formData.isVegetarian}
                onChange={handleInputChange}
                className="checkbox"
              />
              <span className="text-sm font-semibold text-primary/80">
                Vegetarian
              </span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isVegan"
                checked={formData.isVegan}
                onChange={handleInputChange}
                className="checkbox"
              />
              <span className="text-sm font-semibold text-primary/80">
                Vegan
              </span>
            </label>
            <div>
              <label className={labelBase}>Estimated Value (₹)</label>
              <input
                type="number"
                name="estimatedValue"
                value={formData.estimatedValue}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={inputBase}
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Allergens */}
        <div className={sectionCard}>
          <h3 className="text-lg font-anton text-primary mb-3">
            Contains Allergens
          </h3>
          <p className="text-sm text-primary/60 mb-3">
            Helps recipients with dietary restrictions.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {ALLERGENS.map((allergen) => {
              const active = formData.allergens.includes(allergen);
              return (
                <button
                  key={allergen}
                  type="button"
                  onClick={() => handleArrayChange("allergens", allergen)}
                  className={`text-sm px-3 py-2 rounded-xl border transition ${
                    active
                      ? "bg-accent-pink/50 border-accent-pink text-primary font-semibold"
                      : "bg-white border-accent-rust text-primary/80 hover:bg-accent-light"
                  }`}
                >
                  {allergen}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timing */}
        <div className={sectionCard}>
          <h3 className="text-lg font-anton text-primary mb-4">Timing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelBase}>Expiry Time *</label>
              <input
                type="datetime-local"
                name="expiryTime"
                value={formData.expiryTime}
                onChange={handleInputChange}
                className={inputBase}
              />
              {errors.expiryTime && (
                <p className="text-red-600 text-sm mt-1">{errors.expiryTime}</p>
              )}
            </div>

            <div>
              <label className={labelBase}>Preferred Pickup Time *</label>
              <input
                type="datetime-local"
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleInputChange}
                className={inputBase}
              />
              {errors.pickupTime && (
                <p className="text-red-600 text-sm mt-1">{errors.pickupTime}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className={sectionCard}>
          <h3 className="text-lg font-anton text-primary mb-4">
            Pickup Location
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelBase}>Address *</label>
              <input
                type="text"
                name="location.address"
                value={formData.location.address}
                onChange={handleInputChange}
                className={inputBase}
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <label className={labelBase}>City *</label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                className={inputBase}
              />
              {errors.city && (
                <p className="text-red-600 text-sm mt-1">{errors.city}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className={labelBase}>Pincode *</label>
            <input
              type="number"
              name="location.pincode"
              value={formData.location.pincode}
              onChange={handleInputChange}
              className={inputBase}
            />
            {errors.pincode && (
              <p className="text-red-600 text-sm mt-1">{errors.pincode}</p>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className={sectionCard}>
          <h3 className="text-lg font-anton text-primary mb-4">
            Additional Notes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelBase}>Pickup Notes</label>
              <textarea
                name="pickupNotes"
                value={formData.pickupNotes}
                onChange={handleInputChange}
                rows={3}
                className={inputBase}
                placeholder="Special instructions for pickup..."
              />
            </div>

            <div>
              <label className={labelBase}>Special Instructions</label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                rows={3}
                className={inputBase}
                placeholder="Any additional information..."
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className={sectionCard}>
          <h3 className="text-lg font-anton text-primary mb-4">Images</h3>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploadingImage}
            className="block w-full text-sm text-primary/80 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-secondary file:text-primary hover:file:bg-secondary/80"
          />
          {uploadingImage && (
            <p className="text-sm text-primary/60 mt-2">Uploading...</p>
          )}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
              {formData.images.map((url) => (
                <div
                  key={url}
                  className="relative h-24 rounded-xl overflow-hidden border border-accent-rust"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt="upload"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 bg-white/90 rounded-full w-6 h-6 flex items-center justify-center text-red-600 hover:bg-white"
                    aria-label="Remove image"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          {isEdit && (
            <button
              type="button"
              onClick={() => onDone?.(null)}
              className="inline-flex items-center gap-1 text-base bg-white text-primary border border-accent-rust rounded-full px-4 py-2 font-bold hover:bg-accent-light transition"
            >
              Cancel
            </button>
          )}
          <Button type="submit" disabled={isSubmitting} className="!w-auto">
            {isSubmitting
              ? isEdit
                ? "Saving..."
                : "Creating Listing..."
              : isEdit
              ? "Save Changes"
              : "Create Food Listing"}
          </Button>
        </div>
      </form>
    </div>
  );
}
