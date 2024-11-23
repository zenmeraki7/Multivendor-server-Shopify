import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "Home", // Label for the address (e.g., Home, Office)
    },
    street: {
      type: String,
      required: true, // Street is required for a complete address
    },
    city: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    zipCode: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String, // Phone number associated with the address
    },
    isDefault: {
      type: Boolean,
      default: false, // Indicates if this is the default delivery address
    },
  },
  { _id: false } // Disable automatic _id generation for subdocuments
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    DOB: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },
    addresses: [addressSchema], // Array of address subdocuments
    profileImage: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin", "vendor"], // Define roles here
      default: "user", // Default role is 'user'
    },
    isVerified: {
      type: Boolean,
      default: false, // Initially, users are not verified
    },
    registeredAt: {
      type: Date,
      default: new Date(),
    },
    ordersCount: {
      type: Number,
      default: 0,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Users = mongoose.model("Users", userSchema);
export default Users;
