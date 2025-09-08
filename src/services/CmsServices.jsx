import axios from "axios";
import config from "../../config";
import HttpHeaders from "../helper/httphelper/HttpHeaders";

const CmsServices = {
  // ---------------- Public APIs ----------------

  // Get CMS content for a specific page
  getPageContent: async (pageType, pageIdentifier = "") => {
    const response = await axios.get(
      `${config.apiUrl}/api/cms/page/${pageType}/${pageIdentifier}`
    );
    return response.data;
  },

  // Get CMS content by section
  getContentBySection: async (pageType, sectionName) => {
    const response = await axios.get(
      `${config.apiUrl}/api/cms/section/${pageType}/${sectionName}`
    );
    return response.data;
  },

  // Get hot offers
  getHotOffers: async () => {
    const response = await axios.get(`${config.apiUrl}/api/cms/hot-offers`);
    return response.data;
  },

  // Get homepage content
  getHomepageContent: async () => {
    const response = await axios.get(`${config.apiUrl}/api/cms/homepage`);
    return response.data;
  },

  // Get category page content
  getCategoryPageContent: async (categorySlug) => {
    const response = await axios.get(
      `${config.apiUrl}/api/cms/category/${categorySlug}`
    );
    return response.data;
  },

  // Get bank detail page content
  getBankDetailPageContent: async (bankSlug) => {
    const response = await axios.get(
      `${config.apiUrl}/api/cms/bank/${bankSlug}`
    );
    return response.data;
  },

  // Track click on CMS content (public - requires content_id)
  trackContentClick: async (contentId) => {
    const response = await axios.post(
      `${config.apiUrl}/api/cms/${contentId}/track-click`
    );
    return response.data;
  },

  // Get analytics for a CMS content (protected)
  getContentAnalytics: async (contentId) => {
    const response = await axios.get(
      `${config.apiUrl}/api/cms/${contentId}/analytics`,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },

  // ---------------- Admin APIs ----------------

  // Create new CMS content
  createCmsContent: async (formData) => {
    const response = await axios.post(
      `${config.apiUrl}/api/cms/admin/content`,
      formData,
      HttpHeaders.getAuthHeaderMultiPart()
    );
    return response.data;
  },

  // Get all CMS content (admin)
  getAllCmsContentAdmin: async (params = "") => {
    const response = await axios.get(
      `${config.apiUrl}/api/cms/admin/content${params}`,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },

  // Get CMS content by ID
  getCmsContentById: async (id) => {
    const response = await axios.get(
      `${config.apiUrl}/api/cms/admin/content/${id}`,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },

  // Update CMS content
  updateCmsContent: async (id, formData) => {
    const response = await axios.put(
      `${config.apiUrl}/api/cms/admin/content/${id}`,
      formData,
      HttpHeaders.getAuthHeaderMultiPart()
    );
    return response.data;
  },

  // Delete CMS content
  deleteCmsContent: async ({ id }) => {
    const response = await axios.delete(
      `${config.apiUrl}/api/cms/admin/content/${id}`,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },

  // Toggle CMS content status
  toggleCmsContentStatus: async ({ id, ...statusData }) => {
    const response = await axios.patch(
      `${config.apiUrl}/api/cms/admin/content/${id}/toggle-status`,
      statusData,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },

  // Bulk update CMS content status
  bulkUpdateCmsContentStatus: async (payload) => {
    const response = await axios.patch(
      `${config.apiUrl}/api/cms/admin/content/bulk-update-status`,
      payload,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },

  // Get CMS sections by page type
  getCmsSections: async (pageType) => {
    const response = await axios.get(
      `${config.apiUrl}/api/cms/admin/sections/${pageType}`,
      HttpHeaders.getAuthHeader()
    );
    return response.data;
  },
};

export default CmsServices;
