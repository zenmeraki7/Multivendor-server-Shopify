import express from "express";
import {
  isShopLoginedAuthentication,
  logoutAdmin,
  shopifyAuth,
  shopifyAuthCallback,
} from "../controllers/shopifyAuthController.js";

const router = express.Router();

router.get("/", shopifyAuth);
router.get("/auth/callback", shopifyAuthCallback);
router.get("/shopify/authenticate-admin", isShopLoginedAuthentication);
router.post("/shopify/logout", logoutAdmin);

export default router;
