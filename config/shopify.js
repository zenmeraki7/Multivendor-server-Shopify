import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

// 🔹 Shopify API Configuration
const shopify = shopifyApi ({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  hostName: process.env.HOSTNAME,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false, // ✅ No adapter needed for Node.js
});

export default shopify;