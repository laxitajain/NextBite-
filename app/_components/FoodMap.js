"use client";

import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation } from "lucide-react";

export default function FoodMap({ listings, userLocation, onListingClick }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [userMarker, setUserMarker] = useState(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    // Initialize map when component mounts
    const initMap = () => {
      if (typeof window !== "undefined" && window.google) {
        const mapElement = mapRef.current;
        if (mapElement) {
          const googleMap = new window.google.maps.Map(mapElement, {
            center: userLocation || { lat: 19.076, lng: 72.8777 }, // Mumbai coordinates as default
            zoom: 12,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          });

          setMap(googleMap);
          setIsMapLoaded(true);
        }
      }
    };

    // Load Google Maps script if not already loaded
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }
  }, []);

  // Update user location marker
  useEffect(() => {
    if (map && userLocation) {
      // Remove existing user marker
      if (userMarker) {
        userMarker.setMap(null);
      }

      // Create new user marker
      const newUserMarker = new window.google.maps.Marker({
        position: userLocation,
        map: map,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#4285F4" stroke="#fff" stroke-width="4"/>
              <circle cx="16" cy="16" r="6" fill="#fff"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(32, 32),
        },
        title: "Your Location",
      });

      setUserMarker(newUserMarker);
    }
  }, [map, userLocation]);

  // Update listing markers
  useEffect(() => {
    if (map && listings) {
      // Clear existing markers
      markers.forEach((marker) => marker.setMap(null));

      const newMarkers = listings
        .map((listing) => {
          if (!listing.location?.coordinates) return null;

          const marker = new window.google.maps.Marker({
            position: {
              lat: listing.location.coordinates.latitude,
              lng: listing.location.coordinates.longitude,
            },
            map: map,
            icon: {
              url:
                "data:image/svg+xml;charset=UTF-8," +
                encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#10B981" stroke="#fff" stroke-width="4"/>
                <text x="20" y="26" text-anchor="middle" fill="white" font-size="20">🍽️</text>
              </svg>
            `),
              scaledSize: new window.google.maps.Size(40, 40),
            },
            title: listing.title,
          });

          // Add click listener
          marker.addListener("click", () => {
            if (onListingClick) {
              onListingClick(listing);
            }
          });

          return marker;
        })
        .filter(Boolean);

      setMarkers(newMarkers);
    }
  }, [map, listings]);

  const centerOnUser = () => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(15);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={centerOnUser}
          className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
          title="Center on your location"
        >
          <Navigation className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Loading Overlay */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map...</p>
          </div>
        </div>
      )}

      {/* No Listings Message */}
      {isMapLoaded && listings && listings.length === 0 && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No food listings found in your area</p>
          </div>
        </div>
      )}
    </div>
  );
}


