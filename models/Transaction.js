import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true }, // Reference to the user
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    }, // Reference to the associated order
    transactionId: { type: String, required: true, unique: true }, // Unique transaction ID from payment gateway
    amount: { type: Number, required: true }, // Transaction amount
    type: {
      type: String,
      enum: ["Payment", "Refund"],
      required: true,
    }, // Type of transaction: Payment or Refund
    method: {
      type: String,
      enum: [
        "COD",
        "Credit Card",
        "Debit Card",
        "Net Banking",
        "UPI",
        "Wallet",
      ],
      required: true,
    }, // Payment method
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending",
    }, // Status of the transaction
    gatewayResponse: { type: Object }, // Optional: Gateway response data (for debugging or logs)
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
