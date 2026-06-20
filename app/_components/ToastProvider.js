"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const styles = {
  success: "border-green-300 bg-green-50 text-green-900",
  error: "border-red-300 bg-red-50 text-red-900",
  info: "border-blue-300 bg-blue-50 text-blue-900",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = "info") => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => dismiss(id), 4500);
      return id;
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[3000] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map(({ id, message, type }) => {
          const Icon =
            type === "success"
              ? CheckCircle
              : type === "error"
              ? AlertCircle
              : Info;
          return (
            <div
              key={id}
              role={type === "error" ? "alert" : "status"}
              className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg ${styles[type]}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm font-semibold">{message}</p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
