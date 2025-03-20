import Shop from "../models/Shop.js";

export const authenticateShop = async (req, res, next) => {
  const reqShop = req.query.shop;
  try {
    const shop = await Shop.findOne({ shop: reqShop });
    if (!shop) {
      return res.status(401).send("Unauthorized, shop not provided");
    }
    req.session = {
      shop: shop.shop,
      accessToken: shop.accessToken,
    };
    next();
  } catch (err) {
    res
      .status(500)
      .json({ error: err.message, message: "Failed to authenticate shop" });
  }
};
