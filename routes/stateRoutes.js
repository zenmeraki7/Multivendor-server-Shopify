import express from "express";
import {
  createState,
  getStates,
  getStateById,
  updateState,
  deleteState,
} from "../controllers/stateController.js";

const router = express.Router();

router.post("/", createState); // Create a new state
router.get("/", getStates); // Get all states
router.get("/:id", getStateById); // Get a state by ID
router.put("/:id", updateState); // Update a state by ID
router.delete("/:id", deleteState); // Delete a state by ID

export default router;
