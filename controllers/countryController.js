import Country from "../models/Country.js";
import Joi from "joi";

export const countryValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Country name is required",
    "any.required": "Country name is required",
  }),
  code: Joi.string().required().messages({
    "string.empty": "Country code is required",
    "any.required": "Country code is required",
  }),
});

// Create a new country
export const createCountry = async (req, res) => {
  const { error } = countryValidationSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((err) => ({
        field: err.path[0],
        message: err.message,
      })),
    });
  }
  try {
    const { name, code, icon } = req.body;
    const country = new Country({ name, code, icon });
    await country.save();
    res.status(201).json({ message: "Country created successfully", country });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all countries
export const getCountries = async (req, res) => {
  try {
    const countries = await Country.find();
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all active countries
export const getActiveCountries = async (req, res) => {
  try {
    const countries = await Country.find({ isActive: true });
    res.status(200).json(countries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single country by ID
export const getCountryById = async (req, res) => {
  try {
    const country = await Country.findById(req.params.id);
    if (!country) return res.status(404).json({ message: "Country not found" });
    res.status(200).json(country);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a country
export const updateCountry = async (req, res) => {
  const { error } = countryValidationSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((err) => ({
        field: err.path[0],
        message: err.message,
      })),
    });
  }
  try {
    const country = await Country.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!country) return res.status(404).json({ message: "Country not found" });
    res.status(200).json({ message: "Country updated successfully", country });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a country
export const deleteCountry = async (req, res) => {
  try {
    const country = await Country.findByIdAndUpdate(req.params.id, {
      isActive: false,
    });
    if (!country) return res.status(404).json({ message: "Country not found" });
    res.status(200).json({ message: "Country deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
