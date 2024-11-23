import express from "express";
import {
  createProduct,
  updateProductStatus,
  getAllProducts,
  getProductById,
} from "../controllers/productController.js";
import { authenticateVendor } from "../middlewares/jwtMiddleware.js";

const router = express.Router();
router.get("/allproduct", getAllProducts); // Admin views all products

// Vendor routes
router.post("/create", authenticateVendor, createProduct); // Only vendors can create products
router.get("/:productId", getProductById); // View product details

// Admin routes
router.put("/status", updateProductStatus); // Admin approves/rejects products

export default router;
