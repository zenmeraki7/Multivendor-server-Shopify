// GraphQL mutation for creating a product in Shopify
export const CREATE_PRODUCT_QUERY = `
  mutation CreateProduct($product: ProductCreateInput!,$media: [CreateMediaInput!]) {
    productCreate(product: $product, media: $media) {
        product {
          id
          title
          options {
            id
            name
            position
            optionValues {
              id
              name
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                selectedOptions {
                  name
                  value
                }
              } 
            }
          }
          media(first: 10) {
            nodes {
              alt
              mediaContentType
              preview {
                status
              }
            }
          }
        }
        userErrors {
          field
          message
        }
    }
  }
`;

// GraphQL mutation for creating a variant in Shopify
export const CREATE_VARIANT_QUERY = `
  mutation ProductVariantsCreate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkCreate(productId: $productId, variants: $variants) {
    productVariants {
      id
      title
      price
      barcode
      sku
      compareAtPrice
      inventoryQuantity
      selectedOptions {
            name
            value
          }
      image {
        url
        altText
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

// GraphQL mutation for updating a product in Shopify
export const UPDATE_VARIANT_QUERY = `
  mutation ProductVariantsUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
  productVariantsBulkUpdate(productId: $productId, variants: $variants) {
    productVariants {
      id
      title
      price
      barcode
      sku
      compareAtPrice
      inventoryQuantity
      selectedOptions {
            name
            value
          }
      image {
        url
        altText
      }
    }
    userErrors {
      field
      message
    }
  }
}
`;

// GraphQL mutation for creating a product in Shopify
export const CREATE_PRODUCT_OPTION_QUERY = `mutation createOptions($productId: ID!, $options: [OptionCreateInput!]!) {
      productOptionsCreate(productId: $productId, options: $options) {
        userErrors {
          field
          message
          code
        }
        product {
          id
          options {
            id
            name
            linkedMetafield {
              namespace
              key
            }
            optionValues {
              name
              linkedMetafieldValue
            }
          }
        }
      }
    }`;
