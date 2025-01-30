import mongoose from "mongoose";

const businessTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "Sole Proprietorship",
        "Limited Liability Partnership (LLP)",
        "One Person Company (OPC)",
        "Partnership",
        "Private Limited Company (Pvt Ltd)",
        "Public Limited Company (Ltd)",
        "Non-Profit Organization (NGO)",
        "Cooperative Society",
        "Trust",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    taxBenefits: {
      type: String,
      default: "Varies based on government regulations.",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const BusinessType = mongoose.model("BusinessType", businessTypeSchema);
export default BusinessType;
