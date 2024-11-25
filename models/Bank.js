import mongoose from "mongoose";

const bankSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Bank name
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country", // Reference to the Country model
      required: true,
    },
    icon: { type: String }, // Optional: URL or base64 string for the bank icon
    isActive: { type: Boolean, default: true }, // Whether the bank is active
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

const Bank = mongoose.model("Bank", bankSchema);

export default Bank;
