import express from "express";

import {
  authenticateAdmin,
  authentication,
} from "../middlewares/jwtMiddleware.js"; // Optional: If you need authentication
import {
  createCategoryType,
  deleteCategoryType,
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
router.get("/all", authentication, getAllCategoriesTypes);

export default router;
