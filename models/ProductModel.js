import mongoose from "mongoose";

const { ObjectId } = mongoose.Schema;

const reviewSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
    // user: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true,
    //   ref: "User",
    // },
    user: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const compareSchema = mongoose.Schema({
  compareSiteName: {
    type: String,
  },
  comparePrice: {
    type: String,
  },
  compareDescription: {
    type: String,
  },
});

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    // category: {
    //   type: ObjectId,
    //   ref: "Category",
    //   required: true,
    // },
    category: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    finalPrice: {
      type: String,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    discount: {
      type: String,
    },
    flashSale: {
      type: String,
      default: "false",
    },
    compares: [compareSchema],
  },
  { timestamps: true }
);

// const Product = mongoose.model("Product", productSchema);
const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
