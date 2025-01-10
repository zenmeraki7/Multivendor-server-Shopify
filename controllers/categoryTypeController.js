import Joi from "joi";
import Category from "../models/Category.js";
import CategoryType from "../models/CategoryType.js";

export const createCategoryType = async (req, res) => {
  if (!req.image) {
    return res
      .status(404)
      .json({ message: "image is required", success: false });
  }

  try {
    const exist = await CategoryType.findOne({ name: req.body.name });
    console.log(exist);
    if (exist) {
      return res
        .status(404)
        .json({ message: "category Type already exist", success: false });
    }

    req.body.icon = req.image;
    const category = new CategoryType(req.body);

    await category.save();
    res.status(201).json({
      message: "Category type created successfully",
      data: category,
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error creating category",
      error: err.message,
      success: false,
    });
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

// Get All Categories with Pagination
export const getAllCategoriesTypes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    if (req.query.id) {
      const category = await CategoryType.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      return res.status(200).json({
        data: category,
        success: true,
        message: "Category fetched successfully",
      });
    }

    const categories = await CategoryType.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalCount = await CategoryType.countDocuments();

    res.status(200).json({
      data: categories,
      success: true,
      message: "Categories fetched successfully",
      totalCount,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error retrieving categories",
      error: err.message,
    });
  }
};

// Get All active Categories
export const getAllActiveCategoriesTypes = async (req, res) => {
  try {
    const categories = await CategoryType.find({ isActive: true });
    res.status(200).json({ data: categories });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving categories", error: err.message });
  }
};
