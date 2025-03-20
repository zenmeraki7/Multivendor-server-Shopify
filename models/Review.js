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
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true }, // Reference to the user
    rating: { type: Number, required: true, min: 1, max: 5 }, // Rating (1-5)
    comment: { type: String }, // User's review
    images: [imageSchema], // Optional: Images related to the review
    isActive: { type: Boolean, default: true }, // Whether the category is active
  },
  { timestamps: true }
);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
