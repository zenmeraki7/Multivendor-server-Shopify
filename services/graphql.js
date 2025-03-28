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

// GraphQL mutation for creating a product in Shopify query: "metafield:vendor_info.vendor_id:67e29bddb3b240be6cddb7b8"
export const FETCH_PRODUCTS_QUERY = `
  query FetchProducts($first: Int!, $query: String!, $variantsLimit: Int!, $mediaLimit: Int!) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          descriptionHtml
          category { 
            fullName
            name
          }
          compareAtPriceRange {
            maxVariantCompareAtPrice {
              amount 
              currencyCode
            }
            minVariantCompareAtPrice {
              amount 
              currencyCode
            }
          }
          createdAt
          featuredMedia {
            alt
            preview {
              image {
               url
               altText
              }
            }
          }
          metafield(namespace: "vendor_info", key: "vendor_name") {
            namespace
            key
            value
          }
          handle
          media(first: $mediaLimit) {
            edges {
              node {
                preview {
                  image {
                  url
                  altText
                  }
                }
              }
            }
          }
          productType
          seo {
            description
            title
          }
          tags
          totalInventory
          variantsCount {
            count
          }
          vendor
          status
          description
          variants(first: $variantsLimit) {
            edges {
              node {
                id
                title
                price
                createdAt
                compareAtPrice
                inventoryQuantity
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
  }
`;

// GraphQL mutation for creating a product in Shopify query: "metafield:vendor_info.vendor_id:67e29bddb3b240be6cddb7b8"
export const FETCH_PRODUCT_BY_ID = `
  query FetchProducts($id: ID!) {
    product(id: $id) {
          id
          title
          descriptionHtml
          category { 
            fullName
            name
          }
          compareAtPriceRange {
            maxVariantCompareAtPrice {
              amount 
              currencyCode
            }
            minVariantCompareAtPrice {
              amount 
              currencyCode
            }
          }
          createdAt
          featuredMedia {
            alt
            preview {
              image {
               url
               altText
              }
            }
          }
          metafield(namespace: "vendor_info", key: "vendor_name") {
            namespace
            key
            value
          }
          handle
          media(first: 10) {
            edges {
              node {
                preview {
                  image {
                  url
                  altText
                  }
                }
              }
            }
          }
          productType
          seo {
            description
            title
          }
          tags
          totalInventory
          variantsCount {
            count
          }
          vendor
          status
          description
          variants(first: 10) {
            edges {
              node {
                id
                title
                price
                createdAt
                compareAtPrice
                inventoryQuantity
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
`;
