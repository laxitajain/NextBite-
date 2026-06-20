"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Heart, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "./Button";
import { useToast } from "./ToastProvider";

export default function ListingActionButtons({ listing, user, initialHasRequested = false, initialIsSaved = false }) {
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

  const handleRequestPickup = async () => {
    if (!user) {
      toast("Please log in to request pickup", "error");
      router.push("/login");
      return;
    }

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

  const handleToggleSave = async () => {
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

  return (
    <div className="w-full">
      {showMessageBox && (
        <div className="mb-4 p-4 bg-accent-light border border-accent-rust rounded-xl space-y-3 shadow-sm">
          <label className="block text-sm font-semibold text-primary">
            Add a message for the donor (optional)
          </label>
          <textarea
            value={pickupMessage}
            onChange={(e) => setPickupMessage(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-accent-rust bg-white text-primary placeholder:text-primary/40 text-sm focus:outline-none focus:ring-2 focus:ring-secondary focus:border-secondary"
            placeholder="e.g., I can pick up around 3 PM with a van..."
          />
          <div className="flex gap-3">
            <Button
              onClick={handleRequestPickup}
              disabled={isRequesting}
              className="!w-auto flex-1"
            >
              {isRequesting ? "Sending…" : "Confirm Request"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setShowMessageBox(false);
                setPickupMessage("");
              }}
              className="px-4 py-2 border border-accent-rust rounded-xl text-primary font-bold hover:bg-white transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {listing.status === "available" && !showMessageBox && (
          <Button
            onClick={hasRequested ? undefined : handleRequestPickup}
            disabled={isRequesting || hasRequested}
            className={`flex-1 ${hasRequested ? "!bg-green-600 border-green-600 text-white opacity-100" : ""}`}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {isRequesting ? "Sending..." : hasRequested ? "Pickup Requested" : "Request Pickup"}
          </Button>
        )}

        <button
          type="button"
          onClick={handleToggleSave}
          disabled={isSaving}
          className="p-3 bg-white border border-accent-rust rounded-xl shadow-sm hover:bg-accent-light text-primary transition flex items-center justify-center"
          aria-label="Favorite"
        >
          <Heart className={`w-6 h-6 transition-colors ${isSaved ? "fill-accent-pink text-accent-pink" : ""}`} />
        </button>

        {listing.donorId?.phone && (
          <a
            href={`tel:${listing.donorId.phone}`}
            className="p-3 bg-white border border-accent-rust rounded-xl shadow-sm hover:bg-accent-light text-primary transition flex items-center justify-center"
            aria-label="Call donor"
          >
            <Phone className="w-6 h-6" />
          </a>
        )}
      </div>
      
      {listing.status === "reserved" && (
        <div className="mt-4 p-4 bg-accent-mango/60 border border-secondary/40 rounded-xl text-center">
          <p className="font-semibold text-primary">
            This listing is currently reserved.
          </p>
        </div>
      )}
    </div>
  );
}
