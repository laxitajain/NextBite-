"use client";

import { AlertCircle, Inbox } from "lucide-react";
import Button from "./Button";

export function LoadingSkeleton({ rows = 3, label = "Loading" }) {
  return (
    <div role="status" aria-label={label} className="space-y-3 py-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse rounded-xl border border-accent-rust/30 bg-white/60"
        />
      ))}
      <span className="sr-only">{label}…</span>
    </div>
  );
}

export function EmptyState({ title, message, action, icon: Icon = Inbox }) {
  return (
    <div className="rounded-2xl border border-accent-rust/50 bg-white/80 p-8 text-center">
      <Icon className="mx-auto mb-3 h-9 w-9 text-primary/50" />
      <h3 className="font-anton text-xl text-primary">{title}</h3>
      {message && <p className="mt-1 text-sm text-primary/65">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-5 text-red-900">
      <div className="flex items-center gap-2 font-semibold">
        <AlertCircle className="h-5 w-5" /> Something went wrong
      </div>
      <p className="mt-1 text-sm">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} className="mt-3 !text-sm">
          Try again
        </Button>
      )}
    </div>
  );
}
