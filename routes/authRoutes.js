import express from "express";
import {
  registerUser,
  loginUser,
  verifyUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { getUserByToken } from "../controllers/userController.js";
import { authentication } from "../middlewares/jwtMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verify/:token", verifyUser);
router.get("/get-user", authentication, getUserByToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
