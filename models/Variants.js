import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  barcode: { type: String },
  sku: { type: String },
  compareAtPrice: { type: Number },
  price: { type: Number },
  inventoryQuantity: { type: Number, default: 0 }, // Stock for this variant
  image: { type: mongoose.Schema.Types.ObjectId, ref: "Images" }, // Image specific to this variant
  variantTypes: [{ option: { type: String }, value: { type: String } }],
  variantTitle: { type: String },
});

const Variants = mongoose.model("Variants", variantSchema);

export default Variants;
