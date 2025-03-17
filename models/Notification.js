import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    }, // The user who receives the notification
    title: { type: String, required: true }, // Short title or subject of the notification
    message: { type: String, required: true }, // Detailed message of the notification
    type: {
      type: String,
      enum: ["order", "Product", "review", "Vendor"],
      required: true,
    }, // Type of notification, allowing for various categories
    isRead: { type: Boolean, default: false }, // Whether the notification has been read
    link: { type: String }, // Optional URL for redirecting the user to relevant content (e.g., order details, promotion)
    to: { type: String },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt
);

export default mongoose.model("Notification", notificationSchema);
