import axios from 'axios';
import config from '../../config';
import HttpHeaders from '../helper/httphelper/HttpHeaders';

const CategoryServices = {
  // Get categories list (admin view)
  categoryList: async (params = '') => {
    const response = await axios.get(`${config.apiUrl}/api/category/admin/categories${params}`,HttpHeaders.getAuthHeader());
    return response.data;
  },

  // Get single category by ID
  getCategoryById: async (id) => {
    const response = await axios.get(`${config.apiUrl}/api/category/${id}`,HttpHeaders.getAuthHeader());
    return response.data;
  },

  // Get single category by slug
  getCategoryBySlug: async (slug) => {
    const response = await axios.get(`${config.apiUrl}/api/category/slug/${slug}`,HttpHeaders.getAuthHeader());
    return response.data;
  },

  // Create new category
  createCategory: async (formData) => {
    const response = await axios.post(`${config.apiUrl}/api/category/admin/categories`, formData,HttpHeaders.getAuthHeaderMultiPart());
    return response.data;
  },

  // Update category
  updateCategory: async (id, formData) => {
    const response = await axios.put(`${config.apiUrl}/api/category/admin/categories/${id}`, formData, HttpHeaders.getAuthHeaderMultiPart())
    
    return response.data;
  },

  // Toggle category status (is_active, is_featured, is_hot_offer)
  toggleCategoryStatus: async ({ id, ...statusData }) => {
    const response = await axios.patch(`${config.apiUrl}/api/category/admin/categories/${id}/toggle-status`, statusData,HttpHeaders.getAuthHeader());
    return response.data;
  },

  // Delete category
  deleteCategory: async ({ id }) => {
    const response = await axios.delete(`${config.apiUrl}/api/category/admin/categories/${id}`,HttpHeaders.getAuthHeader());
    return response.data;
  },

  // Get featured categories
  getFeaturedCategories: async (params = '') => {
    const response = await axios.get(`${config.apiUrl}/api/category/featured${params}`,HttpHeaders.getAuthHeader());
    return response.data;
  },

  // Get category tree
  getCategoryTree: async (params = '') => {
    const response = await axios.get(`${config.apiUrl}/api/category/tree${params}`);
    return response.data;
  },

  // Get loan categories
  getLoanCategories: async () => {
    const response = await axios.get(`${config.apiUrl}/api/category/loans`);
    return response.data;
  },
};

export default CategoryServices;