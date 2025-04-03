import mongoose from "mongoose";

const shippingAddressSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  company: String,
  address1: String,
  address2: String,
  city: String,
  province: String,
  provinceCode: String,
  country: String,
  countryCode: String,
  zip: String,
  latitude: Number,
  longitude: Number,
});

const lineItemSchema = new mongoose.Schema({
  lineItemId: String,
  productId: String,
  title: String,
  variantTitle: String,
  quantity: Number,
  price: Number,
  sku: String,
});

const vendorOrderSchema = new mongoose.Schema({
  vendorName: String,
  orderId: String,
  orderNumber: Number,
  createdAt: Date,
  orderStatus: String,
  currency: String,
  totalPrice: Number,
  subtotalPrice: Number,
  totalTax: Number,
  customerEmail: String,
  customerName: String,
  items: [lineItemSchema],
  totalAmount: Number,
  shippingAddress: shippingAddressSchema,
});

const VendorOrder = mongoose.model("VendorOrder", vendorOrderSchema);

export default VendorOrder;
