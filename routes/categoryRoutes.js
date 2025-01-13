import express from "express";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getAllActiveCategories,
} from "../controllers/categoryController.js";
import {
  authenticateAdmin,
  authentication,
} from "../middlewares/jwtMiddleware.js"; // Optional: If you need authentication
import {
  handleImageUpload,
  uploadImages,
} from "../middlewares/uploadMiddleware.js";
import {
  validateCategoryCreate,
  validateCategoryUpdate,
} from "../helper/categoriesValidation.js";
import { checkCategoryExist } from "../middlewares/checkexistMiddleware.js";

const router = express.Router();

// Create a new category
router.post(
  "/create",
  authenticateAdmin,
  uploadImages,
  validateCategoryCreate,
  checkCategoryExist,
  handleImageUpload,
  createCategory
);

// Update a category
router.put(
  "/update/:id",
  authenticateAdmin,
  uploadImages,
  validateCategoryUpdate,
  handleImageUpload,
  updateCategory
);

// Delete a category
router.delete("/delete/:id", authenticateAdmin, deleteCategory);

// Get all categories
router.get("/admin-all", authenticateAdmin, getAllCategories);

// Get all active categories
router.get("/all", getAllActiveCategories);

export default router;
