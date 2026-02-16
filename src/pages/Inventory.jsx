import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRestaurant } from '../hooks/useRestaurant';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  X,
  Save,
  Filter,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
} from 'lucide-react';
import inventoryService from '../services/inventoryService';

const Inventory = () => {
  const { t, i18n } = useTranslation();
  const { getThemeColors } = useRestaurant();

  // Get theme colors for dynamic styling
  const themeColors = getThemeColors();
  const primaryColor = themeColors.primary || '#f59e0b';
  const secondaryColor = themeColors.secondary || '#6366f1';
  const accentColor = themeColors.accent || '#10b981';

  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterCategory, setFilterCategory] = useState('all');
  const [stockUpdateData, setStockUpdateData] = useState({ amount: '', type: 'addition' });

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    unit: '',
    costPrice: '',
    supplier: '',
    minStockAlert: 10
  });

  useEffect(() => {
    fetchItems();
    fetchLowStockItems();
  }, []);

  // Auto-hide message after 3 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getAll();
      setItems(response.data || response);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch inventory items'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLowStockItems = async () => {
    try {
      const response = await inventoryService.getLowStock();
      setLowStockItems(response.data || response);
    } catch (error) {
      console.error('Failed to fetch low stock items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        // Update item
        await inventoryService.update(selectedItem._id, formData);
        setMessage({ type: 'success', text: 'Item updated successfully!' });
      } else {
        // Create new item
        await inventoryService.create(formData);
        setMessage({ type: 'success', text: 'Item created successfully!' });
      }
      
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      fetchItems();
      fetchLowStockItems();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Operation failed'
      });
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name || '',
      sku: item.sku || '',
      unit: item.unit || '',
      costPrice: item.costPrice || '',
      supplier: item.supplier || '',
      minStockAlert: item.minStockAlert || 10
    });
    setShowEditModal(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      try {
        await inventoryService.delete(itemId);
        setMessage({ type: 'success', text: 'Item deleted successfully!' });
        fetchItems();
        fetchLowStockItems();
      } catch (error) {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Failed to delete item'
        });
      }
    }
  };

  const handleStockUpdate = (item) => {
    setSelectedItem(item);
    setStockUpdateData({ amount: '', type: 'addition' });
    setShowStockModal(true);
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    try {
      await inventoryService.updateStock(selectedItem._id, stockUpdateData);
      setMessage({ type: 'success', text: 'Stock updated successfully!' });
      setShowStockModal(false);
      setStockUpdateData({ amount: '', type: 'addition' });
      setSelectedItem(null);
      fetchItems();
      fetchLowStockItems();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update stock'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      unit: '',
      costPrice: '',
      supplier: '',
      minStockAlert: 10
    });
    setSelectedItem(null);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter =
      filterCategory === 'all' || item.category === filterCategory;
    
    return matchesSearch && matchesFilter;
  });

  const getStockLevelColor = (currentStock, minStock) => {
    const percentage = (currentStock / minStock) * 100;
    if (percentage <= 25) return '#ef4444'; // Red
    if (percentage <= 50) return '#f59e0b'; // Orange
    return '#10b981'; // Green
  };

  const getStockLevelLabel = (currentStock, minStock) => {
    const percentage = (currentStock / minStock) * 100;
    if (percentage <= 25) return 'Critical';
    if (percentage <= 50) return 'Low';
    return 'Good';
  };

  return (
    <div className="inventory-page" data-direction={i18n.dir()}>
      <style>{`
        .inventory-page {
          padding: 2rem;
          max-width: 1600px;
          margin: 0 auto;
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
          align-items: center;
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

        .filter-select {
          min-width: 150px;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-card);
          color: var(--text-primary);
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

        .low-stock-alert {
          background: var(--bg-card);
          border: 1px solid var(--error);
          border-radius: var(--radius-lg);
          padding: 1rem;
          margin-bottom: 2rem;
        }

        .low-stock-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .low-stock-title {
          color: var(--error);
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .inventory-table {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: var(--bg-base);
          color: var(--text-primary);
          font-weight: 600;
          text-align: left;
          padding: 1rem;
          border-bottom: 2px solid var(--border-color);
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-primary);
        }

        tr:hover {
          background: var(--bg-base);
        }

        .stock-level {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .stock-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn-icon {
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
          background: var(--secondary);
          color: white;
        }

        .btn-edit:hover {
          background: var(--secondary-focus);
        }

        .btn-delete {
          background: var(--error);
          color: white;
        }

        .btn-delete:hover {
          background: var(--error-focus);
        }

        .btn-stock {
          background: var(--primary);
          color: white;
        }

        .btn-stock:hover {
          background: var(--primary-focus);
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
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: var(--shadow-lg);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .modal-header h2 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.25rem;
          font-weight: 600;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-base);
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
        }

        .btn-primary,
        .btn-secondary {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-primary {
          background: var(--primary);
          color: white;
        }

        .btn-primary:hover {
          background: var(--primary-focus);
        }

        .btn-secondary {
          background: var(--bg-base);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
          background: var(--bg-card);
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

        .stock-update-form {
          display: flex;
          gap: 1rem;
          align-items: end;
        }

        @media (max-width: 768px) {
          .inventory-page {
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
            min-width: 100%;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }

          .modal-footer {
            flex-direction: column;
          }

          .stock-update-form {
            flex-direction: column;
            align-items: stretch;
          }
        }

        [data-direction="rtl"] th,
        [data-direction="rtl"] td {
          text-align: right;
        }

        [data-direction="rtl"] .modal-header {
          flex-direction: row-reverse;
        }

        [data-direction="rtl"] .modal-footer {
          flex-direction: row-reverse;
        }
      `}</style>

      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">
          {t('nav.inventory') || 'Inventory Management'}
        </h1>
        <div className="page-actions">
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <Plus size={20} />
            {t('inventory.add_new') || 'Add Item'}
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="low-stock-alert">
          <div className="low-stock-header">
            <AlertTriangle size={24} style={{ color: 'var(--error)' }} />
            <h3 className="low-stock-title">
              {t('inventory.low_stock_alert') || 'Low Stock Alert'}
            </h3>
            <span style={{ color: 'var(--text-secondary)' }}>
              {lowStockItems.length} {t('inventory.items_below_minimum') || 'items below minimum stock'}
            </span>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder={t('inventory.search_placeholder') || 'Search items...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '3rem' }}
            className="form-input"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">{t('inventory.filter_all') || 'All Categories'}</option>
          <option value="food">{t('inventory.category_food') || 'Food'}</option>
          <option value="beverage">{t('inventory.category_beverage') || 'Beverage'}</option>
          <option value="supplies">{t('inventory.category_supplies') || 'Supplies'}</option>
          <option value="other">{t('inventory.category_other') || 'Other'}</option>
        </select>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Package size={24} />
          </div>
          <div className="stat-content">
            <h3>{items.length}</h3>
            <p>{t('inventory.total_items') || 'Total Items'}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{lowStockItems.length}</h3>
            <p>{t('inventory.low_stock_items') || 'Low Stock Items'}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <h3>${items.reduce((sum, item) => sum + (item.stock * item.costPrice || 0), 0).toFixed(2)}</h3>
            <p>{t('inventory.total_value') || 'Total Value'}</p>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>{t('inventory.name') || 'Name'}</th>
                <th>{t('inventory.sku') || 'SKU'}</th>
                <th>{t('inventory.unit') || 'Unit'}</th>
                <th>{t('inventory.cost_price') || 'Cost Price'}</th>
                <th>{t('inventory.stock') || 'Stock'}</th>
                <th>{t('inventory.min_stock') || 'Min Stock'}</th>
                <th>{t('inventory.status') || 'Status'}</th>
                <th>{t('inventory.actions') || 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    {t('common.loading') || 'Loading...'}
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    {t('inventory.no_items_found') || 'No items found'}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.sku || '-'}</td>
                    <td>{item.unit || '-'}</td>
                    <td>${item.costPrice || 0}</td>
                    <td>{item.stock || 0}</td>
                    <td>{item.minStockAlert || 10}</td>
                    <td>
                      <span className="stock-level" style={{ color: getStockLevelColor(item.stock, item.minStockAlert) }}>
                        <div 
                          className="stock-indicator" 
                          style={{ backgroundColor: getStockLevelColor(item.stock, item.minStockAlert) }}
                        ></div>
                        {getStockLevelLabel(item.stock, item.minStockAlert)}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleStockUpdate(item)}
                          className="btn-icon btn-stock"
                          title={t('inventory.update_stock') || 'Update Stock'}
                        >
                          <Package size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          className="btn-icon btn-edit"
                          title={t('common.edit') || 'Edit'}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="btn-icon btn-delete"
                          title={t('common.delete') || 'Delete'}
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

      {/* Add/Edit Item Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {selectedItem ? (t('inventory.edit_item') || 'Edit Item') : (t('inventory.add_new_item') || 'Add New Item')}
              </h2>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>{t('inventory.name') || 'Item Name'} *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('inventory.name_placeholder') || 'Enter item name'}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('inventory.sku') || 'SKU'}</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder={t('inventory.sku_placeholder') || 'Enter SKU'}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>{t('inventory.unit') || 'Unit'}</label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder={t('inventory.unit_placeholder') || 'Enter unit'}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>{t('inventory.cost_price') || 'Cost Price'} *</label>
                  <input
                    type="number"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder={t('inventory.cost_price_placeholder') || 'Enter cost price'}
                    className="form-input"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('inventory.supplier') || 'Supplier'}</label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder={t('inventory.supplier_placeholder') || 'Enter supplier ID'}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>{t('inventory.min_stock') || 'Minimum Stock Alert'} *</label>
                  <input
                    type="number"
                    name="minStockAlert"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    placeholder={t('inventory.min_stock_placeholder') || 'Enter minimum stock'}
                    className="form-input"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                  className="btn-secondary"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={16} />
                  {selectedItem ? (t('common.update') || 'Update') : (t('common.create') || 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {showStockModal && selectedItem && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {t('inventory.update_stock') || 'Update Stock'} - {selectedItem.name}
              </h2>
              <button onClick={() => { setShowStockModal(false); setSelectedItem(null); }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleStockSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>{t('inventory.stock_amount') || 'Stock Amount'} *</label>
                  <input
                    type="number"
                    name="amount"
                    value={stockUpdateData.amount}
                    onChange={(e) => setStockUpdateData({ ...stockUpdateData, amount: e.target.value })}
                    placeholder={t('inventory.stock_amount_placeholder') || 'Enter amount'}
                    className="form-input"
                    step="1"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('inventory.update_type') || 'Update Type'} *</label>
                  <select
                    name="type"
                    value={stockUpdateData.type}
                    onChange={(e) => setStockUpdateData({ ...stockUpdateData, type: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="addition">{t('inventory.stock_addition') || 'Addition'}</option>
                    <option value="deduction">{t('inventory.stock_deduction') || 'Deduction'}</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => { setShowStockModal(false); setStockUpdateData({ amount: '', type: 'addition' }); }}
                  className="btn-secondary"
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button type="submit" className="btn-primary">
                  <Package size={16} />
                  {t('inventory.update_stock') || 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
