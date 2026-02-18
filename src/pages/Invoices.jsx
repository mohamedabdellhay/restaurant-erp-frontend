import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRestaurant } from "../hooks/useRestaurant";
import { useAuth } from "../context/AuthContext";
import { RoleBasedUI } from "../utils/roleUtils";
import {
  Receipt,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Save,
  Filter,
  FileText,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  Printer,
} from "lucide-react";
import invoiceService from "../services/invoiceService";
import orderService from "../services/orderService";

const Invoices = () => {
  const { t, i18n } = useTranslation();
  const { getThemeColors } = useRestaurant();
  const { user } = useAuth();

  // Get theme colors for dynamic styling
  const themeColors = getThemeColors();
  const primaryColor = themeColors.primary || "#f59e0b";
  const secondaryColor = themeColors.secondary || "#6366f1";

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [statistics, setStatistics] = useState(null);

  // Form state for add/edit - simplified to match API
  const [formData, setFormData] = useState({
    orderId: "",
    status: "unpaid",
    method: "cash",
  });

  // Order search state
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [orderSearchResults, setOrderSearchResults] = useState([]);
  const [orderSearchLoading, setOrderSearchLoading] = useState(false);
  const [showOrderResults, setShowOrderResults] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchInvoices();
    fetchStatistics();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await invoiceService.getAll();
      setInvoices(response.data || response);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to fetch invoices",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await invoiceService.getStatistics();
      setStatistics(response.data || response);
    } catch (error) {
      console.error("Failed to fetch statistics", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedInvoice) {
        // Update payment status and method
        await invoiceService.updatePaymentStatus(selectedInvoice._id, {
          status: formData.status,
          method: formData.method,
        });
        setMessage({ type: "success", text: "Invoice updated successfully!" });
      } else {
        // Create invoice from order
        await invoiceService.create({ orderId: formData.orderId });
        setMessage({ type: "success", text: "Invoice created successfully!" });
      }
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      fetchInvoices();
      fetchStatistics();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await invoiceService.delete(id);
        setMessage({ type: "success", text: "Invoice deleted successfully!" });
        fetchInvoices();
        fetchStatistics();
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Delete failed",
        });
      }
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await invoiceService.updatePaymentStatus(id, { status });
      setMessage({ type: "success", text: "Status updated successfully!" });
      fetchInvoices();
      fetchStatistics();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Status update failed",
      });
    }
  };

  const handleGeneratePDF = async (id) => {
    try {
      const blob = await invoiceService.generatePDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setMessage({ type: "success", text: "PDF downloaded successfully!" });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "PDF generation failed",
      });
    }
  };

  const handleSendEmail = async (id) => {
    const email = prompt("Enter email address:");
    if (email) {
      try {
        await invoiceService.sendByEmail(id, { email });
        setMessage({ type: "success", text: "Invoice sent successfully!" });
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Failed to send email",
        });
      }
    }
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      orderId: invoice.order?._id || "",
      status: invoice.paymentStatus || "unpaid",
      method: invoice.paymentMethod || "cash",
    });
    setShowEditModal(true);
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailsModal(true);
  };

  const resetForm = () => {
    setFormData({
      orderId: "",
      status: "unpaid",
      method: "cash",
    });
    setSelectedInvoice(null);
    setOrderSearchQuery("");
    setOrderSearchResults([]);
    setShowOrderResults(false);
    setSelectedOrder(null);
  };

  // Order search functions
  const handleOrderSearch = async (query) => {
    setOrderSearchQuery(query);
    if (query.length < 2) {
      setOrderSearchResults([]);
      setShowOrderResults(false);
      return;
    }

    setOrderSearchLoading(true);
    try {
      const response = await orderService.search(query);
      setOrderSearchResults(response.data || response || []);
      setShowOrderResults(true);
    } catch (error) {
      console.error("Order search failed:", error);
      setOrderSearchResults([]);
    } finally {
      setOrderSearchLoading(false);
    }
  };

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setFormData({ ...formData, orderId: order._id });
    setOrderSearchQuery(
      `${order.customer?.name || ""} - ${order._id.substring(0, 8)}...`,
    );
    setShowOrderResults(false);
  };

  const calculateInvoiceTotal = (invoice) => {
    // Use grandTotal from API if available, otherwise calculate
    return invoice.grandTotal !== undefined
      ? invoice.grandTotal
      : (invoice.subTotal || 0) +
          ((invoice.subTotal || 0) * (invoice.taxPercent || 0)) / 100;
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invoice.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterStatus === "all" || invoice.paymentStatus === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle size={16} className="text-green-500" />;
      case "pending":
        return <Clock size={16} className="text-yellow-500" />;
      case "unpaid":
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "status-paid";
      case "pending":
        return "status-pending";
      case "unpaid":
        return "status-unpaid";
      default:
        return "status-pending";
    }
  };

  return (
    <div className="invoices-page">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <Receipt size={28} />
            {t("nav.invoices")}
          </h1>
          <p>{t("invoices.manage_description")}</p>
        </div>
        <RoleBasedUI user={user} allowedRoles={["admin", "manager", "cashier"]}>
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="btn-primary"
          >
            <Plus size={20} />
            {t("invoices.add_new")}
          </button>
        </RoleBasedUI>
      </div>

      {/* Stats Cards */}
      {statistics && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FileText />
            </div>
            <div className="stat-content">
              <h3>{statistics.totalInvoices || invoices.length}</h3>
              <p>{t("invoices.total_invoices")}</p>
            </div>
          </div>
          <div className="stat-card paid">
            <div className="stat-icon">
              <CheckCircle />
            </div>
            <div className="stat-content">
              <h3>
                {statistics.paidCount ||
                  invoices.filter((i) => i.paymentStatus === "paid").length}
              </h3>
              <p>{t("invoices.paid")}</p>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">
              <Clock />
            </div>
            <div className="stat-content">
              <h3>
                {statistics.unpaidCount ||
                  invoices.filter((i) => i.paymentStatus === "unpaid").length}
              </h3>
              <p>{t("invoices.unpaid")}</p>
            </div>
          </div>
          <div className="stat-card revenue">
            <div className="stat-icon">
              <DollarSign />
            </div>
            <div className="stat-content">
              <h3>
                $
                {(
                  statistics.totalRevenue ||
                  invoices.reduce((sum, i) => sum + calculateInvoiceTotal(i), 0)
                ).toFixed(2)}
              </h3>
              <p>{t("invoices.total_revenue")}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder={t("invoices.search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            {t("invoices.filter_all")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "paid" ? "active" : ""}`}
            onClick={() => setFilterStatus("paid")}
          >
            {t("invoices.filter_paid")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "pending" ? "active" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            {t("invoices.filter_pending")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "unpaid" ? "active" : ""}`}
            onClick={() => setFilterStatus("unpaid")}
          >
            {t("invoices.filter_unpaid")}
          </button>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Invoices Table */}
      <div className="invoices-table-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{t("common.loading")}</p>
          </div>
        ) : (
          <table className="invoices-table">
            <thead>
              <tr>
                <th data-direction={i18n.dir()}>{t("invoices.number")}</th>
                <th data-direction={i18n.dir()}>{t("invoices.customer")}</th>
                <th data-direction={i18n.dir()}>{t("invoices.date")}</th>
                <th data-direction={i18n.dir()}>{t("invoices.amount")}</th>
                <th data-direction={i18n.dir()}>{t("invoices.status")}</th>
                <th data-direction={i18n.dir()}>
                  {t("invoices.payment_method")}
                </th>
                <th data-direction={i18n.dir()}>{t("invoices.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    {t("invoices.no_invoices_found")}
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice._id}>
                    <td>
                      <span className="invoice-number">
                        {invoice.invoiceNumber}
                      </span>
                    </td>
                    <td>
                      <div className="customer-info">
                        <User size={16} />
                        <span>
                          {invoice.customer?.name ||
                            invoice.order?.customer?.name ||
                            "N/A"}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <Calendar size={16} />
                        <span>
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="amount">
                        $
                        {invoice.grandTotal?.toFixed(2) ||
                          calculateInvoiceTotal(invoice).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(invoice.paymentStatus)}`}
                      >
                        {getStatusIcon(invoice.paymentStatus)}
                        {t(`invoices.status_${invoice.paymentStatus}`)}
                      </span>
                    </td>
                    <td>
                      <div className="payment-method">
                        <CreditCard size={16} />
                        <span>{invoice.paymentMethod}</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleViewDetails(invoice)}
                          className="btn-icon btn-view"
                          title={t("common.view")}
                        >
                          <FileText size={16} />
                        </button>
                        <RoleBasedUI
                          user={user}
                          allowedRoles={["admin", "manager", "cashier"]}
                        >
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                invoice._id,
                                invoice.paymentStatus === "paid"
                                  ? "unpaid"
                                  : "paid",
                              )
                            }
                            className="btn-icon btn-toggle"
                            title={
                              invoice.paymentStatus === "paid"
                                ? t("invoices.mark_unpaid")
                                : t("invoices.mark_paid")
                            }
                          >
                            {invoice.paymentStatus === "paid" ? (
                              <XCircle size={16} />
                            ) : (
                              <CheckCircle size={16} />
                            )}
                          </button>
                        </RoleBasedUI>
                        <RoleBasedUI
                          user={user}
                          allowedRoles={["admin", "manager", "cashier"]}
                        >
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="btn-icon btn-edit"
                            title={t("common.edit")}
                          >
                            <Edit size={16} />
                          </button>
                        </RoleBasedUI>
                        <button
                          onClick={() => handleGeneratePDF(invoice._id)}
                          className="btn-icon btn-download"
                          title={t("invoices.download_pdf")}
                        >
                          <Download size={16} />
                        </button>
                        <RoleBasedUI
                          user={user}
                          allowedRoles={["admin", "manager"]}
                        >
                          <button
                            onClick={() => handleSendEmail(invoice._id)}
                            className="btn-icon btn-email"
                            title={t("invoices.send_email")}
                          >
                            <Mail size={16} />
                          </button>
                        </RoleBasedUI>
                        <RoleBasedUI user={user} allowedRoles={["admin"]}>
                          <button
                            onClick={() => handleDelete(invoice._id)}
                            className="btn-icon btn-delete"
                            title={t("common.delete")}
                          >
                            <Trash2 size={16} />
                          </button>
                        </RoleBasedUI>
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
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>
                {showEditModal ? (
                  <>
                    <Edit size={20} />
                    {t("invoices.edit_invoice")}
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    {t("invoices.add_new_invoice")}
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

            <form onSubmit={handleSubmit} className="invoice-form">
              {showAddModal ? (
                // Create Invoice Form - order search
                <div className="form-group order-search-container">
                  <label>{t("invoices.search_order")} *</label>
                  <div className="order-search-input-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      placeholder={t("invoices.search_order_placeholder")}
                      value={orderSearchQuery}
                      onChange={(e) => handleOrderSearch(e.target.value)}
                      required
                    />
                    {orderSearchLoading && (
                      <span className="loading-spinner">...</span>
                    )}
                  </div>
                  <p className="form-hint">{t("invoices.search_order_help")}</p>

                  {/* Search Results Dropdown */}
                  {showOrderResults && orderSearchResults.length > 0 && (
                    <div className="order-search-results">
                      {orderSearchResults.map((order) => (
                        <div
                          key={order._id}
                          className="order-result-item"
                          onClick={() => handleSelectOrder(order)}
                        >
                          <div className="order-result-header">
                            <span className="order-id">
                              {order._id.substring(0, 8)}...
                            </span>
                            <span className="order-status">{order.status}</span>
                          </div>
                          <div className="order-result-customer">
                            <User size={14} />
                            <span>
                              {order.customer?.name ||
                                t("invoices.guest_customer")}
                            </span>
                            {order.customer?.phone && (
                              <span className="phone">
                                ({order.customer.phone})
                              </span>
                            )}
                          </div>
                          <div className="order-result-details">
                            <span className="items-count">
                              {order.items?.length || 0} {t("invoices.items")}
                            </span>
                            <span className="order-total">
                              ${order.total?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showOrderResults &&
                    orderSearchQuery.length >= 2 &&
                    orderSearchResults.length === 0 &&
                    !orderSearchLoading && (
                      <div className="order-search-no-results">
                        {t("invoices.no_orders_found")}
                      </div>
                    )}

                  {/* Hidden input to store selected orderId */}
                  <input type="hidden" value={formData.orderId} required />
                </div>
              ) : (
                // Edit Invoice Form - status and method
                <div className="form-grid">
                  <div className="form-group">
                    <label>{t("invoices.payment_status")} *</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      required
                    >
                      <option value="paid">{t("invoices.status_paid")}</option>
                      <option value="unpaid">
                        {t("invoices.status_unpaid")}
                      </option>
                      <option value="pending">
                        {t("invoices.status_pending")}
                      </option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{t("invoices.payment_method")} *</label>
                    <select
                      value={formData.method}
                      onChange={(e) =>
                        setFormData({ ...formData, method: e.target.value })
                      }
                      required
                    >
                      <option value="cash">{t("invoices.cash")}</option>
                      <option value="card">{t("invoices.card")}</option>
                      <option value="wallet">{t("invoices.wallet")}</option>
                      <option value="online">{t("invoices.online")}</option>
                    </select>
                  </div>
                </div>
              )}

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
                      {t("invoices.generate")}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                <Receipt size={20} />
                {t("invoices.invoice_details")}
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedInvoice(null);
                }}
                className="btn-close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="invoice-details">
              <div className="invoice-header">
                <h3>{selectedInvoice.invoiceNumber}</h3>
                <span
                  className={`status-badge ${getStatusClass(selectedInvoice.paymentStatus)}`}
                >
                  {getStatusIcon(selectedInvoice.paymentStatus)}
                  {t(`invoices.status_${selectedInvoice.paymentStatus}`)}
                </span>
              </div>

              <div className="invoice-info">
                <div className="info-row">
                  <span className="label">{t("invoices.order")}:</span>
                  <span className="value">
                    {selectedInvoice.order?._id
                      ? selectedInvoice.order._id.substring(0, 8) + "..."
                      : "N/A"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">{t("invoices.customer")}:</span>
                  <span className="value">
                    {selectedInvoice.customer?.name ||
                      selectedInvoice.order?.customer?.name ||
                      "N/A"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">{t("invoices.email")}:</span>
                  <span className="value">
                    {selectedInvoice.customer?.email ||
                      selectedInvoice.order?.customer?.email ||
                      "N/A"}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">{t("invoices.date")}:</span>
                  <span className="value">
                    {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">{t("invoices.payment_method")}:</span>
                  <span className="value">{selectedInvoice.paymentMethod}</span>
                </div>
                <div className="info-row">
                  <span className="label">{t("invoices.issued_by")}:</span>
                  <span className="value">
                    {selectedInvoice.issuedBy?.name || "N/A"}
                  </span>
                </div>
              </div>

              {selectedInvoice.order?.items && (
                <div className="invoice-items">
                  <h4>{t("invoices.order_items")}</h4>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>{t("invoices.item_name")}</th>
                        <th>{t("invoices.quantity")}</th>
                        <th>{t("invoices.price")}</th>
                        <th>{t("invoices.total")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.order.items.map((item, index) => (
                        <tr key={index}>
                          <td>{item.product?.name || item.name || "N/A"}</td>
                          <td>{item.quantity}</td>
                          <td>${item.price?.toFixed(2) || "0.00"}</td>
                          <td>
                            $
                            {((item.quantity || 1) * (item.price || 0)).toFixed(
                              2,
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="invoice-summary">
                <div className="summary-row">
                  <span>{t("invoices.subtotal")}:</span>
                  <span>${selectedInvoice.subTotal?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="summary-row">
                  <span>
                    {t("invoices.tax")} ({selectedInvoice.taxPercent || 0}%):
                  </span>
                  <span>
                    $
                    {(
                      (selectedInvoice.subTotal || 0) *
                      ((selectedInvoice.taxPercent || 0) / 100)
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="summary-row total">
                  <span>{t("invoices.total_amount")}:</span>
                  <span>
                    $
                    {selectedInvoice.grandTotal?.toFixed(2) ||
                      calculateInvoiceTotal(selectedInvoice).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => handleGeneratePDF(selectedInvoice._id)}
                  className="btn-primary"
                >
                  <Printer size={16} />
                  {t("invoices.print_pdf")}
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="btn-secondary"
                >
                  {t("common.close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .invoices-page {
          padding: 2rem;
          max-width: 1400px;
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

        .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
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

        .stat-card.paid {
          border-color: var(--success);
          background: color-mix(in srgb, var(--success) 5%, transparent);
        }

        .stat-card.pending {
          border-color: var(--warning);
          background: color-mix(in srgb, var(--warning) 5%, transparent);
        }

        .stat-card.revenue {
          border-color: ${primaryColor};
          background: color-mix(in srgb, ${primaryColor} 5%, transparent);
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

        .stat-card.paid .stat-icon {
          background: var(--success);
        }

        .stat-card.pending .stat-icon {
          background: var(--warning);
        }

        .stat-card.revenue .stat-icon {
          background: ${primaryColor};
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
          flex-wrap: wrap;
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

        .invoices-table-container {
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

        .invoices-table {
          width: 100%;
          border-collapse: collapse;
        }

        .invoices-table th {
          background: var(--bg-base);
          padding: 1rem;
          text-align: right;
          font-weight: 600;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border-color);
        }

        [data-direction="rtl"] .invoices-table th {
          text-align: left;
        }

        [data-direction="rtl"] .invoices-table td {
          text-align: right;
        }

        .invoices-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .invoices-table tr:hover {
          background: var(--bg-base);
        }

        .no-data {
          text-align: center;
          padding: 3rem;
          color: var(--text-muted);
        }

        .invoice-number {
          font-weight: 600;
          color: ${primaryColor};
        }

        .customer-info,
        .date-info,
        .payment-method {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
        }

        .amount {
          font-weight: 600;
          color: var(--text-primary);
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

        .status-badge.status-paid {
          background: color-mix(in srgb, var(--success) 10%, transparent);
          color: var(--success);
        }

        .status-badge.status-pending {
          background: color-mix(in srgb, var(--warning) 10%, transparent);
          color: var(--warning);
        }

        .status-badge.status-unpaid {
          background: color-mix(in srgb, var(--danger) 10%, transparent);
          color: var(--danger);
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
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

        .btn-view {
          background: ${secondaryColor};
          color: white;
        }

        .btn-view:hover {
          background: ${secondaryColor}dd;
        }

        .btn-edit {
          background: ${primaryColor};
          color: white;
        }

        .btn-edit:hover {
          background: ${primaryColor}dd;
        }

        .btn-download {
          background: var(--success);
          color: white;
        }

        .btn-download:hover {
          background: var(--success-focus);
        }

        .btn-email {
          background: var(--info);
          color: white;
        }

        .btn-email:hover {
          background: var(--info-focus);
        }

        .btn-toggle {
          background: var(--warning);
          color: white;
        }

        .btn-toggle:hover {
          background: var(--warning-focus);
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
          padding: 1rem;
        }

        .modal {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-large {
          max-width: 900px;
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

        .invoice-form {
          padding: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
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

        .form-hint {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        /* Order Search Styles */
        .order-search-container {
          position: relative;
        }

        .order-search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .order-search-input-wrapper .search-icon {
          position: absolute;
          left: 0.75rem;
          color: var(--text-secondary);
          pointer-events: none;
        }

        .order-search-input-wrapper input {
          padding-left: 2.5rem !important;
          width: 100%;
        }

        .order-search-input-wrapper .loading-spinner {
          position: absolute;
          right: 0.75rem;
          color: var(--text-secondary);
        }

        .order-search-results {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          margin-top: 0.25rem;
          max-height: 300px;
          overflow-y: auto;
          z-index: 100;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .order-result-item {
          padding: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background 0.2s;
        }

        .order-result-item:hover {
          background: var(--bg-hover);
        }

        .order-result-item:last-child {
          border-bottom: none;
        }

        .order-result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .order-result-header .order-id {
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-primary);
        }

        .order-result-header .order-status {
          font-size: 0.75rem;
          padding: 0.125rem 0.5rem;
          border-radius: var(--radius-sm);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          text-transform: capitalize;
        }

        .order-result-customer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }

        .order-result-customer .phone {
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .order-result-details {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .order-result-details .order-total {
          font-weight: 600;
          color: var(--primary);
        }

        .order-search-no-results {
          padding: 1rem;
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.875rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          margin-top: 0.25rem;
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
          border-color: var(--primary);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 20%, transparent);
        }

        .items-section {
          margin-bottom: 1.5rem;
        }

        .items-section label {
          display: block;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .item-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr auto;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          align-items: center;
        }

        .item-row input {
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: var(--bg-base);
          color: var(--text-primary);
        }

        .total-section {
          text-align: right;
          padding: 1rem;
          background: var(--bg-base);
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
        }

        .total-section h3 {
          margin: 0;
          color: ${primaryColor};
          font-size: 1.5rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        .invoice-details {
          padding: 1.5rem;
        }

        .invoice-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .invoice-header h3 {
          margin: 0;
          color: ${primaryColor};
          font-size: 1.25rem;
        }

        .invoice-info {
          margin-bottom: 1.5rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .info-row .label {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .info-row .value {
          color: var(--text-primary);
        }

        .invoice-items {
          margin-bottom: 1.5rem;
        }

        .invoice-items h4 {
          margin: 0 0 1rem 0;
          color: var(--text-primary);
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
        }

        .items-table th,
        .items-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        .items-table th {
          background: var(--bg-base);
          font-weight: 600;
          color: var(--text-secondary);
        }

        .invoice-summary {
          background: var(--bg-base);
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .summary-row:last-child {
          border-bottom: none;
        }

        .summary-row.discount {
          color: var(--success);
        }

        .summary-row.total {
          font-weight: 700;
          font-size: 1.25rem;
          color: ${primaryColor};
          border-top: 2px solid var(--border-color);
          margin-top: 0.5rem;
          padding-top: 0.5rem;
        }

        .invoice-notes {
          margin-bottom: 1.5rem;
        }

        .invoice-notes h4 {
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .invoice-notes p {
          color: var(--text-secondary);
          font-style: italic;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }

        @media (max-width: 768px) {
          .invoices-page {
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

          .invoices-table-container {
            overflow-x: auto;
          }

          .item-row {
            grid-template-columns: 1fr;
            gap: 0.25rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Invoices;
