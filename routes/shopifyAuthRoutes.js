import express from "express";
import {
  fetchProducts,
  shopifyAuth,
  shopifyAuthCallback,
} from "../controllers/shopifyAuthController.js";
import { authenticateShop } from "../middlewares/shopifyMiddleware.js";

const router = express.Router();

router.get("/", shopifyAuth);
router.get("/auth/callback", shopifyAuthCallback);
router.get("/shopify/products", authenticateShop, fetchProducts);

export default router;
