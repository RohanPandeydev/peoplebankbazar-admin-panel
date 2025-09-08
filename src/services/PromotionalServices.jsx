import axios from "axios";
import config from "../../config";
import HttpHeaders from "../helper/httphelper/HttpHeaders";

const PromotionalServices = {
  // Public APIs
  getAllPromotionalCards: async (params = "") => {
    const response = await axios.get(`${config.apiUrl}/api/promotional/promotional-cards${params}`);
    return response.data;
  },

  getFeaturedPromotionalCards: async (params = "") => {
    const response = await axios.get(`${config.apiUrl}/api/promotional/featured${params}`);
    return response.data;
  },

  getPromotionalCardsByType: async (card_type) => {
    const response = await axios.get(`${config.apiUrl}/api/promotional/type/${card_type}`);
    return response.data;
  },

  trackPromotionalCardClick: async (card_id) => {
    const response = await axios.post(`${config.apiUrl}/api/promotional/${card_id}/track-click`);
    return response.data;
  },

  trackPromotionalCardConversion: async (card_id, data) => {
    const response = await axios.post(
      `${config.apiUrl}/api/promotional/${card_id}/track-conversion`,
      data,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },

  getPromotionalCardAnalytics: async (card_id) => {
    const response = await axios.get(
      `${config.apiUrl}/api/promotional/${card_id}/analytics`,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },

  // Admin APIs
  getAllPromotionalCardsAdmin: async (params = "") => {
    const response = await axios.get(
      `${config.apiUrl}/api/promotional/admin/promotional-cards${params}`,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },

  getPromotionalCardById: async (id) => {
    const response = await axios.get(
      `${config.apiUrl}/api/promotional/admin/promotional-cards/${id}`,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },

  createPromotionalCard: async (formData) => {
    const response = await axios.post(
      `${config.apiUrl}/api/promotional/admin/promotional-cards`,
      formData,
      HttpHeaders.getAuthHeaderMultiPart()
    );
    return response.data;
  },

  updatePromotionalCard: async (id, formData) => {
    const response = await axios.put(
      `${config.apiUrl}/api/promotional/admin/promotional-cards/${id}`,
      formData,
      HttpHeaders.getAuthHeaderMultiPart()
    );
    return response.data;
  },

  togglePromotionalCardStatus: async ({ id, ...statusData }) => {
    const response = await axios.patch(
      `${config.apiUrl}/api/promotional/admin/promotional-cards/${id}/toggle-status`,
      statusData,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },

  deletePromotionalCard: async ({ id }) => {
    const response = await axios.delete(
      `${config.apiUrl}/api/promotional/admin/promotional-cards/${id}`,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },
};

export default PromotionalServices;
