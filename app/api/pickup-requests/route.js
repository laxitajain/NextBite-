import { connectMongoDB } from "@/lib/mongodb";
import PickupRequest from "@/models/pickupRequest";
import FoodListing from "@/models/foodListing";
import { createNotification } from "@/lib/notify";
import { NextResponse } from "next/server";

// GET - Fetch pickup requests
export async function GET(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role"); // 'donor' or 'recipient'
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    let query = {};

    // Filter by user role
    if (role === "donor") {
      query.donorId = userId;
    } else if (role === "recipient") {
      query.recipientId = userId;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const requests = await PickupRequest.find(query)
      .populate("listingId")
      .populate("donorId", "name phone email address")
      .populate("recipientId", "name phone email address")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PickupRequest.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching pickup requests:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch pickup requests" },
      { status: 500 }
    );
  }
}

// POST - Create pickup request
export async function POST(request) {
  try {
    const {
      listingId,
      recipientId,
      message,
      requestedPickupTime,
      recipientLocation,
    } = await request.json();

    await connectMongoDB();

    // Get listing details to find donor
    const listing = await FoodListing.findById(listingId);
    if (!listing) {
      return NextResponse.json(
        { success: false, message: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.status !== "available") {
      return NextResponse.json(
        { success: false, message: "Listing is no longer available" },
        { status: 400 }
      );
    }

    // Get donor location
    const donorLocation = {
      coordinates: listing.location.coordinates,
      address: listing.location.address,
    };

    const pickupRequest = await PickupRequest.create({
      listingId,
      donorId: listing.donorId,
      recipientId,
      message,
      requestedPickupTime: new Date(requestedPickupTime),
      donorLocation,
      recipientLocation,
    });

    const populatedRequest = await PickupRequest.findById(pickupRequest._id)
      .populate("listingId")
      .populate("donorId", "name phone email address")
      .populate("recipientId", "name phone email address");

    await createNotification({
      userId: listing.donorId,
      type: "pickup_request",
      title: "New pickup request",
      message: `${
        populatedRequest.recipientId?.name || "A recipient"
      } requested a pickup for "${listing.title}".`,
      data: {
        pickupRequestId: populatedRequest._id,
        listingId: listing._id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: populatedRequest,
        message: "Pickup request created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating pickup request:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create pickup request" },
      { status: 500 }
    );
  }
}


