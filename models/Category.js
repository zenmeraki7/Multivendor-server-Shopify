import mongoose from "mongoose";

// Define the Category schema
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // Category name (e.g., 'Fashion', 'Electronics')
    description: { type: String }, // Optional: Description of the category
    isActive: { type: Boolean, default: true }, // Whether the category is active
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Create the Category model
const Category = mongoose.model("Category", categorySchema);

export default Category;
