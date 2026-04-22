import mongoose from "mongoose";
import User from "@/models/user";

const modelName = "donor";

const Donor =
  mongoose.models[modelName] ||
  (User.discriminators && User.discriminators[modelName]) ||
  User.discriminator(
    modelName,
    new mongoose.Schema({
      foodTypes: {
        type: [String],
        required: true,
      },
      pickupNotes: {
        type: String,
        required: true,
      },
      avgServings: {
        type: Number,
        required: true,
      },
      totalMealsShared: {
        type: Number,
        default: 0,
      },
    })
  );

export default Donor;
