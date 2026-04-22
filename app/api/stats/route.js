import { connectMongoDB } from "@/lib/mongodb";
import FoodListing from "@/models/foodListing";
import PickupRequest from "@/models/pickupRequest";
import User from "@/models/user";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectMongoDB();

    const [totalListings, completedPickups, totalUsers, donors, recipients] =
      await Promise.all([
        FoodListing.countDocuments({}),
        PickupRequest.countDocuments({ status: "completed" }),
        User.countDocuments({}),
        User.countDocuments({ role: "donor" }),
        User.countDocuments({ role: "recipient" }),
      ]);

    const servingsAgg = await PickupRequest.aggregate([
      { $match: { status: "completed" } },
      {
        $lookup: {
          from: "foodlistings",
          localField: "listingId",
          foreignField: "_id",
          as: "listing",
        },
      },
      { $unwind: "$listing" },
      { $group: { _id: null, total: { $sum: "$listing.servings" } } },
    ]);
    const totalServings = servingsAgg[0]?.total || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalListings,
        completedPickups,
        totalServings,
        totalUsers,
        donors,
        recipients,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load stats" },
      { status: 500 }
    );
  }
}
