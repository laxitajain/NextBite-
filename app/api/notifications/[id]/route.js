import { connectMongoDB } from "@/lib/mongodb";
import Notification from "@/models/notification";
import { NextResponse } from "next/server";

// GET - Fetch single notification
export async function GET(request, { params }) {
  try {
    const { id } = params;
    await connectMongoDB();

    const notification = await Notification.findById(id);

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch notification" },
      { status: 500 }
    );
  }
}

// PUT - Update notification
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();

    await connectMongoDB();

    // If marking as read, set readAt timestamp
    if (updates.read && !updates.readAt) {
      updates.readAt = new Date();
    }

    const notification = await Notification.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notification,
      message: "Notification updated successfully",
    });
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update notification" },
      { status: 500 }
    );
  }
}

// DELETE - Delete notification
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await connectMongoDB();

    const notification = await Notification.findByIdAndDelete(id);

    if (!notification) {
      return NextResponse.json(
        { success: false, message: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete notification" },
      { status: 500 }
    );
  }
}

