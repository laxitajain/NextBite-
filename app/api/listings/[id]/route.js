import { connectMongoDB } from "@/lib/mongodb";
import FoodListing from "@/models/foodListing";
import { NextResponse } from "next/server";
import { authError, getRequestUser, hasRole, owns } from "@/lib/auth";

// GET - Fetch single listing
export async function GET(request, { params }) {
  try {
    const sessionUser = await getRequestUser(request);
    if (!sessionUser) return authError();

    const { id } = params;
    await connectMongoDB();

    const listing = await FoodListing.findById(id)
      .populate("donorId", "name phone email address")
      .populate("reservedBy", "name phone email")
      .populate("reviews.recipientId", "name");

    if (!listing) {
      return NextResponse.json(
        { success: false, message: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: listing,
    });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

// PUT - Update listing
export async function PUT(request, { params }) {
  try {
    const sessionUser = await getRequestUser(request);
    if (!sessionUser) return authError();
    if (!hasRole(sessionUser, "donor")) return authError(403);

    const { id } = params;
    const updates = await request.json();

    await connectMongoDB();

    const existing = await FoodListing.findById(id).select("donorId");
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Listing not found" },
        { status: 404 }
      );
    }
    if (!owns(sessionUser, existing.donorId)) return authError(403);

    // Remove fields that shouldn't be updated directly
    delete updates.donorId;
    delete updates.createdAt;
    delete updates._id;

    const listing = await FoodListing.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).populate("donorId", "name phone email address");

    if (!listing) {
      return NextResponse.json(
        { success: false, message: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: listing,
      message: "Listing updated successfully",
    });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update listing" },
      { status: 500 }
    );
  }
}

// DELETE - Delete listing
export async function DELETE(request, { params }) {
  try {
    const sessionUser = await getRequestUser(request);
    if (!sessionUser) return authError();
    if (!hasRole(sessionUser, "donor")) return authError(403);

    const { id } = params;
    await connectMongoDB();

    const listing = await FoodListing.findById(id);

    if (!listing) {
      return NextResponse.json(
        { success: false, message: "Listing not found" },
        { status: 404 }
      );
    }

    if (!owns(sessionUser, listing.donorId)) return authError(403);
    await listing.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete listing" },
      { status: 500 }
    );
  }
}

