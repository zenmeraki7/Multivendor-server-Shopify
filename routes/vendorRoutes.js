import express from "express";
import {
  createVendor,
  getAllVendors,
  getVendorById,
  approveVendor,
  rejectVendor,
  loginVendor,
  verifyVendor,
  getLoginedVendor,
  updateVendorDetails,
  addDocumentDetails,
  addBankDetails,
  updateCompanyIcon,
  updateBankDetails,
  updateDocumentDetails,
  addSellerByAdmin,
  forgotPasswordVendor,
  resetPasswordVendor,
  blockVendor,
  addVendor,
  changeVendorPassword,
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
import { authenticateShop } from "../middlewares/shopifyMiddleware.js";
import { isShopExistCheckForVendor } from "../controllers/shopifyAuthController.js";
import { getCollections } from "../controllers/collectionController.js";

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

//Verify Vendor account
router.post("/authenticate-shop", isShopExistCheckForVendor);

//Verify Vendor account
router.post("/create-vendor-by-admin", authenticateAdmin, addSellerByAdmin);

// Vendor login
router.post("/login", loginVendor);

// Admin views all vendors
router.get("/all", authenticateShop, getAllVendors);

// Admin views all vendors
router.get("/all-product-collections", getCollections);

// Admin views a single vendor
router.get("/get-one/:id", authenticateShop, getVendorById);

//views a single vendor by token
router.get("/auth-token", authentication, getLoginedVendor);

// Admin approves a vendor
router.put("/approve/:id", authenticateShop, approveVendor);

// Admin rejects a vendor
router.put("/reject/:id", authenticateAdmin, rejectVendor);

// Admin Blocks a vendor
router.put("/blocks/:id", authenticateAdmin, blockVendor);

// Route to add document details
router.put(
  "/add-document",
  authentication,
  uploadImages,
  validateAddDocument,
  handleImageUpload,
  addDocumentDetails
);

// Route to updated document details
router.put(
  "/update-document",
  authentication,
  uploadImages,
  validateAddDocument,
  handleImageUpload,
  updateDocumentDetails
);

// Route to add bank details
router.put(
  "/add-bank",
  authentication,
  uploadImages,
  validateAddBankDetails,
  handleImageUpload,
  addBankDetails
);

// Route to update bank details
router.put(
  "/update-bank-details",
  authentication,
  uploadImages,
  validateAddBankDetails,
  handleImageUpload,
  updateBankDetails
);

// Route to update company icon
router.put(
  "/update-company-logo",
  authenticateVendor,
  uploadImages,
  handleImageUpload,
  updateCompanyIcon
);

// Route to update personal details
router.put("/update-details", authentication, updateVendorDetails);

// Route to update password
router.post("/forgot-password", forgotPasswordVendor);
router.post("/reset-password/:token", resetPasswordVendor);

//Route to add seller by admin
router.post("/add-vendor", authenticateAdmin, addVendor);

// Route to update password by seller
router.post("/change-password", changeVendorPassword);
export default router;
