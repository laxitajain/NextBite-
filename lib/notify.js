import Notification from "@/models/notification";

/**
 * Create a notification. Swallows errors so notification failures don't break
 * the primary API flow they were triggered from.
 */
export async function createNotification({ userId, type, title, message, data }) {
  if (!userId || !type || !title || !message) return null;
  try {
    return await Notification.create({
      userId,
      type,
      title,
      message,
      data: data || {},
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}
