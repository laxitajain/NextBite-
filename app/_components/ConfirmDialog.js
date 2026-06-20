"use client";

import { useEffect, useRef } from "react";
import Button from "./Button";

export default function ConfirmDialog({ open, title, message, pending, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const close = (event) => {
      if (event.key === "Escape" && !pending) onCancel();
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open, pending, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-primary/50 p-4" role="presentation">
      <div role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="confirm-title" className="font-anton text-2xl text-primary">{title}</h2>
        <p className="mt-2 text-primary/70">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <Button ref={cancelRef} onClick={onCancel} disabled={pending} className="!bg-accent-light">Cancel</Button>
          <Button onClick={onConfirm} disabled={pending} className="!bg-red-600 !text-white">
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
