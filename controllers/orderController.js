import shopify from "../config/shopify.js";
import Orders from "../models/Order.js";
import { OrderService } from "../services/OrderService/OrderService.js";

export const fetchAllOrders = async (req, res) => {
  try {
    console.log("🔍 Fetching orders from Shopify...");

    const service = new OrderService(req.session);

    const orders = await service.fetchAllOrders();

    console.log("✅ Orders fetched successfully");

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    console.error("❌ Fetch Orders Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message || error,
    });
  }
};

export const fetchVendorOrders = async (req, res) => {
  try {
    // const vendorId = req.query?.id;
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await Orders.find({ vendor: vendorId });
    return res
      .status(200)
      .json({ message: "successfully fetched orders", data: orders });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: err.message, message: "fetch orders failed" });
  }
};

export const fetchOrderById = async (req, res) => {
  try {
    console.log("🔍 Fetching order from Shopify...");
    const orderId = req.params?.id;

    const service = new OrderService(req.session);

    const order = await service.fetchOrderById(orderId);

    console.log("✅ Order fetched successfully");

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    console.error("❌ Fetch Orders Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message || error,
    });
  }
};
