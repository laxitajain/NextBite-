import { connectMongoDB } from "@/lib/mongodb";
import PickupRequest from "@/models/pickupRequest";
import FoodListing from "@/models/foodListing";
import { createNotification } from "@/lib/notify";
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

// PUT - Update pickup request status or submit ratings
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const {
      status,
      message,
      actualPickupTime,
      location,
      rating,
      review,
      ratingRole, // "recipient" | "donor"
    } = await request.json();

    await connectMongoDB();

    const updateData = {};

    if (status) updateData.status = status;
    if (message) updateData.message = message;
    if (actualPickupTime)
      updateData.actualPickupTime = new Date(actualPickupTime);
    if (location && status) {
      updateData.$push = {
        trackingUpdates: {
          timestamp: new Date(),
          status: status,
          location: location,
          message: message || `${status} update`,
        },
      };
    }

    if (rating) {
      const role = ratingRole || "recipient";
      if (role === "recipient") {
        updateData["completionRating.recipientRating"] = rating;
        if (review) updateData["completionRating.recipientReview"] = review;
      } else if (role === "donor") {
        updateData["completionRating.donorRating"] = rating;
        if (review) updateData["completionRating.donorReview"] = review;
      }
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
    } else if (status === "rejected" || status === "cancelled") {
      await FoodListing.findByIdAndUpdate(pickupRequest.listingId._id, {
        status: "available",
        reservedBy: null,
        reservedAt: null,
      });
    }

    // If a recipient submitted a rating, mirror it into the listing's reviews
    // and recompute the listing's average rating.
    if (rating && (!ratingRole || ratingRole === "recipient")) {
      const listingId = pickupRequest.listingId?._id;
      if (listingId) {
        const listing = await FoodListing.findById(listingId);
        if (listing) {
          listing.reviews = listing.reviews || [];
          listing.reviews.push({
            recipientId: pickupRequest.recipientId._id,
            rating,
            review: review || "",
            createdAt: new Date(),
          });
          const total = listing.reviews.reduce(
            (sum, r) => sum + (r.rating || 0),
            0
          );
          listing.rating = listing.reviews.length
            ? total / listing.reviews.length
            : null;
          await listing.save();
        }
      }
    }

    const listingTitle = pickupRequest.listingId?.title || "the listing";
    const notifData = {
      pickupRequestId: pickupRequest._id,
      listingId: pickupRequest.listingId?._id,
    };

    if (status === "accepted") {
      await createNotification({
        userId: pickupRequest.recipientId._id,
        type: "pickup_accepted",
        title: "Pickup request accepted",
        message: `Your request for "${listingTitle}" was accepted.`,
        data: notifData,
      });
    } else if (status === "rejected") {
      await createNotification({
        userId: pickupRequest.recipientId._id,
        type: "pickup_rejected",
        title: "Pickup request rejected",
        message: `Your request for "${listingTitle}" was rejected.`,
        data: notifData,
      });
    } else if (status === "cancelled") {
      await createNotification({
        userId: pickupRequest.donorId._id,
        type: "pickup_cancelled",
        title: "Pickup cancelled",
        message: `The pickup for "${listingTitle}" was cancelled.`,
        data: notifData,
      });
    } else if (status === "completed") {
      await createNotification({
        userId: pickupRequest.recipientId._id,
        type: "pickup_completed",
        title: "Pickup completed",
        message: `Your pickup for "${listingTitle}" is complete. Rate your donor!`,
        data: notifData,
      });
      await createNotification({
        userId: pickupRequest.donorId._id,
        type: "pickup_completed",
        title: "Pickup completed",
        message: `"${listingTitle}" was picked up. Rate your recipient!`,
        data: notifData,
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

