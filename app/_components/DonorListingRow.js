"use client";

import { Clock, MapPin, Users, Trash2, Edit3 } from "lucide-react";

const STATUS_COLORS = {
  available: "bg-accent-mango text-primary",
  reserved: "bg-secondary/30 text-primary",
  picked_up: "bg-accent-rust text-primary/70",
  expired: "bg-red-100 text-red-700",
  cancelled: "bg-red-100 text-red-700",
};

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  return (
    d.toLocaleDateString() +
    " " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

export default function DonorListingRow({ listing, onEdit, onDelete }) {
  const statusClass =
    STATUS_COLORS[listing.status] || "bg-accent-rust text-primary/70";

  return (
    <div className="bg-white border border-accent-rust rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:shadow-sm transition">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h3 className="text-lg font-anton text-primary">{listing.title}</h3>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${statusClass}`}
          >
            {listing.status.replace("_", " ")}
          </span>
        </div>
        <p className="text-sm text-primary/70 line-clamp-1 mb-2">
          {listing.description}
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-primary/70">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4 text-secondary" />
            {listing.servings} servings
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-secondary" />
            Expires {formatDate(listing.expiryTime)}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-secondary" />
            {listing.location?.city || listing.location?.address}
          </span>
        </div>
      </div>

      <div className="flex gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onEdit?.(listing)}
          className="px-3 py-2 text-sm border border-accent-rust rounded-full text-primary hover:bg-accent-light flex items-center gap-1 font-semibold transition"
        >
          <Edit3 className="w-4 h-4" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(listing)}
          className="px-3 py-2 text-sm border border-red-300 text-red-600 rounded-full hover:bg-red-50 flex items-center gap-1 font-semibold transition"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    </div>
  );
}
