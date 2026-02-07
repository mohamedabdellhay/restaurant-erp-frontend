import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRestaurant } from "../hooks/useRestaurant";
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  Shield,
  X,
  Check,
  Filter,
} from "lucide-react";
import staffService from "../services/staffService";

const Staff = () => {
  const { t, i18n } = useTranslation();
  const { getThemeColors } = useRestaurant();

  // Get theme colors for dynamic styling
  const themeColors = getThemeColors();
  const primaryColor = themeColors.primary || "#f59e0b";
  const secondaryColor = themeColors.secondary || "#6366f1";
  const accentColor = themeColors.accent || "#10b981";
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    role: "cashier",
    isActive: true,
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await staffService.getAll();
      // Handle the actual API response structure
      setStaff(response.data || response);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to fetch staff",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedStaff) {
        // Update staff
        await staffService.update(selectedStaff._id, formData);
        setMessage({ type: "success", text: "Staff updated successfully!" });
      } else {
        // Create new staff
        await staffService.create(formData);
        setMessage({ type: "success", text: "Staff created successfully!" });
      }
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      fetchStaff();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await staffService.delete(id);
        setMessage({ type: "success", text: "Staff deleted successfully!" });
        fetchStaff();
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Delete failed",
        });
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await staffService.toggleStatus(id);
      setMessage({ type: "success", text: "Status updated successfully!" });
      fetchStaff();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Status update failed",
      });
    }
  };

  const handleEdit = (staffMember) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone || "",
      position: staffMember.position || staffMember.role,
      role: staffMember.role,
      isActive: staffMember.isActive,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      position: "",
      role: "cashier",
      isActive: true,
    });
    setSelectedStaff(null);
  };

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.position &&
        member.position.toLowerCase().includes(searchTerm.toLowerCase())) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && member.isActive) ||
      (filterStatus === "inactive" && !member.isActive);

    return matchesSearch && matchesFilter;
  });

  const activeStaffCount = staff.filter((member) => member.isActive).length;
  const inactiveStaffCount = staff.filter((member) => !member.isActive).length;

  return (
    <div className="staff-page">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <Users size={28} />
            {t("nav.staff")}
          </h1>
          <p>{t("staff.manage_description")}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} />
          {t("staff.add_new")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <h3>{staff.length}</h3>
            <p>{t("staff.total_staff")}</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">
            <ToggleRight />
          </div>
          <div className="stat-content">
            <h3>{activeStaffCount}</h3>
            <p>{t("staff.active_staff")}</p>
          </div>
        </div>
        <div className="stat-card inactive">
          <div className="stat-icon">
            <ToggleLeft />
          </div>
          <div className="stat-content">
            <h3>{inactiveStaffCount}</h3>
            <p>{t("staff.inactive_staff")}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder={t("staff.search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            {t("staff.filter_all")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "active" ? "active" : ""}`}
            onClick={() => setFilterStatus("active")}
          >
            {t("staff.filter_active")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "inactive" ? "active" : ""}`}
            onClick={() => setFilterStatus("inactive")}
          >
            {t("staff.filter_inactive")}
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Staff Table */}
      <div className="staff-table-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{t("common.loading")}</p>
          </div>
        ) : (
          <table className="staff-table">
            <thead>
              <tr>
                <th data-direction={i18n.dir()}>{t("staff.name")}</th>
                <th data-direction={i18n.dir()}>{t("staff.email")}</th>
                <th data-direction={i18n.dir()}>{t("staff.phone")}</th>
                <th data-direction={i18n.dir()}>{t("staff.role")}</th>
                <th data-direction={i18n.dir()}>{t("staff.status")}</th>
                <th data-direction={i18n.dir()}>{t("staff.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    {t("staff.no_staff_found")}
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div className="staff-name">
                        <div className="avatar">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{member.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <Mail size={16} />
                        {member.email}
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <Phone size={16} />
                        {member.phone || "N/A"}
                      </div>
                    </td>
                    <td>{member.role}</td>
                    <td>
                      <span
                        className={`status-badge ${member.isActive ? "active" : "inactive"}`}
                      >
                        {member.isActive ? (
                          <ToggleRight size={16} />
                        ) : (
                          <ToggleLeft size={16} />
                        )}
                        {t(
                          `staff.status_${member.isActive ? "active" : "inactive"}`,
                        )}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEdit(member)}
                          className="btn-icon btn-edit"
                          title={t("common.edit")}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(member._id)}
                          className="btn-icon btn-toggle"
                          title={t("staff.toggle_status")}
                        >
                          {member.isActive ? (
                            <ToggleLeft size={16} />
                          ) : (
                            <ToggleRight size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(member._id)}
                          className="btn-icon btn-delete"
                          title={t("common.delete")}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {showEditModal ? (
                  <>
                    <Edit size={20} />
                    {t("staff.edit_staff")}
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    {t("staff.add_new_staff")}
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

            <form onSubmit={handleSubmit} className="staff-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>{t("staff.name")} *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("staff.email")} *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("staff.phone")} *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("staff.position")} *</label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) =>
                      setFormData({ ...formData, position: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("staff.department")} *</label>
                  <select
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    required
                  >
                    <option value="">{t("staff.select_department")}</option>
                    <option value="Kitchen">{t("staff.kitchen")}</option>
                    <option value="Service">{t("staff.service")}</option>
                    <option value="Management">{t("staff.management")}</option>
                    <option value="Administration">
                      {t("staff.administration")}
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t("staff.role")} *</label>
                  <select
                    value={formData.role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    required
                  >
                    <option value="cashier">{t("staff.role_cashier")}</option>
                    <option value="waiter">{t("staff.role_waiter")}</option>
                    <option value="kitchen">{t("staff.role_kitchen")}</option>
                    <option value="manager">{t("staff.role_manager")}</option>
                    <option value="admin">{t("staff.role_admin")}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t("staff.status")}</label>
                  <select
                    value={formData.isActive ? "active" : "inactive"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isActive: e.target.value === "active",
                      })
                    }
                  >
                    <option value="active">{t("staff.status_active")}</option>
                    <option value="inactive">
                      {t("staff.status_inactive")}
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
                      <Check size={16} />
                      {t("common.update")}
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} />
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
        .staff-page {
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
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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

        .stat-card.active {
          border-color: var(--success);
          background: color-mix(in srgb, var(--success) 5%, transparent);
        }

        .stat-card.inactive {
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

        .stat-card.active .stat-icon {
          background: var(--success);
        }

        .stat-card.inactive .stat-icon {
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
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
        }

        .message.success {
          background: color-mix(in srgb, var(--success) 10%, transparent);
          color: var(--success);
          border: 1px solid var(--success);
        }

        .message.error {
          background: color-mix(in srgb, var(--danger) 10%, transparent);
          color: var(--danger);
          border: 1px solid var(--danger);
        }

        .staff-table-container {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
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

        .staff-table {
          width: 100%;
          border-collapse: collapse;
        }
        .staff-table th {
          background: var(--bg-base);
          padding: 1rem;
          text-align: right;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-color);
        }
        [data-direction="rtl"] .staff-table th {
          text-align: left;
        }

        [data-direction="rtl"] .staff-table td {
          text-align: right;
        }

        [data-direction="rtl"] .contact-info {
          justify-content: flex-end;
        }

        [data-direction="rtl"] .staff-name {
          justify-content: flex-end;
        }

        [data-direction="rtl"] .action-buttons {
          justify-content: flex-end;
        }

        .staff-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .staff-table tr:hover {
          background: var(--bg-base);
        }

        .no-data {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }

        .staff-name {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: ${primaryColor};
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .contact-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 600;
        }

        .status-badge.active {
          background: color-mix(in srgb, var(--success) 10%, transparent);
          color: var(--success);
        }

        .status-badge.inactive {
          background: color-mix(in srgb, var(--warning) 10%, transparent);
          color: var(--warning);
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
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
        }

        .btn-edit:hover {
          background: ${primaryColor}dd;
        }

        .btn-toggle {
          background: ${secondaryColor};
          color: white;
        }

        .btn-toggle:hover {
          background: ${secondaryColor}dd;
        }

        .btn-delete {
          background: var(--danger);
          color: white;
        }

        .btn-delete:hover {
          background: var(--danger-focus);
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
          max-width: 600px;
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

        .staff-form {
          padding: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
          border-color: var(--primary);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent);
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
          border-color: var(--primary);
          color: var(--primary);
        }

        @media (max-width: 768px) {
          .staff-page {
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
            grid-template-columns: 1fr;
          }

          .staff-table-container {
            overflow-x: auto;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Staff;
