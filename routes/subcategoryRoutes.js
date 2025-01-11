import express from "express";
import {
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getAllSubcategories,
  getAllActiveSubcategories,
} from "../controllers/subcategoryController.js";
import {
  authenticateAdmin,
  authentication,
} from "../middlewares/jwtMiddleware.js"; // Optional: If you need authentication
import {
  handleImageUpload,
  uploadImages,
} from "../middlewares/uploadMiddleware.js";
import { validateSubCategoryUpdate } from "../helper/categoriesValidation.js";
import { checkSubCategoryExist } from "../middlewares/checkexistMiddleware.js";

const router = express.Router();

// Create a new subcategory
router.post(
  "/create",
  authenticateAdmin,
  uploadImages,
  validateSubCategoryUpdate,
  checkSubCategoryExist,
  handleImageUpload,
  createSubcategory
);

// Update a subcategory
router.put("/update/:id", authenticateAdmin, updateSubcategory);

// Delete a subcategory
router.delete("/delete/:id", authenticateAdmin, deleteSubcategory);

// Get all subcategories
router.get("/all-admin", authenticateAdmin, getAllSubcategories);

// Get all active subcategories
router.get("/all", getAllActiveSubcategories);

export default router;
