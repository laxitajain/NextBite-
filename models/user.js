import mongoose, { Schema, models } from "mongoose";

const options = {
  discriminatorKey: "role",
  collection: "users",
  timestamps: true,
};

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        required: false,
      },
      longitude: {
        type: Number,
        required: false,
      },
    },
    isLocationEnabled: {
      type: Boolean,
      default: false,
    },
  },
  options
);

const User = models.User || mongoose.model("User", userSchema);
export default User;
