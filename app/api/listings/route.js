import { connectMongoDB } from "@/lib/mongodb";
import FoodListing from "@/models/foodListing";
import { NextResponse } from "next/server";

// GET - Fetch food listings with optional filters
export async function GET(request) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat"));
    const lng = parseFloat(searchParams.get("lng"));
    const radius = parseFloat(searchParams.get("radius")) || 10; // km
    const city = searchParams.get("city");
    const foodType = searchParams.get("foodType");
    const status = searchParams.get("status") || "available";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    let query = { status };

    // Add geo query if coordinates provided
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radius * 1000, // Convert km to meters
        },
      };
    }

    // Add city filter
    if (city) {
      query["location.city"] = { $regex: city, $options: "i" };
    }

    // Add food type filter
    if (foodType) {
      query.foodTypes = { $in: [foodType] };
    }

    const skip = (page - 1) * limit;

    const listings = await FoodListing.find(query)
      .populate("donorId", "name phone email address")
      .populate("reservedBy", "name phone email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await FoodListing.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

// POST - Create new food listing
export async function POST(request) {
  try {
    const {
      donorId,
      title,
      description,
      foodTypes,
      servings,
      expiryTime,
      pickupTime,
      location,
      images,
      pickupNotes,
      specialInstructions,
      allergens,
      isVegetarian,
      isVegan,
      estimatedValue,
    } = await request.json();

    await connectMongoDB();

    const listing = await FoodListing.create({
      donorId,
      title,
      description,
      foodTypes,
      servings,
      expiryTime: new Date(expiryTime),
      pickupTime: new Date(pickupTime),
      location,
      images: images || [],
      pickupNotes,
      specialInstructions,
      allergens: allergens || [],
      isVegetarian,
      isVegan,
      estimatedValue,
    });

    const populatedListing = await FoodListing.findById(listing._id).populate(
      "donorId",
      "name phone email address"
    );

    return NextResponse.json(
      {
        success: true,
        data: populatedListing,
        message: "Food listing created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create listing" },
      { status: 500 }
    );
  }
}


