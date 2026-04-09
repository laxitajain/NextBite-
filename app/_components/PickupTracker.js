"use client";

import { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Navigation,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Button from "./Button";

export default function PickupTracker({ pickupRequest, user, onStatusUpdate }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [estimatedArrival, setEstimatedArrival] = useState(null);

  useEffect(() => {
    if (pickupRequest?.status === "accepted" && navigator.geolocation) {
      startLocationTracking();
    }
  }, [pickupRequest?.status]);

  const startLocationTracking = () => {
    setIsTracking(true);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCurrentLocation(location);
        updateLocation(location);
      },
      (error) => {
        console.error("Location tracking error:", error);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  };

  const updateLocation = async (location) => {
    try {
      const response = await fetch(
        `/api/pickup-requests/${pickupRequest._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "en_route",
            location: location,
            message: "Location updated",
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (onStatusUpdate) {
          onStatusUpdate(result.data);
        }
      }
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const updateStatus = async (status, message) => {
    try {
      const response = await fetch(
        `/api/pickup-requests/${pickupRequest._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: status,
            message: message,
            actualPickupTime: status === "completed" ? new Date() : null,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (onStatusUpdate) {
          onStatusUpdate(result.data);
        }
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case "en_route":
        return <Navigation className="w-5 h-5 text-blue-500" />;
      case "arrived":
        return <MapPin className="w-5 h-5 text-green-500" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "en_route":
        return "bg-blue-100 text-blue-800";
      case "arrived":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (!pickupRequest) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <p className="text-gray-600">No pickup request selected</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Pickup Tracking</h3>
        <div className="flex items-center gap-2">
          {getStatusIcon(pickupRequest.status)}
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
              pickupRequest.status
            )}`}
          >
            {pickupRequest.status.replace("_", " ").toUpperCase()}
          </span>
        </div>
      </div>

      {/* Request Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Food Item</h4>
          <p className="text-gray-600">{pickupRequest.listingId?.title}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Requested Time</h4>
          <p className="text-gray-600">
            {formatTime(pickupRequest.requestedPickupTime)}
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Donor</h4>
          <p className="text-gray-600">{pickupRequest.donorId?.name}</p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-700 mb-2">Recipient</h4>
          <p className="text-gray-600">{pickupRequest.recipientId?.name}</p>
        </div>
      </div>

      {/* Location Information */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-2">Pickup Location</h4>
        <p className="text-gray-600">{pickupRequest.donorLocation?.address}</p>
      </div>

      {/* Status Actions */}
      {user?.role === "donor" && (
        <div className="space-y-3">
          {pickupRequest.status === "pending" && (
            <div className="flex gap-3">
              <Button
                onClick={() =>
                  updateStatus("accepted", "Pickup request accepted")
                }
                className="bg-green-600 hover:bg-green-700"
              >
                Accept Request
              </Button>
              <Button
                onClick={() =>
                  updateStatus("rejected", "Pickup request rejected")
                }
                className="bg-red-600 hover:bg-red-700"
              >
                Reject Request
              </Button>
            </div>
          )}

          {pickupRequest.status === "accepted" && (
            <Button
              onClick={() => updateStatus("en_route", "Starting pickup")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Pickup
            </Button>
          )}

          {pickupRequest.status === "en_route" && (
            <div className="flex gap-3">
              <Button
                onClick={() =>
                  updateStatus("arrived", "Arrived at pickup location")
                }
                className="bg-green-600 hover:bg-green-700"
              >
                Mark as Arrived
              </Button>
              <Button
                onClick={() => updateStatus("delayed", "Pickup delayed")}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Report Delay
              </Button>
            </div>
          )}

          {pickupRequest.status === "arrived" && (
            <Button
              onClick={() =>
                updateStatus("completed", "Pickup completed successfully")
              }
              className="bg-green-600 hover:bg-green-700"
            >
              Complete Pickup
            </Button>
          )}
        </div>
      )}

      {/* Tracking Updates */}
      {pickupRequest.trackingUpdates &&
        pickupRequest.trackingUpdates.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-700 mb-3">
              Tracking Updates
            </h4>
            <div className="space-y-2">
              {pickupRequest.trackingUpdates.map((update, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(update.status)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {update.status.replace("_", " ").toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600">{update.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(update.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Current Location (for tracking) */}
      {isTracking && currentLocation && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Current Location</h4>
          <p className="text-sm text-blue-700">
            Lat: {currentLocation.latitude.toFixed(6)}, Lng:{" "}
            {currentLocation.longitude.toFixed(6)}
          </p>
        </div>
      )}

      {/* Message */}
      {pickupRequest.message && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Message</h4>
          <p className="text-gray-600">{pickupRequest.message}</p>
        </div>
      )}
    </div>
  );
}

