import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRestaurant } from "../hooks/useRestaurant";
import { useAuth } from "../context/AuthContext";
import { RoleBasedUI } from "../utils/roleUtils";
import {
  Utensils,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Filter,
  DollarSign,
  Image,
  CheckCircle,
  XCircle,
  ChefHat,
  Loader2,
} from "lucide-react";
import menuService from "../services/menuService";
import categoryService from "../services/categoryService";
import uploadService from "../services/uploadService";

const Menu = () => {
  const { t, i18n } = useTranslation();
  const { getThemeColors } = useRestaurant();
  const { user } = useAuth();

  // Get theme colors for dynamic styling
  const themeColors = getThemeColors();
  const primaryColor = themeColors.primary || "#f59e0b";

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Image upload state
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    isActive: true,
    image: "",
    recipe: [],
    modifiers: [],
  });

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, [filterCategory]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const categoryId = filterCategory === "all" ? null : filterCategory;
      const response = await menuService.getAll(categoryId);
      setMenuItems(response.data || response || []);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to fetch menu items",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data || response || []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  // Category CRUD operations
  const handleCreateCategory = async (categoryData) => {
    try {
      await categoryService.create(categoryData);
      setMessage({ type: "success", text: "Category created successfully!" });
      fetchCategories();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to create category",
      });
    }
  };

  const handleUpdateCategory = async (id, categoryData) => {
    try {
      await categoryService.update(id, categoryData);
      setMessage({ type: "success", text: "Category updated successfully!" });
      fetchCategories();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update category",
      });
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm(t("menu.confirm_delete_category"))) {
      try {
        await categoryService.delete(id);
        setMessage({ type: "success", text: "Category deleted successfully!" });
        fetchCategories();
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Failed to delete category",
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
      };

      if (selectedItem) {
        await menuService.update(selectedItem._id, data);
        setMessage({
          type: "success",
          text: "Menu item updated successfully!",
        });
      } else {
        await menuService.create(data);
        setMessage({
          type: "success",
          text: "Menu item created successfully!",
        });
      }
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
      fetchMenuItems();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t("menu.confirm_delete"))) {
      try {
        await menuService.delete(id);
        setMessage({
          type: "success",
          text: "Menu item deleted successfully!",
        });
        fetchMenuItems();
      } catch (error) {
        setMessage({
          type: "error",
          text: error.response?.data?.message || "Delete failed",
        });
      }
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name || "",
      description: item.description || "",
      price: item.price?.toString() || "",
      category: item.category?._id || item.category || "",
      isActive: item.isActive !== false,
      image: item.image || "",
      recipe: item.recipe || [],
      modifiers: item.modifiers || [],
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      isActive: true,
      image: "",
      recipe: [],
      modifiers: [],
    });
    setSelectedItem(null);
  };

  const handleAddRecipeItem = () => {
    setFormData({
      ...formData,
      recipe: [...formData.recipe, { inventoryItem: "", qty: 1 }],
    });
  };

  const handleRemoveRecipeItem = (index) => {
    const newRecipe = formData.recipe.filter((_, i) => i !== index);
    setFormData({ ...formData, recipe: newRecipe });
  };

  const handleUpdateRecipeItem = (index, field, value) => {
    const newRecipe = formData.recipe.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setFormData({ ...formData, recipe: newRecipe });
  };

  const handleAddModifier = () => {
    setFormData({
      ...formData,
      modifiers: [...formData.modifiers, { name: "", price: 0 }],
    });
  };

  const handleRemoveModifier = (index) => {
    const newModifiers = formData.modifiers.filter((_, i) => i !== index);
    setFormData({ ...formData, modifiers: newModifiers });
  };

  const handleUpdateModifier = (index, field, value) => {
    const newModifiers = formData.modifiers.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setFormData({ ...formData, modifiers: newModifiers });
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setMessage({
        type: "error",
        text: t("menu.invalid_image_type"),
      });
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setMessage({
        type: "error",
        text: t("menu.image_too_large"),
      });
      return;
    }

    try {
      setUploadingImage(true);
      const response = await uploadService.uploadImage(file);

      if (response.success && response.data?.url) {
        setFormData({ ...formData, image: response.data.url });
        setMessage({
          type: "success",
          text: t("menu.image_uploaded"),
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || t("menu.image_upload_failed"),
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const activeItemsCount = menuItems.filter((item) => item.isActive).length;
  const inactiveItemsCount = menuItems.filter((item) => !item.isActive).length;

  return (
    <div className="menu-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>
            <Utensils size={28} />
            {t("menu.title")}
          </h1>
          <p>{t("menu.page_description")}</p>
        </div>
        <RoleBasedUI user={user} allowedRoles={["admin", "manager"]}>
          <div className="header-actions">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="btn-secondary"
            >
              <Filter size={20} />
              {t("menu.manage_categories")}
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="btn-primary"
            >
              <Plus size={20} />
              {t("menu.add_item")}
            </button>
          </div>
        </RoleBasedUI>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div
            className="stat-icon"
            style={{ background: `${primaryColor}20` }}
          >
            <Utensils style={{ color: primaryColor }} />
          </div>
          <div className="stat-content">
            <h3>{menuItems.length}</h3>
            <p>{t("menu.total_items")}</p>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon" style={{ background: "#22c55e20" }}>
            <CheckCircle style={{ color: "#22c55e" }} />
          </div>
          <div className="stat-content">
            <h3>{activeItemsCount}</h3>
            <p>{t("menu.active_items")}</p>
          </div>
        </div>
        <div className="stat-card inactive">
          <div className="stat-icon" style={{ background: "#ef444420" }}>
            <XCircle style={{ color: "#ef4444" }} />
          </div>
          <div className="stat-content">
            <h3>{inactiveItemsCount}</h3>
            <p>{t("menu.inactive_items")}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder={t("menu.search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterCategory === "all" ? "active" : ""}`}
            onClick={() => setFilterCategory("all")}
          >
            {t("menu.all_categories")}
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`filter-btn ${filterCategory === cat._id ? "active" : ""}`}
              onClick={() => setFilterCategory(cat._id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {/* Menu Items Grid */}
      {loading ? (
        <div className="loading">{t("common.loading")}</div>
      ) : filteredItems.length === 0 ? (
        <div className="no-data">{t("menu.no_items_found")}</div>
      ) : (
        <div className="menu-grid">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className={`menu-card ${!item.isActive ? "inactive" : ""}`}
            >
              <div className="menu-card-image">
                {item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <div className="placeholder-image">
                    <Image size={40} />
                  </div>
                )}
                {!item.isActive && (
                  <span className="inactive-badge">{t("menu.inactive")}</span>
                )}
              </div>
              <div className="menu-card-content">
                <div className="menu-card-header">
                  <h3>{item.name}</h3>
                  <span className="price">
                    <DollarSign size={14} />
                    {item.price?.toFixed(2)}
                  </span>
                </div>
                <p className="description">{item.description}</p>
                <div className="menu-card-meta">
                  <span className="category">
                    <ChefHat size={14} />
                    {item.category?.name || t("menu.uncategorized")}
                  </span>
                </div>
                <div className="menu-card-actions">
                  <RoleBasedUI user={user} allowedRoles={["admin", "manager"]}>
                    <button
                      onClick={() => handleEdit(item)}
                      className="btn-icon btn-edit"
                      title={t("common.edit")}
                    >
                      <Edit size={16} />
                    </button>
                  </RoleBasedUI>
                  <RoleBasedUI user={user} allowedRoles={["admin"]}>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="btn-icon btn-delete"
                      title={t("common.delete")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </RoleBasedUI>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>
                {showEditModal ? (
                  <>
                    <Edit size={20} />
                    {t("menu.edit_item")}
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    {t("menu.add_item")}
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

            <form onSubmit={handleSubmit} className="menu-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>{t("menu.name")} *</label>
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
                  <label>{t("menu.price")} *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("menu.category")}</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                  >
                    <option value="">{t("menu.select_category")}</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload */}
                <div className="form-group full-width">
                  <label>{t("menu.image")}</label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="image-file-input"
                    />
                    {uploadingImage && (
                      <div className="upload-loading">
                        <Loader2 size={20} className="spinner" />
                        <span>{t("menu.uploading")}</span>
                      </div>
                    )}
                    {formData.image && !uploadingImage && (
                      <div className="image-preview">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="preview-img"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, image: "" })
                          }
                          className="btn-remove-image"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>{t("menu.description")}</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows="3"
                />
              </div>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  {t("menu.is_active")}
                </label>
              </div>

              {/* Modifiers Section */}
              <div className="modifiers-section">
                <div className="section-header">
                  <label>{t("menu.modifiers")}</label>
                  <button
                    type="button"
                    onClick={handleAddModifier}
                    className="btn-small btn-secondary"
                  >
                    <Plus size={14} />
                    {t("menu.add_modifier")}
                  </button>
                </div>
                {formData.modifiers.map((modifier, index) => (
                  <div key={index} className="modifier-row">
                    <input
                      type="text"
                      placeholder={t("menu.modifier_name")}
                      value={modifier.name}
                      onChange={(e) =>
                        handleUpdateModifier(index, "name", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder={t("menu.modifier_price")}
                      value={modifier.price}
                      onChange={(e) =>
                        handleUpdateModifier(
                          index,
                          "price",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveModifier(index)}
                      className="btn-icon btn-delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
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

      {/* Category Management Modal */}
      {showCategoryModal && (
        <CategoryManagementModal
          categories={categories}
          onClose={() => setShowCategoryModal(false)}
          onCreate={handleCreateCategory}
          onUpdate={handleUpdateCategory}
          onDelete={handleDeleteCategory}
          t={t}
          user={user}
        />
      )}

      <style>{`
        .menu-page {
          padding: 2rem;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-content h1 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.875rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .header-content p {
          color: var(--text-secondary);
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
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
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
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
        }

        .stat-content h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .stat-content p {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .search-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-base);
          color: var(--text-primary);
          font-size: 1rem;
        }

        .search-box svg {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          border: 1px solid var(--border-color);
          background: var(--bg-base);
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn.active {
          background: ${primaryColor};
          color: white;
          border-color: ${primaryColor};
        }

        .message {
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
        }

        .message.success {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #86efac;
        }

        .message.error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .menu-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: all 0.2s;
        }

        .menu-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .menu-card.inactive {
          opacity: 0.7;
        }

        .menu-card-image {
          position: relative;
          height: 180px;
          background: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placeholder-image {
          color: var(--text-secondary);
        }

        .inactive-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.25rem 0.5rem;
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          border-radius: var(--radius-sm);
        }

        .menu-card-content {
          padding: 1rem;
        }

        .menu-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .menu-card-header h3 {
          font-weight: 600;
          color: var(--text-primary);
          flex: 1;
        }

        .price {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 700;
          color: ${primaryColor};
        }

        .description {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .menu-card-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .menu-card-meta .category {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .menu-card-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color);
        }

        .btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-edit {
          background: #e0e7ff;
          color: #4f46e5;
        }

        .btn-edit:hover {
          background: #c7d2fe;
        }

        .btn-delete {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-delete:hover {
          background: #fecaca;
        }

        .loading,
        .no-data {
          text-align: center;
          padding: 3rem;
          color: var(--text-secondary);
          font-size: 1.125rem;
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
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-large {
          max-width: 700px;
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
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .btn-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border: none;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border-radius: var(--radius-md);
          cursor: pointer;
        }

        .btn-close:hover {
          background: var(--border-color);
        }

        .menu-form {
          padding: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-base);
          color: var(--text-primary);
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: ${primaryColor};
          box-shadow: 0 0 0 3px ${primaryColor}20;
        }

        .checkbox-group {
          flex-direction: row;
          align-items: center;
          gap: 0.75rem;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: ${primaryColor};
        }

        .modifiers-section {
          margin: 1.5rem 0;
          padding: 1rem;
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-header label {
          font-weight: 600;
          color: var(--text-primary);
        }

        .btn-small {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
          background: var(--border-color);
        }

        .modifier-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
          align-items: center;
        }

        .modifier-row input {
          flex: 1;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
          margin-top: 1.5rem;
        }

        @media (max-width: 768px) {
          .menu-page {
            padding: 1rem;
          }

          .search-filter-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            min-width: auto;
          }

          .menu-grid {
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

// Category Management Modal Component
const CategoryManagementModal = ({
  categories,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  t,
  user,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
      onUpdate(editingCategory._id, { name: categoryName });
      setEditingCategory(null);
    } else {
      onCreate({ name: categoryName });
    }
    setCategoryName("");
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryName("");
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>
            <Filter size={20} />
            {t("menu.manage_categories")}
          </h2>
          <button onClick={onClose} className="btn-close">
            <X size={20} />
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <div className="category-modal-content">
          {/* Category Form */}
          <RoleBasedUI user={user} allowedRoles={["admin", "manager"]}>
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label>
                  {editingCategory
                    ? t("menu.edit_category")
                    : t("menu.new_category")}
                </label>
                <div className="category-input-row">
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder={t("menu.category_name_placeholder")}
                    required
                  />
                  {editingCategory ? (
                    <>
                      <button type="submit" className="btn-primary">
                        <Save size={16} />
                        {t("common.update")}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="btn-secondary"
                      >
                        <X size={16} />
                        {t("common.cancel")}
                      </button>
                    </>
                  ) : (
                    <button type="submit" className="btn-primary">
                      <Plus size={16} />
                      {t("common.add")}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </RoleBasedUI>

          {/* Categories List */}
          <div className="categories-list">
            <h3>{t("menu.existing_categories")}</h3>
            {categories.length === 0 ? (
              <p className="no-categories">{t("menu.no_categories")}</p>
            ) : (
              categories.map((category) => (
                <div key={category._id} className="category-item">
                  <span className="category-name">{category.name}</span>
                  <div className="category-actions">
                    <RoleBasedUI
                      user={user}
                      allowedRoles={["admin", "manager"]}
                    >
                      <button
                        onClick={() => handleEdit(category)}
                        className="btn-icon btn-edit"
                        title={t("common.edit")}
                      >
                        <Edit size={16} />
                      </button>
                    </RoleBasedUI>
                    <RoleBasedUI user={user} allowedRoles={["admin"]}>
                      <button
                        onClick={() => onDelete(category._id)}
                        className="btn-icon btn-delete"
                        title={t("common.delete")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </RoleBasedUI>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <style>{`
          .category-modal-content {
            padding: 1.5rem;
          }

          .category-form {
            margin-bottom: 2rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--border-color);
          }

          .category-input-row {
            display: flex;
            gap: 0.5rem;
          }

          .category-input-row input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            background: var(--bg-base);
            color: var(--text-primary);
          }

          .category-input-row button {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.75rem 1rem;
            border: none;
            border-radius: var(--radius-md);
            cursor: pointer;
            font-weight: 500;
          }

          .categories-list h3 {
            font-size: 1rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 1rem;
          }

          .no-categories {
            color: var(--text-secondary);
            font-style: italic;
          }

          .category-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background: var(--bg-secondary);
            border-radius: var(--radius-md);
            margin-bottom: 0.5rem;
          }

          .category-name {
            font-weight: 500;
            color: var(--text-primary);
          }

          .category-actions {
            display: flex;
            gap: 0.5rem;
          }

          /* Image Upload Styles */
          .image-upload-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .image-file-input {
            padding: 0.75rem;
            border: 2px dashed var(--border-color);
            border-radius: var(--radius-md);
            background: var(--bg-base);
            cursor: pointer;
            transition: all 0.2s;
          }

          .image-file-input:hover {
            border-color: var(--primary);
          }

          .upload-loading {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--primary);
          }

          .spinner {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .image-preview {
            position: relative;
            display: inline-block;
            max-width: 200px;
          }

          .preview-img {
            width: 100%;
            height: auto;
            border-radius: var(--radius-md);
            border: 1px solid var(--border-color);
          }

          .btn-remove-image {
            position: absolute;
            top: -8px;
            right: -8px;
            background: var(--danger);
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
          }

          .btn-remove-image:hover {
            background: #dc2626;
            transform: scale(1.1);
          }
        `}</style>
      </div>
    </div>
  );
};

export default Menu;
