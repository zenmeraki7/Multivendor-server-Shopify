import express from "express";
import {
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getAllSubcategories,
  getAllActiveSubcategories,
} from "../controllers/subcategoryController.js";
import { authentication } from "../middlewares/jwtMiddleware.js"; // Optional: If you need authentication

const router = express.Router();

// Create a new subcategory
router.post("/create", authentication, createSubcategory);

// Update a subcategory
router.put("/update/:id", authentication, updateSubcategory);

// Delete a subcategory
router.delete("/delete/:id", authentication, deleteSubcategory);

// Get all subcategories
router.get("/all", authentication, getAllSubcategories);

// Get all active subcategories
router.get("/all", getAllActiveSubcategories);

export default router;
