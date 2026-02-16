import api from './api';

const supplierService = {
  // Get all suppliers
  getAll: async () => {
    try {
      const response = await api.get('/inventory/suppliers');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get supplier by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/inventory/suppliers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create new supplier
  create: async (supplierData) => {
    try {
      const response = await api.post('/inventory/suppliers', supplierData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update supplier
  update: async (id, supplierData) => {
    try {
      const response = await api.put(`/inventory/suppliers/${id}`, supplierData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete supplier
  delete: async (id) => {
    try {
      const response = await api.delete(`/inventory/suppliers/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get supplier account statement
  getStatement: async (id) => {
    try {
      const response = await api.get(`/inventory/suppliers/${id}/statement`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Record supplier payment
  recordPayment: async (id, paymentData) => {
    try {
      const response = await api.post(`/inventory/suppliers/${id}/payments`, paymentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get supplier statistics
  getStatistics: async () => {
    try {
      const response = await api.get('/inventory/suppliers/statistics');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get suppliers by payment terms
  getByPaymentTerms: async (paymentTerms) => {
    try {
      const response = await api.get(`/inventory/suppliers?paymentTerms=${paymentTerms}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Search suppliers
  search: async (query) => {
    try {
      const response = await api.get(`/inventory/suppliers/search?q=${query}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default supplierService;
