"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

export default function ProfileMap({ coordinates, address, className = "" }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!coordinates || (!coordinates.latitude && !coordinates.longitude)) {
      setLoading(false);
      return;
    }

    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["places"],
        });

        await loader.load();

        const mapInstance = new google.maps.Map(mapRef.current, {
          center: {
            lat: coordinates.latitude,
            lng: coordinates.longitude,
          },
          zoom: 15,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Add marker for user location
        markerRef.current = new google.maps.Marker({
          position: {
            lat: coordinates.latitude,
            lng: coordinates.longitude,
          },
          map: mapInstance,
          title: "Your Location",
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="#ffffff" stroke-width="3"/>
                <circle cx="20" cy="20" r="8" fill="#ffffff"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20),
          },
        });

        // Add info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold text-gray-900">Your Location</h3>
              <p class="text-sm text-gray-600">${
                address || "Address not specified"
              }</p>
              <p class="text-xs text-gray-500 mt-1">
                ${coordinates.latitude.toFixed(
                  6
                )}, ${coordinates.longitude.toFixed(6)}
              </p>
            </div>
          `,
        });

        markerRef.current.addListener("click", () => {
          infoWindow.open(mapInstance, markerRef.current);
        });

        setMap(mapInstance);
        setLoading(false);
      } catch (err) {
        console.error("Error loading map:", err);
        setError("Failed to load map");
        setLoading(false);
      }
    };

    initializeMap();

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
    };
  }, [coordinates, address]);

  // Update marker position when coordinates change
  useEffect(() => {
    if (map && markerRef.current && coordinates) {
      const newPosition = {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
      };

      markerRef.current.setPosition(newPosition);
      map.setCenter(newPosition);
    }
  }, [map, coordinates]);

  if (!coordinates || (!coordinates.latitude && !coordinates.longitude)) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <p className="text-gray-600">No location set</p>
          <p className="text-sm text-gray-500">
            Click &quot;Update Location&quot; to set your coordinates
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-red-50 border border-red-200 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-red-600">Failed to load map</p>
          <p className="text-sm text-red-500">
            Please check your Google Maps API key
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded shadow text-xs text-gray-600">
        📍 Your Location
      </div>
    </div>
  );
}

