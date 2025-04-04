import express from "express";
import {
  fetchAllOrders,
  fetchVendorOrders,
} from "../controllers/orderController.js";
import { authenticateShop } from "../middlewares/shopifyMiddleware.js";
import { authenticateVendor } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

router.get("/getAll", authenticateShop, fetchAllOrders);
router.get("/getAll-vendor-orders", authenticateVendor, fetchVendorOrders);
export default router;
