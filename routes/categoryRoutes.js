import express from "express";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
} from "../controllers/categoryController.js";
import { authentication } from "../middlewares/jwtMiddleware.js"; // Optional: If you need authentication

const router = express.Router();

// Create a new category
router.post("/create", authentication, createCategory);

// Update a category
router.put("/update/:id", authentication, updateCategory);

// Delete a category
router.delete("/delete/:id", authentication, deleteCategory);

// Get all categories
router.get("/all", authentication, getAllCategories);

export default router;
