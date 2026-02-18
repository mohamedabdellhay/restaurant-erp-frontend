import React, { useState, useEffect, useCallback } from "react";
import "./Menu.css";
import { useTranslation } from "react-i18next";
import { useRestaurant } from "@hooks/useRestaurant";
import { useAuth } from "@hooks/useAuth";
import { RoleBasedUI } from "@utils/roleUtils";
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
import menuService from "@services/menuService";
import categoryService from "@services/categoryService";
import uploadService from "@services/uploadService";

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

  const fetchMenuItems = useCallback(async () => {
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
  }, [filterCategory]);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAll();
      setCategories(response.data || response || []);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, [fetchMenuItems]);

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
      </div>
    </div>
  );
};

export default Menu;
