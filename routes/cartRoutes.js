import express from "express";
import {
  addToCart,
  getUserCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "..//controllers/cartController.js";
import { authentication } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

router.post("/add", authentication, addToCart); // Add item to cart
router.get("/", authentication, getUserCart); // Get user's cart
router.put("/update", authentication, updateCartItem); // Update cart item
router.delete("/remove", authentication, removeCartItem); // Remove item from cart
router.delete("/clear", authentication, clearCart); // Clear cart

export default router;
