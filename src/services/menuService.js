import api from "./api";

const menuService = {
  // Get all menu items
  getAll: async (categoryId = null) => {
    try {
      const url = categoryId ? `/menu?category=${categoryId}` : "/menu";
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get menu item by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/menu/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new menu item (Admin or Manager only)
  create: async (menuData) => {
    try {
      const response = await api.post("/menu", menuData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update menu item (Admin or Manager only)
  update: async (id, menuData) => {
    try {
      const response = await api.put(`/menu/${id}`, menuData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete menu item (Admin only)
  delete: async (id) => {
    try {
      const response = await api.delete(`/menu/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default menuService;
