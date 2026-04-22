"use client";

import { useEffect, useState, useMemo } from "react";

function MapInner({ coordinates, address }) {
  const [L, setL] = useState(null);
  const [components, setComponents] = useState(null);

  useEffect(() => {
    Promise.all([import("leaflet"), import("react-leaflet")]).then(
      ([leaflet, rl]) => {
        setL(leaflet.default);
        setComponents(rl);
      }
    );
  }, []);

  const icon = useMemo(() => {
    if (!L) return null;
    return L.divIcon({
      html: `<div style="width:28px;height:28px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
      className: "",
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }, [L]);

  if (!L || !components) return null;

  const { MapContainer, TileLayer, Marker, Popup } = components;
  const pos = [coordinates.latitude, coordinates.longitude];

  return (
    <MapContainer
      center={pos}
      zoom={15}
      className="w-full h-full z-0"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={pos} icon={icon}>
        <Popup>
          <div className="font-semibold text-gray-900">Your Location</div>
          <div className="text-sm text-gray-600">
            {address || "Address not specified"}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default function ProfileMap({ coordinates, address, className = "" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return (
      <div
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <div className="text-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <MapInner coordinates={coordinates} address={address} />
      <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded shadow text-xs text-gray-600 z-[1000]">
        📍 Your Location
      </div>
    </div>
  );
}
