import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null); // Use state for the socket
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = io(process.env.REACT_APP_BACKEND_URL, {
            withCredentials: true,
            transports: ["websocket", "polling"],
            autoConnect: true,
        });

        socketInstance.on("connect", () => {
            console.log("✅ Connected to socket");
            setIsConnected(true);
        });

        socketInstance.on("disconnect", () => {
            console.log("❌ Disconnected from socket");
            setIsConnected(false);
        });

        socketInstance.on("reconnect", () => {
            console.log("🔄 Reconnected!");
        });

        setSocket(socketInstance); // Set the socket instance to state

        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, []);

    return <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
    return useContext(SocketContext);
};
