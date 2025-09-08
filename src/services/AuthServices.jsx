import axios from "axios";
import config from "../../config";
import HttpHeaders from "../helper/httphelper/HttpHeaders";

const AuthServices = {};

AuthServices.login = (formdata) => {
    return axios.post(`${config.apiUrl}/api/auth/login`, formdata);
};
AuthServices.logout = (formdata) => {
    return axios.post(`${config.apiUrl}/api/auth/logout`, formdata, HttpHeaders.getAuthHeader());
};

export default AuthServices;
