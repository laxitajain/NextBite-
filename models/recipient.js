// import mongoose, { Schema, models } from "mongoose";

// import User from "@/models/user";

// const Recipient = User.discriminator(
//   "recipient",
//   new mongoose.Schema({
//     organisationType: {
//       type: String,
//       required: true,
//     },
//     allergies: {
//       type: String,
//       required: true,
//     },
//     avgRequirement: {
//       type: Number,
//       required: true,
//     },
//     totalMealsReceived: {
//       type: Number,
//       required: true,
//     },
//   })
// );

// export default Recipient;

import mongoose from "mongoose";
import User from "@/models/user";

const modelName = "recipient";

// Check if the discriminator already exists
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
