import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  barcode: { type: String },
  compareAtPrice: { type: Number },
  price: { type: Number },
  inventoryQuantity: { type: Number, default: 0 }, // Stock for this variant
  //   image: imageSchema, // Image specific to this variant
});

const Variants = mongoose.model("Variants", variantSchema);

export default Variants;
