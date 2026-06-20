"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  Trash2,
  ExternalLink,
} from "lucide-react";
import Button from "../_components/Button";
import { useToast } from "../_components/ToastProvider";
import { NotificationListSkeleton, EmptyState } from "../_components/Skeleton";
import Link from "next/link";

function getIcon(type) {
  switch (type) {
    case "pickup_request":
      return <Clock className="w-5 h-5 text-secondary" />;
    case "pickup_accepted":
    case "pickup_completed":
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "pickup_rejected":
    case "pickup_cancelled":
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case "listing_expired":
      return <AlertCircle className="w-5 h-5 text-secondary" />;
    default:
      return <Info className="w-5 h-5 text-primary/50" />;
  }
}

function getDeepLink(notification, role) {
  const { type, data } = notification;
  if (data?.pickupRequestId) {
    return `/${role}?tab=${role === "donor" ? "requests" : "pickups"}&request=${data.pickupRequestId}`;
  }
  if (data?.listingId) {
    return `/${role}?tab=my-listings`;
  }
  switch (type) {
    case "pickup_request":
    case "pickup_accepted":
    case "pickup_completed":
    case "pickup_cancelled":
    case "pickup_rejected":
      return `/${role}?tab=${role === "donor" ? "requests" : "pickups"}`;
    case "listing_expired":
    case "listing_created":
      return `/${role}?tab=my-listings`;
    default:
      return null;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / (1000 * 60));
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return date.toLocaleString();
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "unread"

  const userId = session?.user?.id;
  const userRole = session?.user?.role || "donor";

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ userId, limit: "100" });
      if (filter === "unread") params.append("unreadOnly", "true");
      const response = await fetch(`/api/notifications?${params}`);
      const result = await response.json();
      if (result.success) {
        setNotifications(result.data);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [userId, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Error marking notification:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications/mark-all-read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast("All notifications marked as read", "success");
    } catch (err) {
      console.error("Error marking all read:", err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast("Notification deleted", "info");
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    const link = getDeepLink(notification, userRole);
    if (link) {
      router.push(link);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="bg-white/80 backdrop-blur-sm border border-accent-rust/60 rounded-2xl shadow-sm p-6 text-center max-w-md">
          <h1 className="text-2xl font-anton text-primary mb-4">
            Please log in to view your notifications
          </h1>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-anton text-primary">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-sm text-secondary hover:text-secondary/80 font-semibold transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filter === "all"
                ? "bg-secondary text-primary"
                : "bg-white border border-accent-rust text-primary/70 hover:bg-accent-light"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filter === "unread"
                ? "bg-secondary text-primary"
                : "bg-white border border-accent-rust text-primary/70 hover:bg-accent-light"
            }`}
          >
            Unread{unreadCount ? ` (${unreadCount})` : ""}
          </button>
        </div>

        {loading ? (
          <NotificationListSkeleton count={5} />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No notifications"
            message={
              filter === "unread"
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."
            }
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const deepLink = getDeepLink(n, userRole);
              return (
                <div
                  key={n._id}
                  className={`bg-white/80 backdrop-blur-sm border rounded-2xl p-4 flex items-start gap-3 transition hover:shadow-sm ${
                    !n.read
                      ? "border-l-4 border-l-secondary border-accent-rust/60"
                      : "border-accent-rust/60"
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">{getIcon(n.type)}</div>
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleNotificationClick(n)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleNotificationClick(n)
                    }
                  >
                    <p className="text-sm font-semibold text-primary">
                      {n.title}
                    </p>
                    <p className="text-sm text-primary/60 mt-1">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <p className="text-xs text-primary/40">
                        {formatDate(n.createdAt)}
                      </p>
                      {deepLink && (
                        <span className="inline-flex items-center gap-1 text-xs text-secondary font-semibold">
                          <ExternalLink className="w-3 h-3" />
                          View
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.read && (
                      <button
                        onClick={() => markAsRead(n._id)}
                        className="text-xs text-secondary hover:text-secondary/80 font-semibold transition"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(n._id)}
                      className="text-primary/30 hover:text-red-600 transition"
                      title="Delete"
                      aria-label="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
