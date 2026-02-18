import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  Users,
  Package,
  DollarSign,
  ChefHat,
  CheckCircle,
  XCircle,
  CreditCard,
  UserPlus,
} from "lucide-react";
import orderService from "../services/orderService";
import invoiceService from "../services/invoiceService";
import tableService from "../services/tableService";
import customerService from "../services/customerService";
import menuService from "../services/menuService";
import CustomerModal from "../components/CustomerModal";

const Orders = () => {
  const { t, i18n } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    type: "dineIn",
    table: "",
    customer: "",
    items: [],
    notes: "",
  });

  // Customer search state
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [searchingCustomers, setSearchingCustomers] = useState(false);

  // Payment modal state
  const [paymentData, setPaymentData] = useState({
    orderId: "",
    method: "cash",
    status: "paid",
  });

  useEffect(() => {
    fetchOrders();
    fetchTables();
    fetchMenuItems();
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

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAll();
      setOrders(response.data || response);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to fetch orders",
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

  const fetchMenuItems = async () => {
    try {
      const response = await menuService.getAll();
      setMenuItems(response.data || response || []);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    }
  };

  // Search customers by phone or name
  const searchCustomers = async (query) => {
    if (!query || query.length < 3) {
      setCustomerSearchResults([]);
      setShowCustomerDropdown(false);
      return;
    }

    try {
      setSearchingCustomers(true);
      const response = await customerService.search(query);
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
    searchCustomers(value);
  };

  // Select customer from search results
  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.phone);
    setFormData({ ...formData, customer: customer._id });
    setShowCustomerDropdown(false);
    setCustomerSearchResults([]);
  };

  // Clear customer selection
  const clearCustomerSelection = () => {
    setSelectedCustomer(null);
    setCustomerSearch("");
    setFormData({ ...formData, customer: "" });
    setShowCustomerDropdown(false);
    setCustomerSearchResults([]);
  };

  // Create new customer
  const createNewCustomer = () => {
    setShowCustomerModal(true);
  };

  // Handle customer creation success
  const handleCustomerCreated = (newCustomer) => {
    setSelectedCustomer(newCustomer);
    setCustomerSearch(newCustomer.phone);
    setFormData({ ...formData, customer: newCustomer._id });
    setShowCustomerModal(false);
    setMessage({
      type: "success",
      text: "Customer created and selected successfully!",
    });
  };

  // Order items management
  const addOrderItem = (menuItem) => {
    const newItem = {
      menuItem: menuItem._id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: 1,
      modifiers: [],
      notes: "",
    };
    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });
  };

  const removeOrderItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateOrderItem = (index, field, value) => {
    const newItems = formData.items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setFormData({ ...formData, items: newItems });
  };

  const calculateOrderTotal = () => {
    return formData.items.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const modifiersTotal =
        item.modifiers?.reduce(
          (modTotal, mod) => modTotal + (mod.price || 0),
          0,
        ) || 0;
      return total + itemTotal + modifiersTotal * item.quantity;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedOrder) {
        // Update order
        await orderService.update(selectedOrder._id, formData);
        setMessage({ type: "success", text: "Order updated successfully!" });
      } else {
        // Create new order
        await orderService.create(formData);
        setMessage({ type: "success", text: "Order created successfully!" });
      }

      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      fetchOrders();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setFormData({
      type: order.type || "dineIn",
      table: order.table || "",
      customer: order.customer || "",
      items: order.items || [],
      notes: order.notes || "",
    });

    // Set customer search state if customer exists
    if (order.customer) {
      setCustomerSearch(order.customer);
      setSelectedCustomer(order.customer);
    }

    setShowEditModal(true);
  };

  const handleDelete = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await orderService.delete(orderId);
        setMessage({ type: "success", text: "Order deleted successfully!" });
        fetchOrders();
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Delete failed",
        });
      }
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, { status: newStatus });
      setMessage({
        type: "success",
        text: "Order status updated successfully!",
      });
      fetchOrders();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Status update failed",
      });
    }
  };

  const handleGenerateInvoice = async (order) => {
    try {
      const invoice = await invoiceService.create({ orderId: order._id });
      setMessage({ type: "success", text: "Invoice generated successfully!" });
      fetchOrders();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Invoice generation failed",
      });
    }
  };

  const handlePayment = async () => {
    try {
      await invoiceService.updatePaymentStatus(paymentData.orderId, {
        status: paymentData.status,
        method: paymentData.method,
      });
      setMessage({ type: "success", text: "Payment processed successfully!" });
      setShowPaymentModal(false);
      setPaymentData({ orderId: "", method: "cash", status: "paid" });
      fetchOrders();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Payment failed",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      type: "dineIn",
      table: "",
      customer: "",
      items: [],
      notes: "",
    });
    setSelectedOrder(null);
    setCustomerSearch("");
    setSelectedCustomer(null);
    setCustomerSearchResults([]);
    setShowCustomerDropdown(false);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      (order.customer &&
        typeof order.customer === "string" &&
        order.customer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.notes &&
        order.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "in_kitchen":
        return "text-blue-600 bg-blue-50";
      case "served":
        return "text-green-600 bg-green-50";
      case "paid":
        return "text-purple-600 bg-purple-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock size={16} />;
      case "in_kitchen":
        return <ChefHat size={16} />;
      case "served":
        return <CheckCircle size={16} />;
      case "paid":
        return <DollarSign size={16} />;
      case "cancelled":
        return <XCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const getOrderTypeColor = (type) => {
    switch (type) {
      case "dineIn":
        return "text-blue-600 bg-blue-50";
      case "takeaway":
        return "text-orange-600 bg-orange-50";
      case "delivery":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getTableName = (tableId) => {
    const table = tables.find((t) => t._id === tableId);
    return table ? table.number : "Unassigned";
  };

  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      const itemTotal = item.price * item.qty;
      const modifiersTotal = item.modifiers
        ? item.modifiers.reduce((sum, mod) => sum + (mod.price || 0), 0)
        : 0;
      return total + (itemTotal + modifiersTotal) * item.qty;
    }, 0);
  };

  return (
    <div className="orders-page" data-direction={i18n.dir()}>
      <div className="page-header">
        <div className="header-content">
          <h1>
            <Package size={28} />
            {t("nav.orders")}
          </h1>
          <p>{t("nav.orders_manage_description")}</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} />
          {t("nav.orders_add_new")}
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Package />
          </div>
          <div className="stat-content">
            <h3>{orders.length}</h3>
            <p>{t("nav.orders_total_orders")}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Clock />
          </div>
          <div className="stat-content">
            <h3>{orders.filter((o) => o.status === "pending").length}</h3>
            <p>{t("nav.orders_pending_orders")}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <ChefHat />
          </div>
          <div className="stat-content">
            <h3>{orders.filter((o) => o.status === "in_kitchen").length}</h3>
            <p>{t("nav.orders_in_kitchen")}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign />
          </div>
          <div className="stat-content">
            <h3>{orders.filter((o) => o.status === "paid").length}</h3>
            <p>{t("nav.orders_paid_orders")}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder={t("nav.orders_search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            {t("nav.orders_filter_all")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "pending" ? "active" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            {t("nav.orders_filter_pending")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "in_kitchen" ? "active" : ""}`}
            onClick={() => setFilterStatus("in_kitchen")}
          >
            {t("nav.orders_filter_in_kitchen")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "served" ? "active" : ""}`}
            onClick={() => setFilterStatus("served")}
          >
            {t("nav.orders_filter_served")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "paid" ? "active" : ""}`}
            onClick={() => setFilterStatus("paid")}
          >
            {t("nav.orders_filter_paid")}
          </button>
          <button
            className={`filter-btn ${filterStatus === "cancelled" ? "active" : ""}`}
            onClick={() => setFilterStatus("cancelled")}
          >
            {t("nav.orders_filter_cancelled")}
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th data-direction={i18n.dir()}>{t("nav.orders_order_id")}</th>
              <th data-direction={i18n.dir()}>{t("nav.orders_customer")}</th>
              <th data-direction={i18n.dir()}>{t("nav.orders_type")}</th>
              <th data-direction={i18n.dir()}>{t("nav.orders_table")}</th>
              <th data-direction={i18n.dir()}>{t("nav.orders_items")}</th>
              <th data-direction={i18n.dir()}>{t("nav.orders_total")}</th>
              <th data-direction={i18n.dir()}>{t("nav.orders_status")}</th>
              <th data-direction={i18n.dir()}>{t("nav.orders_actions")}</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order._id}>
                <td data-direction={i18n.dir()}>
                  <span className="order-id">#{order._id.slice(-6)}</span>
                </td>
                <td data-direction={i18n.dir()}>
                  <div className="customer-info">
                    <Users size={16} />
                    <span>{order.customer || "Guest"}</span>
                  </div>
                </td>
                <td data-direction={i18n.dir()}>
                  <span
                    className={`status-badge ${getOrderTypeColor(order.type)}`}
                  >
                    {t(`nav.orders_${order.type}`)}
                  </span>
                </td>
                <td data-direction={i18n.dir()}>
                  {order.type === "dineIn" ? getTableName(order.table) : "-"}
                </td>
                <td data-direction={i18n.dir()}>
                  <div className="items-info">
                    <span>{order.items?.length || 0} items</span>
                  </div>
                </td>
                <td data-direction={i18n.dir()}>
                  <div className="total-info">
                    <DollarSign size={16} />
                    <span>${calculateTotal(order.items || []).toFixed(2)}</span>
                  </div>
                </td>
                <td data-direction={i18n.dir()}>
                  <span
                    className={`status-badge ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    {t(`nav.orders_status_${order.status}`)}
                  </span>
                </td>
                <td data-direction={i18n.dir()}>
                  <div className="action-buttons">
                    <button
                      onClick={() => handleEdit(order)}
                      className="btn-edit"
                      title={t("nav.orders_edit_order")}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(order._id)}
                      className="btn-delete"
                      title={t("nav.orders_delete_order")}
                    >
                      <Trash2 size={16} />
                    </button>
                    {order.status === "pending" && (
                      <button
                        onClick={() =>
                          handleStatusUpdate(order._id, "in_kitchen")
                        }
                        className="btn-status"
                        title={t("nav.orders_start_preparation")}
                      >
                        <ChefHat size={16} />
                      </button>
                    )}
                    {order.status === "in_kitchen" && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, "served")}
                        className="btn-status"
                        title={t("nav.orders_mark_served")}
                      >
                        <CheckCircle size={16} />
                      </button>
                    )}
                    {order.status === "served" && (
                      <>
                        <button
                          onClick={() => handleGenerateInvoice(order)}
                          className="btn-invoice"
                          title={t("nav.orders_generate_invoice")}
                        >
                          <DollarSign size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setPaymentData({
                              ...paymentData,
                              orderId: order._id,
                            });
                            setShowPaymentModal(true);
                          }}
                          className="btn-payment"
                          title={t("nav.orders_process_payment")}
                        >
                          <CreditCard size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Order Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {showEditModal ? (
                  <>
                    <Edit2 size={20} />
                    {t("nav.orders_edit_order")}
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    {t("nav.orders_add_new_order")}
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
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="order-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>{t("nav.orders_order_type")}</label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    <option value="dineIn">{t("nav.orders_dine_in")}</option>
                    <option value="takeaway">{t("nav.orders_takeaway")}</option>
                    <option value="delivery">{t("nav.orders_delivery")}</option>
                  </select>
                </div>

                {formData.type === "dineIn" && (
                  <div className="form-group">
                    <label>{t("nav.orders_table")}</label>
                    <select
                      value={formData.table}
                      onChange={(e) =>
                        setFormData({ ...formData, table: e.target.value })
                      }
                    >
                      <option value="">{t("nav.orders_select_table")}</option>
                      {tables.map((table) => (
                        <option key={table._id} value={table._id}>
                          {table.number} ({table.seats} seats)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>{t("nav.orders_customer")}</label>
                  <div className="customer-search-container">
                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => handleCustomerSearch(e.target.value)}
                      placeholder={t("nav.orders_customer_placeholder")}
                      className="customer-search-input"
                    />
                    {showCustomerDropdown && (
                      <div className="customer-dropdown">
                        {searchingCustomers ? (
                          <div className="customer-loading">Searching...</div>
                        ) : (
                          customerSearchResults.map((customer) => (
                            <div
                              key={customer._id}
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
                          ))
                        )}

                        {customerSearchResults.length === 0 &&
                          customerSearch.length >= 3 &&
                          !searchingCustomers && (
                            <div
                              className="customer-option create-customer-option"
                              onClick={createNewCustomer}
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
                          <button
                            type="button"
                            onClick={clearCustomerSelection}
                            className="clear-customer-btn"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items Section */}
                <div className="form-group full-width order-items-section">
                  <label>{t("nav.orders_items")}</label>

                  {/* Menu Items Selection */}
                  <div className="menu-items-selection">
                    <select
                      onChange={(e) => {
                        const selectedItem = menuItems.find(
                          (item) => item._id === e.target.value,
                        );
                        if (selectedItem) {
                          addOrderItem(selectedItem);
                          e.target.value = ""; // Reset selection
                        }
                      }}
                      value=""
                    >
                      <option value="">{t("nav.orders_select_item")}</option>
                      {menuItems
                        .filter((item) => item.isActive !== false)
                        .map((item) => (
                          <option key={item._id} value={item._id}>
                            {item.name} - ${item.price?.toFixed(2)}
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Selected Items List */}
                  {formData.items.length > 0 && (
                    <div className="selected-items-list">
                      {formData.items.map((item, index) => (
                        <div key={index} className="order-item-row">
                          <div className="item-info">
                            <span className="item-name">{item.name}</span>
                            <span className="item-price">
                              ${item.price?.toFixed(2)}
                            </span>
                          </div>
                          <div className="item-controls">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateOrderItem(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value) || 1,
                                )
                              }
                              className="quantity-input"
                            />
                            <input
                              type="text"
                              placeholder={t("nav.orders_item_notes")}
                              value={item.notes || ""}
                              onChange={(e) =>
                                updateOrderItem(index, "notes", e.target.value)
                              }
                              className="item-notes-input"
                            />
                            <button
                              type="button"
                              onClick={() => removeOrderItem(index)}
                              className="btn-icon btn-delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Order Total */}
                      <div className="order-total">
                        <strong>{t("nav.orders_total")}:</strong>
                        <span>${calculateOrderTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {formData.items.length === 0 && (
                    <p className="no-items-message">
                      {t("nav.orders_no_items")}
                    </p>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>{t("nav.orders_notes")}</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder={t("nav.orders_notes_placeholder")}
                    rows={3}
                  />
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
                  {showEditModal ? t("common.update") : t("common.create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                <CreditCard size={20} />
                {t("nav.orders_process_payment")}
              </h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentData({
                    orderId: "",
                    method: "cash",
                    status: "paid",
                  });
                }}
                className="btn-close"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handlePayment} className="payment-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>{t("nav.orders_payment_method")}</label>
                  <select
                    value={paymentData.method}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, method: e.target.value })
                    }
                  >
                    <option value="cash">{t("nav.orders_cash")}</option>
                    <option value="card">{t("nav.orders_card")}</option>
                    <option value="online">{t("nav.orders_online")}</option>
                    <option value="wallet">{t("nav.orders_wallet")}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t("nav.orders_payment_status")}</label>
                  <select
                    value={paymentData.status}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, status: e.target.value })
                    }
                  >
                    <option value="paid">{t("nav.orders_paid")}</option>
                    <option value="unpaid">{t("nav.orders_unpaid")}</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setPaymentData({
                      orderId: "",
                      method: "cash",
                      status: "paid",
                    });
                  }}
                  className="btn-secondary"
                >
                  {t("common.cancel")}
                </button>
                <button type="submit" className="btn-primary">
                  {t("nav.orders_process_payment")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      <CustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onCustomerCreated={handleCustomerCreated}
        initialData={{
          phone: customerSearch,
        }}
      />

      <style>{`
        .orders-page {
          padding: 2rem;
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
          margin: 0;
          color: var(--text-primary);
          font-size: 2rem;
          font-weight: 700;
        }

        .header-content p {
          margin: 0.5rem 0 0 0;
          color: var(--text-secondary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-content p {
          margin: 0.25rem 0 0 0;
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .search-filter-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 300px;
          position: relative;
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-base);
          color: var(--text-primary);
        }

        .search-box svg {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-base);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
        }

        .filter-btn:hover {
          background: var(--bg-card);
          color: var(--text-primary);
        }

        .filter-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .table-container {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: var(--bg-base);
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border-color);
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-secondary);
        }

        tr:hover {
          background: var(--bg-base);
        }

        .order-id {
          font-family: monospace;
          font-weight: 600;
          color: var(--primary);
        }

        .customer-info,
        .total-info,
        .items-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-edit,
        .btn-delete,
        .btn-status,
        .btn-invoice,
        .btn-payment {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-edit {
          background: var(--primary);
          color: white;
        }

        .btn-edit:hover {
          background: var(--primary-focus);
          transform: scale(1.05);
        }

        .btn-delete {
          background: #ef4444;
          color: white;
        }

        .btn-delete:hover {
          background: #dc2626;
          transform: scale(1.05);
        }

        .btn-status {
          background: var(--secondary);
          color: white;
        }

        .btn-status:hover {
          background: var(--secondary-focus);
          transform: scale(1.05);
        }

        .btn-invoice {
          background: var(--accent);
          color: white;
        }

        .btn-invoice:hover {
          background: var(--accent-focus);
          transform: scale(1.05);
        }

        .btn-payment {
          background: var(--success);
          color: white;
        }

        .btn-payment:hover {
          background: var(--success-focus);
          transform: scale(1.05);
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
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-close:hover {
          background: var(--danger);
          color: white;
        }

        .order-form,
        .payment-form {
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
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-primary);
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
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--primary-focus);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: var(--bg-base);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
          background: var(--bg-card);
          color: var(--text-primary);
        }

        /* Customer Search Styles */
        .customer-search-container {
          position: relative;
        }

        .customer-search-input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-base);
          color: var(--text-primary);
          transition: all 0.2s;
        }

        .customer-search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        .customer-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          max-height: 200px;
          overflow-y: auto;
          z-index: 1000;
          box-shadow: var(--shadow-lg);
        }

        .customer-option {
          padding: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .customer-option:hover {
          background: var(--bg-base);
        }

        .customer-option:last-child {
          border-bottom: none;
        }

        .customer-option.create-customer-option {
          background: var(--primary);
          color: white;
        }

        .customer-option.create-customer-option:hover {
          background: var(--primary-focus);
        }

        .customer-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .customer-name {
          font-weight: 500;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .customer-option.create-customer-option .customer-name {
          color: white;
        }

        .customer-phone {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .customer-email {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .customer-loading {
          padding: 0.75rem;
          text-align: center;
          color: var(--text-secondary);
        }

        .selected-customer-info {
          margin-top: 0.5rem;
          padding: 0.75rem;
          background: var(--bg-base);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .customer-details {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .customer-details strong {
          color: var(--text-primary);
        }

        .customer-details span {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .clear-customer-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border: none;
          background: var(--error);
          color: white;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
          margin-left: auto;
        }

        .clear-customer-btn:hover {
          background: var(--error-focus);
          transform: scale(1.05);
        }

        .message {
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .message.success {
          background: var(--success);
          color: white;
        }

        .message.error {
          background: var(--error);
          color: white;
        }

        .message.warning {
          background: var(--warning);
          color: white;
        }

        .message.info {
          background: var(--primary);
          color: white;
        }

        /* Order Items Styles */
        .order-items-section {
          margin: 1rem 0;
        }

        .menu-items-selection {
          margin-bottom: 1rem;
        }

        .menu-items-selection select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-base);
          color: var(--text-primary);
        }

        .selected-items-list {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1rem;
          background: var(--bg-base);
        }

        .order-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          gap: 1rem;
        }

        .order-item-row:last-child {
          border-bottom: none;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .item-name {
          font-weight: 600;
          color: var(--text-primary);
        }

        .item-price {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .item-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quantity-input {
          width: 60px !important;
          text-align: center;
        }

        .item-notes-input {
          width: 150px !important;
        }

        .order-total {
          display: flex;
          justify-content: space-between;
          padding-top: 1rem;
          margin-top: 1rem;
          border-top: 2px solid var(--border-color);
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .no-items-message {
          color: var(--text-secondary);
          font-style: italic;
          text-align: center;
          padding: 1rem;
        }

        [data-direction="rtl"] .search-box input {
          padding-left: 1rem;
          padding-right: 3rem;
        }

        [data-direction="rtl"] .search-box svg {
          left: auto;
          right: 1rem;
        }

        [data-direction="rtl"] .action-buttons {
          flex-direction: row-reverse;
        }

        @media (max-width: 768px) {
          .orders-page {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .search-filter-bar {
            flex-direction: column;
          }

          .search-box {
            min-width: auto;
          }

          .filter-buttons {
            justify-content: center;
          }

          .table-container {
            overflow-x: auto;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Orders;
