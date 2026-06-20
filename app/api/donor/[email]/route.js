import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import Donor from "@/models/donor";
import Recipient from "@/models/recipient";
import { authError, getRequestUser } from "@/lib/auth";

export async function GET(request, { params }) {
  const { email } = params;

  const sessionUser = await getRequestUser(request);
  if (!sessionUser) return authError();
  if (sessionUser.email !== decodeURIComponent(email)) return authError(403);

  await connectMongoDB();

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const safeUser = user.toObject();
    delete safeUser.password;
    return Response.json({ success: true, data: safeUser });
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

  const sessionUser = await getRequestUser(request);
  if (!sessionUser) return authError();
  if (sessionUser.email !== decodeURIComponent(email)) return authError(403);

  await connectMongoDB();

  try {
    const {
      name,
      phone,
      address,
      city,
      pincode,
      coordinates,
      image,
      // Donor-only
      foodTypes,
      pickupNotes,
      avgServings,
      // Recipient-only
      organisationType,
      allergies,
      avgRequirement,
    } = await request.json();

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (pincode !== undefined) updateData.pincode = pincode;
    if (coordinates !== undefined) updateData.coordinates = coordinates;
    if (image !== undefined) updateData.image = image;

    if (user.role === "donor") {
      if (foodTypes !== undefined) updateData.foodTypes = foodTypes;
      if (pickupNotes !== undefined) updateData.pickupNotes = pickupNotes;
      if (avgServings !== undefined) updateData.avgServings = avgServings;
    } else if (user.role === "recipient") {
      if (organisationType !== undefined)
        updateData.organisationType = organisationType;
      if (allergies !== undefined) updateData.allergies = allergies;
      if (avgRequirement !== undefined)
        updateData.avgRequirement = avgRequirement;
    }

    if (coordinates && coordinates.latitude && coordinates.longitude) {
      updateData.isLocationEnabled = true;
    }

    const Model =
      user.role === "donor"
        ? Donor
        : user.role === "recipient"
        ? Recipient
        : User;

    const updated = await Model.findByIdAndUpdate(user._id, updateData, {
      new: true,
      runValidators: true,
    });

    return Response.json({
      success: true,
      data: (() => {
        const safeUser = updated.toObject();
        delete safeUser.password;
        return safeUser;
      })(),
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json(
      { success: false, message: "Failed to update profile" },
      { status: 500 }
    );
  }
}
