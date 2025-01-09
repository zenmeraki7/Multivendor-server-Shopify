import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import Joi from "joi";
import Admin from "../models/Admin.js";

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
  }),
});
// Joi Schemas
const registerSchema = Joi.object({
  fullName: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Name is required.",
    "string.min": "Name must be at least 3 characters long.",
    "string.max": "Name must not exceed 30 characters.",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
  }),
  designation: Joi.string().required().messages({
    "string.empty": "designation is required.",
    "string.email": "designation must be a valid email address.",
  }),
  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 8 characters long.",
  }),
});

export const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password, designation } = req.body;
  try {
    // Validate Input
    const { error } = registerSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    // Check if User Already Exists
    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Admin already exists with this email address.",
      });
    }

    // Hash Password and Save User
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await Admin.create({
      fullName,
      email,
      password: hashedPassword,
      designation,
    });

    res.status(201).json({ message: "Admin registered.", admin: admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    // Validate Input
    const { error } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    // Check if user exists
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email",
      });
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    await Admin.findByIdAndUpdate(user._id, { lastLogin: Date.now() });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Exclude sensitive fields
    const { password: _, role, ...userData } = user.toObject();

    res.status(200).json({
      token,
      user: userData,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
