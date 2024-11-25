import express from "express";
import {
  createCountry,
  deleteCountry,
  getCountries,
  getCountryById,
  updateCountry,
} from "../controllers/countryController.js";

const router = express.Router();

router.post("/", createCountry); // Create a new country
router.get("/", getCountries); // Get all countries
router.get("/:id", getCountryById); // Get a country by ID
router.put("/:id", updateCountry); // Update a country by ID
router.delete("/:id", deleteCountry); // Delete a country by ID

export default router;
