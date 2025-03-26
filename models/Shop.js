import mongoose from "mongoose";

const ShopSchema = new mongoose.Schema({
  shop: { type: String, unique: true, required: true },
  email: { type: String },
  password: { type: String },
  isEmailVerified: { type: Boolean, default: false },
  accessToken: { type: String, required: true },
  installedAt: { type: Date, default: Date.now },
});


const Shop = mongoose.model("Shop", ShopSchema);

export default Shop;
