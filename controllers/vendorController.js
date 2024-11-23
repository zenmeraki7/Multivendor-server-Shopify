import Vendor from "../models/Vendor.js"; // Adjust path as per your project structure
import bcrypt from "bcryptjs";
import Joi from "joi";
import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

const vendorRegistrationSchema = Joi.object({
  fullName: Joi.string().trim().required().messages({
    "string.empty": "Full name is required.",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "A valid email is required.",
    "string.empty": "Email is required.",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters.",
    "string.empty": "Password is required.",
  }),
  phoneNum: Joi.string()
    .pattern(/^\d{10}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be 10 digits.",
      "string.empty": "Phone number is required.",
    }),
  address: Joi.string().required().messages({
    "string.empty": "Address is required.",
  }),
  zipCode: Joi.number().integer().required().messages({
    "number.base": "Zip code must be a number.",
    "any.required": "Zip code is required.",
  }),
  city: Joi.string().trim().required().messages({
    "string.empty": "City is required.",
  }),
  state: Joi.string().trim().required().messages({
    "string.empty": "State is required.",
  }),
  companyName: Joi.string().trim().required().messages({
    "string.empty": "Company name is required.",
  }),
  gstNumber: Joi.string()
    .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "GST number must be valid.",
      "string.empty": "GST number is required.",
    }),
  panNumber: Joi.string()
    .pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .required()
    .messages({
      "string.pattern.base": "PAN number must be valid.",
      "string.empty": "PAN number is required.",
    }),
  bankDetails: Joi.object({
    accountHolderName: Joi.string().required().messages({
      "string.empty": "Account holder name is required.",
    }),
    accountNumber: Joi.string().required().messages({
      "string.empty": "Account number is required.",
    }),
    ifscCode: Joi.string().required().messages({
      "string.empty": "IFSC code is required.",
    }),
    bankName: Joi.string().required().messages({
      "string.empty": "Bank name is required.",
    }),
  }).required(),
});

// Approve/Reject Vendor Schema
const vendorApprovalSchema = Joi.object({
  verificationRemarks: Joi.string().trim().required().messages({
    "string.empty": "Verification remarks are required.",
  }),
});

// Create Vendor Account
export const createVendor = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      phoneNum,
      address,
      zipCode,
      city,
      state,
      companyName,
      gstNumber,
      panNumber,
      bankDetails,
    } = req.body;

    // Validate Input
    const { error } = vendorRegistrationSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    // Check if vendor with the email or phone number already exists
    const existingVendor = await Vendor.findOne({
      $or: [{ email }, { phoneNum }],
    });
    if (existingVendor) {
      return res.status(400).json({
        message: "Vendor with this email or phone number already exists.",
      });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const vendor = new Vendor({
      fullName,
      email,
      password: hashedPassword,
      phoneNum,
      address,
      zipCode,
      city,
      state,
      companyName,
      gstNumber,
      panNumber,
      bankDetails,
    });

    await vendor.save();

    // Generate Verification Token
    const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Send Verification Email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-vendor/${token}`;
    await sendEmail(
      email,
      "Verify Your Vendor Account",
      `Please verify your email address by clicking the link below:\n\n${verificationUrl}`
    );

    res.status(201).json({
      message: "Check your email for verification.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating vendor account.",
      error: error.message,
    });
  }
};

export const verifyVendor = async (req, res) => {
  const { token } = req.params;

  try {
    if (!token) {
      return res
        .status(403)
        .json({ message: "Verification token is missing." });
    }

    // Decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the vendor and update their verification status
    const vendor = await Vendor.findByIdAndUpdate(
      decoded.id,
      { isEmailVerified: true },
      { new: true }
    ).select("-password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    // Create a notification for the admin
    await Notification.create({
      title: "New Vendor Registration",
      message: `Vendor "${vendor.companyName}" has registered and is awaiting approval.`,
      type: "Vendor",
      vendorId: vendor._id,
      link: `/admin/vendors/${vendor._id}`, // Example link for the admin panel
      to: "admin",
    });

    res.status(200).json({
      message:
        "Vendor email verified successfully.Please wait for admin approval.",
    });
  } catch (error) {
    res.status(400).json({
      message: "Invalid or expired token.",
      error: error.message,
    });
  }
};

export const loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate Input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find Vendor by Email
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    // Check if Vendor is Approved
    if (!vendor.isVerified) {
      return res
        .status(403)
        .json({ message: "Your account has not approved yet." });
    }

    // Compare Passwords
    const isPasswordValid = await bcrypt.compare(password, vendor.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: vendor._id, email: vendor.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token expiration time
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      vendor: {
        id: vendor._id,
        fullName: vendor.fullName,
        email: vendor.email,
        companyName: vendor.companyName,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in.",
      error: error.message,
    });
  }
};

// Get All Vendors (Admin View)
export const getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find().select("-password");
    res.status(200).json(vendors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching vendors.", error: error.message });
  }
};

// Get Single Vendor (Admin View)
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id).select("-password");
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }
    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching vendor details.",
      error: error.message,
    });
  }
};

// Approve Vendor
export const approveVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationRemarks } = req.body;

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    vendor.isVerified = true;
    vendor.verificationRemarks = verificationRemarks || "Approved by admin.";
    await vendor.save();

    await Notification.create({
      title: "Account Approved",
      message: `Your vendor account "${vendor.companyName}" has been approved.`,
      type: "Vendor",
      vendorId: vendor._id,
      link: `/vendor/dashboard`, // Example link to the vendor dashboard
      to: vendor._id,
    });

    res.status(200).json({ message: "Vendor approved successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving vendor.", error: error.message });
  }
};

// Reject Vendor
export const rejectVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationRemarks } = req.body;

    const { error } = vendorApprovalSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    vendor.isVerified = false;
    vendor.verificationRemarks = verificationRemarks || "Rejected by admin.";
    await vendor.save();

    await Notification.create({
      title: "Account Rejected",
      message: `Your vendor account "${vendor.companyName}" has been rejected. Remarks: ${vendor.verificationRemarks}`,
      type: "Vendor",
      vendorId: vendor._id,
      link: `/vendor/support`, // Example link for vendor support
      to: vendor._id,
    });

    res.status(200).json({ message: "Vendor rejected successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rejecting vendor.", error: error.message });
  }
};
