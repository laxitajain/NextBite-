"use client";

/**
 * Reusable loading skeleton components.
 * Each variant mirrors the layout of a real component so the page
 * doesn't jump when data arrives.
 */

function Pulse({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-accent-rust/40 ${className}`}
    />
  );
}

// ── Card skeleton (food listing card) ──────────────────────────────
export function CardSkeleton() {
  return (
    <div className="bg-white/90 border border-accent-rust/60 rounded-2xl shadow-sm overflow-hidden">
      <Pulse className="h-48 !rounded-none" />
      <div className="p-6 space-y-3">
        <Pulse className="h-6 w-3/4" />
        <Pulse className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Pulse className="h-6 w-16 rounded-full" />
          <Pulse className="h-6 w-16 rounded-full" />
        </div>
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-2/3" />
        <Pulse className="h-10 w-full rounded-full" />
      </div>
    </div>
  );
}

// ── Grid of card skeletons ──────────────────────────────────────────
export function CardGridSkeleton({ count = 6, columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" }) {
  return (
    <div className={`grid gap-6 ${columns}`}>
      {Array.from({ length: count }, (_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Row skeleton (donor listing row) ────────────────────────────────
export function RowSkeleton() {
  return (
    <div className="bg-white border border-accent-rust rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <Pulse className="h-6 w-48" />
          <Pulse className="h-5 w-16 rounded-full" />
        </div>
        <Pulse className="h-4 w-full" />
        <div className="flex gap-4">
          <Pulse className="h-4 w-20" />
          <Pulse className="h-4 w-28" />
          <Pulse className="h-4 w-20" />
        </div>
      </div>
      <div className="flex gap-2 shrink-0">
        <Pulse className="h-9 w-20 rounded-full" />
        <Pulse className="h-9 w-20 rounded-full" />
      </div>
    </div>
  );
}

// ── List of row skeletons ───────────────────────────────────────────
export function RowListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <RowSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Profile skeleton ────────────────────────────────────────────────
export function ProfileSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-accent-mango border border-accent-rust rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-4">
          <Pulse className="w-16 h-16 !rounded-full" />
          <div className="space-y-2 flex-1">
            <Pulse className="h-8 w-48" />
            <Pulse className="h-4 w-24" />
          </div>
        </div>
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/80 border border-accent-rust/60 rounded-2xl shadow-sm p-6 space-y-4">
            <Pulse className="h-6 w-40" />
            <Pulse className="h-10 w-full" />
            <Pulse className="h-10 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Notification skeleton ───────────────────────────────────────────
export function NotificationSkeleton() {
  return (
    <div className="bg-white/80 border border-accent-rust/60 rounded-2xl p-4 flex items-start gap-3">
      <Pulse className="w-5 h-5 !rounded-full shrink-0 mt-1" />
      <div className="flex-1 space-y-2">
        <Pulse className="h-4 w-3/4" />
        <Pulse className="h-3 w-full" />
        <Pulse className="h-3 w-20" />
      </div>
    </div>
  );
}

export function NotificationListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }, (_, i) => (
        <NotificationSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────
export function EmptyState({ icon = "📭", title, message, action }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border border-accent-rust/60 rounded-2xl shadow-sm p-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-anton text-primary mb-2">{title}</h3>
      {message && <p className="text-primary/70 mb-4">{message}</p>}
      {action}
    </div>
  );
}
