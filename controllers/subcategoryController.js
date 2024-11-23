import Joi from "joi";
import Subcategory from "../models/Subcategory.js";

export const subcategoryValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Subcategory name is required",
    "string.base": "Subcategory name should be a string",
  }),
  category: Joi.string().required().messages({
    "string.empty": "Category ID is required",
    "string.base": "Category ID should be a valid string",
  }),
  description: Joi.string().optional().max(500).messages({
    "string.max": "Description should not exceed 500 characters",
  }),
  isActive: Joi.boolean().optional().messages({
    "boolean.base": "isActive should be a boolean value",
  }),
});

// Create Subcategory
export const createSubcategory = async (req, res) => {
  // Validate the request body using Joi
  const { error } = subcategoryValidationSchema.validate(req.body, {
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
    const subcategory = new Subcategory({
      name: req.body.name,
      category: req.body.category,
      description: req.body.description,
      isActive: req.body.isActive || true, // Default to true if not provided
    });

    await subcategory.save();
    res
      .status(201)
      .json({ message: "Subcategory created successfully", subcategory });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating subcategory", error: err.message });
  }
};

// Update Subcategory
export const updateSubcategory = async (req, res) => {
  // Validate the request body using Joi
  const { error } = subcategoryValidationSchema.validate(req.body, {
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
    const subcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        category: req.body.category,
        description: req.body.description,
        isActive: req.body.isActive,
      },
      { new: true }
    );

    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    res
      .status(200)
      .json({ message: "Subcategory updated successfully", subcategory });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating subcategory", error: err.message });
  }
};

// Delete Subcategory
export const deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndDelete(req.params.id);

    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    res.status(200).json({ message: "Subcategory deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting subcategory", error: err.message });
  }
};

// Get All Subcategories
export const getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.find().populate("category", "name"); // Populate category name
    res.status(200).json({ subcategories });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving subcategories", error: err.message });
  }
};
