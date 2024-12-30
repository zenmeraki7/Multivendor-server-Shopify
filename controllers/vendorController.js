import Vendor from "../models/Vendor.js"; // Adjust path as per your project structure
import bcrypt from "bcryptjs";
import Joi from "joi";
import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";

// Approve/Reject Vendor Schema
const vendorApprovalSchema = Joi.object({
  verificationRemarks: Joi.string().trim().required().messages({
    "string.empty": "Verification remarks are required.",
  }),
});

// Create Vendor Account
export const createVendor = async (req, res) => {
  // if (!req.companyIconUrl) {
  //   return res.status(400).json({
  //     message: "companyIcon is required",
  //   });
  // }
  try {
    const { email, password, phoneNum } = req.body;
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
    req.body.password = hashedPassword;
    // req.body.companyIcon = req.companyIconUrl;
    // req.body.zipCode = 123456;
    const vendor = new Vendor(req.body);

    await vendor.save();

    // // Generate Verification Token
    // const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, {
    //   expiresIn: "1d",
    // });

    // // Send Verification Email
    // const verificationUrl = `${process.env.CLIENT_SELLER_URL}/verify-vendor/${token}`;
    // await sendEmail(
    //   email,
    //   "Verify Your Vendor Account",
    //   `Please verify your email address by clicking the link below:\n\n${verificationUrl}`
    // );

    res.status(201).json({
      message: "Please wait for admin approval. Add other details like bank and documents",
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

// Controller to update document details
export const updateDocumentDetails = async (req, res) => {
  // Check if both document URLs (PAN and GSTIN) are provided
  if (!req.PAN_URL || !req.GSTIN_URL) {
    return res.status(404).json({ message: "Some document image is missing" });
  }

  try {
    // Find vendor by ID
    const vendor = await Vendor.findById(req.params.vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Ensure document type is either PAN or GSTIN
    const { documentType, documentNumber } = req.body;
    if (documentType !== "PAN" && documentType !== "GSTIN") {
      return res.status(400).json({
        message: "Document type must be either 'PAN' or 'GSTIN'",
      });
    }

    // Update the appropriate document field based on documentType
    if (documentType === "PAN") {
      vendor.PAN = {
        documentNumber: documentNumber,
        documentUrl: req.PAN_URL,
      };
    } else if (documentType === "GSTIN") {
      vendor.GSTIN = {
        documentNumber: documentNumber,
        documentUrl: req.GSTIN_URL,
      };
    }

    // Save updated vendor details
    await vendor.save();

    // Return success response
    return res.status(200).json({
      message: `${documentType} details updated successfully`,
      vendor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to update bank details
export const updateBankDetails = async (req, res) => {
  if (!req.documentURL) {
    return res.status(404).json({ message: "document image required" });
  }
  const { accountHolderName, accountNumber, ifscCode, bankName } = req.body;

  try {
    // Find vendor and update bank details
    const vendor = await Vendor.findById(req.params.vendorId);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.bankDetails = {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      documentUrl: req.documentURL,
    };
    await vendor.save();
    return res
      .status(200)
      .json({ message: "Bank details updated successfully", vendor });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
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

// Approve Vendor and Send Verification Email
export const approveVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationRemarks } = req.body;

    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    // Set the vendor as verified after admin approval
    vendor.isVerified = true;
    vendor.isKycVerified = true;
    vendor.PAN.verified = true;
    vendor.GSTIN.verified = true;
    vendor.bankDetails.isVerified = true;
    vendor.verificationRemarks = verificationRemarks || "Approved by admin.";
    await vendor.save();

    // Create notification for the vendor
    await Notification.create({
      title: "Account Approved",
      message: `Your vendor account "${vendor.companyName}" has been approved.`,
      type: "Vendor",
      vendorId: vendor._id,
      link: `/vendor/dashboard`, // Link to the vendor dashboard
      to: vendor._id,
    });

    // Generate Verification Token
    const token = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Send Verification Email
    const verificationUrl = `${process.env.CLIENT_SELLER_URL}/verify-vendor/${token}`;
    await sendEmail(
      vendor.email,
      "Vendor Account Verified",
      `Dear ${vendor.fullName},\n\nYour vendor account "${vendor.companyName}" has been verified by the admin. Please click the link below to activate your account:\n\n${verificationUrl}\n\nThank you,\nTeam`
    );

    res.status(200).json({ message: "Vendor approved successfully and verification email sent." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error approving vendor.", error: error.message });
  }
};
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

    // Send rejection email
    await sendEmail(
      vendor.email,
      "Vendor Account Rejected",
      `Dear ${vendor.fullName},\n\nWe regret to inform you that your vendor account "${vendor.companyName}" has been rejected. Remarks: ${vendor.verificationRemarks}.\n\nIf you believe this is a mistake or need assistance, please contact our support team.\n\nThank you,\nTeam`
    );

    res.status(200).json({ message: "Vendor rejected successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error rejecting vendor.", error: error.message });
  }
};
