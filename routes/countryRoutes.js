import express from "express";
import {
  createCountry,
  deleteCountry,
  getActiveCountries,
  getCountries,
  updateCountry,
} from "../controllers/countryController.js";
import { authenticateAdmin } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

router.post("/create", authenticateAdmin, createCountry); // Create a new country
router.get("/admin",authenticateAdmin, getCountries); // Get all countries for admin
router.get("/", getActiveCountries); // Get all countries
router.put("/update/:id", authenticateAdmin, updateCountry); // Update a country by ID
router.delete("/delete/:id", authenticateAdmin, deleteCountry); // Delete a country by ID

export default router;
