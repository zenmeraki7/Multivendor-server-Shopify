import mongoose from "mongoose";

const FieldSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Field name
  label: { type: String, required: true }, // Display label
  type: { type: String, required: true }, // Input type (e.g., text, number)
  required: { type: Boolean, default: false }, // Required field flag
  visible: { type: Boolean, default: true }, // Visibility flag
});

const FormConfigSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
      enum: ["productAdd", "sellerRegistration"],
    }, // Form page type
    fields: { type: [FieldSchema], default: [] }, // List of form fields
  },
  { timestamps: true }
);

const FormConfig = mongoose.model("FormConfig", FormConfigSchema);

export default FormConfig;
