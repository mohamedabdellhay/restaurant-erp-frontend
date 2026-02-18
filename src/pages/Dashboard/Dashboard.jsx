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
import { useAuth } from "@hooks/useAuth";
import { useRestaurant } from "@hooks/useRestaurant";
import DashboardOverview from "@components/dashboard/DashboardOverview";
import RevenueAnalytics from "@components/dashboard/RevenueAnalytics";
import TopSellingItems from "@components/dashboard/TopSellingItems";
import StaffPerformance from "@components/dashboard/StaffPerformance";
import CustomerAnalytics from "@components/dashboard/CustomerAnalytics";
import RealTimeMetrics from "@components/dashboard/RealTimeMetrics";
import InventoryAlerts from "@components/dashboard/InventoryAlerts";
import "./Dashboard.css";

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { getThemeColors } = useRestaurant();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState({});

  // Get theme colors
  const themeColors = getThemeColors();

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
    <div
      className="dashboard-page"
      style={{
        "--primary": themeColors.primary,
        "--primary-focus": themeColors.primaryFocus,
        "--primary-content": themeColors.primaryContent,
      }}
    >
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
    </div>
  );
};

export default Dashboard;
