import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRestaurant } from "../hooks/useRestaurant";
import { useAuth } from "../context/AuthContext";
import { RoleBasedUI } from "../utils/roleUtils";
import {
  Calendar,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Save,
  Filter,
  User,
  FileText,
  UserPlus,
} from "lucide-react";
import reservationService from "../services/reservationService";
import tableService from "../services/tableService";
import customerService from "../services/customerService";
import CustomerModal from "../components/CustomerModal";

const Reservations = () => {
  const { t, i18n } = useTranslation();
  const { getThemeColors } = useRestaurant();
  const { user } = useAuth();

  // Get theme colors for dynamic styling
  const themeColors = getThemeColors();
  const primaryColor = themeColors.primary || "#f59e0b";

  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [filterStatus, setFilterStatus] = useState("all");

  // Form state for add/edit
  const [formData, setFormData] = useState({
    table: "", // Optional for guest requests
    reservedAt: "",
    numberOfGuests: "",
    name: "", // Guest name (required for guest requests)
    phone: "", // Guest phone (required for guest requests - used for customer identification)
    email: "", // Guest email (optional)
    notes: "",
  });

  // Toggle between admin reservation and guest request
  const [isGuestRequest, setIsGuestRequest] = useState(false);

  // For admin mode - customer search by phone
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  useEffect(() => {
    fetchReservations();
    fetchTables();
  }, []);

  // Auto-hide message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  // Search customers by phone number
  const searchCustomersByPhone = async (phone) => {
    if (!phone || phone.length < 3) {
      setCustomerSearchResults([]);
      setShowCustomerDropdown(false);
      return;
    }

    try {
      setSearchingCustomers(true);
      const response = await customerService.search(phone);
      setCustomerSearchResults(response.data || response);
      setShowCustomerDropdown(true);
    } catch (error) {
      console.error("Error searching customers:", error);
      setCustomerSearchResults([]);
      setShowCustomerDropdown(false);
    } finally {
      setSearchingCustomers(false);
    }
  };

  // Handle customer search input
  const handleCustomerSearch = (value) => {
    setCustomerSearch(value);
    searchCustomersByPhone(value);
  };

  // Select customer from search results
  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.phone);
    setShowCustomerDropdown(false);
    setCustomerSearchResults([]);
  };

  // Clear customer selection
  const clearCustomerSelection = () => {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setShowCustomerDropdown(false);
    setCustomerSearchResults([]);
  };

  // Create new customer from guest request
  const createCustomerFromGuest = async () => {
    if (!formData.name || !formData.phone) {
      setMessage({
        type: "error",
        text: "Name and phone are required to create a customer",
      });
      return null;
    }

    try {
      const customerData = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || "",
        address: "",
      };

      const response = await customerService.create(customerData);
      return response.data || response;
    } catch (error) {
      console.error("Error creating customer:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to create customer",
      });
      return null;
    }
  };

  // Handle customer creation success from modal
  const handleCustomerCreated = (newCustomer) => {
    setSelectedCustomer(newCustomer);
    setCustomerSearch(newCustomer.phone);
    setShowCustomerModal(false);
    setMessage({
      type: "success",
      text: "Customer created and selected successfully!",
    });
  };

  // Open customer modal with initial data
  const openCustomerModal = () => {
    setShowCustomerModal(true);
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationService.getAll();
      setReservations(response.data || response);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to fetch reservations",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await tableService.getAll();
      setTables(response.data || response);
    } catch (error) {
      console.error("Failed to fetch tables:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedReservation) {
        // Update reservation status and table assignment
        const updateData = {
          status: formData.status || selectedReservation.status,
          table: formData.table || selectedReservation.table,
          notes: formData.notes || selectedReservation.notes,
        };

        // Ensure table is assigned when confirming
        if (updateData.status === "confirmed" && !updateData.table) {
          setMessage({
            type: "error",
            text: "Table must be assigned when confirming reservation",
          });
          return;
        }

        await reservationService.update(selectedReservation._id, updateData);
        setMessage({
          type: "success",
          text: "Reservation updated successfully!",
        });
      } else {
        // Create new reservation or guest request
        if (isGuestRequest) {
          // Check if customer exists, if not create one
          let customer = selectedCustomer;
          if (!customer && formData.phone) {
            // Search for existing customer first
            try {
              const searchResults = await customerService.search(
                formData.phone,
              );
              const existingCustomer = searchResults.data?.find(
                (c) => c.phone === formData.phone,
              );
              if (existingCustomer) {
                customer = existingCustomer;
              } else {
                // Create new customer
                customer = await createCustomerFromGuest();
              }
            } catch (error) {
              // If search fails, try to create customer directly
              customer = await createCustomerFromGuest();
            }
          }

          // Submit guest request with customer ID if available
          const guestRequestData = {
            name: formData.name,
            phone: formData.phone,
            email: formData.email, // Optional
            table: formData.table, // Optional
            reservedAt: formData.reservedAt,
            numberOfGuests: formData.numberOfGuests,
            notes: formData.notes, // Optional
            customer: customer?._id, // Link to customer if created/found
          };
          await reservationService.createGuestRequest(guestRequestData);
          setMessage({
            type: "success",
            text: customer
              ? "Customer created and reservation request submitted successfully!"
              : "Reservation request submitted successfully!",
          });
        } else {
          // Create admin reservation
          const adminReservationData = {
            customer: selectedCustomer?._id || customerSearch, // Customer ID from search or manual input
            table: formData.table,
            reservedAt: formData.reservedAt,
            numberOfGuests: formData.numberOfGuests,
            notes: formData.notes,
          };
          await reservationService.create(adminReservationData);
          setMessage({
            type: "success",
            text: "Reservation created successfully!",
          });
        }
      }

      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      fetchReservations();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this reservation?")) {
      try {
        await reservationService.delete(id);
        setMessage({
          type: "success",
          text: "Reservation deleted successfully!",
        });
        fetchReservations();
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Delete failed",
        });
      }
    }
  };

  const handleEdit = (reservation) => {
    setSelectedReservation(reservation);
    setFormData({
      table: reservation.table || "",
      reservedAt: new Date(reservation.reservedAt).toISOString().slice(0, 16),
      numberOfGuests: reservation.numberOfGuests,
      name: reservation.name || "",
      phone: reservation.phone || "",
      email: reservation.email || "",
      notes: reservation.notes || "",
      status: reservation.status || "pending",
    });

    // Set customer for admin mode
    if (reservation.customer) {
      setSelectedCustomer(reservation.customer);
      setCustomerSearch(reservation.customer._id || reservation.customer);
    }

    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      table: "", // Optional for guest requests
      reservedAt: "",
      numberOfGuests: "",
      name: "", // Guest name
      phone: "", // Guest phone
      email: "", // Guest email (optional)
      notes: "",
      status: "pending",
    });
    setSelectedReservation(null);
    setIsGuestRequest(false);
    setSelectedCustomer(null);
    setCustomerSearch("");
    setShowCustomerDropdown(false);
    setCustomerSearchResults([]);
  };

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      (reservation.customer &&
        typeof reservation.customer === "string" &&
        reservation.customer
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (reservation.name &&
        typeof reservation.name === "string" &&
        reservation.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reservation.notes &&
        typeof reservation.notes === "string" &&
        reservation.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" || reservation.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const pendingReservationsCount = reservations.filter(
    (r) => r.status === "pending",
  ).length;
  const confirmedReservationsCount = reservations.filter(
    (r) => r.status === "confirmed",
  ).length;
  const cancelledReservationsCount = reservations.filter(
    (r) => r.status === "cancelled",
  ).length;
  const completedReservationsCount = reservations.filter(
    (r) => r.status === "completed",
  ).length;

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={16} />;
      case "confirmed":
        return <CheckCircle size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      case "completed":
        return <CheckCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "var(--warning)";
      case "confirmed":
        return "var(--success)";
      case "cancelled":
        return "var(--danger)";
      case "completed":
        return "var(--primary)";
      default:
        return "var(--text-muted)";
    }
  };

  const getTableName = (tableId) => {
    const table = tables.find((t) => t._id === tableId);
    return table ? table.number : "Unknown";
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  return (
    <div className="reservations-page" data-direction={i18n.dir()}>
      <div className="page-header">
        <div className="header-content">
          <h1>
            <Calendar size={28} />
            {t("reservations.reservations")}
          </h1>
          <p>{t("reservations.manage_description")}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="btn-primary"
        >
          <RoleBasedUI user={user} allowedRoles={["admin", "manager"]}>
            <Plus size={20} />
            {t("reservations.add_new")}
          </RoleBasedUI>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Calendar />
          </div>
          <div className="stat-content">
            <h3>{reservations.length}</h3>
            <p>{t("reservations.total_reservations")}</p>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">
            <Clock />
          </div>
          <div className="stat-content">
            <h3>{pendingReservationsCount}</h3>
            <p>{t("reservations.pending_reservations")}</p>
          </div>
        </div>
        <div className="stat-card confirmed">
          <div className="stat-icon">
            <CheckCircle />
          </div>
          <div className="stat-content">
            <h3>{confirmedReservationsCount}</h3>
            <p>{t("reservations.confirmed_reservations")}</p>
          </div>
        </div>
        <div className="stat-card cancelled">
          <div className="stat-icon">
            <XCircle />
          </div>
          <div className="stat-content">
            <h3>{cancelledReservationsCount}</h3>
            <p>{t("reservations.cancelled_reservations")}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder={t("reservations.search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            {t("reservations.filter_all")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "pending" ? "active" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            {t("reservations.filter_pending")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "confirmed" ? "active" : ""}`}
            onClick={() => setFilterStatus("confirmed")}
          >
            {t("reservations.filter_confirmed")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "cancelled" ? "active" : ""}`}
            onClick={() => setFilterStatus("cancelled")}
          >
            {t("reservations.filter_cancelled")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "completed" ? "active" : ""}`}
            onClick={() => setFilterStatus("completed")}
          >
            {t("reservations.filter_completed")}
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Reservations Table */}
      <div className="reservations-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{t("common.loading")}</p>
          </div>
        ) : (
          <div className="reservations-table-container">
            {filteredReservations.length === 0 ? (
              <div className="no-data">
                <Calendar size={48} />
                <h3>{t("reservations.no_found")}</h3>
                <p>{t("reservations.no_description")}</p>
              </div>
            ) : (
              <table className="reservations-table">
                <thead>
                  <tr>
                    <th data-direction={i18n.dir()}>
                      {t("reservations.customer")}
                    </th>
                    <th data-direction={i18n.dir()}>
                      {t("reservations.table")}
                    </th>
                    <th data-direction={i18n.dir()}>
                      {t("reservations.date_time")}
                    </th>
                    <th data-direction={i18n.dir()}>
                      {t("reservations.guests")}
                    </th>
                    <th data-direction={i18n.dir()}>
                      {t("reservations.duration")}
                    </th>
                    <th data-direction={i18n.dir()}>
                      {t("reservations.status")}
                    </th>
                    <th data-direction={i18n.dir()}>
                      {t("reservations.notes")}
                    </th>
                    <th data-direction={i18n.dir()}>
                      {t("reservations.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation._id}>
                      <td data-direction={i18n.dir()}>
                        <div className="customer-info">
                          <User size={16} />
                          <span>
                            {reservation.name ||
                              (typeof reservation.customer === "string"
                                ? reservation.customer
                                : reservation.customer?.name ||
                                  "Unknown Customer")}
                          </span>
                        </div>
                      </td>
                      <td data-direction={i18n.dir()}>
                        <div className="table-info">
                          <MapPin size={16} />
                          <span>{getTableName(reservation.table)}</span>
                        </div>
                      </td>
                      <td data-direction={i18n.dir()}>
                        <div className="datetime-info">
                          <Clock size={16} />
                          <span>{formatDateTime(reservation.reservedAt)}</span>
                        </div>
                      </td>
                      <td data-direction={i18n.dir()}>
                        <div className="guests-info">
                          <Users size={16} />
                          <span>{reservation.numberOfGuests}</span>
                        </div>
                      </td>
                      <td data-direction={i18n.dir()}>
                        <div className="duration-info">
                          <Clock size={16} />
                          <span>{reservation.durationMinutes} min</span>
                        </div>
                      </td>
                      <td data-direction={i18n.dir()}>
                        <span
                          className={`status-badge ${reservation.status}`}
                          style={{ color: getStatusColor(reservation.status) }}
                        >
                          {getStatusIcon(reservation.status)}
                          {t(`reservations.status_${reservation.status}`)}
                        </span>
                      </td>
                      <td data-direction={i18n.dir()}>
                        <div className="notes-info">
                          {reservation.notes ? (
                            <>
                              <FileText size={16} />
                              <span>{reservation.notes}</span>
                            </>
                          ) : (
                            <span className="no-notes">-</span>
                          )}
                        </div>
                      </td>
                      <td data-direction={i18n.dir()}>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(reservation)}
                            className="btn-icon btn-edit"
                            title={t("common.edit")}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(reservation._id)}
                            className="btn-icon btn-delete"
                            title={t("common.delete")}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    {t("reservations.edit_reservation")}
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    {isGuestRequest
                      ? t("reservations.guest_request")
                      : t("reservations.add_new_reservation")}
                  </>
                )}
              </h2>
              <div className="modal-header-actions">
                {!showEditModal && (
                  <div className="request-type-toggle">
                    <button
                      type="button"
                      className={`toggle-btn ${!isGuestRequest ? "active" : ""}`}
                      onClick={() => setIsGuestRequest(false)}
                    >
                      {t("reservations.admin_reservation")}
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${isGuestRequest ? "active" : ""}`}
                      onClick={() => setIsGuestRequest(true)}
                    >
                      {t("reservations.guest_request")}
                    </button>
                  </div>
                )}
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
            </div>

            <form onSubmit={handleSubmit} className="reservation-form">
              <div className="form-grid">
                {isGuestRequest ? (
                  // Guest Request Fields (Public Access)
                  <>
                    <div className="form-group">
                      <label>{t("reservations.guest_name")} *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        placeholder={t("reservations.guest_name_placeholder")}
                      />
                    </div>

                    <div className="form-group">
                      <label>{t("reservations.guest_phone")} *</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                        placeholder={t("reservations.guest_phone_placeholder")}
                      />
                      <small className="form-help">
                        {t("reservations.phone_help")}
                      </small>
                    </div>

                    <div className="form-group">
                      <label>{t("reservations.guest_email")}</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder={t("reservations.guest_email_placeholder")}
                      />
                      <small className="form-help">
                        {t("reservations.email_help")}
                      </small>
                    </div>
                  </>
                ) : (
                  // Admin Reservation Fields (Protected)
                  <div className="form-group">
                    <label>{t("reservations.customer_phone")} *</label>
                    <div className="customer-search-container">
                      <div className="search-input-wrapper">
                        <input
                          type="tel"
                          value={customerSearch}
                          onChange={(e) => handleCustomerSearch(e.target.value)}
                          required
                          placeholder={t(
                            "reservations.customer_phone_placeholder",
                          )}
                          className={
                            selectedCustomer ? "customer-selected" : ""
                          }
                        />
                        {selectedCustomer && (
                          <button
                            type="button"
                            onClick={clearCustomerSelection}
                            className="clear-customer-btn"
                            title={t("reservations.clear_customer")}
                          >
                            <X size={16} />
                          </button>
                        )}
                        {searchingCustomers && (
                          <div className="search-spinner">
                            <div className="spinner-small"></div>
                          </div>
                        )}
                      </div>

                      {showCustomerDropdown && (
                        <div className="customer-dropdown">
                          {customerSearchResults.map((customer) => (
                            <div
                              key={customer.phone}
                              className="customer-option"
                              onClick={() => selectCustomer(customer)}
                            >
                              <div className="customer-info">
                                <div className="customer-name">
                                  {customer.name}
                                </div>
                                <div className="customer-phone">
                                  {customer.phone}
                                </div>
                                {customer.email && (
                                  <div className="customer-email">
                                    {customer.email}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {customerSearchResults.length === 0 &&
                        customerSearch.length >= 3 &&
                        !searchingCustomers && (
                          <div
                            className="customer-option create-customer-option"
                            onClick={openCustomerModal}
                          >
                            <div className="customer-info">
                              <div className="customer-name">
                                <UserPlus size={16} />
                                Create New Customer
                              </div>
                              <div className="customer-phone">
                                {customerSearch}
                              </div>
                            </div>
                          </div>
                        )}

                      {selectedCustomer && (
                        <div className="selected-customer-info">
                          <div className="customer-details">
                            <strong>{selectedCustomer.name}</strong>
                            <span>{selectedCustomer.phone}</span>
                            {selectedCustomer.email && (
                              <span>{selectedCustomer.email}</span>
                            )}
                          </div>
                        </div>
                      )}

                      <small className="form-help">
                        {t("reservations.customer_phone_help")}
                      </small>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>{t("reservations.table")}</label>
                  <select
                    value={formData.table}
                    onChange={(e) =>
                      setFormData({ ...formData, table: e.target.value })
                    }
                  >
                    <option value="">
                      {isGuestRequest
                        ? t("reservations.table_optional")
                        : t("reservations.select_table")}
                    </option>
                    {tables.map((table) => (
                      <option key={table._id} value={table._id}>
                        {table.number} ({table.seats} seats)
                      </option>
                    ))}
                  </select>
                  <small className="form-help">
                    {isGuestRequest
                      ? t("reservations.table_help_guest")
                      : t("reservations.table_help_admin")}
                  </small>
                </div>

                <div className="form-group">
                  <label>{t("reservations.date_time")} *</label>
                  <input
                    type="datetime-local"
                    value={formData.reservedAt}
                    onChange={(e) =>
                      setFormData({ ...formData, reservedAt: e.target.value })
                    }
                    required
                    min={new Date().toISOString().slice(0, 16)} // Prevent past dates
                  />
                  <small className="form-help">
                    {t("reservations.datetime_help")}
                  </small>
                </div>

                <div className="form-group">
                  <label>{t("reservations.guests")} *</label>
                  <input
                    type="number"
                    value={formData.numberOfGuests}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfGuests: e.target.value,
                      })
                    }
                    required
                    min="1"
                    max="20"
                  />
                  <small className="form-help">
                    {t("reservations.guests_help")}
                  </small>
                </div>

                {selectedReservation && (
                  <div className="form-group">
                    <label>{t("reservations.status")}</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="pending">
                        {t("reservations.status_pending")}
                      </option>
                      <option value="confirmed">
                        {t("reservations.status_confirmed")}
                      </option>
                      <option value="cancelled">
                        {t("reservations.status_cancelled")}
                      </option>
                      <option value="completed">
                        {t("reservations.status_completed")}
                      </option>
                    </select>
                  </div>
                )}

                <div className="form-group full-width">
                  <label>{t("reservations.notes")}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder={t("reservations.notes_placeholder")}
                    rows={3}
                  />
                  <small className="form-help">
                    {t("reservations.notes_help")}
                  </small>
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
        .reservations-page {
          padding: 1rem;
          max-width: 1600px;
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

        .stat-card.pending {
          border-color: var(--warning);
          background: color-mix(in srgb, var(--warning) 5%, transparent);
        }

        .stat-card.confirmed {
          border-color: var(--success);
          background: color-mix(in srgb, var(--success) 5%, transparent);
        }

        .stat-card.cancelled {
          border-color: var(--danger);
          background: color-mix(in srgb, var(--danger) 5%, transparent);
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

        .stat-card.pending .stat-icon {
          background: var(--warning);
        }

        .stat-card.confirmed .stat-icon {
          background: var(--success);
        }

        .stat-card.cancelled .stat-icon {
          background: var(--danger);
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

        .reservations-container {
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

        .reservations-table-container {
          overflow-x: auto;
        }

        .reservations-table {
          width: 100%;
          border-collapse: collapse;
        }

        .reservations-table th {
          background: var(--bg-base);
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        [data-direction="rtl"] .reservations-table th {
          text-align: right;
        }

        .reservations-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        [data-direction="rtl"] .reservations-table td {
          text-align: right;
        }

        .reservations-table tr:hover {
          background: var(--bg-base);
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

        .customer-info,
        .table-info,
        .datetime-info,
        .guests-info,
        .duration-info,
        .notes-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        [data-direction="rtl"] .customer-info,
        [data-direction="rtl"] .table-info,
        [data-direction="rtl"] .datetime-info,
        [data-direction="rtl"] .guests-info,
        [data-direction="rtl"] .duration-info,
        [data-direction="rtl"] .notes-info {
          justify-content: flex-end;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          font-weight: 600;
          background: color-mix(in srgb, currentColor 10%, transparent);
        }

        .no-notes {
          color: var(--text-muted);
          font-style: italic;
        }

        .action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }

        [data-direction="rtl"] .action-buttons {
          justify-content: flex-start;
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
          max-width: 1100px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          gap: 1rem;
        }

        .modal-header h2 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin: 0;
          color: var(--text-primary);
          flex: 1;
        }

        .modal-header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .request-type-toggle {
          display: flex;
          background: var(--bg-base);
          border-radius: var(--radius-md);
          padding: 0.25rem;
          gap: 0.25rem;
        }

        .toggle-btn {
          padding: 0.5rem 1rem;
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .toggle-btn.active {
          background: ${primaryColor};
          color: white;
        }

        .toggle-btn:hover:not(.active) {
          background: color-mix(in srgb, var(--text-muted) 10%, transparent);
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

        .reservation-form {
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

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-help {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        /* Customer Search Styles */
        .customer-search-container {
          position: relative;
        }

        .search-input-wrapper {
          position: relative;
        }

        .search-input-wrapper input.customer-selected {
          padding-right: 2.5rem;
          background: color-mix(in srgb, var(--success) 5%, var(--input-bg));
          border-color: var(--success);
        }

        .clear-customer-btn {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: var(--danger);
          color: white;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
        }

        .clear-customer-btn:hover {
          background: #dc2626;
          transform: translateY(-50%) scale(1.1);
        }

        .search-spinner {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-color);
          border-top: 2px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .customer-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
          margin-top: 0.25rem;
        }

        .customer-option {
          padding: 0.75rem;
          cursor: pointer;
          transition: background 0.2s;
          border-bottom: 1px solid var(--border-color);
        }

        .customer-option:last-child {
          border-bottom: none;
        }

        .customer-option:hover {
          background: var(--bg-base);
        }

        .customer-info .customer-name {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .customer-info .customer-phone {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.125rem;
        }

        .customer-info .customer-email {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .selected-customer-info {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: color-mix(in srgb, var(--success) 10%, transparent);
          border: 1px solid var(--success);
          border-radius: var(--radius-sm);
        }

        .customer-details {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .customer-details strong {
          color: var(--success);
          font-weight: 600;
        }

        .customer-details span {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        [data-direction="rtl"] .clear-customer-btn {
          right: auto;
          left: 0.5rem;
        }

        [data-direction="rtl"] .search-input-wrapper input.customer-selected {
          padding-left: 2.5rem;
          padding-right: 0.75rem;
        }

        [data-direction="rtl"] .search-spinner {
          right: auto;
          left: 0.5rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-base);
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
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

        [data-direction="rtl"] .form-group {
          text-align: right;
        }

        [data-direction="rtl"] .form-group label {
          text-align: right;
        }

        @media (max-width: 768px) {
          .reservations-page {
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

          .form-grid {
            grid-template-columns: 1fr;
          }

          .reservations-table {
            font-size: 0.875rem;
          }

          .reservations-table th,
          .reservations-table td {
            padding: 0.5rem;
          }
        }
      `}</style>

      {/* Customer Modal */}
      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onCustomerCreated={handleCustomerCreated}
        initialData={{
          phone: customerSearch,
          name: formData.name,
          email: formData.email,
        }}
      />
    </div>
  );
};

export default Reservations;
