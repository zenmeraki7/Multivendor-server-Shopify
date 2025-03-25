import shopify from "../config/shopify.js";
import Shop from "../models/Shop.js";
import crypto from "crypto";
import axios from "axios";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const shopifyAuth = async (req, res) => {
  const shop = req.query.shop;
  if (!shop) {
    return res.status(400).send("Missing shop parameter");
  }

  const state = crypto.randomBytes(16).toString("hex");
  const redirectUri = `http://localhost:5000/auth/callback`;
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=read_products,write_products&state=${state}&redirect_uri=${redirectUri}`;

  res.redirect(installUrl);
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
export const adminCreateAccount = async (req, res) => {
  const { email, password, shop } = req.body;
  try {
    const existShop = await Shop.findOne({ shop });
    if (!existShop)
      return res
        .status(404)
        .json({ message: "Shop not found! please install the app" });

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    res.redirect(`http://localhost:5173/login?shop=${shop}`);
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
};

async function storeSession(shop, accessToken) {
  // Implement your session storage logic here
  try {
    let store = await Shop.findOne({ shop });
    if (!store) {
      store = new Shop({ shop, accessToken });
    } else {
      store.accessToken = accessToken;
    }
    await store.save();
  } catch (err) {
    console.log(err);
  }
}

export const fetchProducts = async (req, res) => {
  try {
    const shop = await Shop.findOne({ shop: req.query.shop });

    const client = new shopify.clients.Graphql({
      session: req.session,
    });
    console.log("first");
    const query = `
  {
    products(first: 10) {
      edges {
        node {
          id
          title
          descriptionHtml
          category { 
            attributes
            fullName
            name
          }
          description
          options {
            name
            value
          }
          variants {
            edges {
              node {
                id
                title
                price
                compareAtPrice
                sku
                barcode
                displayName
                image { 
                  url
                }
              }
            }
          }
        }
      }
    }
  }`;

    const response = await client.query({
      data: {
        query: query,
      },
    });
    console.log(response);
    res.status(400).json({ data: response.body.data });
  } catch (err) {
    res.status(400).json({ message: "failed to fetch", error: err.message });
  }
};
