import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true }, // Full name of the recipient
  phone: { type: String, required: true }, // Phone number
  addressLine1: { type: String, required: true }, // Address line 1
  addressLine2: { type: String }, // Address line 2 (optional)
  city: { type: String, required: true }, // City
  state: { type: String, required: true }, // State
  country: { type: String, required: true }, // Country
  zipCode: { type: String, required: true }, // Zip/Postal Code
});

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  }, // Reference to the product
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  }, // Seller of the product
  variant: { type: String }, // Selected variant (e.g., "Red, 64GB")
  quantity: { type: Number, required: true, min: 1 }, // Quantity ordered
  price: { type: Number, required: true }, // Price per unit
  discountedPrice: { type: Number }, // Discounted price per unit
  totalPrice: { type: Number, required: true }, // Total price for this item (quantity * price)
});

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ["COD", "Credit Card", "Debit Card", "Net Banking", "UPI", "Wallet"],
    required: true,
  }, // Payment method
  status: {
    type: String,
    enum: ["Pending", "Completed", "Failed", "Refunded"],
    default: "Pending",
  }, // Payment status
  // transactionId: { type: String }, // Transaction ID from payment gateway
  // amountPaid: { type: Number, required: true }, // Amount paid by the user
});

const shipmentSchema = new mongoose.Schema({
  // courierService: { type: String }, // Courier service name
  // trackingNumber: { type: String }, // Tracking number for shipment
  // estimatedDeliveryDate: { type: Date }, // Estimated delivery date
  shippedAt: { type: Date }, // Date when the product was shipped
  deliveredAt: { type: Date }, // Date when the product was delivered
  status: {
    type: String,
    enum: [
      "Pending",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
    ],
    default: "Pending",
  }, // Current shipment status
});

const orderSchema = new mongoose.Schema(
  {
    items: [orderItemSchema], // Items in the order
    shippingAddress: addressSchema, // Shipping address
    paymentDetails: paymentSchema, // Payment details
    shipmentDetails: shipmentSchema, // Shipment details
    totalAmount: { type: Number, required: true }, // Total amount for the order
    discount: { type: Number, default: 0 }, // Discount applied to the order
    finalAmount: { type: Number, required: true }, // Final amount after discounts
    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
    }, // Current order status
    orderedAt: { type: Date, default: Date.now }, // Date when the order was placed
    notes: { type: String }, // Optional order notes
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
