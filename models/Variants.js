import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  shopifyVariantId: { type: String },
  shopifyProductId: { type: String },
  barcode: { type: String },
  sku: { type: String },
  compareAtPrice: { type: Number },
  price: { type: Number },
  quantity: { type: Number, default: 0 }, // Stock for this variant
  image: { type: mongoose.Schema.Types.ObjectId, ref: "Images" }, // Image specific to this variant
  variantTypes: [{ option: { type: String }, value: { type: String } }],
  variant: { type: String },
});

const Variants = mongoose.model("Variants", variantSchema);

export default Variants;
