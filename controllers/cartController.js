import Cart from "../models/Cart.js"; // Adjust path as per your project structure
import Joi from "joi";

const addToCartSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  variant: Joi.object({
    attribute: Joi.string().required(),
    value: Joi.string().required(),
    additionalPrice: Joi.number().min(0).optional(),
  }).required(),
});

const updateCartItemSchema = Joi.object({
  productId: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  variant: Joi.object({
    attribute: Joi.string().required(),
    value: Joi.string().required(),
  }).required(),
});

const removeCartItemSchema = Joi.object({
  productId: Joi.string().required(),
  variant: Joi.object({
    attribute: Joi.string().required(),
    value: Joi.string().required(),
  }).required(),
});

export const addToCart = async (req, res) => {
  const { productId, quantity, variant } = req.body;

  try {
    // Validate user ID from the token
    const { error } = addToCartSchema.validate(req.body, {
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
    const userId = req.user.id;

    // Check if the cart exists for the user
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = new Cart({
        user: userId,
        products: [{ product: productId, quantity, variant }],
      });
    } else {
      // Check if the product already exists in the cart
      const productIndex = cart.products.findIndex(
        (item) =>
          item.product.toString() === productId &&
          item.variant.attribute === variant.attribute &&
          item.variant.value === variant.value
      );

      if (productIndex > -1) {
        // If the product exists, update the quantity
        cart.products[productIndex].quantity += quantity;
      } else {
        // Add the new product to the cart
        cart.products.push({ product: productId, quantity, variant });
      }
    }

    await cart.save();

    res.status(200).json({ message: "Product added to cart", cart });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding to cart", error: err.message });
  }
};

export const getUserCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId }).populate({
      path: "products.product",
      model: "Product",
      select: "title price thumbnail",
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching cart", error: err.message });
  }
};

export const updateCartItem = async (req, res) => {
  const { productId, quantity, variant } = req.body;

  try {
    const { error } = updateCartItemSchema.validate(req.body, {
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
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variant.attribute === variant.attribute &&
        item.variant.value === variant.value
    );

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Update quantity or other details
    cart.products[productIndex].quantity = quantity;

    await cart.save();

    res.status(200).json({ message: "Cart item updated", cart });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating cart item", error: err.message });
  }
};

export const removeCartItem = async (req, res) => {
  const { productId, variant } = req.body;

  try {
    const { error } = removeCartItemSchema.validate(req.body, {
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
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = cart.products.filter(
      (item) =>
        item.product.toString() !== productId ||
        item.variant.attribute !== variant.attribute ||
        item.variant.value !== variant.value
    );

    await cart.save();

    res.status(200).json({ message: "Cart item removed", cart });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error removing cart item", error: err.message });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.products = [];
    await cart.save();

    res.status(200).json({ message: "Cart cleared successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error clearing cart", error: err.message });
  }
};
