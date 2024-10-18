import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/user/check-auth", { withCredentials: true });
        setIsAuthenticated(true);
        console.log("DEV: Authenticated");
      } catch (error) {
        setIsAuthenticated(false); // Not authenticated, redirect to login
        console.log("DEV: NOT authenticated");
      }
    };

    checkAuth();
  }, []);

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
