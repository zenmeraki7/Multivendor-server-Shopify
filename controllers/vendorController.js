import Vendor from "../models/Vendor.js"; // Adjust path as per your project structure
import bcrypt from "bcryptjs";
import Joi from "joi";
import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import Otp from "../models/Otp.js";
import { vendorUpdateSchema } from "../helper/vendorValidation.js";

// Approve/Reject Vendor Schema
const vendorApprovalSchema = Joi.object({
  verificationRemarks: Joi.string().trim().required().messages({
    "string.empty": "Verification remarks are required.",
  }),
});

// Create Vendor Account
export const createVendor = async (req, res) => {
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

    const vendor = new Vendor(req.body);
    vendor.KycProvidedDetails.personalDetails = true;
    await vendor.save();

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = Date.now() + 10 * 60 * 1000; // Valid for 10 minutes

    // Save OTP to the OTP collection
    const newOtp = new Otp({
      email,
      otp,
      expiresAt: otpExpiration,
    });
    await newOtp.save();

    // Send OTP Email
    await sendEmail(
      email,
      "Verify Your Vendor Account",
      `Your OTP for email verification is: ${otp}`
    );

    res.status(201).json({
      message:
        "Please wait for admin approval. Add other details like bank and documents. An OTP has been sent to your email for verification.",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating vendor account.",
      error: error.message,
    });
  }
};

export const verifyVendor = async (req, res) => {
  const { email, otp } = req.body; // Use email and OTP for verification

  try {
    // Validate input
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    // Find the OTP record for the given email and OTP
    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Check if OTP has expired
    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP has expired." });
    }

    // Delete the OTP document after successful verification
    await Otp.deleteOne({ _id: otpRecord._id });

    // Update the vendor's email verification status
    const vendor = await Vendor.findOneAndUpdate(
      { email },
      { isEmailVerified: true },
      { new: true }
    ).select("-password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: vendor._id, email: vendor.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Token expiration time
    );

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
        "Vendor email verified successfully. Please wait for admin approval.",
      token, // Send the token in the response
      user: vendor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error verifying vendor.",
      error: error.message,
    });
  }
};

// Controller to add document details
export const addDocumentDetails = async (req, res) => {
  // Check if both document URLs (PAN and GSTIN) are provided
  if (!req.PAN_URL || !req.GSTIN_URL) {
    return res
      .status(400)
      .json({ message: "PAN or GSTIN document image is missing." });
  }

  try {
    // Find vendor by ID
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    const { panNumber, gstinNumber } = req.body;

    // Update PAN details if provided
    if (panNumber) {
      vendor.PAN = {
        documentNumber: panNumber,
        documentUrl: req.PAN_URL,
      };
      // Update KycProvidedDetails for PAN
      vendor.KycProvidedDetails.PAN = true;
    }

    // Update GSTIN details if provided
    if (gstinNumber) {
      vendor.GSTIN = {
        documentNumber: gstinNumber,
        documentUrl: req.GSTIN_URL,
      };
      // Update KycProvidedDetails for GSTIN
      vendor.KycProvidedDetails.GSTIN = true;
    }

    // Save updated vendor details
    const updatedData = await Vendor.findByIdAndUpdate(
      req.user.id,
      {
        $set: vendor,
      },
      { new: true }
    ).select("-password");
    console.log(updatedData);
    // Return success response
    return res.status(200).json({
      message: "PAN and GSTIN details updated successfully.",
      user: updatedData,
    });
  } catch (error) {
    console.error("Error updating document details:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
// Controller to update document details
export const updateDocumentDetails = async (req, res) => {
  try {
    // Find vendor by ID
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    const { panNumber, gstinNumber } = req.body;

    vendor.PAN = {
      documentNumber: panNumber,
      documentUrl: vendor.PAN.documentUrl,
    };
    if (req.PAN_URL) {
      vendor.PAN.documentUrl = req.PAN_URL;
    }
    // Update KycProvidedDetails for PAN
    vendor.KycProvidedDetails.PAN = true;

    // Update GSTIN details if provided

    vendor.GSTIN = {
      documentNumber: gstinNumber,
      documentUrl: vendor.GSTIN.documentUrl,
    };
    if (req.GSTIN_URL) {
      vendor.GSTIN.documentUrl = req.GSTIN_URL;
    }
    // Update KycProvidedDetails for GSTIN
    vendor.KycProvidedDetails.GSTIN = true;

    // Save updated vendor details
    const updatedData = await Vendor.findByIdAndUpdate(
      req.user.id,
      {
        $set: vendor,
      },
      { new: true }
    ).select("-password");
    console.log(updatedData);
    // Return success response
    return res.status(200).json({
      message: "PAN and GSTIN details updated successfully.",
      user: updatedData,
    });
  } catch (error) {
    console.error("Error updating document details:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Controller to add bank details
export const addBankDetails = async (req, res) => {
  if (!req.image) {
    return res.status(404).json({ message: "document image required" });
  }
  const { accountHolderName, accountNumber, ifscCode, bankName } = req.body;

  try {
    // Find vendor and update bank details
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.bankDetails = {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      documentUrl: req.image,
    };
    vendor.KycProvidedDetails.bankDetails = true;
    // Save updated vendor details
    const updatedData = await Vendor.findByIdAndUpdate(
      req.user.id,
      {
        $set: vendor,
      },
      { new: true }
    );
    console.log(updatedData);
    return res.status(200).json({
      message: "Bank details updated successfully",
      user: updatedData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Controller to update bank details
export const updateBankDetails = async (req, res) => {
  const { accountHolderName, accountNumber, ifscCode, bankName } = req.body;

  try {
    // Find vendor and update bank details
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    vendor.bankDetails = {
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      documentUrl: vendor.bankDetails.documentUrl,
    };

    if (req.image) {
      vendor.bankDetails.documentUrl = req.image;
    }

    vendor.KycProvidedDetails.bankDetails = true;
    // Save updated vendor details
    const updatedData = await Vendor.findByIdAndUpdate(
      req.user.id,
      {
        $set: vendor,
      },
      { new: true }
    );
    console.log(updatedData);
    return res.status(200).json({
      message: "Bank details updated successfully",
      user: updatedData,
    });
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
    const vendor = await Vendor.findOne({ email })
      .populate("country", "name") // Populate 'country' field
      .populate("state", "name") // Populate 'state' field
      .populate({
        path: "bankDetails.bankName", // Target the nested bankName field
        select: "name", // Select only the name field from the Bank model
      });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }

    // // Check if Vendor is Approved
    // if (!vendor.isVerified) {
    //   return res
    //     .status(403)
    //     .json({
    //       message:
    //         "Your account has not approved yet.Please wait for admin approval",
    //     });
    // }

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
      user: vendor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in.",
      error: error.message,
    });
  }
};

export const getAllVendors = async (req, res) => {
  try {
    // Extract page and limit from query parameters, defaulting to page 1 and 10 items per page
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // Fetch vendors with pagination
    const vendors = await Vendor.find()
      .select(
        "fullName email phoneNum country state companyName salesData companyIcon isVerified"
      )
      .populate("country", "name") // Populate 'country' field, selecting only the 'name' field
      .populate("state", "name") // Populate 'state' field, selecting only the 'name' field
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get the total count of vendors
    const totalVendors = await Vendor.countDocuments();

    res.status(200).json({
      message: "Vendors fetched successfully",
      data: vendors,
      currentPage: page,
      totalPages: Math.ceil(totalVendors / limit),
      totalItems: totalVendors,
      itemsPerPage: limit,
      success: true,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching vendors.", error: error.message });
  }
};

// Get Single Vendor (Admin View)
export const getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .select("-password")
      .populate("country", "name") // Populate 'country' field
      .populate("state", "name") // Populate 'state' field
      .populate({
        path: "bankDetails.bankName", // Target the nested bankName field
        select: "name", // Select only the name field from the Bank model
      });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }
    res.status(200).json({
      message: "Vendors fetched successfully",
      data: vendor,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching vendor details.",
      error: error.message,
    });
  }
};

// Get Single Vendor by token
export const getLoginedVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id).select("-password");
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }
    res.status(200).json({
      message: "Vendor fetched successfully.",
      user: vendor,
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching vendor details.",
      error: error.message,
      success: false,
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
    // vendor.isKycVerified = true;
    vendor.PAN.verified = true;
    vendor.GSTIN.verified = true;
    vendor.bankDetails.isVerified = true;
    vendor.verificationRemarks = verificationRemarks || "Approved by admin.";
    const updatedVendor = await Vendor.findByIdAndUpdate(
      id,
      { $set: vendor },
      { new: true }
    ).select("-password");

    // Create notification for the vendor
    await Notification.create({
      title: "Account Approved",
      message: `Your vendor account "${vendor.companyName}" has been approved.`,
      type: "Vendor",
      vendorId: vendor._id,
      link: `/vendor/dashboard`, // Link to the vendor dashboard
      to: vendor._id,
    });

    await sendEmail(
      vendor.email,
      "Vendor Account Verified",
      `Dear ${vendor.fullName},\n\nYour vendor account "${vendor.companyName}" has been verified by the admin.You can login now`
    );

    res.status(200).json({
      message: "Vendor approved successfully and verification email sent.",
    });
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

export const updateVendorDetails = async (req, res) => {
  try {
    const vendorData = req.body;

    // Validate the incoming data
    const { error, value } = vendorUpdateSchema.validate(vendorData, {
      abortEarly: false, // Return all errors, not just the first one
    });

    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((err) => err.message),
      });
    }

    // Find the vendor by ID and update their details
    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.user.id,
      { $set: value },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({
      message: "Vendor details updated successfully",
      data: updatedVendor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating vendor details",
      error: error.message,
    });
  }
};

export const updateCompanyIcon = async (req, res) => {
  try {
    if (!req.image) {
      return res.status(404).json({ message: "Logo is required" });
    }
    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.vendor._id,
      { $set: { companyIcon: req.image } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedVendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({
      message: "Vendor details updated successfully",
      data: updatedVendor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating vendor details",
      error: error.message,
    });
  }
};
