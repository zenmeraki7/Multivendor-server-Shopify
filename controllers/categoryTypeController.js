import Joi from "joi";
import CategoryType from "../models/CategoryType.js";

export const createCategoryType = async (req, res) => {
  if (!req.image) {
    return res
      .status(404)
      .json({ message: "image is required", success: false });
  }

  try {
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
  const { name, description, isActive } = req.body;
  try {
    const category = await CategoryType.findById(req.params.id);
    if (name) {
      category.name = name;
    }
    if (description) {
      category.description = description;
    }
    if (isActive !== undefined) {
      category.isActive = isActive;
    }
    if (req.image) {
      category.icon = req.image;
    }

    const updatedcategory = await CategoryType.findByIdAndUpdate(
      req.params.id,
      { $set: category },
      { new: true }
    );
    res.status(200).json({
      message: "Category updated successfully",
      data: updatedcategory,
    });
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
    const query = {};
    const { isActive, page = 1, limit = 10, search, id } = req.query;

    // Status filtering (Convert isActive to boolean)
    if (isActive && isActive !== "all") query.isActive = isActive === "true";

 
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Pagination calculations
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (req.query.id) {
      const category = await CategoryType.findById(req.query.id);
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

    const categories = await CategoryType.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    const totalCount = await CategoryType.countDocuments(query);

    res.status(200).json({
      data: categories,
      success: true,
      message: "Categories fetched successfully",
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
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
