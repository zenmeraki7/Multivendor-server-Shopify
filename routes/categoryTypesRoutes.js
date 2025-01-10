import express from "express";

import {
  authenticateAdmin,
  authentication,
} from "../middlewares/jwtMiddleware.js"; // Optional: If you need authentication
import {
  createCategoryType,
  deleteCategoryType,
  getAllActiveCategoriesTypes,
  getAllCategoriesTypes,
  updateCategoryType,
} from "../controllers/categoryTypeController.js";
import {
  handleImageUpload,
  uploadImages,
} from "../middlewares/uploadMiddleware.js";
import { validateCategoryTypeCreation } from "../helper/categoriesValidation.js";

const router = express.Router();

// Create a new category
router.post(
  "/create",
  uploadImages,
  validateCategoryTypeCreation,
  handleImageUpload,
  createCategoryType
);

// Update a category
router.put("/update/:id", authenticateAdmin, updateCategoryType);

// Delete a category
router.delete("/delete/:id", authenticateAdmin, deleteCategoryType);

// Get all categories
router.get("/all-admin", authenticateAdmin, getAllCategoriesTypes);

// Get all actuve categories
router.get("/all", getAllActiveCategoriesTypes);

export default router;
