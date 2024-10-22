import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import axios from "axios";
import { LoadingOutlined } from "@ant-design/icons";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/check-auth", { withCredentials: true });
        if (response.data.authenticated) {
          setIsAuthenticated(true);
          console.log("DEV: Authenticated");
        } else {
          setIsAuthenticated(false);
          console.log("DEV: NOT authenticated, verification failed");
        }
      } catch (error) {
        setIsAuthenticated(false);
        console.log("DEV: NOT authenticated");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div style={{ position: "relative", height: "100vh" }}>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            fontSize: "50px",
            transform: "translate(-50%, -50%)",
          }}>
          <LoadingOutlined />
        </div>
      </div>
    );
  }

  // After loading, either render children or redirect
  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

export default ProtectedRoute;
