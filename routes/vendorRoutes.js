import express from "express";
import {
  createVendor,
  getAllVendors,
  getVendorById,
  approveVendor,
  rejectVendor,
  loginVendor,
  verifyVendor,
  updateBankDetails,
  updateDocumentDetails,
  getLoginedVendor,
} from "../controllers/vendorController.js";
import {
  handleImageUpload,
  uploadImages,
} from "../middlewares/uploadMiddleware.js";
import {
  validateAddBankDetails,
  validateAddDocument,
  validateVendorCreation,
} from "../helper/vendorValidation.js";
import {
  authenticateAdmin,
  authenticateVendor,
  authentication,
} from "../middlewares/jwtMiddleware.js";

const router = express.Router();

// Vendor creates an account
router.post(
  "/register",
  uploadImages,
  validateVendorCreation,
  handleImageUpload,
  createVendor
);

//Verify Vendor account
router.post("/verify-vendor", verifyVendor);

// Vendor login
router.post("/login", loginVendor);

// Admin views all vendors
router.get("/all", authenticateAdmin, getAllVendors);

// Admin views a single vendor
router.get("/:id", authenticateAdmin, getVendorById);

//views a single vendor by token
router.get("/auth-token", authenticateVendor, getLoginedVendor);

// Admin approves a vendor
router.put("/approve/:id", approveVendor);

// Admin rejects a vendor
router.put("/reject/:id", rejectVendor);

// Route to update document details
router.put(
  "/add-document/:vendorId",
  uploadImages,
  validateAddDocument,
  handleImageUpload,
  updateDocumentDetails
);

// Route to update bank details
router.put(
  "/add-bank/:vendorId",
  uploadImages,
  validateAddBankDetails,
  handleImageUpload,
  updateBankDetails
);

export default router;
