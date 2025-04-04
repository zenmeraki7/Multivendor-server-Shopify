import shopify from "./shopify.js";

export const registerOrderWebhook = async (shop, accessToken) => {
  const client = new shopify.clients.Graphql({
    session: { shop, accessToken },
  });
  console.log("second");

  try {
    const response = await client.query({
      data: {
        query: `
            mutation webhookSubscriptionCreate($topic: WebhookSubscriptionTopic!, $webhookSubscription: WebhookSubscriptionInput!) {
              webhookSubscriptionCreate(topic: $topic, webhookSubscription: $webhookSubscription) {
                webhookSubscription {
                  id
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
        variables: {
          topic: "ORDERS_CREATE",
          webhookSubscription: {
            callbackUrl: "https://b6ed-2409-4073-2e9a-db74-e984-5743-9a0c-6508.ngrok-free.app/webhooks/orders/create",
            format: "JSON",
          },
        },
      },
    });
    console.log("thrisd");
    const result = response.body.data.webhookSubscriptionCreate;

    if (result.userErrors.length > 0) {
      console.error("Webhook registration errors:", result.userErrors);
      throw new Error(result.userErrors[0].message);
    }

    console.log("Webhook registered with ID:", result.webhookSubscription.id);
    return result;
  } catch (error) {
    console.error("Failed to register webhook:", error);
    throw error;
  }
};
