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
} from "lucide-react";

const Settings = () => {
  const { getRestaurantData, getRestaurantId } = useRestaurant();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Initialize form with restaurant data
  const restaurantData = getRestaurantData();
  const [formData, setFormData] = useState(restaurantData);

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
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        theme: {
          ...prev.settings.theme,
          [colorType]: value,
        },
      },
    }));
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
            <DollarSign size={20} /> Financial Settings
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Tax Percentage (%)</label>
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
              <label>Service Charge Percentage (%)</label>
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
            <Palette size={20} /> Theme Settings
          </h2>
          <div className="theme-settings">
            <div className="color-inputs">
              <div className="form-group">
                <label>Primary Color</label>
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
                <label>Secondary Color</label>
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
                <label>Accent Color</label>
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
            <div className="theme-preview">
              <h3>Theme Preview</h3>
              <div className="preview-colors">
                <div
                  className="preview-card primary"
                  style={{
                    backgroundColor: formData.settings.theme.primaryColor,
                  }}
                >
                  Primary
                </div>
                <div
                  className="preview-card secondary"
                  style={{
                    backgroundColor: formData.settings.theme.secondaryColor,
                  }}
                >
                  Secondary
                </div>
                <div
                  className="preview-card accent"
                  style={{
                    backgroundColor: formData.settings.theme.accentColor,
                  }}
                >
                  Accent
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="settings-section">
          <h2>
            <Clock size={20} /> Opening Hours
          </h2>
          <div className="form-grid">
            {days.map((day) => (
              <div key={day} className="form-group">
                <label className="capitalize">{day}</label>
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
            <Share2 size={20} /> Social Media
          </h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Facebook</label>
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
              <label>Instagram</label>
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
              <label>Twitter</label>
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
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Settings
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
