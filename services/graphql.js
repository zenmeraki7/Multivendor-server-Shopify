export const CREATE_PRODUCT_QUERY = `
          mutation CreateProduct($input: ProductInput!) {
            productCreate(input: $input) {
              product {
                id
                title
                handle
                descriptionHtml
                vendor
                productType
                tags
                status
                totalVariants
                images(first: 10) {
                  edges {
                    node {
                      originalSrc
                    }
                  }
                }
                featuredImage {
                  originalSrc
                }
                metafields(first: 5) {
                  edges {
                    node {
                      id
                      namespace
                      key
                      value
                    }
                  }
                }
                seo {
                  title
                  description
                }
              }
              userErrors {
                field
                message
              }
            }
          }
        `;
