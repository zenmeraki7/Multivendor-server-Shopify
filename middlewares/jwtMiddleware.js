import jwt from "jsonwebtoken";
import Vendor from "../models/Vendor.js";
import User from "../models/User.js";
import Admins from "../models/Admin.js";

export const authentication = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data to the request
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Admins.findById(decoded.id);
    // Check if user is an admin
    if (!user) {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
    req.user = decoded; // Attach decoded user data to the request
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

export const authenticateVendor = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    // Check if vendor exists in the database
    const vendor = await Vendor.findById(decoded.id).select("-password");
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found." });
    }
    if (!vendor.isVerified) {
      return res.status(404).json({
        message: "Not approved by admin yet, Please wait for admin approval",
      });
    }
    // Attach vendor to request object
    req.vendor = vendor;
    console.log("first");
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token.", error: error.message });
  }
};
