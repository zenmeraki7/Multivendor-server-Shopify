import Shop from "../models/Shop.js";
import jwt from "jsonwebtoken";

export const authenticateShop = async (req, res, next) => {
  const token = req.cookies?.authToken; // Get token from cookies
  if (!token)
    return res.status(401).json({ error: "Unauthorized, token not found" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.session = {
      shop: decoded.shop,
      accessToken: decoded.accessToken,
    };
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
