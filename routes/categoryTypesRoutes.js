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

const router = express.Router();

// Create a new category
router.post("/create", authenticateAdmin, createCategoryType);

// Update a category
router.put("/update/:id", authenticateAdmin, updateCategoryType);

// Delete a category
router.delete("/delete/:id", authenticateAdmin, deleteCategoryType);

// Get all categories
router.get("/all-admin", authentication, getAllCategoriesTypes);

// Get all actuve categories
router.get("/all", getAllActiveCategoriesTypes);

export default router;
