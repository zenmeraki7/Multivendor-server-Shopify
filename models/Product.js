import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // Product name
    description: { type: String, required: true }, // Detailed description
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    productType: {
      type: String,
      default: "",
    },
    handle: {
      type: String,
      default: "",
    },
    price: { type: Number },
    compareAtPrice: { type: Number },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Images" }], // Array of product images
    variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Variants" }], // Product variants (e.g., different colors, sizes)
    inventoryQuanitiy: { type: Number, default: 0 }, // Total stock
    isActive: { type: Boolean, default: true }, // Product active/inactive status
    isApproved: { type: Boolean, default: false }, // Product active/inactive status
    verificationRemarks: {
      type: String, // Remarks or reasons for approval/rejection
    },
    // reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }], // Array of review IDs
    tags: [{ type: String }], // Search tags (e.g., "smartphone", "android")

    // returnPolicy: {
    //   isReturnable: { type: Boolean, default: false }, // Is the product returnable?
    //   returnWindow: { type: Number }, // Return window in days
    // },
    meta: {
      title: { type: String }, // SEO meta title
      description: { type: String }, // SEO meta description
      keywords: [{ type: String }], // SEO keywords
    },
    productSold: { type: Number, default: 0 }, // Number of units sold
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
