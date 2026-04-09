import { connectMongoDB } from "@/lib/mongodb";
import Donor from "@/models/donor";
import Recipient from "@/models/recipient";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      city,
      pincode,
      role,
      foodTypes,
      pickupNotes,
      avgServings,
      totalMealsShared,
      organisationType,
      allergies,
      avgRequirement,
      totalMealsReceived,
    } = await req.json();

    const hashedPassword = await bcrypt.hash(password, 10);
    await connectMongoDB();

    let user;

    if (role === "donor") {
      user = await Donor.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        city,
        pincode,
        role,
        foodTypes,
        pickupNotes,
        avgServings,
        totalMealsShared,
      });
    } else if (role === "recipient") {
      user = await Recipient.create({
        name,
        email,
        password: hashedPassword,
        phone,
        address,
        city,
        pincode,
        role,
        organisationType,
        allergies,
        avgRequirement,
        totalMealsReceived,
      });
    } else {
      return NextResponse.json({ message: "Invalid role." }, { status: 400 });
    }

    return NextResponse.json({ message: "User registered." }, { status: 201 });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { message: "An error occurred while registering the user." },
      { status: 500 }
    );
  }
}
