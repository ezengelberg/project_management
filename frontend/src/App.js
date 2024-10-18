import "./App.css";

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

import Login from "./components/Login/Login";
import WrongPath from "./components/WrongPath/WrongPath";
import Dashboard from "./components/Dashboard/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Route */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown routes */}
        <Route path="*" element={<WrongPath />} />
      </Routes>
    </Router>
  );
}

export default App;
