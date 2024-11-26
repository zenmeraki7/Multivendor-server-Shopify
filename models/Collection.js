import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product", // Reference to the Product model
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true, // Toggle visibility of the collection
    },
  },
  { timestamps: true } // Automatically add `createdAt` and `updatedAt` fields
);

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
