import { connectMongoDB } from "@/lib/mongodb";
import PickupRequest from "@/models/pickupRequest";
import FoodListing from "@/models/foodListing";
import { createNotification } from "@/lib/notify";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { authError, getRequestUser, owns } from "@/lib/auth";
import {
  canSubmitRating,
  canTransition,
  shouldReopenListing,
} from "@/lib/pickup-policy.mjs";

// GET - Fetch single pickup request
export async function GET(request, { params }) {
  try {
    const sessionUser = await getRequestUser(request);
    if (!sessionUser) return authError();

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

    if (
      !owns(sessionUser, pickupRequest.donorId?._id) &&
      !owns(sessionUser, pickupRequest.recipientId?._id)
    ) {
      return authError(403);
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
    const sessionUser = await getRequestUser(request);
    if (!sessionUser) return authError();

    const { id } = params;
    const {
      status,
      message,
      actualPickupTime,
      location,
      rating,
      review,
    } = await request.json();

    await connectMongoDB();

    const existing = await PickupRequest.findById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Pickup request not found" },
        { status: 404 }
      );
    }

    const isDonor = owns(sessionUser, existing.donorId);
    const isRecipient = owns(sessionUser, existing.recipientId);
    if (!isDonor && !isRecipient) return authError(403);

    if (rating) {
      const existingRating = isDonor
        ? existing.completionRating?.donorRating
        : existing.completionRating?.recipientRating;
      if (!canSubmitRating({ status: existing.status, existingRating })) {
        return NextResponse.json(
          {
            success: false,
            message:
              existing.status === "completed"
                ? "You have already rated this pickup"
                : "Ratings are only available after pickup",
          },
          { status: 409 }
        );
      }
    }

    if (status) {
      const role = isDonor ? "donor" : "recipient";
      if (!canTransition(role, existing.status, status)) {
        return NextResponse.json(
          { success: false, message: "That pickup status change is not allowed" },
          { status: 409 }
        );
      }
    }

    const updateData = {};
    const trackingStatuses = ["en_route", "arrived", "delayed"];
    const isTrackingOnly = status === "delayed";

    if (status && !isTrackingOnly) updateData.status = status;
    if (message) updateData.message = message;
    if (actualPickupTime)
      updateData.actualPickupTime = new Date(actualPickupTime);

    if (status && (location || trackingStatuses.includes(status))) {
      updateData.$push = {
        trackingUpdates: {
          timestamp: new Date(),
          status: status,
          location: location || undefined,
          message: message || `${status} update`,
        },
      };
    }

    if (rating) {
      if (isRecipient) {
        updateData["completionRating.recipientRating"] = rating;
        if (review) updateData["completionRating.recipientReview"] = review;
      } else {
        updateData["completionRating.donorRating"] = rating;
        if (review) updateData["completionRating.donorReview"] = review;
      }
    }

    if (status === "accepted") {
      const transaction = await mongoose.startSession();
      try {
        await transaction.withTransaction(async () => {
          const reservation = await FoodListing.updateOne(
            { _id: existing.listingId, status: "available" },
            {
              status: "reserved",
              reservedBy: existing.recipientId,
              reservedAt: new Date(),
            },
            { session: transaction }
          );
          if (!reservation.modifiedCount) {
            const conflict = new Error("This listing has already been reserved");
            conflict.code = "LISTING_RESERVED";
            throw conflict;
          }

          await PickupRequest.updateOne(
            { _id: id, status: "pending" },
            updateData,
            { session: transaction, runValidators: true }
          );
          await PickupRequest.updateMany(
            {
              _id: { $ne: id },
              listingId: existing.listingId,
              status: "pending",
            },
            {
              status: "rejected",
              message: "Another pickup request was accepted",
            },
            { session: transaction }
          );
        });
      } finally {
        await transaction.endSession();
      }
    }

    const pickupRequest = await (status === "accepted"
      ? PickupRequest.findById(id)
      : PickupRequest.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        }))
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
    } else if (shouldReopenListing(existing.status, status)) {
      await FoodListing.updateOne(
        {
          _id: pickupRequest.listingId._id,
          reservedBy: pickupRequest.recipientId._id,
        },
        { status: "available", reservedBy: null, reservedAt: null }
      );
    }

    // If a recipient submitted a rating, mirror it into the listing's reviews
    // and recompute the listing's average rating.
    if (rating && isRecipient) {
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
    if (error?.code === "LISTING_RESERVED") {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }
    console.error("Error updating pickup request:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update pickup request" },
      { status: 500 }
    );
  }
}

