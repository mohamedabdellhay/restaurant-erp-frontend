import api from "./api";

const orderService = {
  // Get all orders
  getAll: async () => {
    try {
      const response = await api.get("/orders");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get order by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new order
  create: async (orderData) => {
    try {
      const response = await api.post("/orders", orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update order
  update: async (id, orderData) => {
    try {
      const response = await api.put(`/orders/${id}`, orderData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update order status
  updateStatus: async (id, statusData) => {
    try {
      const response = await api.put(`/orders/${id}`, statusData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete order
  delete: async (id) => {
    try {
      const response = await api.delete(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get orders by status
  getByStatus: async (status) => {
    try {
      const response = await api.get(`/orders?status=${status}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get orders by table
  getByTable: async (tableId) => {
    try {
      const response = await api.get(`/orders?table=${tableId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get orders by customer
  getByCustomer: async (customerId) => {
    try {
      const response = await api.get(`/orders?customer=${customerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get today's orders
  getTodayOrders: async () => {
    try {
      const response = await api.get("/orders/today");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get order statistics
  getStatistics: async () => {
    try {
      const response = await api.get("/orders/statistics");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search orders by customer name or phone
  search: async (query) => {
    try {
      const response = await api.get(
        `/orders/search?q=${encodeURIComponent(query)}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default orderService;
