import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/sendEmail.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import Joi from "joi";

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
  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 8 characters long.",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required.",
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Email must be a valid email address.",
  }),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required.",
    "string.min": "Password must be at least 8 characters long.",
  }),
});

export const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

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

  // Hash Password and Save User
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ fullName, email, password: hashedPassword });

  // Send Verification Email
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  const verificationUrl = `${process.env.CLIENT_URL}/verify/${token}`;
  await sendEmail(
    email,
    "Verify Your Email",
    `Click here to verify: ${verificationUrl}`
  );

  res
    .status(201)
    .json({ message: "User registered. Check your email for verification." });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

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
  const user = await User.findOne({ email });
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

  // Check if user is verified
  if (!user.isVerified) {
    return res.status(403).json({
      message: "Please verify your email first",
    });
  }

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
});

export const verifyUser = asyncHandler(async (req, res) => {
  const { token } = req.params;

  try {
    if (!token) {
      res.status(403);
      throw new Error("Missing token");
    }

    // Decode the token to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Update the user's isVerified field
    const user = await User.findByIdAndUpdate(
      decoded.id,
      { isVerified: true },
      { new: true }
    ).select("-password -role"); // Exclude password and role fields

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Generate a new token for the user after verification
    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Email verified successfully",
      token: newToken,
      user,
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Invalid or expired token", error: err.message });
  }
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Validate Input
  const { error } = forgotPasswordSchema.validate(req.body, {
    abortEarly: false,
  });
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
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "No user found with this email",
    });
  }

  // Generate reset token
  const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h", // Token valid for 1 hour
  });

  // Send email with reset link
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail(
    email,
    "Password Reset Request",
    `Click the link to reset your password: ${resetUrl}`
  );

  res.status(200).json({
    message: "Password reset email sent. Please check your inbox.",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Validate Input
  const { error } = resetPasswordSchema.validate(req.body, {
    abortEarly: false,
  });
  if (error) {
    return res.status(400).json({
      message: "Validation error",
      errors: error.details.map((err) => ({
        field: err.path[0],
        message: err.message,
      })),
    });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID and update password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(
      decoded.id,
      { password: hashedPassword },
      { new: true }
    ).select("-password -role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Password reset successfully. You can now log in.",
    });
  } catch (err) {
    res.status(400).json({
      message: "Invalid or expired token",
      error: err.message,
    });
  }
});
