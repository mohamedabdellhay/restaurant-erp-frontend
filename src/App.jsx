import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Profile from './pages/Profile';
import LandingPage from './pages/LandingPage';
import PaymentResult from './pages/PaymentResult';
import DashboardLayout from './layouts/DashboardLayout';

import { useTranslation } from 'react-i18next';

// Placeholder components for other pages
const Dashboard = () => {
  const { t } = useTranslation();
  return (
    <div className="dashboard-content">
      <h1>{t('dashboard.welcome')}</h1>
      <p>{t('dashboard.welcome_subtitle')}</p>
      <div className="stats-grid">
        <div className="card"><h3>{t('dashboard.total_sales')}</h3><p>$12,450</p></div>
        <div className="card"><h3>{t('dashboard.active_orders')}</h3><p>8</p></div>
        <div className="card"><h3>{t('dashboard.tables_booked')}</h3><p>12/20</p></div>
        <div className="card"><h3>{t('dashboard.staff_on_duty')}</h3><p>6</p></div>
      </div>
      <style>{`
        .dashboard-content h1 { margin-bottom: 1rem; }
        .stats-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); 
          gap: 1.5rem; 
          margin-top: 2rem; 
        }
        .stats-grid .card h3 { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
        .stats-grid .card p { font-size: 1.5rem; font-weight: 700; color: var(--primary); }
        
        [dir='rtl'] .dashboard-content h1,
        [dir='rtl'] .dashboard-content p,
        [dir='rtl'] .stats-grid .card {
          text-align: right;
        }
      `}</style>
    </div>
  );
};

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
                <Route path="/orders" element={<div>Orders Page (Implementation pending)</div>} />
                <Route path="/menu" element={<div>Menu Page (Implementation pending)</div>} />
                <Route path="/tables" element={<div>Tables Page (Implementation pending)</div>} />
                <Route path="/staff" element={<div>Staff Page (Implementation pending)</div>} />
                <Route path="/inventory" element={<div>Inventory Page (Implementation pending)</div>} />
                <Route path="/invoices" element={<div>Invoices Page (Implementation pending)</div>} />
                <Route path="/reports" element={<div>Reports Page (Implementation pending)</div>} />
                <Route path="/settings" element={<div>Settings Page (Implementation pending)</div>} />
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
