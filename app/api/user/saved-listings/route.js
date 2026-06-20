import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import { NextResponse } from "next/server";
import { authError, getRequestUser } from "@/lib/auth";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    const sessionUser = await getRequestUser(request);
    if (!sessionUser) return authError();

    const { listingId } = await request.json();
    if (!listingId) {
      return NextResponse.json(
        { success: false, message: "Listing ID is required" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const user = await User.findById(sessionUser.id);
    if (!user) return authError(404);

    const objectId = new mongoose.Types.ObjectId(listingId);
    
    // Check if listing is already saved
    const isSaved = user.savedListings?.includes(objectId);

    if (isSaved) {
      // Remove it
      user.savedListings = user.savedListings.filter(
        (id) => id.toString() !== listingId
      );
    } else {
      // Add it
      if (!user.savedListings) user.savedListings = [];
      user.savedListings.push(objectId);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: isSaved ? "Listing removed from favorites" : "Listing added to favorites",
      isSaved: !isSaved
    });
  } catch (error) {
    console.error("Error toggling saved listing:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
