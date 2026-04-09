import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";

export async function GET(request, { params }) {
  const { email } = params;

  await connectMongoDB();

  try {
    const donor = await User.findOne({ email, __v: "0" });

    if (!donor) {
      return Response.json(
        { success: false, message: "Donor not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: donor });
  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const { email } = params;

  await connectMongoDB();

  try {
    const {
      name,
      phone,
      address,
      city,
      pincode,
      coordinates,
      foodTypes,
      pickupNotes,
      avgServings,
    } = await request.json();

    const donor = await User.findOne({ email, __v: "0" });

    if (!donor) {
      return Response.json(
        { success: false, message: "Donor not found" },
        { status: 404 }
      );
    }

    // Update donor fields
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (coordinates !== undefined) updateData.coordinates = coordinates;
    if (foodTypes !== undefined) updateData.foodTypes = foodTypes;
    if (pickupNotes !== undefined) updateData.pickupNotes = pickupNotes;
    if (avgServings !== undefined) updateData.avgServings = avgServings;

    // If coordinates are provided, enable location
    if (coordinates && coordinates.latitude && coordinates.longitude) {
      updateData.isLocationEnabled = true;
    }

    const updatedDonor = await User.findByIdAndUpdate(donor._id, updateData, {
      new: true,
      runValidators: true,
    });

    return Response.json({
      success: true,
      data: updatedDonor,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating donor profile:", error);
    return Response.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
