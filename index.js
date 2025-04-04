import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from "cors";
import vendorRoutes from "./routes/vendorRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import bankRoutes from "./routes/bankRoutes.js";
import stateRoutes from "./routes/stateRoutes.js";
import countryRoutes from "./routes/countryRoutes.js";
import businessTypesRoutes from "./routes/businessTYpesRoutes.js";
import shopifyRoutes from "./routes/shopifyAuthRoutes.js";
import imageRoutes from "./routes/imagesRoutes.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { logMiddleware } from "./middlewares/logMiddleware.js";
import orderRoutes from "./routes/orderRoutes.js";
import cookieParser from "cookie-parser";
import Order from "./models/Order.js";
dotenv.config();
connectDB();

const app = express();

app.use(express.json());
// Specify the frontend URL in the CORS configuration
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"], // Update this to match your frontend URL
  credentials: true, // 👈 Allows cookies & authentication headers
};

app.use(cors(corsOptions));

// Log all API calls
// app.use(logMiddleware);
app.use(cookieParser()); // 👈 Required to read cookies

app.use("/", shopifyRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/product", productRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/business-type", businessTypesRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/orders", orderRoutes);

app.post("/webhooks/orders/create", async (req, res) => {
  try {
    const order = req.body;
    const isExistingOrder = await Order.findOne({
      orderId: order.id.toString(),
    });

    if (!isExistingOrder) {
      console.log("Saving new order to the database.");
      // Group items by vendor
      const vendorOrders = {};

      order.line_items.forEach((item) => {
        const vendor = item.vendor;

        if (!vendorOrders[vendor]) {
          vendorOrders[vendor] = {
            items: [],
            totalAmount: 0,
          };
        }

        vendorOrders[vendor].items.push({
          lineItemId: item.id.toString(),
          productId: item.product_id.toString(),
          title: item.title,
          variantTitle: item.variant_title,
          quantity: item.quantity,
          price: parseFloat(item.price),
          sku: item.sku,
        });

        vendorOrders[vendor].totalAmount +=
          parseFloat(item.price) * item.quantity;
      });

      // Store vendor-specific order data with shipping details using Promise.all
      await Promise.all(
        Object.entries(vendorOrders).map(([vendorName, data]) => {
          const vendorOrder = new Order({
            vendor: vendorName,
            orderId: order.id.toString(),
            orderNumber: order.order_number,
            createdAt: new Date(order.created_at),
            orderStatus: order.financial_status,
            currency: order.currency,
            totalPrice: parseFloat(order.total_price),
            subtotalPrice: parseFloat(order.subtotal_price),
            totalTax: parseFloat(order.total_tax),
            customerEmail: order.customer?.email || "",
            customerName: `${order.customer?.first_name || ""} ${
              order.customer?.last_name || ""
            }`.trim(),
            items: data.items,
            totalAmount: data.totalAmount,
            shippingAddress: order.shipping_address
              ? {
                  firstName: order.shipping_address.first_name,
                  lastName: order.shipping_address.last_name,
                  company: order.shipping_address.company || "",
                  address1: order.shipping_address.address1,
                  address2: order.shipping_address.address2 || "",
                  city: order.shipping_address.city,
                  province: order.shipping_address.province,
                  provinceCode: order.shipping_address.province_code,
                  country: order.shipping_address.country,
                  countryCode: order.shipping_address.country_code,
                  zip: order.shipping_address.zip,
                  latitude: order.shipping_address.latitude || null,
                  longitude: order.shipping_address.longitude || null,
                }
              : null,
          });
          return vendorOrder.save();
        })
      );

      console.log("Vendor-specific orders saved successfully");
    }
  } catch (err) {
    console.error(err.message);
  }
});

// Error Middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
