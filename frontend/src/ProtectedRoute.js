import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("user"); // Check if user is stored (can also use a state or context)

  return isAuthenticated ? children : <Navigate to="/login" />; // Redirect to login if not authenticated
};

export default ProtectedRoute;
