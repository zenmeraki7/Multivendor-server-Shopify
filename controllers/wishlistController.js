import Wishlist from "../models/Wishlist.js"; // Adjust path as per your project structure
import Joi from "joi";

const addToWishlistSchema = Joi.object({
  productId: Joi.string().required(),
  variant: Joi.object({
    attribute: Joi.string().required(),
    value: Joi.string().required(),
    additionalPrice: Joi.number().min(0).optional(),
  }).required(),
});

const removeFromWishlistSchema = Joi.object({
  productId: Joi.string().required(),
  variant: Joi.object({
    attribute: Joi.string().required(),
    value: Joi.string().required(),
  }).required(),
});

export const addToWishlist = async (req, res) => {
  const { error } = addToWishlistSchema.validate(req.body, {
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

  const { productId, variant } = req.body;

  try {
    const userId = req.user._id;

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        products: [{ product: productId, variant }],
      });
    } else {
      const productExists = wishlist.products.some(
        (item) =>
          item.product.toString() === productId &&
          item.variant.attribute === variant.attribute &&
          item.variant.value === variant.value
      );

      if (productExists) {
        return res.status(400).json({ message: "Product already in wishlist" });
      }

      wishlist.products.push({ product: productId, variant });
    }

    await wishlist.save();

    res.status(200).json({ message: "Product added to wishlist", wishlist });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding to wishlist", error: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  const { error } = removeFromWishlistSchema.validate(req.body, {
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

  const { productId, variant } = req.body;

  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(
      (item) =>
        item.product.toString() !== productId ||
        item.variant.attribute !== variant.attribute ||
        item.variant.value !== variant.value
    );

    await wishlist.save();

    res
      .status(200)
      .json({ message: "Product removed from wishlist", wishlist });
  } catch (err) {
    res.status(500).json({
      message: "Error removing product from wishlist",
      error: err.message,
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId }).populate(
      "products.product"
    );
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    res.status(200).json(wishlist);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching wishlist", error: err.message });
  }
};

export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user._id;

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.products = [];
    await wishlist.save();

    res.status(200).json({ message: "Wishlist cleared successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error clearing wishlist", error: err.message });
  }
};
