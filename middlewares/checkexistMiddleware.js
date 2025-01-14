import Category from "../models/Category.js";
import CategoryType from "../models/CategoryType.js";
import Subcategory from "../models/Subcategory.js";

export const checkCategoryTypeExist = async (req, res, next) => {
  try {
    const exist = await CategoryType.findOne({ name: req.body.name });
    console.log(exist);
    if (exist) {
      return res
        .status(403)
        .json({ message: "category Type already exist", success: false });
    }
    next();
  } catch (error) {
    return res
      .status(404)
      .json({ message: "error checking exist", success: false });
  }
};

export const checkCategoryExist = async (req, res, next) => {
  try {
    const exist = await Category.findOne({ name: req.body.name });
    console.log(exist);
    if (exist) {
      return res
        .status(403)
        .json({ message: "category already exist", success: false });
    }
    next();
  } catch (error) {
    return res
      .status(404)
      .json({ message: "error checking exist", success: false });
  }
};

export const checkSubCategoryExist = async (req, res, next) => {
  try {
    const exist = await Subcategory.findOne({ name: req.body.name });
    console.log(exist);
    if (exist) {
      return res
        .status(403)
        .json({ message: "Sub category already exist", success: false });
    }
    next();
  } catch (error) {
    return res
      .status(404)
      .json({ message: "error checking exist", success: false });
  }
};

export const checkProductMiddleware = async (req, res, next) => {
  try {
    const subCat = await Subcategory.findById(req.body.subcategory);
    if (!subCat) {
      return res
        .status(403)
        .json({ message: "Sub category not found", success: false });
    }
    if (subCat.category != req.body.category) {
      return res.status(403).json({
        message: "Sub category not a subset of category that you provided",
        success: false,
      });
    }
    const Cat = await Category.findById(req.body.category);
    if (Cat.categoryType != req.body.categoryType) {
      return res.status(403).json({
        message: "category not a subset of category type that you provided",
        success: false,
      });
    }
    next();
  } catch (error) {
    return res
      .status(404)
      .json({
        message: "error checking exist",
        success: false,
        error: error.message,
      });
  }
};
