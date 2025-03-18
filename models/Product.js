import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // Product name
    description: { type: String, required: true }, // Detailed description
    shopifyProductId: { type: String },
    status: {
      type: String,
      enum: ["DRAFT", "ACTIVE", "ARCHIVED"],
      default: "ACTIVE",
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    productType: {
      type: String,
      default: "",
    },
    productOptions: [
      {
        name: { type: String },
        values: [{ type: String }],
      },
    ],
    price: { type: Number },
    compareAtPrice: { type: Number },
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Images" }], // Array of product images
    variants: [{ type: mongoose.Schema.Types.ObjectId, ref: "Variants" }], // Product variants (e.g., different colors, sizes)
    isActive: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    verificationRemarks: {
      type: String, // Remarks or reasons for approval/rejection
    },
    // reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }], // Array of review IDs
    tags: [{ type: String }], // Search tags (e.g., "smartphone", "android")
    meta: {
      title: { type: String }, // SEO meta title
      description: { type: String }, // SEO meta description
    },
    productSold: { type: Number, default: 0 }, // Number of units sold
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
