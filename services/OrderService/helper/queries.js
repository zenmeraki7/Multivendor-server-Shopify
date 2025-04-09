export const GET_ALL_ORDERS = `
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

export const GET_ORDER_BY_ID = `
  query GetOrderById($id: ID!) {
    order(id: $id) {
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
        `;
