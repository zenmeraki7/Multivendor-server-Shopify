import mongoose from "mongoose";

// Define the Category schema
const categoryTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Category name (e.g., 'Fashion', 'Electronics')
    description: { type: String }, // Optional: Description of the category
    icon: { type: String }, // Optional: Description of the category
    isActive: { type: Boolean, default: true }, // Whether the category is active
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create the Category model
const CategoryType = mongoose.model("CategoryType", categoryTypeSchema);

export default CategoryType;
