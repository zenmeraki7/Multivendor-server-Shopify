import mongoose from "mongoose";

const countrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Country name
    code: { type: String, required: true, unique: true }, // Country code (e.g., 'US', 'IN')
    icon: { type: String }, // Optional: URL or base64 string for the country flag/icon
    isActive: { type: Boolean, default: true }, // Whether the country is active
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

const Country = mongoose.model("Country", countrySchema);

export default Country;
