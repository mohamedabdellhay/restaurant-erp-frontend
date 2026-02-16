import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Staff from "./pages/Staff";
import Suppliers from "./pages/Suppliers";
import Inventory from "./pages/Inventory";
import PaymentResult from "./pages/PaymentResult";
import DashboardLayout from "./layouts/DashboardLayout";
import {
  simulateRestaurantLogin,
  testThemes,
  applyTestTheme,
} from "./utils/demoTheme";

import { useTranslation } from "react-i18next";
import LandingPage from "./pages/LandingPage";
import Tables from "./pages/Tables";
import Reservations from "./pages/Reservations";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";

import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/payment/*" element={<PaymentResult />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route
                  path="/menu"
                  element={<div>Menu Page (Implementation pending)</div>}
                />
                <Route path="/tables" element={<Tables />} />
                <Route path="/reservations" element={<Reservations />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/suppliers" element={<Suppliers />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route
                  path="/invoices"
                  element={<div>Invoices Page (Implementation pending)</div>}
                />
                <Route
                  path="/reports"
                  element={<div>Reports Page (Implementation pending)</div>}
                />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
