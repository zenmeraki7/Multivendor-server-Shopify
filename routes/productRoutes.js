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
} from "../controllers/productController.js";
import {
  authenticateAdmin,
  authenticateVendor,
  authentication,
} from "../middlewares/jwtMiddleware.js";
import {
  handleImageUpload,
  uploadImages,
} from "../middlewares/uploadMiddleware.js";
import {
  validateProductCreation,
  validateVariant,
} from "../helper/productValidation.js";

const router = express.Router();

// Admin views all products
router.get("/all-customers", getAllActiveProducts);

// Admin views all products
router.get("/allproduct", authenticateAdmin, getAllProducts);

// Vendor routes
router.post(
  "/create",
  authenticateVendor,
  uploadImages,
  validateProductCreation,
  handleImageUpload,
  createProduct
);

router.get("/get-one/:productId", authentication, getProductById); // View product details

// Admin routes
router.put("/status", authenticateAdmin, updateProductStatus); // Admin approves/rejects products
router.put("/approve/:id", authenticateAdmin, approveProduct); // Admin approves/rejects products
router.put("/reject/:id", authenticateAdmin, rejectProduct); // Admin approves/rejects products

router.post(
  "/product-variant/:productId",
  authenticateVendor,
  uploadImages,
  validateVariant,
  handleImageUpload,
  addVariant
);

router.put(
  "/product-variant/:productId/:variantId",
  authenticateVendor,
  uploadImages,
  validateVariant,
  handleImageUpload,
  editVariant
); // Edit an existing variant

export default router;
