import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    coudinaryId: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" }, // Reference to the Vendor model
    url: { type: String, required: true }, // URL of the image
    altText: { type: String }, // Alt text for accessibility
  },
  { timestamps: true }
);

const Images = mongoose.model("Images", imageSchema);

export default Images;
