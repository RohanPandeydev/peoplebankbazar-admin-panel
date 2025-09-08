import axios from 'axios';
import config from '../../config';
import HttpHeaders from '../helper/httphelper/HttpHeaders';

const BankServices = {
    // ✅ Public APIs

    // Get all banks
    getBanks: async (params = '') => {
        const response = await axios.get(`${config.apiUrl}/api/bank/banks${params}`);
        return response.data;
    },

    // Get featured banks
    getFeaturedBanks: async (params = '') => {
        const response = await axios.get(`${config.apiUrl}/api/bank/featured${params}`);
        return response.data;
    },

    // Get banks by category
    getBanksByCategory: async (categoryId, params = '') => {
        const response = await axios.get(`${config.apiUrl}/api/bank/category/${categoryId}${params}`);
        return response.data;
    },

    // Get single bank by ID
    getBankById: async (id) => {
        const response = await axios.get(`${config.apiUrl}/api/bank/${id}`);
        return response.data;
    },

    // Get also-buy items for a bank
    getAlsoBuyItems: async (bankId) => {
        const response = await axios.get(`${config.apiUrl}/api/bank/${bankId}/also-buy`);
        return response.data;
    },

    // Track website visit (requires user token)
    trackBankVisit: async (bankId) => {
        const response = await axios.post(
            `${config.apiUrl}/api/bank/${bankId}/track-visit`,
            {},
            HttpHeaders.getAuthHeader()
        );
        return response.data;
    },

    // ✅ Admin APIs

    // Create new bank
    createBank: async (formData) => {
        const response = await axios.post(
            `${config.apiUrl}/api/bank/admin/banks`,
            formData,
            HttpHeaders.getAuthHeaderMultiPart()
        );
        return response.data;
    },

    // Get all banks (admin view)
    getAllBanksAdmin: async (params = '') => {
        const response = await axios.get(
            `${config.apiUrl}/api/bank/admin/banks${params}`,
            HttpHeaders.getAuthHeader()
        );
        return response.data;
    },

    // Update bank
    updateBank: async (id, formData) => {
        const response = await axios.put(
            `${config.apiUrl}/api/bank/admin/banks/${id}`,
            formData,
            HttpHeaders.getAuthHeaderMultiPart()
        );
        return response.data;
    },

    // Delete bank
    deleteBank: async (id) => {
        const response = await axios.delete(
            `${config.apiUrl}/api/bank/admin/banks/${id}`,
            HttpHeaders.getAuthHeader()
        );
        return response.data;
    },

    // Toggle bank status (is_active, is_featured, is_hot_offer)
    toggleBankStatus: async ({ id, ...statusData }) => {
        const response = await axios.patch(
            `${config.apiUrl}/api/bank/admin/banks/${id}/toggle-status`,
            statusData,
            HttpHeaders.getAuthHeader()
        );
        return response.data;
    },

    // Associate bank with categories
    associateBankWithCategories: async (id, categories) => {
        const response = await axios.post(
            `${config.apiUrl}/api/bank/admin/banks/${id}/associate-categories`,
            { categories },
            HttpHeaders.getAuthHeader()
        );
        return response.data;
    },
};

export default BankServices;
