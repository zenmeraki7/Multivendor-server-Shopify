import express from "express";
import {
  isShopLoginedAuthentication,
  logoutAdmin,
  shopifyAuth,
  shopifyAuthCallback,
} from "../controllers/shopifyAuthController.js";
import {
  deleteWebhook,
  getAllWebhook,
} from "../controllers/webhookController.js";
import { authenticateShop } from "../middlewares/shopifyMiddleware.js";

const router = express.Router();

router.get("/", shopifyAuth);
router.get("/auth/callback", shopifyAuthCallback);
router.get("/shopify/authenticate-admin", isShopLoginedAuthentication);
router.get("/shopify/get-webhooks", authenticateShop, getAllWebhook);
router.get("/shopify/delete-webhook/:id", authenticateShop, deleteWebhook);
router.post("/shopify/logout", logoutAdmin);

export default router;
