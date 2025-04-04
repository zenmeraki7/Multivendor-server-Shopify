import shopify from "../config/shopify.js";
import Orders from "../models/Order.js";

export const fetchAllOrders = async (req, res) => {
  try {
    if (!req.session) {
      return res.status(401).json({ success: false, message: "Unauthorized: No session found" });
    }

    const client = new shopify.clients.Graphql({ session: req.session });

    const query = `
      query {
        orders(first: 10) {
          edges {
            node {
              id
              createdAt
              unpaid
              name
              customer {
                id
                firstName
                lastName
              }
              billingAddress {
                firstName
                lastName
                address1
                address2
                city
                province
                country
                zip
              }
              shippingLine {
                title
                carrierIdentifier
                code
                deliveryCategory
                custom
                currentDiscountedPriceSet {
                  presentmentMoney {
                    amount
                    currencyCode
                  }
                }
              }
              totalPriceSet {
                presentmentMoney {
                  amount
                  currencyCode
                }
              }
              totalTaxSet {
                presentmentMoney {
                  amount
                  currencyCode
                }
              }
              paymentGatewayNames
              fullyPaid
              shippingAddress {
                firstName
                lastName
                address1
                address2
                city
                company
                province
                country
                countryCodeV2
                formatted
                formattedArea
                latitude
                longitude
                provinceCode
                countryCode
                zip
              }
              lineItems(first: 10) {
                edges {
                  node {
                    id
                    title
                    image {
                      url
                    }
                    vendor
                    quantity
                    sku
                    variant {
                      id
                      barcode
                      displayName
                      image {
                        url
                      }
                      title
                      sku
                      price
                    }
                  }
                }
              }
              requiresShipping
              refundable
            }
          }
        }
      }
    `;

    console.log("🔍 Fetching orders from Shopify...");

    const response = await client.query({ data: query });

    if (!response || !response.body || !response.body.data) {
      throw new Error("Invalid response from Shopify API");
    }

    console.lo("✅ Orders fetched successfully:");

    res.status(200).json({ success: true, data: response.body.data.orders });
  } catch (error) {
    console.error("❌ Fetch Orders Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message || error,
    });
  }
};

export const fetchVendorOrders = async (req, res) => {
  try {
    // const vendorId = req.query?.id;
    const vendorId = req.vendor?._id;

    if (!vendorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const orders = await Orders.find({ vendor: vendorId });
    return res
      .status(200)
      .json({ message: "successfully fetched orders", data: orders });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ error: err.message, message: "fetch orders failed" });
  }
};
