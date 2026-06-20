import { connectMongoDB } from "@/lib/mongodb";
import Notification from "@/models/notification";
import { NextResponse } from "next/server";
import { authError, getRequestUser } from "@/lib/auth";

// GET - Fetch notifications for a user
export async function GET(request) {
  try {
    const sessionUser = await getRequestUser(request);
    if (!sessionUser) return authError();

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const userId = sessionUser.id;
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const unreadOnly = searchParams.get("unreadOnly") === "true";

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    let query = { userId };

    if (unreadOnly) {
      query.read = false;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST - Create new notification
export async function POST(request) {
  return authError(403);
}

