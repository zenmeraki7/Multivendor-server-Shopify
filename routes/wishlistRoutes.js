import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlistController.js";
import { authentication } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

router.post("/add", authentication, addToWishlist); // Add item to wishlist
router.get("/", authentication, getWishlist); // Get user's wishlist
router.delete("/remove", authentication, removeFromWishlist); // Remove item from wishlist
router.delete("/clear", authentication, clearWishlist); // Clear wishlist

export default router;
