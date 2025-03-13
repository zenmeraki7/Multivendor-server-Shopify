import express from "express";
import {
  createProduct,
  fetchProducts,
  shopifyAuth,
  shopifyAuthCallback,
} from "../controllers/shopifyAuthController.js";
import { authenticateShop } from "../middlewares/shopifyMiddleware.js";

const router = express.Router();

router.get("/", shopifyAuth);
router.get("/auth/callback", shopifyAuthCallback);
router.get("/shopify/products", authenticateShop, fetchProducts);
router.post("/shopify/products-create", authenticateShop, createProduct);

export default router;
