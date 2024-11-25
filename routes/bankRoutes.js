import express from "express";
import {
  createBank,
  getBanks,
  getBankById,
  updateBank,
  deleteBank,
} from "../controllers/bankController.js";

const router = express.Router();

router.post("/", createBank); // Create a new bank
router.get("/", getBanks); // Get all banks
router.get("/:id", getBankById); // Get a bank by ID
router.put("/:id", updateBank); // Update a bank by ID
router.delete("/:id", deleteBank); // Delete a bank by ID

export default router;
