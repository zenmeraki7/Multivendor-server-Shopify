import express from "express";
import {
  createVendor,
  getAllVendors,
  getVendorById,
  approveVendor,
  rejectVendor,
  loginVendor,
  verifyVendor,
} from "../controllers/vendorController.js";

const router = express.Router();

// Vendor creates an account
router.post("/register", createVendor);

//Verify Vendor account
router.get("/verify-vendor/:token", verifyVendor);

// Vendor login
router.post("/login", loginVendor);

// Admin views all vendors
router.get("/all", getAllVendors);

// Admin views a single vendor
router.get("/:id", getVendorById);

// Admin approves a vendor
router.put("/approve/:id", approveVendor);

// Admin rejects a vendor
router.put("/reject/:id", rejectVendor);

export default router;
