import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  DollarSign,
  FileText,
  TrendingUp,
  Users,
  CreditCard,
  Calendar,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
  Filter,
} from "lucide-react";
import supplierService from "../services/supplierService";

const Suppliers = () => {
  const { t, i18n } = useTranslation();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [statementData, setStatementData] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [filterPaymentTerms, setFilterPaymentTerms] = useState("all");

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    paymentTerms: "cash",
  });

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    amount: "",
    description: "",
  });

  useEffect(() => {
    fetchSuppliers();
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

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierService.getAll();
      setSuppliers(response.data || response);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to fetch suppliers",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedSupplier) {
        // Update supplier
        await supplierService.update(selectedSupplier._id, formData);
        setMessage({ type: "success", text: "Supplier updated successfully!" });
      } else {
        // Create new supplier
        await supplierService.create(formData);
        setMessage({ type: "success", text: "Supplier created successfully!" });
      }

      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      fetchSuppliers();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      paymentTerms: supplier.paymentTerms || "cash",
    });
    setShowEditModal(true);
  };

  const handleDelete = async (supplierId) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await supplierService.delete(supplierId);
        setMessage({ type: "success", text: "Supplier deleted successfully!" });
        fetchSuppliers();
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Failed to delete supplier",
        });
      }
    }
  };

  const handleViewStatement = async (supplier) => {
    try {
      const response = await supplierService.getStatement(supplier._id);
      setStatementData(response.data || response);
      setSelectedSupplier(supplier);
      setShowStatementModal(true);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to fetch statement",
      });
    }
  };

  const handleRecordPayment = (supplier) => {
    setSelectedSupplier(supplier);
    setPaymentData({ amount: "", description: "" });
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      await supplierService.recordPayment(selectedSupplier._id, paymentData);
      setMessage({ type: "success", text: "Payment recorded successfully!" });
      setShowPaymentModal(false);
      resetPaymentForm();
      fetchSuppliers();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to record payment",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      paymentTerms: "cash",
    });
    setSelectedSupplier(null);
  };

  const resetPaymentForm = () => {
    setPaymentData({ amount: "", description: "" });
    setSelectedSupplier(null);
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.phone?.includes(searchTerm) ||
      supplier.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterPaymentTerms === "all" ||
      supplier.paymentTerms === filterPaymentTerms;

    return matchesSearch && matchesFilter;
  });

  const getPaymentTermsColor = (terms) => {
    switch (terms) {
      case "cash":
        return "#10b981";
      case "credit":
        return "#3b82f6";
      case "installment":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  const getPaymentTermsLabel = (terms) => {
    switch (terms) {
      case "cash":
        return "Cash";
      case "credit":
        return "Credit";
      case "installment":
        return "Installment";
      default:
        return terms;
    }
  };

  return (
    <div className="suppliers-page" data-direction={i18n.dir()}>
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          {t("nav.suppliers") || "Suppliers Management"}
        </h1>
        <div className="page-actions">
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            <Plus size={20} />
            {t("suppliers.add_new") || "Add Supplier"}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search
            size={20}
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-secondary)",
            }}
          />
          <input
            type="text"
            placeholder={
              t("suppliers.search_placeholder") || "Search suppliers..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: "3rem" }}
            className="form-input"
          />
        </div>
        <select
          value={filterPaymentTerms}
          onChange={(e) => setFilterPaymentTerms(e.target.value)}
          className="filter-select"
        >
          <option value="all">
            {t("suppliers.filter_all") || "All Payment Terms"}
          </option>
          <option value="cash">{t("suppliers.payment_cash") || "Cash"}</option>
          <option value="credit">
            {t("suppliers.payment_credit") || "Credit"}
          </option>
          <option value="installment">
            {t("suppliers.payment_installment") || "Installment"}
          </option>
        </select>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>{suppliers.length}</h3>
            <p>{t("suppliers.total_suppliers") || "Total Suppliers"}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3>{suppliers.filter((s) => s.paymentTerms === "cash").length}</h3>
            <p>{t("suppliers.cash_suppliers") || "Cash Suppliers"}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <CreditCard size={24} />
          </div>
          <div className="stat-content">
            <h3>
              {suppliers.filter((s) => s.paymentTerms === "credit").length}
            </h3>
            <p>{t("suppliers.credit_suppliers") || "Credit Suppliers"}</p>
          </div>
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="suppliers-table">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>{t("suppliers.name") || "Name"}</th>
                <th>{t("suppliers.phone") || "Phone"}</th>
                <th>{t("suppliers.email") || "Email"}</th>
                <th>{t("suppliers.payment_terms") || "Payment Terms"}</th>
                <th>{t("suppliers.balance") || "Balance"}</th>
                <th>{t("suppliers.actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    {t("common.loading") || "Loading..."}
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    {t("suppliers.no_suppliers_found") || "No suppliers found"}
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: getPaymentTermsColor(
                              supplier.paymentTerms,
                            ),
                          }}
                        ></div>
                        {supplier.name}
                      </div>
                    </td>
                    <td>{supplier.phone || "-"}</td>
                    <td>{supplier.email || "-"}</td>
                    <td>
                      <span
                        className="payment-terms-badge"
                        style={{
                          backgroundColor: getPaymentTermsColor(
                            supplier.paymentTerms,
                          ),
                        }}
                      >
                        {getPaymentTermsLabel(supplier.paymentTerms)}
                      </span>
                    </td>
                    <td
                      className={
                        supplier.balance >= 0
                          ? "balance-positive"
                          : "balance-negative"
                      }
                    >
                      ${Math.abs(supplier.balance || 0).toFixed(2)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleViewStatement(supplier)}
                          className="btn-icon btn-view"
                          title={
                            t("suppliers.view_statement") || "View Statement"
                          }
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleRecordPayment(supplier)}
                          className="btn-icon btn-edit"
                          title={
                            t("suppliers.record_payment") || "Record Payment"
                          }
                        >
                          <DollarSign size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(supplier)}
                          className="btn-icon btn-edit"
                          title={t("common.edit") || "Edit"}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(supplier._id)}
                          className="btn-icon btn-delete"
                          title={t("common.delete") || "Delete"}
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
        </div>
      </div>

      {/* Add/Edit Supplier Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {selectedSupplier
                  ? t("suppliers.edit_supplier") || "Edit Supplier"
                  : t("suppliers.add_new_supplier") || "Add New Supplier"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>{t("suppliers.name") || "Supplier Name"} *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder={
                      t("suppliers.name_placeholder") || "Enter supplier name"
                    }
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t("suppliers.phone") || "Phone Number"}</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder={
                      t("suppliers.phone_placeholder") || "Enter phone number"
                    }
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>{t("suppliers.email") || "Email Address"}</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder={
                      t("suppliers.email_placeholder") || "Enter email address"
                    }
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>
                    {t("suppliers.payment_terms") || "Payment Terms"} *
                  </label>
                  <select
                    name="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentTerms: e.target.value })
                    }
                    className="form-select"
                    required
                  >
                    <option value="cash">
                      {t("suppliers.payment_cash") || "Cash"}
                    </option>
                    <option value="credit">
                      {t("suppliers.payment_credit") || "Credit"}
                    </option>
                    <option value="installment">
                      {t("suppliers.payment_installment") || "Installment"}
                    </option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  {t("common.cancel") || "Cancel"}
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  {selectedSupplier
                    ? t("common.update") || "Update"
                    : t("common.create") || "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statement Modal */}
      {showStatementModal && selectedSupplier && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {t("suppliers.account_statement") || "Account Statement"} -{" "}
                {selectedSupplier.name}
              </h2>
              <button
                onClick={() => {
                  setShowStatementModal(false);
                  setSelectedSupplier(null);
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="statement-table">
                <table>
                  <thead>
                    <tr>
                      <th>{t("suppliers.date") || "Date"}</th>
                      <th>{t("suppliers.description") || "Description"}</th>
                      <th>{t("suppliers.type") || "Type"}</th>
                      <th>{t("suppliers.amount") || "Amount"}</th>
                      <th>{t("suppliers.balance") || "Balance"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statementData.map((transaction, index) => (
                      <tr key={index}>
                        <td>
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td>{transaction.description}</td>
                        <td>{transaction.type}</td>
                        <td
                          className={
                            transaction.type === "payment"
                              ? "balance-positive"
                              : "balance-negative"
                          }
                        >
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td
                          className={
                            transaction.balance >= 0
                              ? "balance-positive"
                              : "balance-negative"
                          }
                        >
                          ${transaction.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedSupplier && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {t("suppliers.record_payment") || "Record Payment"} -{" "}
                {selectedSupplier.name}
              </h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  resetPaymentForm();
                }}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handlePaymentSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>
                    {t("suppliers.payment_amount") || "Payment Amount"} *
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={paymentData.amount}
                    onChange={(e) =>
                      setPaymentData({ ...paymentData, amount: e.target.value })
                    }
                    placeholder={
                      t("suppliers.payment_amount_placeholder") ||
                      "Enter amount"
                    }
                    className="form-input"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    {t("suppliers.payment_description") || "Description"}
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={paymentData.description}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        description: e.target.value,
                      })
                    }
                    placeholder={
                      t("suppliers.payment_description_placeholder") ||
                      "Enter description"
                    }
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    resetPaymentForm();
                  }}
                  className="btn-secondary"
                >
                  {t("common.cancel") || "Cancel"}
                </button>
                <button type="submit" className="btn-primary">
                  <DollarSign size={16} />
                  {t("suppliers.record_payment") || "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internal CSS */}
      <style>{`
        .suppliers-page {
          padding: 2rem;
          background: var(--bg-base);
          min-height: 100vh;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .page-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-primary {
          background: var(--primary);
          color: var(--primary-content);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: var(--primary-focus);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: var(--secondary);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          opacity: 0.9;
        }

        .message {
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .message.success {
          background: #10b981;
          color: white;
        }

        .message.error {
          background: #ef4444;
          color: white;
        }

        .search-filter-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-base);
          color: var(--text-primary);
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-base);
          color: var(--text-primary);
          font-size: 0.875rem;
          cursor: pointer;
          min-width: 200px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: var(--bg-base);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          background: var(--primary);
          color: var(--primary-content);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .stat-content p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .suppliers-table {
          background: var(--bg-base);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .suppliers-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .suppliers-table th {
          background: var(--bg-secondary);
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border);
        }

        .suppliers-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border);
          color: var(--text-primary);
        }

        .suppliers-table tr:hover {
          background: var(--bg-secondary);
        }

        .payment-terms-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-sm);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .balance-positive {
          color: #10b981;
          font-weight: 600;
        }

        .balance-negative {
          color: #ef4444;
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-icon {
          background: none;
          border: none;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          background: var(--bg-secondary);
        }

        .btn-view:hover {
          color: #3b82f6;
        }

        .btn-edit:hover {
          color: #f59e0b;
        }

        .btn-delete:hover {
          color: #ef4444;
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
          background: var(--bg-base);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
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
          border-bottom: 1px solid var(--border);
        }

        .modal-header h2 {
          margin: 0;
          color: var(--text-primary);
        }

        .modal-header button {
          background: none;
          border: none;
          padding: 0.5rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--text-secondary);
        }

        .modal-header button:hover {
          background: var(--bg-secondary);
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .form-select {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: var(--bg-base);
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid var(--border);
        }

        .statement-table {
          max-height: 400px;
          overflow-y: auto;
        }

        .statement-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .statement-table th {
          background: var(--bg-secondary);
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: var(--text-primary);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
        }

        .statement-table td {
          padding: 0.75rem;
          border-bottom: 1px solid var(--border);
          color: var(--text-primary);
        }

        /* RTL Support */
        [data-direction='rtl'] .page-header {
          flex-direction: row-reverse;
        }

        [data-direction='rtl'] .search-filter-bar {
          flex-direction: row-reverse;
        }

        [data-direction='rtl'] .suppliers-table th,
        [data-direction='rtl'] .suppliers-table td {
          text-align: right;
        }

        [data-direction='rtl'] .modal-header {
          flex-direction: row-reverse;
        }

        [data-direction='rtl'] .modal-footer {
          flex-direction: row-reverse;
        }

        [data-direction='rtl'] .action-buttons {
          flex-direction: row-reverse;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .suppliers-page {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .search-filter-bar {
            flex-direction: column;
          }

          .search-box {
            min-width: 100%;
          }

          .suppliers-table {
            font-size: 0.875rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          .modal {
            width: 95%;
            margin: 1rem;
          }

          [data-direction='rtl'] .page-header {
            flex-direction: column;
            align-items: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default Suppliers;
