import mongoose from "mongoose";
import Vendor from "../models/Vendor.js"; // Adjust path as per your project structure
import bcrypt from "bcryptjs";
import Joi from "joi";
import Notification from "../models/Notification.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import Otp from "../models/Otp.js";
import { vendorUpdateSchema } from "../helper/vendorValidation.js";
import asyncHandler from "express-async-handler";

// Approve/Reject Vendor Schema
const vendorApprovalSchema = Joi.object({
  verificationRemarks: Joi.string().trim().required().messages({ 
    "string.empty": "Verification remarks are required.",
  }),
});
const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
  }),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 8 characters long.",
  }),
});
// Joi validation schema
const vendorValidationSchema = Joi.object({
  fullName: Joi.string().required().trim(),
  email: Joi.string().email().required().trim(),
  password: Joi.string().required().min(6),
  phoneNum: Joi.string().required(),
  address: Joi.string().required(),
  zipCode: Joi.number().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  country: Joi.string().required(),
  companyName: Joi.string().required().trim(),
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

// Controller to add document detailss
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
// admin view all vendors
export const getAllVendors = async (req, res) => {
  try {
    const query = {};
    const { isVerified, isBlocked, state, country, minSales, maxSales, search } = req.query;

    if (isVerified && isVerified !== "all") query.isVerified = isVerified;
    if (isBlocked && isBlocked !== "all") query.isBlocked = isBlocked;
    if (state && state !== "all") query.state = state;
    if (country && country !== "all") query.country = country;

    // Filter by totalSales range
    if (minSales || maxSales) {
      query["salesData.totalSales"] = {}; // Initialize filter object
      if (minSales) query["salesData.totalSales"].$gte = parseFloat(minSales); // Minimum sales
      if (maxSales) query["salesData.totalSales"].$lte = parseFloat(maxSales); // Maximum sales
    }

    // Extract page and limit from query parameters, defaulting to page 1 and 10 items per page
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Fetch vendors with pagination
    let vendorsQuery = Vendor.find(query)
      .select("fullName email phoneNum country state companyName salesData companyIcon isVerified isBlocked")
      .populate("country", "name") // Populate 'country' field, selecting only the 'name' field
      .populate("state", "name") // Populate 'state' field, selecting only the 'name' field
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    let vendors = await vendorsQuery;

    // Search logic for companyName, email, state, and country (after populating)
    if (search) {
      const regex = new RegExp(search, "i"); // Case-insensitive regex search

      vendors = vendors.filter((vendor) =>
        regex.test(vendor.companyName) ||
        regex.test(vendor.email) ||
        regex.test(vendor.state?.name) || // Search by state name after population
        regex.test(vendor.country?.name) // Search by country name after population
      );
    }

    // Get the total count of vendors (without pagination)
    const totalVendors = await Vendor.countDocuments(query);

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
    res.status(500).json({ message: "Error fetching vendors.", error: error.message });
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

// Vendor Blocking/Unblocking
export const blockVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // Expecting action as "block" or "unblock"

    if (!["block", "unblock"].includes(action)) {
      return res.status(400).json({ message: "Invalid action. Use 'block' or 'unblock'." });
    }

    const isBlocked = action === "block"; // Set isBlocked based on action

    // Ensure vendor exists before updating
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    // Update the vendor's blocked status
    vendor.isBlocked = isBlocked;
    await vendor.save();

    res.status(200).json({
      message: `Vendor ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      vendor: {
        id: vendor._id,
        companyName: vendor.companyName,
        email: vendor.email,
        isBlocked: vendor.isBlocked, // Ensure frontend receives updated status
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
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

// Controller to add a seller by admin
export const addSellerByAdmin = async (req, res) => {
  // Validate request body
  const { error } = vendorValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    // Check if email or phone number already exists
    const existingVendor = await Vendor.findOne({
      $or: [{ email: req.body.email }, { phoneNum: req.body.phoneNum }],
    });
    if (existingVendor) {
      return res
        .status(409)
        .json({ message: "Email or phone number already in use." });
    }

    // Create new vendor
    const newVendor = new Vendor(req.body);
    await newVendor.save();

    // Send email to the seller with their password and a welcome message
    const emailSubject = "Welcome to Our Platform!";
    const emailText = `
      Dear ${newVendor.fullName},

      Welcome to our platform! Your account has been successfully created.

      Here are your login details:
      Email: ${newVendor.email}
      Password: ${req.body.password}

      Please keep your password secure and do not share it with anyone, you can update this later.

      Best regards,
      The Platform Team
    `;

    await sendEmail(newVendor.email, emailSubject, emailText);

    res
      .status(201)
      .json({ message: "Seller added successfully", vendor: newVendor });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to add seller", error: err.message });
  }
};

export const forgotPasswordVendor = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate Input
  const { error } = forgotPasswordSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((err) => ({
        field: err.path[0],
        message: err.message,
      })),
    });
  }

  // Check if vendor exists
  const vendor = await Vendor.findOne({ email });
  if (!vendor) {
    return res.status(404).json({
      message: "No vendor found with this email",
    });
  }

  // Generate reset token
  const resetToken = jwt.sign({ id: vendor._id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token valid for 1 hour
  });

  // Send email with reset link
  const resetUrl = `${process.env.CLIENT_SELLER_URL}/reset-password/${resetToken}`;
  await sendEmail(
    email,
    "Vendor Password Reset Request",
    `Click the link to reset your password: ${resetUrl}`
  );

  res.status(200).json({
    message: "Password reset email sent. Please check your inbox.",
  });
});
export const resetPasswordVendor = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const token = req.params.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const vendor = await Vendor.findById(decoded.id);
    console.log(vendor);
    
    if (!vendor) {
      return res.status(404).json({ message: "Invalid or expired token." });
    }

    // Hash new password and update
    console.log(newPassword);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(hashedPassword);
    
    vendor.password = hashedPassword;
    await vendor.save();
console.log("----");

    res.status(200).json({ message: "Password reset successfully." });
     
  } catch (error) {
    
    
    res.status(500).json({ message: "Error resetting password.", error: error.message });
  }
});
// Admin Adds a New Vendor (Seller)
export const addVendor = async (req, res) => {
  try {
    const {
      fullName,
      companyName,
      email,
      address,
      city,
      country,
      state,
      businessType,
      zipCode,
      phoneNum,
      storeDescription,
      sellerDescription,
      sellerPolicy,
      password,
      confirmPassword,
    } = req.body;

    // Validate if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Validate ObjectId fields
    if (!mongoose.Types.ObjectId.isValid(country)) {
      return res.status(400).json({ message: "Invalid country ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(state)) {
      return res.status(400).json({ message: "Invalid state ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(businessType)) {
      return res.status(400).json({ message: "Invalid business type ID" });
    }

    // Check if email already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ message: "Vendor with this email already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Vendor instance
    const newVendor = new Vendor({
      fullName,
      companyName,
      email,
      phoneNum,
      address,
      city,
      country: new mongoose.Types.ObjectId(country),
      state: new mongoose.Types.ObjectId(state),
      businessType: new mongoose.Types.ObjectId(businessType),
      zipCode,
      password: hashedPassword,
      storeDescription,
      sellerDescription,
      sellerPolicy,
      isEmailVerified: false,
      isVerified: false,
    });

    // Save to Database
    await newVendor.save();

    // Send Email with Login Credentials (including password)
    const subject = "Vendor Account Created - ZenMeraki";
    const text = `Dear ${fullName},\n\nYour seller account has been created successfully.\n\nLogin Credentials:\nEmail: ${email}\nPassword: ${password}\n\nFor security reasons, please login and change your password immediately.\n\nBest Regards,\nZenMeraki Team`;

    await sendEmail(email, subject, text);

    res.status(201).json({ message: "Seller added successfully. Login credentials sent via email." });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};