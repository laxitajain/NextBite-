"use client";

import { useState, useEffect, useMemo } from "react";
import { Navigation } from "lucide-react";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const useMap = dynamic(
  () => import("react-leaflet").then((mod) => mod.useMap),
  { ssr: false }
);

function RecenterButton({ userLocation }) {
  const [mapRef, setMapRef] = useState(null);

  useEffect(() => {
    (async () => {
      const { useMap } = await import("react-leaflet");
      setMapRef(null);
    })();
  }, []);

  return null;
}

function MapInner({ listings, userLocation, onListingClick }) {
  const [L, setL] = useState(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  const userIcon = useMemo(() => {
    if (!L) return null;
    return L.divIcon({
      html: `<div style="width:20px;height:20px;background:#4285F4;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
      className: "",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }, [L]);

  const listingIcon = useMemo(() => {
    if (!L) return null;
    return L.divIcon({
      html: `<div style="width:32px;height:32px;background:#10B981;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:16px;">🍽️</div>`,
      className: "",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }, [L]);

  if (!L) return null;

  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [19.076, 72.8777];

  return (
    <MapContainer
      center={center}
      zoom={12}
      className="w-full h-full min-h-[400px] z-0"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {userLocation && userIcon && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>Your Location</Popup>
        </Marker>
      )}

      {listings?.map((listing) => {
        const raw = listing.location?.coordinates;
        if (!raw) return null;
        let pos;
        if (Array.isArray(raw.coordinates) && raw.coordinates.length === 2) {
          // GeoJSON Point: [lng, lat] -> leaflet expects [lat, lng]
          pos = [raw.coordinates[1], raw.coordinates[0]];
        } else if (
          raw.latitude !== undefined &&
          raw.longitude !== undefined
        ) {
          pos = [raw.latitude, raw.longitude];
        } else {
          return null;
        }
        return (
          <Marker
            key={listing._id}
            position={pos}
            icon={listingIcon}
            eventHandlers={{
              click: () => onListingClick?.(listing),
            }}
          >
            <Popup>
              <div className="font-semibold">{listing.title}</div>
              <div className="text-sm text-gray-600">
                {listing.description?.slice(0, 80)}
                {listing.description?.length > 80 ? "..." : ""}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default function FoodMap({ listings, userLocation, onListingClick }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full min-h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
      <MapInner
        listings={listings}
        userLocation={userLocation}
        onListingClick={onListingClick}
      />
    </div>
  );
}
