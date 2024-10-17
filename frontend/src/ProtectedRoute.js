import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  return isAuthenticated ? children : <Navigate to="/login" />; // Redirect to login if not authenticated
};

export default ProtectedRoute;
