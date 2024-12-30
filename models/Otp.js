import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
  email: { type: String, required: true }, // Email associated with the OTP
  otp: { type: String, required: true }, // The OTP value
  expiresAt: { type: Date, required: true }, // OTP expiration time
  createdAt: { type: Date, default: Date.now }, // Timestamp of OTP creation
  verified: { type: Boolean, default: false }, // Verification status
});

export default mongoose.model("Otp", OtpSchema);
