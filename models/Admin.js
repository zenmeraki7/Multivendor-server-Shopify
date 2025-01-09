import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true, // Admin's full name is required
    },
    email: {
      type: String,
      required: true,
      unique: true, // Email must be unique for each admin
    },
    password: {
      type: String,
      required: true, // Password is required
    },
    phoneNumber: {
      type: String,
    },
    profileImage: {
      type: String, // Admin profile picture URL
    },
    designation: {
      type: String, // Role or title of the admin (e.g., "Team Lead", "Manager")
      required: true, // Designation is mandatory
    },
    role: {
      type: String,
      enum: ["superAdmin", "admin"], // Roles can be 'superAdmin' or 'admin'
      default: "admin", // Default role is 'admin'
    },
    isVerified: {
      type: Boolean,
      default: true, // Admin accounts are usually verified by default
    },
    isBlocked: {
      type: Boolean,
      default: false, // Admin accounts can be blocked if needed
    },
    permissions: {
      type: [String], // List of permissions (e.g., "manageUsers", "manageVendors")
      default: ["manageUsers", "manageVendors", "viewReports"], // Default permissions
    },
    lastLogin: {
      type: Date, // Tracks the last login time of the admin
    },
  },
  { timestamps: true } // Adds `createdAt` and `updatedAt` fields
);

const Admins = mongoose.model("Admins", adminSchema);
export default Admins;
