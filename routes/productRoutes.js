import express from "express";
import {
  createProduct,
  updateProductStatus,
  getAllProducts,
  getProductById,
} from "../controllers/productController.js";
import { authenticateVendor } from "../middlewares/jwtMiddleware.js";
import {
  handleImageUpload,
  uploadImages,
} from "../middlewares/uploadMiddleware.js";
import { validateProductCreation } from "../helper/productValidation.js";

const router = express.Router();
router.get("/allproduct", getAllProducts); // Admin views all products

// Vendor routes
router.post(
  "/create",
  authenticateVendor,
  uploadImages,
  validateProductCreation,
  handleImageUpload,
  createProduct
); // Only vendors can create products
router.get("/:productId", getProductById); // View product details

// Admin routes
router.put("/status", updateProductStatus); // Admin approves/rejects products

export default router;
