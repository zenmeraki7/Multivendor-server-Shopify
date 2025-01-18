import express from "express";
import {
  createBank,
  getBanks,
  updateBank,
  deleteBank,
  getActiveBanks,
} from "../controllers/bankController.js";
import { authenticateAdmin } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

router.post("/create", authenticateAdmin, createBank); // Create a new bank
router.get("/admin", authenticateAdmin, getBanks); // Get all banks
router.get("/", getActiveBanks); // Get all banks
router.put("/update/:id", authenticateAdmin, updateBank); // Update a bank by ID
router.delete("/delete/:id", authenticateAdmin, deleteBank); // Delete a bank by ID

export default router;
