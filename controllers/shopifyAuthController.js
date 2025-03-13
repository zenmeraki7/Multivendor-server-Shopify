import shopify from "../config/shopify.js";
import Shop from "../models/Shop.js";
import crypto from "crypto";
import axios from "axios";
import { CREATE_PRODUCT_QUERY } from "../services/graphql.js";

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

  // Validate request is from Shopify
  const map = Object.assign({}, req.query);
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
  console.log("every thing ok");
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
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const accessToken = response.data.access_token;
    // Store the access token in your session storage
    await storeSession(shop, accessToken);

    res.redirect(`http://localhost:5173/dashboard?shop=${shop}`);
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

export const createProduct = async (req, res) => {
  const client = new shopify.clients.Graphql({ session: req.session });

  const {
    title,
    description,
    images,
    status,
    productType,
    vendor,
    collections,
    tags,
    category,
    price,
    compareAtPrice,
    inventory,
    sku,
    barcode,
    weightUnit,
    variants,
    seo,
    metadata,
    thumbnail,
  } = req.body;

  try {
    const productImages = images.map((url) => ({ src: url }));

    // Ensure the first image is the thumbnail
    if (thumbnail) {
      productImages.unshift({ src: thumbnail });
    }

    const response = await client.query({
      data: CREATE_PRODUCT_QUERY,
      variables: {
        input: {
          title: "Premium Hoodie",
          descriptionHtml: "<p>High-quality cotton hoodie.</p>",
          productType: "Clothing",
          vendor: "BrandX",
          tags: ["hoodie", "cotton", "fashion"],
          status: "ACTIVE",
          images: [
            {
              src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEZLeIw258b2lVOd5kKq9HTFNBZFlgMIWQKbPv_SvBO9_oL1ilVQ8za1pa40LC6tUb8Ao&usqp=CAU",
            },
            {
              src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHtQ2IqJnLUcCVoU91_Yq1Muc9RbyP26Hx5ojdUj4BSsRUmU7BwIAEWwEEskxBgFnZBWc&usqp=CAU",
            },
          ],
          variants: [
            {
              title: "Small",
              price: "49.99",
              compareAtPrice: "59.99",
              sku: "HOODIE-S",
              barcode: "9876543210987",
              inventoryQuantities: [
                {
                  locationId: "gid://shopify/Location/123456789",
                  availableQuantity: 10,
                },
              ],
              weightUnit: "kg",
            },
            {
              title: "Medium",
              price: "49.99",
              compareAtPrice: "59.99",
              sku: "HOODIE-M",
              barcode: "9876543210988",
              inventoryQuantities: [
                {
                  locationId: "gid://shopify/Location/123456789",
                  availableQuantity: 15,
                },
              ],
              weightUnit: "kg",
            },
          ],
          seo: {
            title: "Best Hoodie for Winter",
            description: "Stay warm with our premium hoodies.",
          },
          metafields: [
            {
              namespace: "custom",
              key: "material",
              value: "100% Cotton",
              type: "single_line_text_field",
            },
          ],
        },
      },
    });

    if (response.body.data.productCreate.userErrors.length > 0) {
      return res
        .status(400)
        .json({ errors: response.body.data.productCreate.userErrors });
    }

    res.json({
      success: true,
      product: response.body.data.productCreate.product,
    });
  } catch (error) {
    console.error("GraphQL Product Creation Error:", error);
    res.status(500).json({ error: error });
  }
};
