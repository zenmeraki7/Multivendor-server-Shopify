import shopify from "../config/shopify.js";
import Shop from "../models/Shop.js";

export const getCollections = async (req, res) => {
  try {
    // const shop = await Shop.findOne({ shop: req.vendor?.merchantShop });
    // if (!shop)
    //   return res.status(500).json({
    //     message: "Shop not found!",
    //   });

    // const session = { shop: shop.shop, accessToken: shop.accessToken };
   
    const data = await client.query({
      data: `query CustomCollectionList {
          collections(first: 50, query: "collection_type:custom") {
            nodes {
              id
              handle
              title
              updatedAt
              descriptionHtml
              publishedOnCurrentPublication
              sortOrder
              templateSuffix
            }
          }
        }`,
    });
    res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({
      message: "error while fetching collections",
      error: err.message,
    });
  }
};
