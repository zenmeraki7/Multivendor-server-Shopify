import express from "express";
import {
  getadminByToken,
  loginAdmin,
  registerAdmin,
} from "../controllers/adminAuthController.js";
import { authenticateAdmin } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/get-auth-admin", authenticateAdmin, getadminByToken);

export default router;
