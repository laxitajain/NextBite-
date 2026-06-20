"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, CheckCircle, AlertCircle, Info, Clock } from "lucide-react";

export default function NotificationCenter({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  const userId = user?.id || user?._id;

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch(`/api/notifications?userId=${userId}`);
        const result = await response.json();

        if (result.success) {
          setNotifications(result.data);
          setUnreadCount(result.data.filter((n) => !n.read).length);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ read: true }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`/api/notifications/mark-all-read`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  /**
   * Deep-link to the resource associated with a notification.
   * Falls back to the full notifications page if no specific target.
   */
  const getDeepLink = useCallback((notification) => {
    const { type, data } = notification;
    const role = user?.role || "donor";

    if (data?.pickupRequestId) {
      return `/${role}?tab=pickups&request=${data.pickupRequestId}`;
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
  }, [user?.role]);

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    const link = getDeepLink(notification);
    if (link) {
      setIsOpen(false);
      router.push(link);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "pickup_request":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "pickup_accepted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pickup_completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pickup_cancelled":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "listing_expired":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-primary hover:text-primary/70 focus:outline-none transition"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-accent-rust/60 z-[2100] overflow-hidden">
          <div className="px-4 py-3 border-b border-accent-rust/40">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-anton text-primary">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-secondary hover:text-secondary/80 font-semibold"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-primary/40 hover:text-primary/70 transition"
                  aria-label="Close notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-primary/50">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm font-semibold">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  type="button"
                  key={notification._id}
                  className={`w-full text-left p-4 border-b border-accent-rust/20 hover:bg-accent-light/60 transition cursor-pointer ${
                    !notification.read ? "bg-accent-mango/30" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary truncate">
                        {notification.title}
                      </p>
                      <p className="text-sm text-primary/60 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-primary/40 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-accent-rust/40">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push("/notifications");
                }}
                className="w-full text-center text-sm text-secondary hover:text-secondary/80 font-semibold transition"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
