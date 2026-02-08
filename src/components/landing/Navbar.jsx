import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Moon, Sun, Globe } from "lucide-react";

const Navbar = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
    document.dir = newLang === "ar" ? "rtl" : "ltr";
  };

  return (
    <nav className="fixed w-full z-50 bg-(--bg-base)/80 backdrop-blur-md border-b border-(--border-color) transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="text-3xl font-extrabold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-600">
                Restaurant
              </span>
              <span className="text-(--text-primary)">ERP</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-(--bg-card) text-(--text-secondary) hover:text-(--primary) transition-all"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            <button
              onClick={toggleLanguage}
              className="p-2.5 rounded-full hover:bg-(--bg-card) text-(--text-secondary) hover:text-(--primary) transition-all flex items-center gap-2 font-medium"
              aria-label="Toggle Language"
            >
              <Globe size={20} />
              <span className="text-sm">{i18n.language.toUpperCase()}</span>
            </button>

            <div className="h-6 w-px bg-(--border-color) mx-2 hidden sm:block"></div>

            {user ? (
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex btn-primary items-center px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-amber-500/20 text-sm"
              >
                {t("common.dashboard") || "Dashboard"}
              </Link>
            ) : (
              <a
                href="#pricing"
                className="hidden sm:inline-flex btn-primary items-center px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-amber-500/20 text-sm"
              >
                {t("landing.get_started") || "Get Started"}
              </a>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
