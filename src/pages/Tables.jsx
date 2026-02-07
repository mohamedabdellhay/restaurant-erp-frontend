import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRestaurant } from "../hooks/useRestaurant";
import {
  SquareMenu,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Save,
  Filter,
} from "lucide-react";
import tableService from "../services/tableService";

const Tables = () => {
  const { t, i18n } = useTranslation();
  const { getThemeColors } = useRestaurant();

  // Get theme colors for dynamic styling
  const themeColors = getThemeColors();
  const primaryColor = themeColors.primary || "#f59e0b";
  const secondaryColor = themeColors.secondary || "#6366f1";
  const accentColor = themeColors.accent || "#10b981";

  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [filterStatus, setFilterStatus] = useState("all");

  // Auto-hide message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    number: "",
    seats: "",
    status: "available",
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await tableService.getAll();
      setTables(response.data || response);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to fetch tables",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTable) {
        // Update table
        await tableService.update(selectedTable._id, formData);
        setMessage({ type: "success", text: "Table updated successfully!" });
      } else {
        // Create new table
        await tableService.create(formData);
        setMessage({ type: "success", text: "Table created successfully!" });
      }

      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      fetchTables();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this table?")) {
      try {
        await tableService.delete(id);
        setMessage({ type: "success", text: "Table deleted successfully!" });
        fetchTables();
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Delete failed",
        });
      }
    }
  };

  const handleEdit = (table) => {
    setSelectedTable(table);
    setFormData({
      number: table.number,
      seats: table.seats,
      status: table.status,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      number: "",
      seats: "",
      status: "available",
    });
    setSelectedTable(null);
  };

  const filteredTables = tables.filter((table) => {
    const matchesSearch = table.number
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || table.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const availableTablesCount = tables.filter(
    (table) => table.status === "available",
  ).length;
  const occupiedTablesCount = tables.filter(
    (table) => table.status === "occupied",
  ).length;
  const reservedTablesCount = tables.filter(
    (table) => table.status === "reserved",
  ).length;
  const maintenanceTablesCount = tables.filter(
    (table) => table.status === "maintenance",
  ).length;

  const getStatusIcon = (status) => {
    switch (status) {
      case "available":
        return <CheckCircle size={16} />;
      case "occupied":
        return <Users size={16} />;
      case "reserved":
        return <Clock size={16} />;
      case "maintenance":
        return <AlertCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "var(--success)";
      case "occupied":
        return "var(--primary)";
      case "reserved":
        return "var(--warning)";
      case "maintenance":
        return "var(--danger)";
      default:
        return "var(--text-muted)";
    }
  };

  return (
    <div className="tables-page" data-direction={i18n.dir()}>
      <div className="page-header">
        <div className="header-content">
          <h1>
            <SquareMenu size={28} />
            {t("nav.tables")}
          </h1>
          <p>{t("table.tables_manage_description")}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} />
          {t("table.tables_add_new")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <SquareMenu />
          </div>
          <div className="stat-content">
            <h3>{tables.length}</h3>
            <p>{t("table.tables_total_tables")}</p>
          </div>
        </div>
        <div className="stat-card available">
          <div className="stat-icon">
            <CheckCircle />
          </div>
          <div className="stat-content">
            <h3>{availableTablesCount}</h3>
            <p>{t("table.tables_available_tables")}</p>
          </div>
        </div>
        <div className="stat-card occupied">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <h3>{occupiedTablesCount}</h3>
            <p>{t("table.tables_occupied_tables")}</p>
          </div>
        </div>
        <div className="stat-card reserved">
          <div className="stat-icon">
            <Clock />
          </div>
          <div className="stat-content">
            <h3>{reservedTablesCount}</h3>
            <p>{t("table.tables_reserved_tables")}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder={t("table.tables_search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            {t("table.tables_filter_all")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "available" ? "active" : ""}`}
            onClick={() => setFilterStatus("available")}
          >
            {t("table.tables_filter_available")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "occupied" ? "active" : ""}`}
            onClick={() => setFilterStatus("occupied")}
          >
            {t("table.tables_filter_occupied")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "reserved" ? "active" : ""}`}
            onClick={() => setFilterStatus("reserved")}
          >
            {t("table.tables_filter_reserved")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "maintenance" ? "active" : ""}`}
            onClick={() => setFilterStatus("maintenance")}
          >
            {t("table.tables_filter_maintenance")}
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Tables Grid */}
      <div className="tables-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{t("common.loading")}</p>
          </div>
        ) : (
          <div className="tables-grid">
            {filteredTables.length === 0 ? (
              <div className="no-data">
                <SquareMenu size={48} />
                <h3>{t("table.tables_no_tables_found")}</h3>
                <p>{t("table.tables_no_tables_description")}</p>
              </div>
            ) : (
              filteredTables.map((table) => (
                <div key={table._id} className={`table-card ${table.status}`}>
                  <div className="table-header">
                    <div className="table-number">
                      <span className="number">{table.number}</span>
                      <span className="capacity">
                        {table.seats} {t("table.tables_seats")}
                      </span>
                    </div>
                    <div className="table-status">
                      {getStatusIcon(table.status)}
                      <span>{t(`table.tables_status_${table.status}`)}</span>
                    </div>
                  </div>

                  <div className="table-body"></div>

                  <div className="table-actions">
                    <button
                      onClick={() => handleEdit(table)}
                      className="btn-icon btn-edit"
                      title={t("common.edit")}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(table._id)}
                      className="btn-icon btn-delete"
                      title={t("common.delete")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal" data-direction={i18n.dir()}>
            <div className="modal-header">
              <h2>
                {showEditModal ? (
                  <>
                    <Edit size={20} />
                    {t("table.tables_edit_table")}
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    {t("table.tables_add_new_table")}
                  </>
                )}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="table-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>{t("table.tables_table_number")} *</label>
                  <input
                    type="text"
                    value={formData.number}
                    onChange={(e) =>
                      setFormData({ ...formData, number: e.target.value })
                    }
                    required
                    placeholder="T1"
                  />
                </div>

                <div className="form-group">
                  <label>{t("table.tables_capacity")} *</label>
                  <input
                    type="number"
                    value={formData.seats}
                    onChange={(e) =>
                      setFormData({ ...formData, seats: e.target.value })
                    }
                    required
                    min="1"
                    max="20"
                  />
                </div>

                <div className="form-group">
                  <label>{t("table.tables_status")} *</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    required
                  >
                    <option value="available">
                      {t("table.tables_status_available")}
                    </option>
                    <option value="occupied">
                      {t("table.tables_status_occupied")}
                    </option>
                    <option value="reserved">
                      {t("table.tables_status_reserved")}
                    </option>
                    <option value="maintenance">
                      {t("table.tables_status_maintenance")}
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  {t("common.cancel")}
                </button>
                <button type="submit" className="btn-primary">
                  {showEditModal ? (
                    <>
                      <Save size={16} />
                      {t("common.update")}
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      {t("common.create")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .tables-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .header-content h1 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
          font-size: 2rem;
          font-weight: 700;
        }

        .header-content p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: ${primaryColor};
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: ${primaryColor}dd;
          transform: translateY(-1px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          transition: all 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .stat-card.available {
          border-color: var(--success);
          background: color-mix(in srgb, var(--success) 5%, transparent);
        }

        .stat-card.occupied {
          border-color: var(--primary);
          background: color-mix(in srgb, var(--primary) 5%, transparent);
        }

        .stat-card.reserved {
          border-color: var(--warning);
          background: color-mix(in srgb, var(--warning) 5%, transparent);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: ${primaryColor};
          color: white;
        }

        .stat-card.available .stat-icon {
          background: var(--success);
        }

        .stat-card.occupied .stat-icon {
          background: var(--primary);
        }

        .stat-card.reserved .stat-icon {
          background: var(--warning);
        }

        .stat-content h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-content p {
          margin: 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .search-filter-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: center;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          max-width: 400px;
          padding: 0.75rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .search-box input {
          flex: 1;
          border: none;
          background: none;
          outline: none;
          color: var(--text-primary);
        }

        .search-box svg {
          color: var(--text-muted);
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.75rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn.active {
          background: ${primaryColor};
          color: white;
          border-color: ${primaryColor};
        }

        .filter-btn:hover:not(.active) {
          border-color: ${primaryColor};
          color: ${primaryColor};
        }

        .message {
          padding: 1rem 1.5rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
          animation: slideInDown 0.3s ease-out;
        }

        .message.fade-out {
          animation: fadeOutUp 0.3s ease-out forwards;
        }

        .message.success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: 1px solid #10b981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .message.success::before {
          content: '✓';
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          font-weight: bold;
          font-size: 14px;
        }

        .message.error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: 1px solid #ef4444;
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .message.error::before {
          content: '✕';
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          font-weight: bold;
          font-size: 14px;
        }

        @keyframes slideInDown {
          from {
            transform: translateY(-20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeOutUp {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-20px);
            opacity: 0;
          }
        }

        .tables-container {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          gap: 1rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .tables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .no-data {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem;
          text-align: center;
          color: var(--text-muted);
        }

        .no-data svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .no-data h3 {
          margin: 0 0 0.5rem 0;
          color: var(--text-secondary);
        }

        .no-data p {
          margin: 0;
          font-size: 0.875rem;
        }

        .table-card {
          background: var(--bg-base);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .table-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--border-color);
        }

        .table-card.available::before {
          background: var(--success);
        }

        .table-card.occupied::before {
          background: var(--primary);
        }

        .table-card.reserved::before {
          background: var(--warning);
        }

        .table-card.maintenance::before {
          background: var(--danger);
        }

        .table-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .table-number {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .table-number .number {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .table-number .capacity {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .table-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .table-card.available .table-status {
          background: color-mix(in srgb, var(--success) 10%, transparent);
          color: var(--success);
        }

        .table-card.occupied .table-status {
          background: color-mix(in srgb, var(--primary) 10%, transparent);
          color: var(--primary);
        }

        .table-card.reserved .table-status {
          background: color-mix(in srgb, var(--warning) 10%, transparent);
          color: var(--warning);
        }

        .table-card.maintenance .table-status {
          background: color-mix(in srgb, var(--danger) 10%, transparent);
          color: var(--danger);
        }

        .table-body {
          margin-bottom: 1rem;
        }

        .table-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .location {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
        }

        .location .label {
          color: var(--text-secondary);
        }

        .location .value {
          color: var(--text-primary);
          font-weight: 500;
        }

        .table-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 0.75rem;
          background: rgba(0, 0, 0, 0.02);
          border-radius: 0 0 var(--radius-lg) var(--radius-lg);
          margin-top: auto;
        }

        .btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-edit {
          background: ${primaryColor};
          color: white;
          border: 2px solid ${primaryColor};
          transition: all 0.2s ease;
        }

        .btn-edit:hover {
          background: ${primaryColor}dd;
          border-color: ${primaryColor}dd;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .btn-edit:active {
          transform: scale(0.95);
        }

        .btn-delete {
          background: #ef4444;
          color: white;
          border: 2px solid #ef4444;
          transition: all 0.2s ease;
        }

        .btn-delete:hover {
          background: #dc2626;
          border-color: #dc2626;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .btn-delete:active {
          transform: scale(0.95);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h2 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0;
          color: var(--text-primary);
        }

        .btn-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          background: var(--bg-base);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: var(--danger);
          color: white;
        }

        .table-form {
          padding: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-group input,
        .form-group select {
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-base);
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: ${primaryColor};
          box-shadow: 0 0 0 3px color-mix(in srgb, ${primaryColor} 20%, transparent);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .btn-secondary {
          padding: 0.75rem 1.5rem;
          background: var(--bg-base);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          border-color: ${primaryColor};
          color: ${primaryColor};
        }

        /* RTL Support */
        [data-direction="rtl"] .modal-header {
          flex-direction: row-reverse;
        }

        [data-direction="rtl"] .form-actions {
          flex-direction: row-reverse;
        }

        [data-direction="rtl"] .search-box {
          flex-direction: row-reverse;
        }

        [data-direction="rtl"] .filter-buttons {
          flex-direction: row-reverse;
        }

        [data-direction="rtl"] .table-actions {
          justify-content: flex-start;
        }

        [data-direction="rtl"] .location {
          flex-direction: row-reverse;
        }

        [data-direction="rtl"] .form-group {
          text-align: right;
        }

        [data-direction="rtl"] .form-group label {
          text-align: right;
        }

        @media (max-width: 768px) {
          .tables-page {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .search-filter-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-buttons {
            justify-content: space-between;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .tables-grid {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Tables;
