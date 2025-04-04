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
import mongoose from "mongoose";
import Vendor from "./models/Vendor.js";
import { sendEmail } from "./utils/sendEmail.js";
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
  console.log("Webhook received - starting order processing");
  try {
    const order = req.body;
    console.log("Order data received:", order.id);

    console.log("Checking if order already exists in database");
    const isExistingOrder = await Order.findOne({
      orderId: order.id.toString(),
    });
    console.log(
      "Existing order check result:",
      isExistingOrder ? "Found" : "Not found"
    );

    if (!isExistingOrder) {
      console.log("Saving new order to the database.");
      // Group items by vendor
      const vendorOrders = {};
      console.log("Order line items count:", order.line_items.length);

      order.line_items.forEach((item, index) => {
        const vendor = item.vendor;
        console.log(`Processing line item ${index + 1}, vendor: ${vendor}`);

        if (!vendorOrders[vendor]) {
          console.log(`Creating new vendor group for ${vendor}`);
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
        console.log(`Added item: ${item.title} to vendor ${vendor}`);

        vendorOrders[vendor].totalAmount +=
          parseFloat(item.price) * item.quantity;
        console.log(
          `Updated total for vendor ${vendor}: ${vendorOrders[vendor].totalAmount}`
        );
      });

      console.log(
        "Vendor grouping complete. Vendor count:",
        Object.keys(vendorOrders).length
      );
      console.log("Starting to store vendor-specific orders");

      // Store vendor-specific order data with shipping details using Promise.all
      await Promise.all(
        Object.entries(vendorOrders).map(async ([vendorName, data], index) => {
          console.log(
            `Creating order object for vendor ${index + 1}: ${vendorName}`
          );
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
          console.log(`Order object created for vendor ${vendorName}`);

          if (mongoose.Types.ObjectId.isValid(vendorName)) {
            console.log(
              `Vendor name ${vendorName} is a valid ObjectId, looking up vendor details`
            );
            try {
              const vendorDetails = await Vendor.findById(vendorName);
              console.log(
                `Vendor lookup result: ${vendorDetails ? "Found" : "Not found"}`
              );

              if (vendorDetails) {
                console.log(
                  `Preparing email for vendor: ${vendorDetails.companyName}`
                );
                const message = `
                    Hello ${vendorDetails.companyName},

                    You have received a new order!

                    Order ID: #${order.id.toString()}
                    Total Amount: $${data.totalAmount}

                    Thank you for being a valued vendor!

                    Best Regards,  
                    Your Company Name
                    `;

                console.log(`Sending email to: ${vendorDetails.email}`);
                await sendEmail(
                  vendorDetails.email,
                  `New Order ${order.id.toString()} Received`,
                  message
                );
                console.log(
                  `Email sent successfully to ${vendorDetails.email}`
                );
              }
            } catch (vendorErr) {
              console.error(
                `Error with vendor ${vendorName}:`,
                vendorErr.message
              );
            }
          } else {
            console.log(
              `Vendor name ${vendorName} is not a valid ObjectId, skipping vendor lookup`
            );
          }

          console.log(`Saving order for vendor ${vendorName} to database`);
          await vendorOrder.save();
          console.log(`Order saved successfully for vendor ${vendorName}`);
          return true;
        })
      );

      console.log("All vendor-specific orders saved successfully");
      res.status(200).send("Order processed successfully");
    } else {
      console.log(
        `Order ${order.id} already exists in the database, skipping processing`
      );
      res.status(200).send("Order already processed");
    }
  } catch (err) {
    console.error("Error in order webhook:", err.message);
    console.error("Error stack:", err.stack);
    res.status(500).send("Error processing order");
  }
});

// Error Middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
