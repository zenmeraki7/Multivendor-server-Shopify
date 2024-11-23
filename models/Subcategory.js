import mongoose from "mongoose";

// Define the Subcategory schema
const subcategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // Subcategory name (e.g., 'Men's Clothing', 'Smartphones')
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to the parent Category model
      required: true,
    },
    description: { type: String }, // Optional: Description of the subcategory
    isActive: { type: Boolean, default: true }, // Whether the subcategory is active
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create the Subcategory model
const Subcategory = mongoose.model("Subcategory", subcategorySchema);

export default Subcategory;
