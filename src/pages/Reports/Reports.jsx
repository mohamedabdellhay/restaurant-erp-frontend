import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./Reports.css";

const Reports = () => {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(true);

  // Calculate initial date range safely
  const initialDateRange = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return {
      from: thirtyDaysAgo.toISOString().split("T")[0],
      to: now.toISOString().split("T")[0],
    };
  }, []);

  const [dateRange, setDateRange] = useState(initialDateRange);
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState({
    overview: null,
    revenue: null,
    topItems: null,
    staffPerformance: null,
    customers: null,
    realtime: null,
    inventoryAlerts: null,
  });
  const [reportData, setReportData] = useState({
    sales: null,
    inventory: null,
    orders: null,
    reservations: null,
  });

  // Fetch dashboard overview data
  const fetchOverview = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/dashboard/overview?from=${dateRange.from}&to=${dateRange.to}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Accept-Language": i18n.language,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setDashboardData((prev) => ({ ...prev, overview: data.data }));
      }
    } catch (error) {
      console.error("Error fetching overview:", error);
    }
  }, [dateRange.from, dateRange.to, i18n.language]);

  // Fetch revenue analytics
  const fetchRevenue = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/dashboard/revenue?from=${dateRange.from}&to=${dateRange.to}&groupBy=day`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Accept-Language": i18n.language,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setDashboardData((prev) => ({ ...prev, revenue: data.data }));
      }
    } catch (error) {
      console.error("Error fetching revenue:", error);
    }
  }, [dateRange.from, dateRange.to, i18n.language]);

  // Fetch top selling items
  const fetchTopItems = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/dashboard/top-items?limit=10&from=${dateRange.from}&to=${dateRange.to}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Accept-Language": i18n.language,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setDashboardData((prev) => ({ ...prev, topItems: data.data }));
      }
    } catch (error) {
      console.error("Error fetching top items:", error);
    }
  }, [dateRange.from, dateRange.to, i18n.language]);

  // Fetch staff performance
  const fetchStaffPerformance = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/dashboard/staff-performance?from=${dateRange.from}&to=${dateRange.to}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Accept-Language": i18n.language,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setDashboardData((prev) => ({ ...prev, staffPerformance: data.data }));
      }
    } catch (error) {
      console.error("Error fetching staff performance:", error);
    }
  }, [dateRange.from, dateRange.to, i18n.language]);

  // Fetch customer insights
  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/dashboard/customers?from=${dateRange.from}&to=${dateRange.to}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Accept-Language": i18n.language,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setDashboardData((prev) => ({ ...prev, customers: data.data }));
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }, [dateRange.from, dateRange.to, i18n.language]);

  // Fetch real-time metrics
  const fetchRealtime = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/realtime", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Accept-Language": i18n.language,
        },
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData((prev) => ({ ...prev, realtime: data.data }));
      }
    } catch (error) {
      console.error("Error fetching realtime data:", error);
    }
  }, [i18n.language]);

  // Fetch inventory alerts
  const fetchInventoryAlerts = useCallback(async () => {
    try {
      const response = await fetch("/api/dashboard/inventory-alerts", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Accept-Language": i18n.language,
        },
      });
      const data = await response.json();
      if (data.success) {
        setDashboardData((prev) => ({ ...prev, inventoryAlerts: data.data }));
      }
    } catch (error) {
      console.error("Error fetching inventory alerts:", error);
    }
  }, [i18n.language]);

  // Fetch sales report
  const fetchSalesReport = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/reports/sales?from=${dateRange.from}&to=${dateRange.to}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Accept-Language": i18n.language,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setReportData((prev) => ({ ...prev, sales: data.data }));
      }
    } catch (error) {
      console.error("Error fetching sales report:", error);
    }
  }, [dateRange.from, dateRange.to, i18n.language]);

  // Fetch inventory report
  const fetchInventoryReport = useCallback(async () => {
    try {
      const response = await fetch("/api/reports/inventory", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Accept-Language": i18n.language,
        },
      });
      const data = await response.json();
      if (data.success) {
        setReportData((prev) => ({ ...prev, inventory: data.data }));
      }
    } catch (error) {
      console.error("Error fetching inventory report:", error);
    }
  }, [i18n.language]);

  // Fetch orders report
  const fetchOrdersReport = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/reports/orders?from=${dateRange.from}&to=${dateRange.to}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Accept-Language": i18n.language,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setReportData((prev) => ({ ...prev, orders: data.data }));
      }
    } catch (error) {
      console.error("Error fetching orders report:", error);
    }
  }, [dateRange.from, dateRange.to, i18n.language]);

  // Fetch reservations report
  const fetchReservationsReport = useCallback(async () => {
    try {
      const response = await fetch("/api/reports/reservations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Accept-Language": i18n.language,
        },
      });
      const data = await response.json();
      if (data.success) {
        setReportData((prev) => ({ ...prev, reservations: data.data }));
      }
    } catch (error) {
      console.error("Error fetching reservations report:", error);
    }
  }, [i18n.language]);

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      if (activeTab === "overview") {
        await Promise.all([
          fetchOverview(),
          fetchRevenue(),
          fetchTopItems(),
          fetchStaffPerformance(),
          fetchCustomers(),
        ]);
      } else if (activeTab === "realtime") {
        await fetchRealtime();
        await fetchInventoryAlerts();
      } else if (activeTab === "sales") {
        await fetchSalesReport();
      } else if (activeTab === "inventory") {
        await fetchInventoryReport();
      } else if (activeTab === "orders") {
        await fetchOrdersReport();
      } else if (activeTab === "reservations") {
        await fetchReservationsReport();
      }

      setLoading(false);
    };

    loadData();
  }, [
    activeTab,
    dateRange,
    i18n.language,
    fetchOverview,
    fetchRevenue,
    fetchTopItems,
    fetchStaffPerformance,
    fetchCustomers,
    fetchRealtime,
    fetchInventoryAlerts,
    fetchSalesReport,
    fetchInventoryReport,
    fetchOrdersReport,
    fetchReservationsReport,
  ]);

  // Auto-refresh real-time data every 30 seconds
  useEffect(() => {
    if (activeTab === "realtime") {
      const interval = setInterval(() => {
        fetchRealtime();
        fetchInventoryAlerts();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [activeTab, fetchRealtime, fetchInventoryAlerts]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  return (
    <div className="reports-container" data-direction={i18n.dir()}>
      <div className="reports-header">
        <h1>{t("reports.title") || "Reports & Analytics"}</h1>
        <p>
          {t("reports.subtitle") ||
            "Comprehensive insights and analytics for your restaurant"}
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="date-range-selector">
        <div className="date-inputs">
          <div className="date-input-group">
            <label>{t("reports.from_date") || "From Date"}</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
              className="date-input"
            />
          </div>
          <div className="date-input-group">
            <label>{t("reports.to_date") || "To Date"}</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
              className="date-input"
            />
          </div>
        </div>
        <div className="quick-dates">
          <button
            onClick={() =>
              setDateRange({
                from: new Date().toISOString().split("T")[0],
                to: new Date().toISOString().split("T")[0],
              })
            }
            className="quick-date-btn"
          >
            {t("reports.today") || "Today"}
          </button>
          <button
            onClick={() =>
              setDateRange({
                from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
                to: new Date().toISOString().split("T")[0],
              })
            }
            className="quick-date-btn"
          >
            {t("reports.last_7_days") || "Last 7 Days"}
          </button>
          <button
            onClick={() =>
              setDateRange({
                from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
                to: new Date().toISOString().split("T")[0],
              })
            }
            className="quick-date-btn"
          >
            {t("reports.last_30_days") || "Last 30 Days"}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          {t("reports.overview") || "Overview"}
        </button>
        <button
          className={`tab-btn ${activeTab === "realtime" ? "active" : ""}`}
          onClick={() => setActiveTab("realtime")}
        >
          {t("reports.realtime") || "Real-time"}
        </button>
        <button
          className={`tab-btn ${activeTab === "sales" ? "active" : ""}`}
          onClick={() => setActiveTab("sales")}
        >
          {t("reports.sales_performance") || "Sales Performance"}
        </button>
        <button
          className={`tab-btn ${activeTab === "inventory" ? "active" : ""}`}
          onClick={() => setActiveTab("inventory")}
        >
          {t("reports.inventory_summary") || "Inventory Summary"}
        </button>
        <button
          className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          {t("reports.order_analytics") || "Order Analytics"}
        </button>
        <button
          className={`tab-btn ${activeTab === "reservations" ? "active" : ""}`}
          onClick={() => setActiveTab("reservations")}
        >
          {t("reports.reservations_report") || "Reservations Report"}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>{t("common.loading") || "Loading..."}</p>
        </div>
      )}

      {/* Overview Tab */}
      {!loading && activeTab === "overview" && (
        <div className="tab-content">
          {/* Overview Metrics */}
          {dashboardData.overview && (
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>{t("reports.total_revenue") || "Total Revenue"}</h3>
                <p className="metric-value">
                  {formatCurrency(dashboardData.overview.totalRevenue)}
                </p>
              </div>
              <div className="metric-card">
                <h3>{t("reports.total_orders") || "Total Orders"}</h3>
                <p className="metric-value">
                  {dashboardData.overview.totalOrders?.toLocaleString() || 0}
                </p>
              </div>
              <div className="metric-card">
                <h3>
                  {t("reports.average_order_value") || "Average Order Value"}
                </h3>
                <p className="metric-value">
                  {formatCurrency(dashboardData.overview.averageOrderValue)}
                </p>
              </div>
              <div className="metric-card">
                <h3>{t("reports.total_customers") || "Total Customers"}</h3>
                <p className="metric-value">
                  {dashboardData.overview.totalCustomers?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          )}

          {/* Revenue Chart */}
          {dashboardData.revenue && (
            <div className="chart-container">
              <h3>{t("reports.revenue_trends") || "Revenue Trends"}</h3>
              <div className="chart-placeholder">
                <p>
                  {t("reports.chart_placeholder") ||
                    "Revenue chart will be displayed here"}
                </p>
                <div className="mock-chart">
                  {dashboardData.revenue.data
                    ?.slice(0, 7)
                    .map((item, index) => {
                      const height = [70, 85, 60, 90, 75, 80, 65][index] || 50;
                      return (
                        <div
                          key={index}
                          className="chart-bar"
                          style={{ height: `${height}%` }}
                        ></div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Top Items */}
          {dashboardData.topItems && (
            <div className="top-items-container">
              <h3>{t("reports.top_selling_items") || "Top Selling Items"}</h3>
              <div className="items-table">
                <table>
                  <thead>
                    <tr>
                      <th data-direction={i18n.dir()}>
                        {t("reports.item_name") || "Item Name"}
                      </th>
                      <th data-direction={i18n.dir()}>
                        {t("reports.quantity_sold") || "Quantity Sold"}
                      </th>
                      <th data-direction={i18n.dir()}>
                        {t("reports.revenue") || "Revenue"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.topItems.items
                      ?.slice(0, 5)
                      .map((item, index) => (
                        <tr key={index}>
                          <td data-direction={i18n.dir()}>{item.name}</td>
                          <td data-direction={i18n.dir()}>
                            {item.quantitySold?.toLocaleString() || 0}
                          </td>
                          <td data-direction={i18n.dir()}>
                            {formatCurrency(item.revenue)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Staff Performance */}
          {dashboardData.staffPerformance && (
            <div className="staff-performance-container">
              <h3>{t("reports.staff_performance") || "Staff Performance"}</h3>
              <div className="staff-grid">
                {dashboardData.staffPerformance.staff
                  ?.slice(0, 4)
                  .map((staff, index) => (
                    <div key={index} className="staff-card">
                      <h4>{staff.name}</h4>
                      <p>
                        {t("reports.orders") || "Orders"}:{" "}
                        {staff.orders?.toLocaleString() || 0}
                      </p>
                      <p>
                        {t("reports.revenue") || "Revenue"}:{" "}
                        {formatCurrency(staff.revenue)}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Real-time Tab */}
      {!loading && activeTab === "realtime" && (
        <div className="tab-content">
          {dashboardData.realtime && (
            <div className="realtime-metrics">
              <h2>{t("reports.live_metrics") || "Live Metrics"}</h2>
              <div className="metrics-grid">
                <div className="metric-card live">
                  <h3>{t("reports.today_revenue") || "Today's Revenue"}</h3>
                  <p className="metric-value">
                    {formatCurrency(dashboardData.realtime.todayRevenue)}
                  </p>
                  <span className="live-indicator">
                    {t("reports.live") || "LIVE"}
                  </span>
                </div>
                <div className="metric-card live">
                  <h3>{t("reports.today_orders") || "Today's Orders"}</h3>
                  <p className="metric-value">
                    {dashboardData.realtime.todayOrders?.toLocaleString() || 0}
                  </p>
                  <span className="live-indicator">
                    {t("reports.live") || "LIVE"}
                  </span>
                </div>
                <div className="metric-card live">
                  <h3>{t("reports.active_tables") || "Active Tables"}</h3>
                  <p className="metric-value">
                    {dashboardData.realtime.activeTables || 0}
                  </p>
                  <span className="live-indicator">
                    {t("reports.live") || "LIVE"}
                  </span>
                </div>
                <div className="metric-card live">
                  <h3>
                    {t("reports.pending_reservations") ||
                      "Pending Reservations"}
                  </h3>
                  <p className="metric-value">
                    {dashboardData.realtime.pendingReservations || 0}
                  </p>
                  <span className="live-indicator">
                    {t("reports.live") || "LIVE"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {dashboardData.inventoryAlerts && (
            <div className="inventory-alerts">
              <h3>{t("reports.inventory_alerts") || "Inventory Alerts"}</h3>
              <div className="alerts-summary">
                <div className="alert-card">
                  <h4>{t("reports.low_stock_items") || "Low Stock Items"}</h4>
                  <p className="alert-count">
                    {dashboardData.inventoryAlerts.lowStockItems || 0}
                  </p>
                </div>
                <div className="alert-card">
                  <h4>
                    {t("reports.total_inventory_value") ||
                      "Total Inventory Value"}
                  </h4>
                  <p className="alert-value">
                    {formatCurrency(dashboardData.inventoryAlerts.totalValue)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sales Performance Tab */}
      {!loading && activeTab === "sales" && reportData.sales && (
        <div className="tab-content">
          <h2>
            {t("reports.sales_performance_report") ||
              "Sales Performance Report"}
          </h2>
          <div className="report-summary">
            <div className="summary-grid">
              <div className="summary-item">
                <h4>{t("reports.gross_revenue") || "Gross Revenue"}</h4>
                <p>{formatCurrency(reportData.sales.grossRevenue)}</p>
              </div>
              <div className="summary-item">
                <h4>{t("reports.net_revenue") || "Net Revenue"}</h4>
                <p>{formatCurrency(reportData.sales.netRevenue)}</p>
              </div>
              <div className="summary-item">
                <h4>
                  {t("reports.total_transactions") || "Total Transactions"}
                </h4>
                <p>
                  {reportData.sales.totalTransactions?.toLocaleString() || 0}
                </p>
              </div>
              <div className="summary-item">
                <h4>
                  {t("reports.average_transaction") || "Average Transaction"}
                </h4>
                <p>{formatCurrency(reportData.sales.averageTransaction)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Summary Tab */}
      {!loading && activeTab === "inventory" && reportData.inventory && (
        <div className="tab-content">
          <h2>
            {t("reports.inventory_summary_report") ||
              "Inventory Summary Report"}
          </h2>
          <div className="inventory-summary">
            <div className="summary-grid">
              <div className="summary-item">
                <h4>{t("reports.total_items") || "Total Items"}</h4>
                <p>{reportData.inventory.totalItems?.toLocaleString() || 0}</p>
              </div>
              <div className="summary-item">
                <h4>{t("reports.total_value") || "Total Value"}</h4>
                <p>{formatCurrency(reportData.inventory.totalValue)}</p>
              </div>
              <div className="summary-item">
                <h4>{t("reports.low_stock_count") || "Low Stock Count"}</h4>
                <p>{reportData.inventory.lowStockCount || 0}</p>
              </div>
              <div className="summary-item">
                <h4>
                  {t("reports.out_of_stock_count") || "Out of Stock Count"}
                </h4>
                <p>{reportData.inventory.outOfStockCount || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Analytics Tab */}
      {!loading && activeTab === "orders" && reportData.orders && (
        <div className="tab-content">
          <h2>
            {t("reports.order_analytics_report") || "Order Analytics Report"}
          </h2>
          <div className="orders-summary">
            <div className="summary-grid">
              <div className="summary-item">
                <h4>{t("reports.total_orders") || "Total Orders"}</h4>
                <p>{reportData.orders.totalOrders?.toLocaleString() || 0}</p>
              </div>
              <div className="summary-item">
                <h4>{t("reports.completed_orders") || "Completed Orders"}</h4>
                <p>
                  {reportData.orders.completedOrders?.toLocaleString() || 0}
                </p>
              </div>
              <div className="summary-item">
                <h4>{t("reports.cancelled_orders") || "Cancelled Orders"}</h4>
                <p>
                  {reportData.orders.cancelledOrders?.toLocaleString() || 0}
                </p>
              </div>
              <div className="summary-item">
                <h4>{t("reports.completion_rate") || "Completion Rate"}</h4>
                <p>{reportData.orders.completionRate || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservations Report Tab */}
      {!loading && activeTab === "reservations" && reportData.reservations && (
        <div className="tab-content">
          <h2>
            {t("reports.reservations_summary_report") ||
              "Reservations Summary Report"}
          </h2>
          <div className="reservations-summary">
            <div className="summary-grid">
              <div className="summary-item">
                <h4>
                  {t("reports.total_reservations") || "Total Reservations"}
                </h4>
                <p>
                  {reportData.reservations.totalReservations?.toLocaleString() ||
                    0}
                </p>
              </div>
              <div className="summary-item">
                <h4>
                  {t("reports.confirmed_reservations") ||
                    "Confirmed Reservations"}
                </h4>
                <p>
                  {reportData.reservations.confirmedReservations?.toLocaleString() ||
                    0}
                </p>
              </div>
              <div className="summary-item">
                <h4>
                  {t("reports.cancelled_reservations") ||
                    "Cancelled Reservations"}
                </h4>
                <p>
                  {reportData.reservations.cancelledReservations?.toLocaleString() ||
                    0}
                </p>
              </div>
              <div className="summary-item">
                <h4>{t("reports.no_show_rate") || "No-Show Rate"}</h4>
                <p>{reportData.reservations.noShowRate || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
