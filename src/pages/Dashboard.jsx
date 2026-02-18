import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  Users,
  Calendar,
  Package,
  ChefHat,
  Settings,
  TrendingUp,
  Activity,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { RoleBasedUI } from "../utils/roleUtils";
import DashboardOverview from "../components/dashboard/DashboardOverview";
import RevenueAnalytics from "../components/dashboard/RevenueAnalytics";
import TopSellingItems from "../components/dashboard/TopSellingItems";
import StaffPerformance from "../components/dashboard/StaffPerformance";
import CustomerAnalytics from "../components/dashboard/CustomerAnalytics";
import RealTimeMetrics from "../components/dashboard/RealTimeMetrics";
import InventoryAlerts from "../components/dashboard/InventoryAlerts";

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({});

  const allTabs = [
    {
      id: "overview",
      label: t("dashboard.overview"),
      icon: <BarChart3 size={18} />,
      requiredRoles: ["admin", "manager"],
    },
    {
      id: "realtime",
      label: t("dashboard.real_time"),
      icon: <Activity size={18} />,
      requiredRoles: ["admin", "manager"],
    },
    {
      id: "revenue",
      label: t("dashboard.revenue"),
      icon: <TrendingUp size={18} />,
      requiredRoles: ["admin", "manager"],
    },
    {
      id: "items",
      label: t("dashboard.top_items"),
      icon: <Package size={18} />,
      requiredRoles: ["admin", "manager"],
    },
    {
      id: "staff",
      label: t("dashboard.staff"),
      icon: <ChefHat size={18} />,
      requiredRoles: ["admin", "manager"],
    },
    {
      id: "customers",
      label: t("dashboard.customers"),
      icon: <Users size={18} />,
      requiredRoles: ["admin", "manager"],
    },
    {
      id: "inventory",
      label: t("dashboard.inventory_alerts"),
      icon: <Package size={18} />,
      requiredRoles: ["admin", "manager"],
    },
  ];

  // Filter tabs based on user role
  const tabs = allTabs.filter((tab) => {
    if (!user) return false;
    return tab.requiredRoles.includes(user.role);
  });

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardOverview dateRange={dateRange} />;
      case "realtime":
        return <RealTimeMetrics />;
      case "revenue":
        return <RevenueAnalytics dateRange={dateRange} />;
      case "items":
        return <TopSellingItems dateRange={dateRange} />;
      case "staff":
        return <StaffPerformance dateRange={dateRange} />;
      case "customers":
        return <CustomerAnalytics dateRange={dateRange} />;
      case "inventory":
        return <InventoryAlerts />;
      default:
        return <DashboardOverview dateRange={dateRange} />;
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="page-title">{t("dashboard.title")}</h1>
        <p className="page-subtitle">{t("dashboard.subtitle")}</p>
      </div>

      {/* Date Range Filter */}
      <div className="dashboard-filter">
        <div className="filter-content">
          <div className="filter-group">
            <label className="filter-label">{t("dashboard.date_range")}:</label>
            <input
              type="date"
              value={dateRange.from || ""}
              onChange={(e) =>
                handleDateRangeChange({ ...dateRange, from: e.target.value })
              }
              className="date-input"
            />
            <span className="filter-separator">to</span>
            <input
              type="date"
              value={dateRange.to || ""}
              onChange={(e) =>
                handleDateRangeChange({ ...dateRange, to: e.target.value })
              }
              className="date-input"
            />
          </div>
          <div className="filter-actions">
            <button
              onClick={() => handleDateRangeChange({})}
              className="btn btn-secondary"
            >
              {t("dashboard.clear_dates")}
            </button>
            <button
              onClick={() =>
                handleDateRangeChange({
                  from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                  to: new Date().toISOString().split("T")[0],
                })
              }
              className="btn btn-outline"
            >
              {t("dashboard.last_7_days")}
            </button>
            <button
              onClick={() =>
                handleDateRangeChange({
                  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                  to: new Date().toISOString().split("T")[0],
                })
              }
              className="btn btn-outline"
            >
              {t("dashboard.last_30_days")}
            </button>
            <button
              onClick={() =>
                handleDateRangeChange({
                  from: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    1,
                  )
                    .toISOString()
                    .split("T")[0],
                  to: new Date().toISOString().split("T")[0],
                })
              }
              className="btn btn-outline"
            >
              {t("dashboard.this_month")}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <nav className="tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="dashboard-content">{renderTabContent()}</div>

      <style>{`
        .dashboard-page {
          padding: 0;
          background: var(--bg-base);
          min-height: 100vh;
        }

        .dashboard-header {
          padding: 2rem 2rem 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .page-subtitle {
          color: var(--text-secondary);
          margin: 0;
          font-size: 1rem;
        }

        .dashboard-filter {
          padding: 1.5rem 2rem;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
        }

        .filter-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .date-input {
          padding: 0.5rem 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--input-bg);
          color: var(--text-primary);
          font-size: 0.875rem;
          outline: none;
        }

        .date-input:focus {
          border-color: var(--primary);
        }

        .filter-separator {
          color: var(--text-muted);
          font-size: 0.875rem;
        }

        .filter-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
          outline: none;
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border-color: var(--border-color);
        }

        .btn-secondary:hover {
          background: var(--bg-tertiary);
        }

        .btn-outline {
          background: transparent;
          color: var(--text-secondary);
          border-color: var(--border-color);
        }

        .btn-outline:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .dashboard-tabs {
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-color);
        }

        .tabs-nav {
          display: flex;
          padding: 0 2rem;
          overflow-x: auto;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .tab-btn:hover {
          color: var(--text-primary);
          background: var(--bg-secondary);
        }

        .tab-btn.active {
          color: var(--primary);
          border-bottom-color: var(--primary);
          font-weight: 600;
        }

        .tab-icon {
          font-size: 1rem;
        }

        .tab-label {
          font-size: 0.875rem;
        }

        .dashboard-content {
          padding: 2rem;
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            padding: 1.5rem 1rem 1rem;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .dashboard-filter {
            padding: 1rem;
          }

          .filter-content {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .filter-actions {
            justify-content: center;
          }

          .tabs-nav {
            padding: 0 1rem;
          }

          .tab-btn {
            padding: 0.75rem 1rem;
            font-size: 0.8rem;
          }

          .dashboard-content {
            padding: 1rem;
          }
        }

        [dir='rtl'] .filter-group {
          direction: rtl;
        }

        [dir='rtl'] .filter-actions {
          direction: rtl;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
