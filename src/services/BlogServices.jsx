import axios from "axios";
import config from "../../config";
import HttpHeaders from "../helper/httphelper/HttpHeaders";

const BlogServices = {};

BlogServices.blogList = (query) => {
    return axios.get(`${config.apiUrl}/api/blogs${query}`, HttpHeaders.getAuthHeader());
};
BlogServices.blogBySlug = (params) => {
    if (!params?.slug) {
        return []
    }
    return axios.get(`${config.apiUrl}/api/blog/${params.slug}`, HttpHeaders.getAuthHeader());
};
BlogServices.addBlog = (formdata) => {
    return axios.post(`${config.apiUrl}/api/admin/blog`, formdata, HttpHeaders.getAuthHeader());
};
BlogServices.updateBlogBySlug = (formdata) => {
    return axios.put(`${config.apiUrl}/api/admin/blog/${formdata?.get("slugId")}`, formdata, HttpHeaders.getAuthHeader());
};
BlogServices.updateBlogStatusBySlug = (formdata) => {
    return axios.put(`${config.apiUrl}/api/admin/blog/${formdata.slugId}`, formdata, HttpHeaders.getAuthHeader());
};
BlogServices.softDeleteBlog = (formdata) => {
    return axios.delete(`${config.apiUrl}/api/admin/blog/${formdata?.id}`, HttpHeaders.getAuthHeader());
};

export default BlogServices;
