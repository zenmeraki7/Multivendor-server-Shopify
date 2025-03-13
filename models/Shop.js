import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema({
  shop: { type: String, unique: true, required: true },
  accessToken: { type: String, required: true },
  installedAt: { type: Date, default: Date.now },
});

const Shop = mongoose.model("Shop", ShopSchema);

export default Shop;
