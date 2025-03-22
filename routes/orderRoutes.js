import express from "express";
import { fetchAllOrders } from "../controllers/orderController.js";
import { authenticateShop } from "../middlewares/shopifyMiddleware.js";

const router = express.Router()

router.get('/getAll',authenticateShop,fetchAllOrders)
export default router;
