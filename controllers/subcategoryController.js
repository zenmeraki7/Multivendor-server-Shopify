import Subcategory from "../models/Subcategory.js";
import Category from "../models/Category.js";
// Create Subcategory
export const createSubcategory = async (req, res) => {
  if (!req.image) {
    return res
      .status(404)
      .json({ message: "image is required", success: false });
  }
  try {
    req.body.icon = req.image;
    const subcategory = new Subcategory(req.body);

    await subcategory.save();
    res
      .status(201)
      .json({ message: "Subcategory created successfully", data: subcategory });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating subcategory", error: err.message });
  }
};

// Update Subcategory
export const updateSubcategory = async (req, res) => {
  const { name, description, isActive, category } = req.body;
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (name) {
      subcategory.name = name;
    }
    if (description) {
      subcategory.description = description;
    }
    if (isActive !== undefined) {
      subcategory.isActive = isActive;
    }
    if (category) {
      subcategory.category = category;
    }
    if (req.image) {
      subcategory.icon = req.image;
    }
    const updatedsubcategory = await Subcategory.findByIdAndUpdate(
      req.params.id,
      { $set: subcategory },
      { new: true }
    );

    if (!updatedsubcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    res.status(200).json({
      message: "Subcategory updated successfully",
      data: updatedsubcategory,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating subcategory", error: err.message });
  }
};

// Delete Subcategory
export const deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, {
      isActive: false,
    });

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
    const query = {};
    const { isActive, category, page = 1, limit = 10, id, search } = req.query;

    if (isActive && isActive !== "all") query.isActive = isActive === "true";
    if (category && category !== "all") query.category = category;

    // If search query exists, find matching category IDs first
    let categoryIds = [];
    if (search) {
      categoryIds = await Category.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");

      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $in: categoryIds.map((cat) => cat._id) } }, // Match category ID
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (id) {
      const subcategory = await Subcategory.findById(id).populate("category", "name");
      if (!subcategory) {
        return res.status(404).json({
          success: false,
          message: "Sub Category not found",
        });
      }
      return res.status(200).json({
        data: subcategory,
        success: true,
        message: "Sub Category fetched successfully",
      });
    }

    const subcategories = await Subcategory.find(query)
      .populate("category", "name")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const totalCount = await Subcategory.countDocuments(query);

    res.status(200).json({
      data: subcategories,
      success: true,
      message: "Sub Categories fetched successfully",
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({
      message: "Error retrieving subcategories",
      error: err.message,
      success: false,
    });
  }
};

// Get All active Subcategories
export const getAllActiveSubcategories = async (req, res) => {
  try {
    if (req.query.id) {
      const subcategories = await Subcategory.find({
        category: req.query.id,
        isActive: true,
      }).populate("category", "name");
      res.status(200).json({
        success: true,
        message: "subcategories fetched successfully",
        data: subcategories,
      });
    } else {
      const subcategories = await Subcategory.find({ isActive: true }).populate(
        "category",
        "name"
      );
      res.status(200).json({
        success: true,
        message: "subcategories fetched successfully",
        data: subcategories,
      });
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error retrieving subcategories", error: err.message });
  }
};
