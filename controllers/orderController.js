import shopify from "../config/shopify.js";

export const fetchAllOrders = async (req, res) => {
  try {
    if (!req.session) {
      return res.status(401).json({ message: "Unauthorized: No session found" });
    }

    const client = new shopify.clients.Graphql({ session: req.session });

    const query = `query {
      orders(first: 10) {
        edges {
          node {
            id
            updatedAt
            additionalFees {
              id
              name
            }
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
          subtotalPriceSet {
          presentmentMoney {
            amount
            currencyCode
          }
        }
          totalDiscountsSet {
          presentmentMoney {
            amount
            currencyCode
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
          city
          province
          country
          zip
        }
           requiresShipping
            refundable
          }
        }
      }
    }`;

    console.log("Fetching orders...");

    // ✅ Fix: Ensure query is passed correctly
    const response = await client.query({ data: query });

    console.log("Response:", response.body);

    res.status(200).json({ success: true, data: response.body });
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: error });
  }
};
