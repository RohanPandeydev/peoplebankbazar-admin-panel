import axios from "axios";
import config from "../../config";
import HttpHeaders from "../helper/httphelper/HttpHeaders";

const AlsoBuyServices = {
  // Public APIs
  getAlsoBuyItemsByBank: async (bank_id) => {
    const response = await axios.get(`${config.apiUrl}/api/also-buy/bank/${bank_id}`);
    return response.data;
  },

  // Track clicks (protected)
  trackAlsoBuyItemClick: async (id) => {
    const response = await axios.post(
      `${config.apiUrl}/api/also-buy/${id}/track-click`,
      {},
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },

  // Admin APIs
  getAllAlsoBuyItemsAdmin: async (params = "") => {
    const response = await axios.get(
      `${config.apiUrl}/api/also-buy/admin/items${params}`,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },

  getAlsoBuyItemById: async (id) => {
    const response = await axios.get(
      `${config.apiUrl}/api/also-buy/admin/items/${id}`,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },

  createAlsoBuyItem: async (formData) => {
    const response = await axios.post(
      `${config.apiUrl}/api/also-buy/admin/items`,
      formData,
      HttpHeaders.getAuthHeaderMultiPart()
    );
    return response.data;
  },

  updateAlsoBuyItem: async (id, formData) => {
    const response = await axios.put(
      `${config.apiUrl}/api/also-buy/admin/items/${id}`,
      formData,
      HttpHeaders.getAuthHeaderMultiPart()
    );
    return response.data;
  },

  deleteAlsoBuyItem: async (id) => {
    const response = await axios.delete(
      `${config.apiUrl}/api/also-buy/admin/items/${id}`,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },

  toggleAlsoBuyItemStatus: async ({ id, ...statusData }) => {
    // statusData can contain is_active and/or is_featured
    const response = await axios.patch(
      `${config.apiUrl}/api/also-buy/admin/items/${id}/toggle-status`,
      statusData,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },
};

export default AlsoBuyServices;
