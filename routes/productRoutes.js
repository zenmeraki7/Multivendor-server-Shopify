import express from "express";
import {
  createProduct,
  updateProductStatus,
  getAllProducts,
  getProductById,
  addVariant,
  editVariant,
  approveProduct,
  rejectProduct,
  getAllActiveProducts,
  getAllSellerProducts,
  updateProduct,
  fetchProducts,
  getAllSellerApprovedProducts,
} from "../controllers/productController.js";
import {
  authenticateAdmin,
  authenticateVendor,
} from "../middlewares/jwtMiddleware.js";
import {
  handleImageUpload,
  uploadImages,
} from "../middlewares/uploadMiddleware.js";
import {
  validateProductCreation,
  validateVariant,
} from "../helper/productValidation.js";
import { checkVendorBlocked } from "../middlewares/checkVendorBlocked.js";
import { authenticateShop } from "../middlewares/shopifyMiddleware.js";

const router = express.Router();

// Admin views all products
router.get("/for-customers", getAllActiveProducts);

// Admin views all products
router.get("/all-pending-products", authenticateShop, getAllProducts);

// Admin views all products
router.get("/all-approved-products", authenticateShop, fetchProducts);

// Seller views all pending products
router.get(
  "/all-seller-pending-products",
  authenticateVendor,
  getAllSellerProducts
);

// Seller views all products
router.get(
  "/all-seller-approved-products",
  authenticateVendor,
  getAllSellerApprovedProducts
);

// Vendor routes
router.post("/create", authenticateVendor, createProduct);

// Vendor routes for update product
router.post(
  "/update/:id",
  authenticateVendor,
  checkVendorBlocked,
  uploadImages,
  validateProductCreation,
  handleImageUpload,
  updateProduct
);

router.get("/get-one/:productId", getProductById); // View product details

// Admin routes
router.put("/status", authenticateAdmin, updateProductStatus); // Admin approves/rejects products
router.put("/approve/:id", authenticateShop, approveProduct); // Admin approves/rejects products
router.put("/reject/:id", authenticateAdmin, rejectProduct); // Admin approves/rejects products

router.post(
  "/product-variant/:productId",
  authenticateVendor,
  checkVendorBlocked,
  uploadImages,
  validateVariant,
  handleImageUpload,
  addVariant
);

router.post(
  "/product-variant/:productId/:variantId",
  authenticateVendor,
  checkVendorBlocked,
  uploadImages,
  validateVariant,
  handleImageUpload,
  editVariant
); // Edit an existing variant

export default router;
