import shopify from "../config/shopify.js";
import Shop from "../models/Shop.js";
import crypto from "crypto";
import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerOrderWebhook } from "../config/webhook.js";

export const shopifyAuth = async (req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).send("Missing shop parameter");
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `http://localhost:5000/auth/callback`;
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=read_products,write_products&state=${state}&redirect_uri=${redirectUri}`;

  return res.redirect(installUrl);
};

export const shopifyAuthCallback = async (req, res) => {
  const { shop, hmac, code, state } = req.query;

  // Validate HMAC
  const map = { ...req.query };
  delete map["hmac"];
  const message = Object.keys(map)
    .sort()
    .map((key) => `${key}=${map[key]}`)
    .join("&");
  const providedHmac = Buffer.from(hmac, "utf-8");
  const generatedHmac = Buffer.from(
    crypto
      .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
      .update(message)
      .digest("hex"),
    "utf-8"
  );

  if (!crypto.timingSafeEqual(generatedHmac, providedHmac)) {
    return res.status(400).send("HMAC validation failed");
  }

  console.log("Everything is OK");

  // Exchange temporary code for a permanent access token
  const accessTokenRequestUrl = `https://${shop}/admin/oauth/access_token`;
  const accessTokenPayload = {
    client_id: process.env.SHOPIFY_API_KEY,
    client_secret: process.env.SHOPIFY_API_SECRET,
    code: code,
  };

  try {
    const response = await axios.post(
      accessTokenRequestUrl,
      accessTokenPayload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const accessToken = response.data.access_token;

    // Store access token in session or DB
    await storeSession(shop, accessToken);
    console.log("first")
    // 🔹 Generate a JWT token
    const token = jwt.sign({ shop, accessToken }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 🔹 Set the token in an HTTP-only cookie (Most Secure)
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
    });

    // Redirect to frontend (No token in URL for security reasons)
    res.redirect(`http://localhost:5173?shop=${shop}`);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
};

export const isShopExistCheckForVendor = async (req, res) => {
  if (!req.body.shop)
    return res.status(404).json({ message: "Shop not found!", success: false });

  try {
    const existShop = await Shop.findOne({
      shop: `${req.body.shop}.myshopify.com`,
    });

    if (!existShop)
      return res
        .status(404)
        .json({ message: "Shop not found!", success: false });

    return res
      .status(201)
      .json({ message: "Shop found", shop: existShop.shop, success: true });
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const isShopLoginedAuthentication = async (req, res) => {
  const token = req.cookies?.authToken; // Get token from cookies
  if (!token)
    return res
      .status(401)
      .json({ error: "Unauthorized access, token not found" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res
      .status(201)
      .json({ message: "authorized shop", shop: decoded.shop });
  } catch (error) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const logoutAdmin = async (req, res) => {
  res.cookie("authToken", "", {
    httpOnly: true,
    secure: false, // Set to `true` in production (HTTPS)
    sameSite: "Lax",
    expires: new Date(0), // Expire the cookie immediately
  });

  res.status(200).json({ message: "Logged out successfully" });
};

async function storeSession(shop, accessToken) {
  // Implement your session storage logic here
  try {
    let store = await Shop.findOne({ shop });
    if (!store) {
      store = new Shop({ shop, accessToken });
      await registerOrderWebhook(shop, accessToken); // Register webhook for order creation
    } else {
      store.accessToken = accessToken;
    }
    await store.save();
  } catch (err) {
    console.log(err);
  }
}
