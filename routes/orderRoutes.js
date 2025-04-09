import express from "express";
import {
  fetchAllOrders,
  fetchOrderById,
  fetchVendorOrders,
} from "../controllers/orderController.js";
import { authenticateShop } from "../middlewares/shopifyMiddleware.js";
import { authenticateVendor } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

router.get("/getAll", authenticateShop, fetchAllOrders);
router.get("/getOrderById/:id", authenticateShop, fetchOrderById);
router.get("/getAll-vendor-orders", authenticateVendor, fetchVendorOrders);
export default router;
