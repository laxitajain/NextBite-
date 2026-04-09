"use client";

import { useState } from "react";
import {
  MapPin,
  Clock,
  Users,
  Phone,
  MessageCircle,
  Heart,
} from "lucide-react";
import Button from "./Button";

export default function FoodListingCard({ listing, user, onRequestPickup }) {
  const [isRequesting, setIsRequesting] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "reserved":
        return "bg-yellow-100 text-yellow-800";
      case "picked_up":
        return "bg-gray-100 text-gray-800";
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRequestPickup = async () => {
    if (!user) {
      alert("Please log in to request pickup");
      return;
    }

    setIsRequesting(true);

    const message = prompt("Add a message for the donor (optional):");

    try {
      const response = await fetch("/api/pickup-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: listing._id,
          recipientId: user._id,
          message: message || "",
          requestedPickupTime: listing.pickupTime,
          recipientLocation: {
            coordinates: user.coordinates || { latitude: 0, longitude: 0 },
            address: user.address || "",
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Pickup request sent successfully!");
        if (onRequestPickup) {
          onRequestPickup(result.data);
        }
      } else {
        alert("Failed to send pickup request: " + result.message);
      }
    } catch (error) {
      console.error("Error requesting pickup:", error);
      alert("An error occurred while sending the request");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Image Section */}
      <div className="h-48 bg-gradient-to-r from-green-400 to-blue-500 relative">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-white text-4xl">🍽️</span>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
              listing.status
            )}`}
          >
            {listing.status.replace("_", " ").toUpperCase()}
          </span>
        </div>

        {/* Distance Badge */}
        {listing.distance && (
          <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-2 py-1 rounded-full text-sm font-medium">
            {listing.distance.toFixed(1)} km away
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {listing.title}
            </h3>
            <p className="text-gray-600 text-sm">by {listing.donorId?.name}</p>
          </div>

          {listing.estimatedValue && (
            <div className="text-right">
              <span className="text-lg font-bold text-green-600">
                ₹{listing.estimatedValue}
              </span>
              <p className="text-xs text-gray-500">Estimated Value</p>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 mb-4 line-clamp-2">{listing.description}</p>

        {/* Food Types */}
        <div className="flex flex-wrap gap-2 mb-4">
          {listing.foodTypes?.slice(0, 4).map((type, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {type}
            </span>
          ))}
          {listing.foodTypes?.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{listing.foodTypes.length - 4} more
            </span>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-2" />
            <span>{listing.servings} servings</span>
          </div>

          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>Expires: {formatDate(listing.expiryTime)}</span>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-start text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{listing.location.address}</span>
        </div>

        {/* Allergens */}
        {listing.allergens && listing.allergens.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Contains:</p>
            <div className="flex flex-wrap gap-1">
              {listing.allergens.map((allergen, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded"
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Dietary Info */}
        <div className="flex gap-2 mb-4">
          {listing.isVegetarian && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              🥬 Vegetarian
            </span>
          )}
          {listing.isVegan && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              🌱 Vegan
            </span>
          )}
        </div>

        {/* Pickup Notes */}
        {listing.pickupNotes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Pickup Notes:</strong> {listing.pickupNotes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {listing.status === "available" && (
            <Button
              onClick={handleRequestPickup}
              disabled={isRequesting}
              className="flex-1"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {isRequesting ? "Sending..." : "Request Pickup"}
            </Button>
          )}

          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Heart className="w-4 h-4" />
          </button>

          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Phone className="w-4 h-4" />
          </button>
        </div>

        {/* Contact Info (if reserved by current user) */}
        {listing.status === "reserved" &&
          listing.reservedBy?._id === user?._id && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Your request is pending approval.</strong>
                You can contact the donor at {listing.donorId?.phone}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}


