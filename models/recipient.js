import mongoose from "mongoose";
import User from "@/models/user";

const modelName = "recipient";

const Recipient =
  mongoose.models[modelName] ||
  (User.discriminators && User.discriminators[modelName]) ||
  User.discriminator(
    modelName,
    new mongoose.Schema({
      organisationType: {
        type: String,
        required: true,
      },
      allergies: {
        type: [String],
        required: true,
      },
      avgRequirement: {
        type: Number,
        required: true,
      },
      totalMealsReceived: {
        type: Number,
        default: 0,
      },
    })
  );

export default Recipient;
