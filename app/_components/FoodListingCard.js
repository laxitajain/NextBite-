"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Users,
  Phone,
  MessageCircle,
  Heart,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "./Button";
import { useToast } from "./ToastProvider";

const STATUS_STYLE = {
  available: "bg-accent-mango text-primary",
  reserved: "bg-secondary/30 text-primary",
  picked_up: "bg-accent-rust text-primary/70",
  expired: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function FoodListingCard({ listing, user, onRequestPickup, initialHasRequested = false, initialIsSaved = false }) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [hasRequested, setHasRequested] = useState(initialHasRequested);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);
  const [pickupMessage, setPickupMessage] = useState("");
  const [showMessageBox, setShowMessageBox] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setHasRequested(initialHasRequested);
  }, [initialHasRequested]);

  useEffect(() => {
    setIsSaved(initialIsSaved);
  }, [initialIsSaved]);

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
      toast("Please log in to request pickup", "error");
      router.push("/login");
      return;
    }

    // Show inline message box first time
    if (!showMessageBox) {
      setShowMessageBox(true);
      return;
    }

    setIsRequesting(true);

    try {
      const response = await fetch("/api/pickup-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId: listing._id,
          recipientId: user._id,
          message: pickupMessage || "",
          requestedPickupTime: listing.pickupTime,
          recipientLocation: {
            coordinates: user.coordinates || { latitude: 0, longitude: 0 },
            address: user.address || "",
          },
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast("Pickup request sent successfully!", "success");
        setShowMessageBox(false);
        setPickupMessage("");
        setHasRequested(true);
        if (onRequestPickup) {
          onRequestPickup(result.data);
        }
      } else {
        toast(result.message || "Failed to send pickup request", "error");
      }
    } catch (error) {
      console.error("Error requesting pickup:", error);
      toast("An error occurred while sending the request", "error");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast("Please log in to save listings", "error");
      router.push("/login");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/user/saved-listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing._id }),
      });
      const result = await response.json();
      
      if (result.success) {
        setIsSaved(result.isSaved);
        toast(result.message, "success");
      } else {
        toast(result.message || "Failed to save listing", "error");
      }
    } catch (error) {
      console.error("Error saving listing:", error);
      toast("An error occurred", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const statusClass =
    STATUS_STYLE[listing.status] || "bg-accent-rust text-primary/70";

  return (
    <div 
      onClick={(e) => {
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('textarea') || e.target.closest('input')) return;
        router.push(`/listings/${listing._id}`);
      }}
      className="bg-white/90 backdrop-blur-sm border border-accent-rust/60 rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      {/* Image */}
      <Link href={`/listings/${listing._id}`} className="block relative h-48 bg-gradient-to-br from-accent-mango via-secondary to-accent-pink">
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
      </Link>

      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-2">
            <Link href={`/listings/${listing._id}`} className="hover:text-secondary hover:underline transition block mb-0.5">
              <h3 className="text-xl font-anton text-primary">
                {listing.title}
              </h3>
            </Link>
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

          <div className="text-right flex flex-col items-end">
            {listing.pricingType === "discounted" ? (
              <>
                <span className="text-xl font-anton text-primary">₹{listing.discountedPrice}</span>
                {listing.estimatedValue && <p className="text-xs text-primary/50 line-through">₹{listing.estimatedValue}</p>}
              </>
            ) : (
              <>
                <span className="text-sm font-anton text-green-700 bg-green-100 px-2 py-0.5 rounded-md border border-green-200">FREE</span>
                {listing.estimatedValue && <p className="text-xs text-primary/50 mt-1">Value: ₹{listing.estimatedValue}</p>}
              </>
            )}
          </div>
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

        {/* Inline message box for pickup request */}
        {showMessageBox && (
          <div className="mb-4 p-3 bg-accent-light border border-accent-rust rounded-xl space-y-2">
            <label className="block text-sm font-semibold text-primary/80">
              Add a message for the donor (optional)
            </label>
            <textarea
              value={pickupMessage}
              onChange={(e) => setPickupMessage(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-accent-rust bg-white text-primary placeholder:text-primary/40 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
              placeholder="e.g., I can pick up between 2-4 PM…"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleRequestPickup}
                disabled={isRequesting}
                className="!w-auto flex-1 !text-sm"
              >
                {isRequesting ? "Sending…" : "Send Request"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setShowMessageBox(false);
                  setPickupMessage("");
                }}
                className="px-3 py-1 text-sm border border-accent-rust rounded-full text-primary hover:bg-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {listing.status === "available" && !showMessageBox && (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!hasRequested) handleRequestPickup();
              }}
              disabled={isRequesting || hasRequested}
              className={`!w-auto flex-1 !text-base ${hasRequested ? "!bg-green-600 border-green-600 text-white opacity-100" : ""}`}
            >
              <MessageCircle className="w-4 h-4 mr-1.5" />
              {isRequesting ? "Sending..." : hasRequested ? "Requested" : "Request Pickup"}
            </Button>
          )}

          <button
            type="button"
            onClick={handleToggleSave}
            disabled={isSaving}
            className="p-2 border border-accent-rust rounded-full hover:bg-accent-light text-primary transition"
            aria-label="Favorite"
          >
            <Heart className={`w-4 h-4 transition-colors ${isSaved ? "fill-accent-pink text-accent-pink" : ""}`} />
          </button>

          {listing.donorId?.phone && (
            <a
              href={`tel:${listing.donorId.phone}`}
              className="p-2 border border-accent-rust rounded-full hover:bg-accent-light text-primary transition"
              aria-label="Call donor"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
          {!listing.donorId?.phone && (
            <button
              type="button"
              className="p-2 border border-accent-rust rounded-full hover:bg-accent-light text-primary transition opacity-50 cursor-not-allowed"
              aria-label="Call donor"
              disabled
            >
              <Phone className="w-4 h-4" />
            </button>
          )}
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
