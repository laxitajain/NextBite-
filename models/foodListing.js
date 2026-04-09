import mongoose from "mongoose";

const foodListingSchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    foodTypes: [
      {
        type: String,
        required: true,
      },
    ],
    servings: {
      type: Number,
      required: true,
    },
    expiryTime: {
      type: Date,
      required: true,
    },
    pickupTime: {
      type: Date,
      required: true,
    },
    location: {
      address: {
        type: String,
        required: true,
      },
      coordinates: {
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
          required: true,
        },
      },
      city: {
        type: String,
        required: true,
      },
      pincode: {
        type: Number,
        required: true,
      },
    },
    images: [
      {
        type: String, // URLs to uploaded images
      },
    ],
    status: {
      type: String,
      enum: ["available", "reserved", "picked_up", "expired", "cancelled"],
      default: "available",
    },
    reservedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reservedAt: {
      type: Date,
      default: null,
    },
    pickedUpAt: {
      type: Date,
      default: null,
    },
    pickupNotes: {
      type: String,
    },
    specialInstructions: {
      type: String,
    },
    allergens: [
      {
        type: String,
      },
    ],
    isVegetarian: {
      type: Boolean,
      required: true,
    },
    isVegan: {
      type: Boolean,
      default: false,
    },
    estimatedValue: {
      type: Number, // in local currency
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    reviews: [
      {
        recipientId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for geo queries
foodListingSchema.index({ "location.coordinates": "2dsphere" });
foodListingSchema.index({ status: 1, expiryTime: 1 });
foodListingSchema.index({ donorId: 1, createdAt: -1 });

const FoodListing =
  mongoose.models.FoodListing ||
  mongoose.model("FoodListing", foodListingSchema);

export default FoodListing;


