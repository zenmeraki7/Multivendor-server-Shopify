import express from "express";
import {
  createBank,
  getBanks,
  getBankById,
  updateBank,
  deleteBank,
} from "../controllers/bankController.js";
import { authenticateAdmin } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

router.post("/", authenticateAdmin, createBank); // Create a new bank
router.get("/",  getBanks); // Get all banks
router.get("/:id", authenticateAdmin, getBankById); // Get a bank by ID
router.put("/:id", authenticateAdmin, updateBank); // Update a bank by ID
router.delete("/:id", authenticateAdmin, deleteBank); // Delete a bank by ID

export default router;
