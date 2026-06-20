import { connectMongoDB } from "@/lib/mongodb";
import Notification from "@/models/notification";
import { NextResponse } from "next/server";
import { authError, getRequestUser } from "@/lib/auth";

// PUT - Mark all notifications as read for a user
export async function PUT(request) {
  try {
    const sessionUser = await getRequestUser(request);
    if (!sessionUser) return authError();
    const userId = sessionUser.id;

    await connectMongoDB();

    const result = await Notification.updateMany(
      { userId, read: false },
      {
        read: true,
        readAt: new Date(),
      }
    );

    return NextResponse.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { success: false, message: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}

