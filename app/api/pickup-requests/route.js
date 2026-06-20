import { connectMongoDB } from "@/lib/mongodb";
import PickupRequest from "@/models/pickupRequest";
import FoodListing from "@/models/foodListing";
import { createNotification } from "@/lib/notify";
import { NextResponse } from "next/server";
import { authError, getRequestUser, hasRole } from "@/lib/auth";
import {
  ACTIVE_PICKUP_STATUSES,
  isListingExpired,
} from "@/lib/pickup-policy.mjs";

// GET - Fetch pickup requests
export async function GET(request) {
  try {
    const sessionUser = await getRequestUser(request);
    if (!sessionUser) return authError();

    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    const query =
      sessionUser.role === "donor"
        ? { donorId: sessionUser.id }
        : { recipientId: sessionUser.id };

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
    const sessionUser = await getRequestUser(request);
    if (!sessionUser) return authError();
    if (!hasRole(sessionUser, "recipient")) return authError(403);

    const {
      listingId,
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

    if (isListingExpired(listing)) {
      listing.status = "expired";
      await listing.save();
      return NextResponse.json(
        { success: false, message: "This listing has expired" },
        { status: 410 }
      );
    }

    const existingRequest = await PickupRequest.findOne({
      listingId,
      recipientId: sessionUser.id,
      status: { $in: ACTIVE_PICKUP_STATUSES },
    });
    if (existingRequest) {
      return NextResponse.json(
        { success: false, message: "You already have an active request for this listing" },
        { status: 409 }
      );
    }

    const geoCoords = listing.location?.coordinates?.coordinates || [];
    const donorLocation = {
      coordinates: {
        latitude: geoCoords[1] || 0,
        longitude: geoCoords[0] || 0,
      },
      address: listing.location.address,
    };

    const pickupRequest = await PickupRequest.create({
      listingId,
      donorId: listing.donorId,
      recipientId: sessionUser.id,
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
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "You already have an active request for this listing",
        },
        { status: 409 }
      );
    }
    console.error("Error creating pickup request:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create pickup request" },
      { status: 500 }
    );
  }
}


