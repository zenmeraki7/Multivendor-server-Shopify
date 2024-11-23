import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true }, // URL of the image
  altText: { type: String }, // Alt text for accessibility
});

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    }, // Reference to the product
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the user
    rating: { type: Number, required: true, min: 1, max: 5 }, // Rating (1-5)
    comment: { type: String }, // User's review
    images: [imageSchema], // Optional: Images related to the review
    createdAt: { type: Date, default: Date.now }, // Review creation time
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
