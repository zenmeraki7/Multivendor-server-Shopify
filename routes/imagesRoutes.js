import express from "express";
import { authenticateVendor } from "../middlewares/jwtMiddleware.js";
import { uploadImageController } from "../controllers/imageController.js";
import { checkVendorBlocked } from "../middlewares/checkVendorBlocked.js";
import {
  handleImageUpload,
  uploadImages,
} from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/create",
//   authenticateVendor,
//   checkVendorBlocked,
  uploadImages,
  handleImageUpload,
  uploadImageController
); // Create a new country

export default router;
