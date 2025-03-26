import mongoose from "mongoose";

const documentDetailsSchema = new mongoose.Schema({
  documentNumber: {
    type: String,
    required: true, // GST number, PAN number, etc.
  },
  documentUrl: {
    type: String,
    required: true, // URL for the uploaded document
  },
  verified: {
    type: Boolean,
    default: false, // Verification status for the document
  },
});

const bankDetailsSchema = new mongoose.Schema({
  accountHolderName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  bankName: { type: String, required: true },
  documentUrl: {
    type: String,
    required: true, // URL for the uploaded bank-related document (e.g., canceled cheque)
  },
  isVerified: { type: Boolean, default: false }, // Verification status for bank details
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
      trim: true,
    },
    merchantShop: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNum: {
      type: String,
      required: true,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Country",
      required: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyIcon: {
      type: String,
      // required: true,
    },
    website: {
      type: String,
    },
    storeDescription: {
      type: String,
    },
    sellerDescription: {
      type: String,
    },
    sellerPolicy: {
      type: String,
    },
    businessType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessType",
      required: true,
    },
    PAN: {
      documentNumber: {
        type: String,
      },
      documentUrl: {
        type: String,
      },
      verified: {
        type: Boolean,
        default: false, // Verification status for the document
      },
    }, // Consolidated for all document types
    GSTIN: {
      documentNumber: {
        type: String,
      },
      documentUrl: {
        type: String,
      },
      verified: {
        type: Boolean,
        default: false, // Verification status for the document
      },
    }, // Consolidated for all document types
    KycProvidedDetails: {
      type: Object,
      default: {
        personalDetails: false, // Status for personalDetails details provided
        PAN: false, // Status for PAN details provided
        GSTIN: false, // Status for GSTIN details provided
        bankDetails: false, // Status for bank details provided
      },
    },
    bankDetails: {
      accountHolderName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String },
      bankName: { type: mongoose.Schema.Types.ObjectId, ref: "Bank" },
      documentUrl: {
        type: String,
      },
      isVerified: { type: Boolean, default: false }, // Verification status for bank details
    },
    isVerified: {
      type: Boolean,
      default: false, // Overall vendor verification status
    },
    isEmailVerified: {
      type: Boolean,
      default: false, // Email verification status
    },
    verificationRemarks: {
      type: String, // Remarks or reasons for approval/rejection
    },
    isBlocked: {
      type: Boolean,
      default: false,
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
