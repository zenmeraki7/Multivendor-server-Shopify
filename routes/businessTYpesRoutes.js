import express from "express";
import {
  addBusinessType,
  getAllActiveBusinessTypes,
  getBusinessTypeById,
  updateBusinessType,
} from "../controllers/businessTypeController.js";

const router = express.Router();

router.post("/create", addBusinessType); // Add Business Type
router.get("/all", getAllActiveBusinessTypes); // Get All Business Types
router.get("/:id", getBusinessTypeById); // Get Business Type by ID
router.put("/:id", updateBusinessType); // Update Business Type by ID

export default router;
// Compare this snippet from controllers/categoryController.js:
