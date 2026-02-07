import React, { useState, useEffect } from "react";
import { useRestaurant } from "../hooks/useRestaurant";
import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";
import restaurantService from "../services/restaurantService";
import {
  Save,
  Upload,
  Palette,
  Clock,
  Phone,
  Mail,
  Globe,
  DollarSign,
  Building,
  Hash,
  Share2,
  X,
  Check,
  Moon,
  Sun,
  RotateCcw,
} from "lucide-react";
import { presetThemes } from "../utils/demoTheme";

const Settings = () => {
  const { getRestaurantData, getRestaurantId } = useRestaurant();
  const { theme, toggleTheme, updateRestaurantSettings } = useTheme();
  const { t } = useTranslation();

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState("");

  // Initialize form with restaurant data
  const restaurantData = getRestaurantData();
  const [formData, setFormData] = useState(restaurantData);

  // Check if current theme matches any preset
  const getCurrentPresetTheme = () => {
    if (!formData.settings?.theme) return null;

    const currentTheme = formData.settings.theme;
    return presetThemes.findIndex(
      (preset) =>
        preset.theme.primaryColor === currentTheme.primaryColor &&
        preset.theme.secondaryColor === currentTheme.secondaryColor &&
        preset.theme.accentColor === currentTheme.accentColor,
    );
  };

  const currentPresetIndex = getCurrentPresetTheme();

  useEffect(() => {
    if (restaurantData?.settings?.theme?.logo) {
      setLogoPreview(restaurantData.settings.theme.logo);
    }
  }, [restaurantData]);

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleThemeColorChange = (colorType, value) => {
    const newSettings = {
      ...formData.settings,
      theme: {
        ...formData.settings.theme,
        [colorType]: value,
      },
    };

    setFormData((prev) => ({
      ...prev,
      settings: newSettings,
    }));

    // Live update the theme context
    updateRestaurantSettings(newSettings);
  };

  const handlePresetThemeSelect = (presetTheme) => {
    const newSettings = {
      ...formData.settings,
      theme: {
        ...formData.settings.theme,
        ...presetTheme.theme,
      },
    };

    setFormData((prev) => ({
      ...prev,
      settings: newSettings,
    }));

    // Live update the theme context
    updateRestaurantSettings(newSettings);
  };

  const handleResetToDefault = () => {
    const defaultTheme = {
      primaryColor: "#f59e0b",
      secondaryColor: "#6366f1",
      accentColor: "#10b981",
      mode: "light",
    };

    const newSettings = {
      ...formData.settings,
      theme: {
        ...formData.settings.theme,
        ...defaultTheme,
      },
    };

    setFormData((prev) => ({
      ...prev,
      settings: newSettings,
    }));

    // Live update the theme context
    updateRestaurantSettings(newSettings);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const restaurantId = getRestaurantId();

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: t("settings.invalid_file_type"),
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: t("settings.file_size_limit"),
      });
      return;
    }

    setUploadingLogo(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await restaurantService.uploadLogo(restaurantId, file);

      if (response.success || response.logo) {
        let newLogoUrl = response.logo || response.data?.logo;

        console.log("Backend returned logo URL:", newLogoUrl);

        // Clean up any malformed URLs with duplicate base URLs
        if (
          newLogoUrl &&
          newLogoUrl.includes("http://localhost:3000http://localhost:3000")
        ) {
          // Extract just the path part after all the duplicates
          const match = newLogoUrl.match(/\/uploads\/.*$/);
          if (match) {
            newLogoUrl = match[0];
            console.log("Cleaned malformed URL to:", newLogoUrl);
          }
        }

        // If URL is relative, construct full URL
        if (newLogoUrl && !newLogoUrl.startsWith("http")) {
          // If it starts with /, it's already a proper path from root
          if (newLogoUrl.startsWith("/")) {
            newLogoUrl = `http://localhost:3000${newLogoUrl}`;
          } else {
            // If it doesn't start with /, add both / and base URL
            newLogoUrl = `http://localhost:3000/${newLogoUrl}`;
          }
        }

        console.log("Final logo URL:", newLogoUrl);

        setLogoPreview(newLogoUrl);

        // Update form data with new logo
        setFormData((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            theme: {
              ...prev.settings.theme,
              logo: newLogoUrl,
            },
          },
        }));

        // Update local storage with new theme settings
        localStorage.setItem(
          "restaurantSettings",
          JSON.stringify({
            ...formData.settings,
            theme: {
              ...formData.settings.theme,
              logo: newLogoUrl,
            },
          }),
        );

        // Trigger theme update
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "restaurantSettings",
            newValue: JSON.stringify({
              ...formData.settings,
              theme: {
                ...formData.settings.theme,
                logo: newLogoUrl,
              },
            }),
          }),
        );

        setMessage({
          type: "success",
          text: t("settings.logo_uploaded_success"),
        });
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      } else {
        setMessage({
          type: "error",
          text: response.message || t("settings.upload_failed"),
        });
      }
    } catch (error) {
      console.error("Logo upload error:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || t("settings.upload_failed"),
      });
    } finally {
      setUploadingLogo(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const restaurantId = getRestaurantId();

    if (!restaurantId) {
      setMessage({
        type: "error",
        text: t("settings.restaurant_id_not_found"),
      });
      return;
    }

    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await restaurantService.updateRestaurant(
        restaurantId,
        formData,
      );

      if (response.success) {
        setMessage({ type: "success", text: t("settings.settings_updated") });

        // Update local storage with new theme settings
        localStorage.setItem(
          "restaurantSettings",
          JSON.stringify(formData.settings),
        );

        // Trigger theme update
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "restaurantSettings",
            newValue: JSON.stringify(formData.settings),
          }),
        );

        // Clear message after 3 seconds
        setTimeout(() => setMessage({ type: "", text: "" }), 3000);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || t("settings.update_failed"),
      });
    } finally {
      setSaving(false);
    }
  };

  const currencies = ["USD", "EUR", "GBP", "EGP", "SAR", "AED", "JOD", "LBP"];
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>{t("settings.title")}</h1>
        <p>{t("settings.subtitle")}</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.type === "success" ? <Check size={20} /> : <X size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="settings-form">
        {/* Basic Information */}
        <div className="settings-section">
          <h2>
            <Building size={20} /> {t("settings.basic_info")}
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label>{t("settings.restaurant_name")}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  handleInputChange(null, "name", e.target.value)
                }
                required
              />
            </div>
            <div className="form-group">
              <label>{t("settings.address")}</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  handleInputChange(null, "address", e.target.value)
                }
                required
              />
            </div>
            <div className="form-group">
              <label>
                <Phone size={16} /> {t("settings.phone")}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  handleInputChange(null, "phone", e.target.value)
                }
                required
              />
            </div>
            <div className="form-group">
              <label>
                <Mail size={16} /> {t("settings.email")}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  handleInputChange(null, "email", e.target.value)
                }
                required
              />
            </div>
            <div className="form-group">
              <label>
                <Globe size={16} /> {t("settings.website")}
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) =>
                  handleInputChange(null, "website", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>
                <DollarSign size={16} /> {t("settings.currency")}
              </label>
              <select
                value={formData.currency}
                onChange={(e) =>
                  handleInputChange(null, "currency", e.target.value)
                }
              >
                {currencies.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Business Details */}
        <div className="settings-section">
          <h2>
            <Hash size={20} /> {t("settings.business_details")}
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label>{t("settings.vat_number")}</label>
              <input
                type="text"
                value={formData.vatNumber}
                onChange={(e) =>
                  handleInputChange(null, "vatNumber", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>{t("settings.cr_number")}</label>
              <input
                type="text"
                value={formData.crNumber}
                onChange={(e) =>
                  handleInputChange(null, "crNumber", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Financial Settings */}
        <div className="settings-section">
          <h2>
            <DollarSign size={20} /> {t("settings.financial_settings")}
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label>{t("settings.tax_percent")}</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.settings.taxPercent}
                onChange={(e) =>
                  handleInputChange(
                    "settings",
                    "taxPercent",
                    parseFloat(e.target.value),
                  )
                }
              />
            </div>
            <div className="form-group">
              <label>{t("settings.service_charge_percent")}</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.settings.serviceChargePercent}
                onChange={(e) =>
                  handleInputChange(
                    "settings",
                    "serviceChargePercent",
                    parseFloat(e.target.value),
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="settings-section">
          <h2>
            <Palette size={20} /> {t("settings.theme_settings")}
          </h2>
          <div className="theme-settings">
            <div className="theme-upload-section">
              <div className="form-group">
                <label>{t("settings.logo")}</label>
                <div className="logo-upload-wrapper">
                  {/* Hidden file input - always present in DOM */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    id="logo-upload"
                    style={{ display: "none" }}
                  />

                  <div className="logo-preview-container">
                    {logoPreview ? (
                      <div className="logo-preview-with-controls">
                        <img
                          src={logoPreview}
                          alt="Restaurant Logo"
                          className="logo-preview-image"
                          onError={() => {
                            console.error("Logo preview failed:", logoPreview);
                            setLogoPreview("");
                          }}
                        />
                        <button
                          type="button"
                          className="remove-logo-btn"
                          onClick={() => {
                            setLogoPreview("");
                            setFormData((prev) => ({
                              ...prev,
                              settings: {
                                ...prev.settings,
                                theme: {
                                  ...prev.settings.theme,
                                  logo: "",
                                },
                              },
                            }));
                          }}
                          title={t("settings.remove_logo")}
                        >
                          <X size={16} />
                        </button>
                        <button
                          type="button"
                          className="change-logo-btn"
                          onClick={() =>
                            document.getElementById("logo-upload").click()
                          }
                        >
                          <Upload size={16} />
                          {t("settings.change_logo")}
                        </button>
                      </div>
                    ) : (
                      <div className="logo-upload-area">
                        <label
                          htmlFor="logo-upload"
                          className="upload-area-label"
                        >
                          <Upload size={48} className="upload-icon" />
                          <div className="upload-text">
                            <h4>{t("settings.upload_logo")}</h4>
                            <p>{t("settings.drag_drop")}</p>
                            <small>{t("settings.supported_formats")}</small>
                          </div>
                          <button
                            type="button"
                            className="upload-btn-secondary"
                          >
                            {t("settings.choose_file")}
                          </button>
                        </label>
                      </div>
                    )}

                    {uploadingLogo && (
                      <div className="upload-progress">
                        <div className="spinner-small"></div>
                        <span>{t("settings.uploading")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="theme-options">
              <div className="preset-themes">
                <h3>{t("settings.preset_themes")}</h3>
                <div className="presets-grid">
                  {presetThemes.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`preset-btn ${currentPresetIndex === index ? "active" : ""}`}
                      onClick={() => handlePresetThemeSelect(preset)}
                      title={preset.name}
                    >
                      <div
                        className="preset-preview"
                        style={{
                          background: `linear-gradient(135deg, ${preset.theme.primaryColor} 50%, ${preset.theme.secondaryColor} 50%)`,
                        }}
                      >
                        <div
                          className="preset-accent-dot"
                          style={{ backgroundColor: preset.theme.accentColor }}
                        ></div>
                        {currentPresetIndex === index && (
                          <div className="preset-selected-indicator">
                            <Check size={16} />
                          </div>
                        )}
                      </div>
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="color-inputs">
                <div className="form-group">
                  <label>{t("settings.primary_color")}</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={formData.settings.theme.primaryColor}
                      onChange={(e) =>
                        handleThemeColorChange("primaryColor", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      value={formData.settings.theme.primaryColor}
                      onChange={(e) =>
                        handleThemeColorChange("primaryColor", e.target.value)
                      }
                      placeholder="#3498db"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>{t("settings.secondary_color")}</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={formData.settings.theme.secondaryColor}
                      onChange={(e) =>
                        handleThemeColorChange("secondaryColor", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      value={formData.settings.theme.secondaryColor}
                      onChange={(e) =>
                        handleThemeColorChange("secondaryColor", e.target.value)
                      }
                      placeholder="#2ecc71"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>{t("settings.accent_color")}</label>
                  <div className="color-input-wrapper">
                    <input
                      type="color"
                      value={formData.settings.theme.accentColor}
                      onChange={(e) =>
                        handleThemeColorChange("accentColor", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      value={formData.settings.theme.accentColor}
                      onChange={(e) =>
                        handleThemeColorChange("accentColor", e.target.value)
                      }
                      placeholder="#e74c3c"
                    />
                  </div>
                </div>
              </div>

              <div className="advanced-theme-settings">
                <div className="form-group">
                  <label>{t("settings.appearance_mode")}</label>
                  <div className="mode-toggle-group">
                    <button
                      type="button"
                      className={`mode-btn ${theme === "light" ? "active" : ""}`}
                      onClick={() => theme !== "light" && toggleTheme()}
                    >
                      <Sun size={18} />
                      {t("settings.light_mode")}
                    </button>
                    <button
                      type="button"
                      className={`mode-btn ${theme === "dark" ? "active" : ""}`}
                      onClick={() => theme !== "dark" && toggleTheme()}
                    >
                      <Moon size={18} />
                      {t("settings.dark_mode")}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="reset-theme-btn"
                  onClick={handleResetToDefault}
                >
                  <RotateCcw size={16} />
                  {t("settings.reset_theme")}
                </button>
              </div>
            </div>

            <div className="theme-preview">
              <h3>{t("settings.theme_preview")}</h3>
              <div className="preview-colors">
                <div
                  className="preview-card primary"
                  style={{
                    backgroundColor: formData.settings.theme.primaryColor,
                  }}
                >
                  {t("settings.primary_color_desc")}
                </div>
                <div
                  className="preview-card secondary"
                  style={{
                    backgroundColor: formData.settings.theme.secondaryColor,
                  }}
                >
                  {t("settings.secondary_color_desc")}
                </div>
                <div
                  className="preview-card accent"
                  style={{
                    backgroundColor: formData.settings.theme.accentColor,
                  }}
                >
                  {t("settings.accent_color_desc")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="settings-section">
          <h2>
            <Clock size={20} /> {t("settings.opening_hours")}
          </h2>
          <div className="form-grid">
            {days.map((day) => (
              <div key={day} className="form-group">
                <label className="capitalize">{t(`settings.${day}`)}</label>
                <input
                  type="text"
                  placeholder="e.g., 9:00 AM - 10:00 PM"
                  value={formData.openingHours[day]}
                  onChange={(e) =>
                    handleInputChange("openingHours", day, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Social Media */}
        <div className="settings-section">
          <h2>
            <Share2 size={20} /> {t("settings.social_media")}
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label>{t("settings.facebook")}</label>
              <input
                type="url"
                placeholder="https://facebook.com/yourrestaurant"
                value={formData.socialMedia.facebook}
                onChange={(e) =>
                  handleInputChange("socialMedia", "facebook", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>{t("settings.instagram")}</label>
              <input
                type="url"
                placeholder="https://instagram.com/yourrestaurant"
                value={formData.socialMedia.instagram}
                onChange={(e) =>
                  handleInputChange("socialMedia", "instagram", e.target.value)
                }
              />
            </div>
            <div className="form-group">
              <label>{t("settings.twitter")}</label>
              <input
                type="url"
                placeholder="https://twitter.com/yourrestaurant"
                value={formData.socialMedia.twitter}
                onChange={(e) =>
                  handleInputChange("socialMedia", "twitter", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="settings-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? (
              <>
                <div className="spinner"></div>
                {t("settings.saving")}
              </>
            ) : (
              <>
                <Save size={20} />
                {t("settings.save_settings")}
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .settings-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .settings-header {
          margin-bottom: 2rem;
        }

        .settings-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .settings-header p {
          color: var(--text-secondary);
          font-size: 1rem;
        }

        .message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .message.success {
          background: color-mix(in srgb, var(--accent) 10%, transparent);
          color: var(--accent);
          border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
        }

        .message.error {
          background: color-mix(in srgb, #ef4444 10%, transparent);
          color: #ef4444;
          border: 1px solid color-mix(in srgb, #ef4444 30%, transparent);
        }

        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .settings-section {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }

        .settings-section h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-group input,
        .form-group select {
          padding: 0.75rem 1rem;
          background: var(--input-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.875rem;
          transition: var(--transition-fast);
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent);
        }

        .theme-settings {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .theme-upload-section {
          grid-column: span 2;
        }

        .logo-upload-wrapper {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .logo-preview-container {
          position: relative;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .logo-preview-with-controls {
          position: relative;
          display: inline-block;
          padding: 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          transition: all var(--transition-normal);
        }

        .logo-preview-with-controls:hover {
          box-shadow: var(--shadow-lg);
          transform: translateY(-2px);
        }

        .logo-preview-image {
          object-fit: contain;
          border-radius: var(--radius-md);
          display: block;
        }

        .logo-upload-area {
          position: relative;
        }

        .logo-upload-area input[type="file"] {
          display: none;
        }

        .upload-area-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.25rem;
          padding: 3rem 2rem;
          border: 2px dashed var(--border-color);
          border-radius: var(--radius-lg);
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          cursor: pointer;
          transition: all var(--transition-normal);
          min-height: 220px;
          position: relative;
          overflow: hidden;
        }

        [data-theme="dark"] .upload-area-label {
          background: rgba(30, 41, 59, 0.5);
        }

        .upload-area-label::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: var(--radius-lg);
          padding: 2px;
          background: linear-gradient(135deg, transparent, var(--primary), transparent);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity var(--transition-normal);
        }

        .upload-area-label:hover {
          border-color: var(--primary);
          background: color-mix(in srgb, var(--primary) 8%, transparent);
          transform: scale(1.01);
          box-shadow: 0 8px 16px -4px color-mix(in srgb, var(--primary) 20%, transparent);
        }

        .upload-area-label:hover::before {
          opacity: 1;
        }

        .upload-icon {
          color: var(--text-muted);
          transition: all var(--transition-normal);
        }

        .upload-area-label:hover .upload-icon {
          color: var(--primary);
          transform: scale(1.1) rotate(5deg);
        }

        .upload-text {
          text-align: center;
          transition: all var(--transition-normal);
        }

        .upload-text h4 {
          margin: 0;
          color: var(--text-primary);
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .upload-text p {
          margin: 0.5rem 0 0.25rem;
          color: var(--text-secondary);
          font-size: 0.9375rem;
          font-weight: 500;
        }

        .upload-text small {
          color: var(--text-muted);
          font-size: 0.8125rem;
          display: block;
          margin-top: 0.25rem;
        }

        .upload-btn-secondary {
          padding: 0.875rem 2rem;
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all var(--transition-normal);
          box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--primary) 40%, transparent);
          position: relative;
          overflow: hidden;
        }

        .upload-btn-secondary::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        .upload-btn-secondary:hover::before {
          width: 300px;
          height: 300px;
        }

        .upload-btn-secondary:hover {
          background: var(--primary-focus);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px -4px color-mix(in srgb, var(--primary) 50%, transparent);
        }

        .upload-btn-secondary:active {
          transform: translateY(0);
        }

        .upload-progress {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: linear-gradient(
            90deg,
            color-mix(in srgb, var(--primary) 10%, transparent),
            color-mix(in srgb, var(--primary) 15%, transparent),
            color-mix(in srgb, var(--primary) 10%, transparent)
          );
          background-size: 200% 100%;
          border: 1px solid var(--primary);
          border-radius: var(--radius-md);
          color: var(--primary);
          font-weight: 600;
          animation: progressGradient 2s ease infinite, pulse 2s ease-in-out infinite;
          box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--primary) 25%, transparent);
        }

        @keyframes progressGradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }

        .remove-logo-btn {
          position: absolute;
          top: -0.5rem;
          right: -0.5rem;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-normal);
          box-shadow: 0 4px 12px -2px rgba(239, 68, 68, 0.4);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 10;
        }

        [dir='rtl'] .remove-logo-btn {
          right: auto;
          left: -0.5rem;
        }

        .remove-logo-btn:hover {
          background: #dc2626;
          transform: scale(1.15) rotate(90deg);
          box-shadow: 0 6px 16px -2px rgba(239, 68, 68, 0.5);
        }

        .remove-logo-btn:active {
          transform: scale(1.05) rotate(90deg);
        }

        .change-logo-btn {
          position: absolute;
          bottom: -0.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--primary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          padding: 0.625rem 1.25rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all var(--transition-normal);
          font-size: 0.875rem;
          font-weight: 600;
          box-shadow: 0 4px 12px -2px color-mix(in srgb, var(--primary) 40%, transparent);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          white-space: nowrap;
          direction: ltr;
        }

        [dir='rtl'] .change-logo-btn {
          direction: rtl;
        }

        .change-logo-btn:hover {
          background: var(--primary-focus);
          transform: translateX(-50%) translateY(-2px);
          box-shadow: 0 6px 16px -2px color-mix(in srgb, var(--primary) 50%, transparent);
        }

        .change-logo-btn:active {
          transform: translateX(-50%) translateY(0);
        }

        .upload-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .upload-controls input[type="file"] {
          display: none;
        }

        .upload-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--secondary);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .upload-btn:hover:not(:disabled) {
          background: var(--primary);
          transform: translateY(-1px);
        }

        .upload-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-small {
          width: 18px;
          height: 18px;
          border: 2.5px solid color-mix(in srgb, var(--primary) 30%, transparent);
          border-top: 2.5px solid var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .theme-options {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .preset-themes h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1rem;
        }

        .presets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
        }

        .preset-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .preset-btn:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .preset-btn.active {
          border-color: var(--primary);
          background: color-mix(in srgb, var(--primary) 5%, transparent);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px color-mix(in srgb, var(--primary) 20%, transparent);
        }

        .preset-btn.active span {
          color: var(--primary);
          font-weight: 600;
        }

        .preset-preview {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          position: relative;
          overflow: hidden;
          border: 2px solid white;
          box-shadow: 0 0 0 1px var(--border-color);
        }

        .preset-selected-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          color: var(--primary);
        }

        .preset-accent-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid white;
        }

        .preset-btn span {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .advanced-theme-settings {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px dashed var(--border-color);
        }

        .mode-toggle-group {
          display: flex;
          gap: 1rem;
        }

        .mode-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-normal);
        }

        .mode-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .mode-btn:not(.active):hover {
          border-color: var(--primary);
          color: var(--primary);
        }

        .reset-theme-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: transparent;
          color: var(--text-muted);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-normal);
          width: fit-content;
        }

        .reset-theme-btn:hover {
          color: #ef4444;
          border-color: #ef4444;
          background: color-mix(in srgb, #ef4444 5%, transparent);
        }

        .color-inputs {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .color-input-wrapper {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .color-input-wrapper input[type="color"] {
          width: 50px;
          height: 40px;
          border-radius: var(--radius-md);
          cursor: pointer;
        }

        .color-input-wrapper input[type="text"] {
          flex: 1;
        }

        .theme-preview {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .theme-preview h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .preview-colors {
          display: flex;
          gap: 1rem;
        }

        .preview-card {
          padding: 1rem;
          border-radius: var(--radius-md);
          color: white;
          text-align: center;
          font-weight: 500;
          min-width: 80px;
          font-size: 0.875rem;
        }

        .settings-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 1rem;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--primary);
          color: var(--primary-content);
          border: none;
          border-radius: var(--radius-md);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-fast);
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--primary-focus);
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid var(--primary-content);
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .capitalize {
          text-transform: capitalize;
        }

        @media (max-width: 768px) {
          .settings-page {
            padding: 1rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .theme-settings {
            grid-template-columns: 1fr;
          }

          .preview-colors {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default Settings;
