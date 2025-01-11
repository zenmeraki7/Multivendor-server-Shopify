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
import {
  validateCategoryTypeCreation,
  validateCategoryTypeUpdate,
} from "../helper/categoriesValidation.js";
import { checkCategoryTypeExist } from "../middlewares/checkexistMiddleware.js";

const router = express.Router();

// Create a new category
router.post(
  "/create",
  authenticateAdmin,
  uploadImages,
  validateCategoryTypeCreation,
  checkCategoryTypeExist,
  handleImageUpload,
  createCategoryType
);

// Update a category
router.put(
  "/update/:id",
  authenticateAdmin,
  uploadImages,
  validateCategoryTypeUpdate,
  handleImageUpload,
  updateCategoryType
);

// Delete a category
router.delete("/delete/:id", authenticateAdmin, deleteCategoryType);

// Get all categories
router.get("/all-admin", authenticateAdmin, getAllCategoriesTypes);

// Get all actuve categories
router.get("/all", getAllActiveCategoriesTypes);

export default router;
