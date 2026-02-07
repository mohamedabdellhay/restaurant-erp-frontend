import React from "react";
import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Users,
  LayoutDashboard,
  UtensilsCrossed,
  SquareMenu,
  ChefHat,
  ShoppingCart,
  Receipt,
  Package,
  ChevronLeft,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRestaurant } from "../hooks/useRestaurant";
import { useTranslation } from "react-i18next";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuth();
  const { getRestaurantName, getThemeColors } = useRestaurant();
  const { t, i18n } = useTranslation();

  // Debug logging
  console.log("Sidebar - themeColors:", getThemeColors());

  const menuItems = [
    { name: t("nav.dashboard"), icon: LayoutDashboard, path: "/dashboard" },
    { name: t("nav.orders"), icon: ShoppingCart, path: "/orders" },
    { name: t("nav.menu"), icon: SquareMenu, path: "/menu" },
    { name: t("nav.tables"), icon: UtensilsCrossed, path: "/tables" },
    { name: t("nav.staff"), icon: Users, path: "/staff" },
    { name: t("nav.inventory"), icon: Package, path: "/inventory" },
    { name: t("nav.invoices"), icon: Receipt, path: "/invoices" },
    { name: t("nav.reports"), icon: BarChart3, path: "/reports" },
    { name: t("nav.settings"), icon: Settings, path: "/settings" },
  ];

  const isRTL = i18n.dir() === "rtl";

  return (
    <aside
      className={`sidebar ${!isOpen ? "collapsed" : ""} ${isRTL ? "rtl" : ""}`}
    >
      <div className="sidebar-header">
        {isOpen && (
          <div className="logo-text">
            {getThemeColors().logo ? (
              <img
                src={getThemeColors().logo}
                alt="Restaurant Logo"
                className="sidebar-logo"
                onError={(e) => {
                  console.error(
                    "Sidebar logo failed to load:",
                    getThemeColors().logo,
                  );
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <>
                <span className="restaurant-name">{getRestaurantName()}</span>
                <span>ERP</span>
              </>
            )}
          </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className="toggle-btn">
          <ChevronLeft size={20} className={!isOpen ? "rotate" : ""} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <item.icon size={22} />
            {isOpen && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className="nav-link">
          <Settings size={22} />
          {isOpen && <span>{t("nav.settings")}</span>}
        </NavLink>
        <button onClick={logout} className="nav-link logout-btn">
          <LogOut size={22} />
          {isOpen && <span>{t("nav.logout")}</span>}
        </button>
      </div>

      <style>{`
        .sidebar {
          width: 260px;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          transition: width var(--transition-normal);
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          z-index: 100;
        }

        .sidebar.collapsed {
          width: 80px;
        }

        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
          height: 70px;
        }

        .logo-text {
          font-weight: 800;
          font-size: 1.25rem;
          letter-spacing: -0.5px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sidebar-logo {
          height: 32px;
          max-width: 100px;
          object-fit: contain;
          border-radius: var(--radius-sm);
        }

        .logo-text span {
          color: var(--primary);
        }

        .toggle-btn {
          color: var(--text-secondary);
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          transition: background 0.2s;
        }

        .toggle-btn:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .toggle-btn .rotate {
          transform: rotate(180deg);
        }

        .sidebar-nav {
          padding: 1.5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .nav-link {
          display: flex;
          align-items: center;
          padding: 0.875rem 1.5rem;
          color: var(--text-secondary);
          gap: 1rem;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }

        [dir='rtl'] .nav-link {
          border-left: none;
          border-right: 3px solid transparent;
        }

        .sidebar.collapsed .nav-link {
          justify-content: center;
          padding: 0.875rem;
        }

        .nav-link:hover {
          background: rgba(245, 158, 11, 0.05);
          color: var(--primary);
        }

        .nav-link.active {
          background: rgba(245, 158, 11, 0.1);
          color: var(--primary);
          border-left-color: var(--primary);
        }
        
        [dir='rtl'] .nav-link.active {
          border-left-color: transparent;
          border-right-color: var(--primary);
        }

        .sidebar-footer {
          padding: 1.5rem 0;
          border-top: 1px solid var(--border-color);
        }

        .logout-btn {
          width: 100%;
          text-align: left;
        }

        .logout-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
