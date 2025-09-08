// src/hooks/useSocket.js
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import config from "../../config";

const SOCKET_URL = config.apiUrl; // Or your server URL

export const useSocket = (token) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!token) return;

        const socket = io(SOCKET_URL, {
            transports: ["websocket"],
            auth: {
                token,
            },
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Socket connected:", socket.id);
            setIsConnected(true);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
            setIsConnected(false);
        });

        // Optional: listen for confirmation from server
        socket.on("connected", (data) => {
            console.log("Server confirmation:", data);
        });

        return () => {
            socket.disconnect();
        };
    }, [token]);

    const emit = (event, payload) => {
        if (socketRef.current) {
            socketRef.current.emit(event, payload);
        }
    };

    const on = (event, callback) => {
        if (socketRef.current) {
            socketRef.current.on(event, callback);
        }
    };

    const off = (event) => {
        if (socketRef.current) {
            socketRef.current.off(event);
        }
    };

    return {
        socket: socketRef.current,
        emit,
        on,
        off,
        isConnected,
    };
};
