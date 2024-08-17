import mongoose from "mongoose";

const offerSchema = mongoose.Schema(
  {
    percentage: {
      type: String,
      required: true,
    },
    offerReason: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Offer = mongoose.model("Offer", offerSchema);

export default Offer;
