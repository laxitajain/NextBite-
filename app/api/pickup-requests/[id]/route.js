import { connectMongoDB } from "@/lib/mongodb";
import PickupRequest from "@/models/pickupRequest";
import FoodListing from "@/models/foodListing";
import { NextResponse } from "next/server";

// GET - Fetch single pickup request
export async function GET(request, { params }) {
  try {
    const { id } = params;
    await connectMongoDB();

    const pickupRequest = await PickupRequest.findById(id)
      .populate("listingId")
      .populate("donorId", "name phone email address")
      .populate("recipientId", "name phone email address");

    if (!pickupRequest) {
      return NextResponse.json(
        { success: false, message: "Pickup request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: pickupRequest,
    });
  } catch (error) {
    console.error("Error fetching pickup request:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch pickup request" },
      { status: 500 }
    );
  }
}

// PUT - Update pickup request status
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const { status, message, actualPickupTime, location, rating, review } =
      await request.json();

    await connectMongoDB();

    const updateData = { status };

    // Add optional fields based on status
    if (message) updateData.message = message;
    if (actualPickupTime)
      updateData.actualPickupTime = new Date(actualPickupTime);
    if (location) {
      updateData.$push = {
        trackingUpdates: {
          timestamp: new Date(),
          status: status,
          location: location,
          message: message || `${status} update`,
        },
      };
    }

    // Handle completion ratings
    if (status === "completed" && rating) {
      updateData["completionRating.recipientRating"] = rating;
      if (review) updateData["completionRating.recipientReview"] = review;
    }

    const pickupRequest = await PickupRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("listingId")
      .populate("donorId", "name phone email address")
      .populate("recipientId", "name phone email address");

    if (!pickupRequest) {
      return NextResponse.json(
        { success: false, message: "Pickup request not found" },
        { status: 404 }
      );
    }

    // Update listing status if pickup is completed
    if (status === "completed") {
      await FoodListing.findByIdAndUpdate(pickupRequest.listingId._id, {
        status: "picked_up",
        pickedUpAt: new Date(),
        reservedBy: null,
      });
    } else if (status === "accepted") {
      await FoodListing.findByIdAndUpdate(pickupRequest.listingId._id, {
        status: "reserved",
        reservedBy: pickupRequest.recipientId._id,
        reservedAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      data: pickupRequest,
      message: "Pickup request updated successfully",
    });
  } catch (error) {
    console.error("Error updating pickup request:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update pickup request" },
      { status: 500 }
    );
  }
}

