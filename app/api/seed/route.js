import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import Donor from "@/models/donor";
import Recipient from "@/models/recipient";
import FoodListing from "@/models/foodListing";
import PickupRequest from "@/models/pickupRequest";
import bcrypt from "bcryptjs";

export async function GET(req) {
  try {
    await connectMongoDB();
    
    // Cleanup previous demo data to avoid duplicates
    const oldDonor = await Donor.findOne({ email: "donor@example.com" });
    const oldRecipient = await Recipient.findOne({ email: "recipient@example.com" });
    
    if (oldDonor) {
      await FoodListing.deleteMany({ donorId: oldDonor._id });
      await PickupRequest.deleteMany({ donorId: oldDonor._id });
      await Donor.deleteOne({ _id: oldDonor._id });
    }
    if (oldRecipient) {
      await PickupRequest.deleteMany({ recipientId: oldRecipient._id });
      await Recipient.deleteOne({ _id: oldRecipient._id });
    }

    // 1. Create Demo Donor
    const donorPassword = await bcrypt.hash("password123", 10);
    const donor = await Donor.create({
      name: "Sunny Side Bakery",
      email: "donor@example.com",
      password: donorPassword,
      phone: "555-0101",
      address: "123 Sunrise Ave",
      city: "Shirpur",
      pincode: 425405,
      coordinates: { latitude: 21.350, longitude: 74.882 },
      isLocationEnabled: true,
      role: "donor",
      foodTypes: ["Bakery", "Desserts", "Packaged Food"],
      pickupNotes: "Please come to the back alley door. Ring the bell twice.",
      avgServings: 25,
      totalMealsShared: 350,
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80",
    });

    // 2. Create Demo Recipient
    const recipientPassword = await bcrypt.hash("password123", 10);
    const recipient = await Recipient.create({
      name: "Downtown Community Kitchen",
      email: "recipient@example.com",
      password: recipientPassword,
      phone: "555-0202",
      address: "45 Hope Street",
      city: "Shirpur",
      pincode: 425405,
      coordinates: { latitude: 21.360, longitude: 74.890 },
      isLocationEnabled: true,
      role: "recipient",
      organisationType: "Community Kitchen",
      allergies: ["Nuts"],
      avgRequirement: 50,
      totalMealsReceived: 210,
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80",
    });

    // 3. Create an Active (Available) Food Listing
    const activeListing = await FoodListing.create({
      donorId: donor._id,
      title: "Fresh Artisanal Bread & Pastries",
      description: "End of day surplus! We have about 10 loaves of sourdough and an assortment of muffins and croissants.",
      foodTypes: ["Bakery"],
      servings: 30,
      expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 5), // 5 hours from now
      pickupTime: new Date(Date.now() + 1000 * 60 * 60 * 1), // 1 hour from now
      location: {
        address: donor.address,
        city: donor.city,
        pincode: donor.pincode,
        coordinates: { type: "Point", coordinates: [donor.coordinates.longitude, donor.coordinates.latitude] },
      },
      status: "available",
      isVegetarian: true,
      isVegan: false,
    });

    // 4. Create an Active Pickup Request (Accepted State)
    const reservedListing = await FoodListing.create({
      donorId: donor._id,
      title: "Mixed Fruit Boxes",
      description: "Several boxes of apples, bananas, and oranges. Very ripe, perfect for smoothies or immediate consumption.",
      foodTypes: ["Fresh Produce"],
      servings: 25,
      expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 12),
      pickupTime: new Date(Date.now() + 1000 * 60 * 60 * 2),
      location: {
        address: donor.address,
        city: donor.city,
        pincode: donor.pincode,
        coordinates: { type: "Point", coordinates: [donor.coordinates.longitude, donor.coordinates.latitude] },
      },
      status: "reserved",
      reservedBy: recipient._id,
      reservedAt: new Date(),
      isVegetarian: true,
      isVegan: true,
    });

    await PickupRequest.create({
      listingId: reservedListing._id,
      donorId: donor._id,
      recipientId: recipient._id,
      status: "accepted",
      message: "We would love to use these fruits for our afternoon snack program.",
      requestedPickupTime: new Date(Date.now() + 1000 * 60 * 60 * 2),
      donorLocation: { coordinates: donor.coordinates, address: donor.address },
      recipientLocation: { coordinates: recipient.coordinates, address: recipient.address },
      trackingUpdates: []
    });

    // 5. Create a Completed Pickup Request (History)
    const historyListing = await FoodListing.create({
      donorId: donor._id,
      title: "Yesterday's Surplus Bagels",
      description: "A large box of assorted bagels left over from yesterday morning.",
      foodTypes: ["Bakery"],
      servings: 40,
      expiryTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
      pickupTime: new Date(Date.now() - 1000 * 60 * 60 * 25),
      location: {
        address: donor.address,
        city: donor.city,
        pincode: donor.pincode,
        coordinates: { type: "Point", coordinates: [donor.coordinates.longitude, donor.coordinates.latitude] },
      },
      status: "picked_up",
      pickedUpAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      isVegetarian: true,
      isVegan: true,
    });

    await PickupRequest.create({
      listingId: historyListing._id,
      donorId: donor._id,
      recipientId: recipient._id,
      status: "completed",
      message: "We can distribute these for breakfast tomorrow. Thank you!",
      requestedPickupTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
      actualPickupTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
      donorLocation: { coordinates: donor.coordinates, address: donor.address },
      recipientLocation: { coordinates: recipient.coordinates, address: recipient.address },
      trackingUpdates: [
        { status: "en_route", message: "Driver is on the way", location: recipient.coordinates },
        { status: "arrived", message: "Driver has arrived", location: donor.coordinates },
        { status: "picked_up", message: "Food picked up successfully", location: donor.coordinates },
      ],
      completionRating: {
        recipientRating: 5,
        recipientReview: "Amazing bread, still very fresh!",
        donorRating: 5,
        donorReview: "Very prompt pickup.",
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Demo users and interconnected data seeded successfully!",
      demoCredentials: {
        donor: { email: "donor@example.com", password: "password123" },
        recipient: { email: "recipient@example.com", password: "password123" }
      }
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
