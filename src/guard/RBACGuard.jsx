// src/components/ProtectedRoute.js
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSocket } from "../utils/socket";
import useCustomContext from "../contexts/Context";

const ProtectedRoute = ({ children, moduleName, action = "view" }) => {
    const { token } = useCustomContext();
    const { emit, on, off, isConnected } = useSocket(token);
    const location = useLocation();
    const [hasPermission, setHasPermission] = useState(null); // null = loading, false = denied, true = granted

    useEffect(() => {
        if (!isConnected) return;


        emit("rbac", {
            moduleName: capitalizeFirst(moduleName),
            action: action, // or decide action based on route if needed
        });

        on("rbac-response", (res) => {
            setHasPermission(res?.status);
        });

        return () => {
            off("rbac-response");
        };
    }, [location.pathname, isConnected]);

    if (hasPermission === null) {
        return <p>Checking permission...</p>;
    }

    if (!hasPermission) {
        return <p style={{ color: "red" }}>Access Denied</p>;
    }

    return children;
};
export const ProtectedMethod = ({ children, moduleName, action = "view" }) => {
    const { token } = useCustomContext();
    const { emit, on, off, isConnected } = useSocket(token);
    const location = useLocation();
    const [hasPermission, setHasPermission] = useState(null); // null = loading, false = denied, true = granted

    useEffect(() => {
        if (!isConnected) return;


        emit("rbac", {
            moduleName: capitalizeFirst(moduleName),
            action: action, // or decide action based on route if needed
        });

        on("rbac-response", (res) => {
            setHasPermission(res?.status);
        });

        return () => {
            off("rbac-response");
        };
    }, [location.pathname, isConnected]);

    if (hasPermission === null) {
        return <p>Checking permission...</p>;
    }

    if (!hasPermission) {
        return false;
    }

    return children;
};

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default ProtectedRoute;


