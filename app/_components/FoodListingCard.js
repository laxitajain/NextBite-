"use client";

import { useState } from "react";
import {
  MapPin,
  Clock,
  Users,
  Phone,
  MessageCircle,
  Heart,
  Star,
} from "lucide-react";
import Button from "./Button";

const STATUS_STYLE = {
  available: "bg-accent-mango text-primary",
  reserved: "bg-secondary/30 text-primary",
  picked_up: "bg-accent-rust text-primary/70",
  expired: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
};

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

  const statusClass =
    STATUS_STYLE[listing.status] || "bg-accent-rust text-primary/70";

  return (
    <div className="bg-white/90 backdrop-blur-sm border border-accent-rust/60 rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-accent-mango via-secondary to-accent-pink relative">
        {listing.images && listing.images.length > 0 ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-white text-5xl drop-shadow-sm">🍽️</span>
          </div>
        )}

        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusClass}`}
          >
            {listing.status.replace("_", " ")}
          </span>
        </div>

        {listing.distance && (
          <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-xs font-semibold text-primary flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {listing.distance.toFixed(1)} km
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-anton text-primary mb-0.5">
              {listing.title}
            </h3>
            <p className="text-primary/60 text-sm">
              by {listing.donorId?.name}
            </p>
            {listing.rating && (
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`w-4 h-4 ${
                      n <= Math.round(listing.rating)
                        ? "fill-secondary text-secondary"
                        : "text-accent-rust"
                    }`}
                  />
                ))}
                <span className="text-xs text-primary/60 ml-1">
                  {listing.rating.toFixed(1)} ({listing.reviews?.length || 0})
                </span>
              </div>
            )}
          </div>

          {listing.estimatedValue && (
            <div className="text-right">
              <span className="text-lg font-anton text-primary">
                ₹{listing.estimatedValue}
              </span>
              <p className="text-xs text-primary/50">Est. Value</p>
            </div>
          )}
        </div>

        <p className="text-primary/80 text-sm mb-4 line-clamp-2">
          {listing.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {listing.foodTypes?.slice(0, 4).map((type, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-accent-mango text-primary text-xs font-semibold rounded-full"
            >
              {type}
            </span>
          ))}
          {listing.foodTypes?.length > 4 && (
            <span className="px-2 py-1 bg-accent-light text-primary/70 text-xs rounded-full">
              +{listing.foodTypes.length - 4} more
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
          <div className="flex items-center text-primary/80">
            <Users className="w-4 h-4 mr-2 text-secondary" />
            <span>{listing.servings} servings</span>
          </div>

          <div className="flex items-center text-primary/80">
            <Clock className="w-4 h-4 mr-2 text-secondary" />
            <span className="truncate">
              Exp: {formatDate(listing.expiryTime)}
            </span>
          </div>
        </div>

        <div className="flex items-start text-primary/80 mb-4 text-sm">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-secondary" />
          <span>{listing.location.address}</span>
        </div>

        {listing.allergens && listing.allergens.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-primary/60 mb-1 font-semibold">
              Contains:
            </p>
            <div className="flex flex-wrap gap-1">
              {listing.allergens.map((allergen, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-accent-pink/40 text-primary text-xs rounded-full"
                >
                  {allergen}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {listing.isVegetarian && (
            <span className="px-2 py-1 bg-accent-mango text-primary text-xs font-semibold rounded-full">
              🥬 Vegetarian
            </span>
          )}
          {listing.isVegan && (
            <span className="px-2 py-1 bg-accent-mango text-primary text-xs font-semibold rounded-full">
              🌱 Vegan
            </span>
          )}
        </div>

        {listing.pickupNotes && (
          <div className="mb-4 p-3 bg-accent-light rounded-xl">
            <p className="text-sm text-primary/80">
              <strong className="text-primary">Pickup Notes:</strong>{" "}
              {listing.pickupNotes}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {listing.status === "available" && (
            <Button
              onClick={handleRequestPickup}
              disabled={isRequesting}
              className="!w-auto flex-1 !text-base"
            >
              <MessageCircle className="w-4 h-4" />
              {isRequesting ? "Sending..." : "Request Pickup"}
            </Button>
          )}

          <button
            type="button"
            className="p-2 border border-accent-rust rounded-full hover:bg-accent-light text-primary transition"
            aria-label="Favorite"
          >
            <Heart className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="p-2 border border-accent-rust rounded-full hover:bg-accent-light text-primary transition"
            aria-label="Call donor"
          >
            <Phone className="w-4 h-4" />
          </button>
        </div>

        {listing.status === "reserved" &&
          listing.reservedBy?._id === user?._id && (
            <div className="mt-4 p-3 bg-accent-mango/60 border border-secondary/40 rounded-xl">
              <p className="text-sm text-primary">
                <strong>Your request is pending approval.</strong> You can
                contact the donor at {listing.donorId?.phone}
              </p>
            </div>
          )}
      </div>
    </div>
  );
}
