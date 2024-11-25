import mongoose from "mongoose";

const stateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // State name
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country", // Reference to the Country model
      required: true,
    },
    code: { type: String, unique: true }, // Optional: State code (e.g., 'CA' for California)
    icon: { type: String }, // Optional: URL or base64 string for the state icon
    isActive: { type: Boolean, default: true }, // Whether the state is active
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

const State = mongoose.model("State", stateSchema);

export default State;
