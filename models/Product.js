import mongoose from "mongoose";

const specificationSchema = new mongoose.Schema({
  key: { type: String, required: true }, // e.g., "RAM", "Storage"
  value: { type: String, required: true }, // e.g., "8GB", "128GB"
});

const offerSchema = new mongoose.Schema({
  title: { type: String, required: true }, // e.g., "10% off on HDFC cards"
  description: { type: String }, // Additional details about the offer
  discountPercentage: { type: Number }, // Percentage discount (e.g., 10)
  validUntil: { type: Date }, // Offer expiration date
});

const imageSchema = new mongoose.Schema({
  url: { type: String, required: true }, // URL of the image
  altText: { type: String }, // Alt text for accessibility
});

const variantSchema = new mongoose.Schema({
  attribute: { type: String, required: true }, // e.g., "Color", "Storage"
  value: { type: String, required: true }, // e.g., "Blue", "64GB"
  additionalPrice: { type: Number, default: 0 }, // Price difference for this variant
  stock: { type: Number, default: 0 }, // Stock for this variant
  image: imageSchema, // Image specific to this variant
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // Product name
    description: { type: String, required: true }, // Detailed description
    brand: { type: String, required: true }, // Brand name
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    }, // Main category
    subcategories: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    }, // Array of subcategories
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    }, // Reference to the seller
    price: { type: Number, required: true }, // Base price of the product
    discountedPrice: { type: Number }, // Discounted price
    thumbnail: imageSchema, // Thumbnail image
    images: [imageSchema], // Array of product images
    variants: [variantSchema], // Product variants (e.g., different colors, sizes)
    specifications: [specificationSchema], // Detailed product specifications
    offers: [offerSchema], // Offers applicable to the product
    stock: { type: Number, default: 0 }, // Total stock
    isActive: { type: Boolean, default: true }, // Product active/inactive status
    isApproved: { type: Boolean, default: false }, // Product active/inactive status
    rating: {
      average: { type: Number, default: 0 }, // Average rating
      count: { type: Number, default: 0 }, // Total number of ratings
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }], // Array of review IDs
    tags: [{ type: String }], // Search tags (e.g., "smartphone", "android")
    shippingDetails: {
      weight: { type: Number }, // Weight in kilograms
      freeShipping: { type: Boolean, default: false }, // Whether free shipping is available
    },
    returnPolicy: {
      isReturnable: { type: Boolean, default: false }, // Is the product returnable?
      returnWindow: { type: Number }, // Return window in days
    },
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
