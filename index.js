import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import categoryTypeRoutes from "./routes/categoryTypesRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import bankRoutes from "./routes/bankRoutes.js";
import stateRoutes from "./routes/stateRoutes.js";
import countryRoutes from "./routes/countryRoutes.js";
import businessTypesRoutes from "./routes//businessTYpesRoutes.js";
import adminRoutes from "./routes/adminAuthRoutes.js";
import shopifyRoutes from "./routes/shopifyAuthRoutes.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { logMiddleware } from "./middlewares/logMiddleware.js";

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
// Specify the frontend URL in the CORS configuration
const corsOptions = {
  origin: "https://multi-vendor-frontend-lyart.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"], // Adjust based on your needs
  credentials: true, // If you're using cookies or other credentials
};

app.use(cors());

// Log all API calls
app.use(logMiddleware);

app.use("/", shopifyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/category-type", categoryTypeRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategory", subcategoryRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/states", stateRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/business-type", businessTypesRoutes);

// Error Middleware
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
