// import mongoose from "mongoose";
// import User from "@/models/user";

// const Donor =
//   mongoose.models.Donor ||
//   User.discriminator(
//     "donor",
//     new mongoose.Schema({
//       foodTypes: {
//         type: [String],
//         required: false,
//       },
//       pickupNotes: {
//         type: String,
//         required: false,
//       },
//       avgServings: {
//         type: Number,
//         required: false,
//       },
//       totalMealsShared: {
//         type: Number,
//         default: 0,
//       },
//     })
//   );

// export default Donor;

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
