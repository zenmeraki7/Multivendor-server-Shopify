import Joi from "joi";
import Category from "../models/Category.js";
import CategoryType from "../models/CategoryType.js";

export const categoryValidationSchema = Joi.object({
  name: Joi.string().required().messages({
    "string.empty": "Category name is required",
    "string.base": "Category name should be a string",
  }),
  description: Joi.string().optional().max(500).messages({
    "string.max": "Description should not exceed 500 characters",
  }),
});

export const createCategoryType = async (req, res) => {
  // Validate the request body using Joi
  const { error } = categoryValidationSchema.validate(req.body, {
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
    const category = new CategoryType({
      name: req.body.name,
      description: req.body.description,
      isActive: req.body.isActive || true, // Default to true if not provided
    });

    await category.save();
    res
      .status(201)
      .json({ message: "Category type created successfully", category });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating category", error: err.message });
  }
};

// Update Category
export const updateCategoryType = async (req, res) => {
  // Validate the request body using Joi
  const { error } = categoryValidationSchema.validate(req.body, {
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
    const category = await CategoryType.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        isActive: req.body.isActive,
      },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating category", error: err.message });
  }
};

// Delete Category
export const deleteCategoryType = async (req, res) => {
  try {
    const category = await CategoryType.findByIdAndUpdate(req.params.id, {
      isActive: false,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting category", error: err.message });
  }
};

// Get All Categories
export const getAllCategoriesTypes = async (req, res) => {
  try {
    const categories = await CategoryType.find();
    res.status(200).json({ data: categories });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving categories", error: err.message });
  }
};
