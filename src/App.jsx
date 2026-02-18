import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import DynamicFavicon from "./components/DynamicFavicon";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Staff from "./pages/Staff";
import Suppliers from "./pages/Suppliers";
import Inventory from "./pages/Inventory";
import PaymentResult from "./pages/PaymentResult";
import DashboardLayout from "./layouts/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import Tables from "./pages/Tables";
import Reservations from "./pages/Reservations";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";
import Invoices from "./pages/Invoices";
import Dashboard from "./pages/Dashboard";
import Menu from "./pages/Menu";

function App() {
  return (
    <ThemeProvider>
      <DynamicFavicon />
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
                {/* Dashboard - Admin and Manager only */}
                <Route
                  path="/dashboard"
                  element={
                    <RoleProtectedRoute allowedRoles={["admin", "manager"]}>
                      <Dashboard />
                    </RoleProtectedRoute>
                  }
                />

                {/* Profile - Any logged-in staff */}
                <Route path="/profile" element={<Profile />} />

                {/* Orders - Any logged-in staff */}
                <Route path="/orders" element={<Orders />} />

                {/* Menu - Cashier, Waiter, Admin, Manager, Chef */}
                <Route
                  path="/menu"
                  element={
                    <RoleProtectedRoute
                      allowedRoles={[
                        "cashier",
                        "waiter",
                        "admin",
                        "manager",
                        "chef",
                      ]}
                    >
                      <Menu />
                    </RoleProtectedRoute>
                  }
                />

                {/* Tables - Cashier, Waiter, Admin, Manager */}
                <Route
                  path="/tables"
                  element={
                    <RoleProtectedRoute
                      allowedRoles={["cashier", "waiter", "admin", "manager"]}
                    >
                      <Tables />
                    </RoleProtectedRoute>
                  }
                />

                {/* Reservations - Admin and Manager only */}
                <Route
                  path="/reservations"
                  element={
                    <RoleProtectedRoute allowedRoles={["admin", "manager"]}>
                      <Reservations />
                    </RoleProtectedRoute>
                  }
                />

                {/* Staff - Admin and Manager for viewing, Admin only for management */}
                <Route
                  path="/staff"
                  element={
                    <RoleProtectedRoute allowedRoles={["admin", "manager"]}>
                      <Staff />
                    </RoleProtectedRoute>
                  }
                />

                {/* Suppliers - Any logged-in staff */}
                <Route path="/suppliers" element={<Suppliers />} />

                {/* Inventory - Any logged-in staff */}
                <Route path="/inventory" element={<Inventory />} />

                {/* Invoices - Any logged-in staff */}
                <Route path="/invoices" element={<Invoices />} />

                {/* Reports - Admin and Manager only */}
                <Route
                  path="/reports"
                  element={
                    <RoleProtectedRoute allowedRoles={["admin", "manager"]}>
                      <div>Reports Page (Implementation pending)</div>
                    </RoleProtectedRoute>
                  }
                />

                {/* Settings - Admin only */}
                <Route
                  path="/settings"
                  element={
                    <RoleProtectedRoute allowedRoles={["admin"]}>
                      <Settings />
                    </RoleProtectedRoute>
                  }
                />
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
