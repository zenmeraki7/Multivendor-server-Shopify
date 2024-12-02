import express from "express";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
} from "../controllers/categoryController.js";
import { authenticateAdmin, authentication } from "../middlewares/jwtMiddleware.js"; // Optional: If you need authentication

const router = express.Router();

// Create a new category
router.post("/create", authenticateAdmin, createCategory);

// Update a category
router.put("/update/:id", authenticateAdmin, updateCategory);

// Delete a category
router.delete("/delete/:id", authenticateAdmin, deleteCategory);

// Get all categories
router.get("/all", authentication, getAllCategories);

export default router;
