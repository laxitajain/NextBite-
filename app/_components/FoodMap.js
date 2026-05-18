"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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

const MapRecenter = dynamic(
  () =>
    import("react-leaflet").then((mod) => ({
      default: function RecenterInner({ mapRef }) {
        const map = mod.useMap();
        mapRef.current = map;
        return null;
      },
    })),
  { ssr: false }
);

function MapInner({ listings, userLocation, onListingClick }) {
  const [L, setL] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    import("leaflet").then((leaflet) => {
      setL(leaflet.default);
    });
  }, []);

  const userIcon = useMemo(() => {
    if (!L) return null;
    return L.divIcon({
      html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 11.25 15 25 15 25s15-13.75 15-25C30 6.7 23.3 0 15 0z" fill="#480102"/>
        <circle cx="15" cy="14" r="6" fill="#DFD6C4"/>
      </svg>`,
      className: "",
      iconSize: [30, 40],
      iconAnchor: [15, 40],
    });
  }, [L]);

  const listingIcon = useMemo(() => {
    if (!L) return null;
    return L.divIcon({
      html: `<div style="width:40px;height:40px;background:#480102;border:3px solid #F59E0B;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:18px;">🍽️</div>`,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }, [L]);

  const handleRecenter = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 14);
    }
  };

  if (!L) return null;

  const center = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [19.076, 72.8777];

  return (
    <>
      <button
        onClick={handleRecenter}
        className="absolute top-3 right-3 z-[1000] bg-primary hover:bg-primary/90 text-accent-rust p-2 rounded-full shadow-lg transition"
        title="Recenter"
      >
        <Navigation className="w-5 h-5" />
      </button>
      <MapContainer
        center={center}
        zoom={12}
        className="w-full h-full min-h-[400px] z-0"
        scrollWheelZoom={true}
      >
        <MapRecenter mapRef={mapRef} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && userIcon && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup className="nb-popup">
              <span className="font-semibold">Your Location</span>
            </Popup>
          </Marker>
        )}

        {listings?.map((listing) => {
          const raw = listing.location?.coordinates;
          if (!raw) return null;
          let pos;
          if (Array.isArray(raw.coordinates) && raw.coordinates.length === 2) {
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
              <Popup className="nb-popup">
                <div className="font-semibold">{listing.title}</div>
                <div className="text-sm text-accent-pink">
                  {listing.servings} servings
                </div>
                <div className="text-sm">
                  {listing.description?.slice(0, 80)}
                  {listing.description?.length > 80 ? "..." : ""}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </>
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
