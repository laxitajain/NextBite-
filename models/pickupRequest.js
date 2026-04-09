import mongoose from "mongoose";

const pickupRequestSchema = new mongoose.Schema(
  {
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodListing",
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },
    message: {
      type: String,
    },
    requestedPickupTime: {
      type: Date,
      required: true,
    },
    actualPickupTime: {
      type: Date,
      default: null,
    },
    donorLocation: {
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      address: String,
    },
    recipientLocation: {
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
      address: String,
    },
    estimatedArrival: {
      type: Date,
      default: null,
    },
    trackingUpdates: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["en_route", "arrived", "picked_up", "delayed"],
        },
        message: String,
        location: {
          latitude: Number,
          longitude: Number,
        },
      },
    ],
    completionRating: {
      recipientRating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      recipientReview: {
        type: String,
        default: null,
      },
      donorRating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },
      donorReview: {
        type: String,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

pickupRequestSchema.index({ listingId: 1, recipientId: 1 });
pickupRequestSchema.index({ donorId: 1, status: 1 });
pickupRequestSchema.index({ recipientId: 1, status: 1 });

const PickupRequest =
  mongoose.models.PickupRequest ||
  mongoose.model("PickupRequest", pickupRequestSchema);

export default PickupRequest;


