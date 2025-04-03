import shopify from "../config/shopify.js";

export const getAllWebhook = async (req, res) => {
  try {
    const client = new shopify.clients.Graphql({
      session: req.session,
    });
    const data = await client.query({
      data: `query {
          webhookSubscriptions(first: 2) {
            edges {
              node {
                id
                topic
                endpoint {
                  __typename
                  ... on WebhookHttpEndpoint {
                    callbackUrl
                  }
                  ... on WebhookEventBridgeEndpoint {
                    arn
                  }
                  ... on WebhookPubSubEndpoint {
                    pubSubProject
                    pubSubTopic
                  }
                }
              }
            }
          }
        }`,
    });
    console.log("Webhook data:", data.body.data.webhookSubscriptions.edges);
    return res.status(200).json({
      message: "Webhook data retrieved successfully",
      success: true,
      data: data.body.data.webhookSubscriptions.edges,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: err.message,
    });
  }
};

export const deleteWebhook = async (req, res) => {
  try {
    const client = new shopify.clients.Graphql({
      session: req.session,
    });
    const query = `
  mutation webhookSubscriptionDelete($id: ID!) {
    webhookSubscriptionDelete(id: $id) {
      userErrors {
        field
        message
      }
      deletedWebhookSubscriptionId
    }
  }
`;

    const variables = {
      id: `gid://shopify/WebhookSubscription/${req.params.id}`,
    };

    const data = await client.query({
      data: {
        query,
        variables,
      },
    });
    return res.status(200).json({
      message: "Webhook deleted successfully",
      success: true,
      data: data.body.data.webhookSubscriptionDelete,
    });
    
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: err.message,
    });
  }
};
