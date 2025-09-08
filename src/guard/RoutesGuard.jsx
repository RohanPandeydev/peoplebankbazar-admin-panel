import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useCustomContext from "../contexts/Context";
const RequireAuth = ({ children }) => {
    const location = useLocation();
    const { token } = useCustomContext();
    if (!!!token) {
        return <Navigate to="/login" state={{ path: location.pathname }} />;
    }
    return children;
}
export const NonAuth = ({ children }) => {
    const { token } = useCustomContext();
    if (!!token) {
        return <Navigate to="/" />;
    }
    return children;
}





export default RequireAuth;