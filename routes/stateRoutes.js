import express from "express";
import {
  createState,
  getStates,
  getStateById,
  updateState,
  deleteState,
  getActiveStates,
} from "../controllers/stateController.js";
import { authenticateAdmin } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

router.post("/", authenticateAdmin, createState); // Create a new state
router.get("/admin", authenticateAdmin, getStates); // Get all states
router.get("/", getActiveStates); // Get all states
router.get("/:id", authenticateAdmin, getStateById); // Get a state by ID
router.put("/:id", authenticateAdmin, updateState); // Update a state by ID
router.delete("/:id", authenticateAdmin, deleteState); // Delete a state by ID

export default router;
