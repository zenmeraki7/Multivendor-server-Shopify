import shopify from "../config/shopify.js";
import Shop from "../models/Shop.js";
import crypto from "crypto";
import axios from "axios";
import {
  CREATE_PRODUCT_OPTION_QUERY,
  CREATE_PRODUCT_QUERY,
  CREATE_VARIANT_QUERY,
} from "../services/graphql.js";

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
    // const productImages = images.map((url) => ({ src: url }));

    // // Ensure the first image is the thumbnail
    // if (thumbnail) {
    //   productImages.unshift({ src: thumbnail });
    // }

    // const response = await client.query({
    //   data: {
    //     query: CREATE_PRODUCT_QUERY,
    //     variables: {
    //       product: {
    //         title: "Helmet Nova",
    //         descriptionHtml: "<strong>Good helmet</strong>",
    //         vendor: "Helmet",
    //         productType: "Helmet",
    //         tags: ["Helmet", "Safety"],
    //         seo: {
    //           title: "Helmet Nova",
    //           description: "Helmet Nova",
    //         },
    //         handle: "helmet-nova",
    //       },
    //       media: [
    //         {
    //           originalSource:
    //             "https://cdn.shopify.com/shopifycloud/brochure/assets/sell/image/image-@artdirection-large-1ba8d5de56c361cec6bc487b747c8774b9ec8203f392a99f53c028df8d0fb3fc.png",
    //           alt: "Gray helmet for bikers",
    //           mediaContentType: "IMAGE",
    //         },
    //         {
    //           originalSource:
    //             "https://www.youtube.com/watch?v=4L8VbGRibj8&list=PLlMkWQ65HlcEoPyG9QayqEaAu0ftj0MMz",
    //           alt: "Testing helmet resistance against impacts",
    //           mediaContentType: "EXTERNAL_VIDEO",
    //         },
    //       ],
    //     },
    //   },
    // });

    const optionResponse = await client.query({
      data: {
        query: CREATE_PRODUCT_OPTION_QUERY,
        variables: {
          productId: "gid://shopify/Product/9627173519607",
          options: [
            {
              name: "Shape",
              values: [{ name: "Square" }, { name: "Rounded" }],
            },
          ],
        },
      },
    });
    console.log(
      optionResponse.body.data.productOptionsCreate.product.options[0].id
    );
    console.log("first");
    const variantResponse = await client.query({
      data: {
        query: CREATE_VARIANT_QUERY,
        variables: {
          productId: 'gid://shopify/Product/9627173519607',
          variants: {
            barcode: "123456789",
            compareAtPrice: "100",
            price: "60",
            
            optionValues: [
              {
                name: "Rounded",
                optionId:'gid://shopify/ProductOption/12110631895287',
              },
            ],
            mediaSrc: [
              "https://media.istockphoto.com/id/178619117/photo/motorcycle-helmet.jpg?s=612x612&w=0&k=20&c=pO2VOZ_M5kDBB4CcWo2VcXppmgA02SM0o8B26Lv2ga8=",
            ],
            inventoryQuantities: [
              {
                availableQuantity: 10,
                locationId: "gid://shopify/Location/98387394807",
              },
            ],
            inventoryItem: {
              measurement: {
                weight: {
                  value: 5,
                  unit: "GRAMS",
                },
              },
              sku: "SH-1235",
            },
          },
        },
      },
    });
    console.log(variantResponse);

    // if (response.body.data.productCreate.userErrors.length > 0) {
    //   return res
    //     .status(400)
    //     .json({ errors: response.body.data.productCreate.userErrors });
    // }
    // if (variantResponse.body.data.productVariants.userErrors.length > 0) {
    //   return res
    //     .status(400)
    //     .json({ errors: response.body.data.productVariants.userErrors });
    // }
    // console.log(response);

    res.json({
      success: true,
      // product: response.body.data.productCreate.product,
      variants: variantResponse.body.data,
      options: optionResponse.body.data,
    });
  } catch (error) {
    console.error("GraphQL Product Creation Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
