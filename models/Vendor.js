import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  documentType: {
    type: String,
    enum: [
      "PAN Card",
      "GST Certificate",
      "Aadhar Card",
      "Bank Statement",
      "Trade License",
    ],
    required: true,
  },
  documentUrl: { type: String, required: true }, // URL for the uploaded document
  verified: { type: Boolean, default: false }, // Verification status for the document
});

const vendorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNum: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    zipCode: {
      type: Number,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      default: "India", // Default to India
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyIcon: {
      type: String,
    },
    website: {
      type: String,
    },
    documents: [documentSchema], // Stores required documents for verification
    isVerified: {
      type: Boolean,
      default: false, // Vendor verification status
    },
    isEmailVerified: {
      type: Boolean,
      default: false, // Vendor verification status
    },
    verificationRemarks: {
      type: String, // Remarks or reasons for approval/rejection
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    bankDetails: {
      accountHolderName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      ifscCode: { type: String, required: true },
      bankName: { type: String, required: true },
    },
    gstNumber: {
      type: String,
      required: true, // GST number is mandatory in India for selling
    },
    panNumber: {
      type: String,
      required: true, // PAN is mandatory for tax filing
    },
    salesData: {
      totalSales: { type: Number, default: 0 }, // Total sales in INR
      productsSold: { type: Number, default: 0 }, // Total products sold
    },
    supportContact: {
      email: { type: String, default: "" }, // Vendor support email
      phone: { type: String, default: "" }, // Vendor support phone number
    },
  },
  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);

export default Vendor;
