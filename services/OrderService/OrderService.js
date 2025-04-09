import shopify from "../../config/shopify.js";
import { GET_ALL_ORDERS, GET_ORDER_BY_ID } from "./helper/queries.js";

export class OrderService {
  constructor(session) {
    this.session = session;
    this.client = new shopify.clients.Graphql({ session });
  }
  async fetchAllOrders() {
    if (!this.session) {
      throw new Error("Unauthorized: No session found");
    }

    const response = await this.client.query({ data: GET_ALL_ORDERS });

    if (!response || !response.body || !response.body.data) {
      throw new Error("Invalid response from Shopify API");
    }

    return response.body.data.orders.edges;
  }
  
  async fetchOrderById(id) {
    if (!this.session) {
      throw new Error("Unauthorized: No session found");
    }

    const response = await this.client.query({
      data: {
        query: GET_ORDER_BY_ID,
        variables: { id: `gid://shopify/Order/${id}` },
      },
    });

    if (!response || !response.body || !response.body.data) {
      throw new Error("Invalid response from Shopify API");
    }

    return response.body.data.order;
  }
}
