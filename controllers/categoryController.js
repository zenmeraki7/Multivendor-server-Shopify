import Category from "../models/Category.js";
import CategoryType from "../models/CategoryType.js"; 
export const createCategory = async (req, res) => {
  if (!req.image) {
    return res
      .status(404)
      .json({ message: "image is required", success: false });
  }
  try {
    req.body.icon = req.image;
    const category = new Category(req.body);

    await category.save();
    res
      .status(201)
      .json({ message: "Category created successfully", data: category });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating category", error: err.message });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  const { name, description, isActive, categoryType } = req.body;
  try {
    const category = await Category.findById(req.params.id);
    if (name) {
      category.name = name;
    }
    if (description) {
      category.description = description;
    }
    if (isActive !== undefined) {
      category.isActive = isActive;
    }
    if (categoryType) {
      category.categoryType = categoryType;
    }
    if (req.image) {
      category.icon = req.image;
    }
    const updatedcategory = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: category },
      {
        new: true,
      }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res
      .status(200)
      .json({
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
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, {
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
export const getAllCategories = async (req, res) => {
  try {
    const query = {};
    const { isActive, categoryType, page = 1, limit = 10, id, search } = req.query;

    if (isActive && isActive !== "all") query.isActive = isActive === "true";
    if (categoryType && categoryType !== "all") query.categoryType = categoryType;

    // If search query exists, find matching categoryType IDs first
    let categoryTypeIds = [];
    if (search) {
      categoryTypeIds = await CategoryType.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { categoryType: { $in: categoryTypeIds.map((type) => type._id) } }, // Match categoryType ID
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (id) {
      const category = await Category.findById(id).populate("categoryType", "name");
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

    const categories = await Category.find(query)
      .populate("categoryType", "name")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const totalCount = await Category.countDocuments(query);

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
      message: "Error retrieving categories",
      error: err.message,
      success: false,
    });
  }
};


// Get All Categories
export const getAllActiveCategories = async (req, res) => {
  try {
    if (req.query.id) {
      const categories = await Category.find({
        categoryType: req.query.id,
        isActive: true,
      }).populate("categoryType", "name");
      res.status(200).json({
        success: true,
        message: "categories fetched succussfully",
        data: categories,
      });
    } else {
      const categories = await Category.find({ isActive: true }).populate(
        "categoryType",
        "name"
      );
      res.status(200).json({
        success: true,
        message: "categories fetched succussfully",
        data: categories,
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving categories", error: err.message });
  }
};
