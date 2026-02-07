import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  const [restaurantSettings, setRestaurantSettings] = useState(() => {
    const settings = localStorage.getItem("restaurantSettings");
    return settings ? JSON.parse(settings) : null;
  });

  useEffect(() => {
    // Listen for storage changes (when user logs in)

    // Listen for storage changes (when user logs in)
    const handleStorageChange = (e) => {
      if (e.key === "restaurantSettings" && e.newValue) {
        setRestaurantSettings(JSON.parse(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);

    // Apply restaurant color scheme if available
    if (restaurantSettings?.theme) {
      const root = document.documentElement;
      const { primaryColor, secondaryColor, accentColor } =
        restaurantSettings.theme;

      // Apply custom colors as CSS variables
      root.style.setProperty("--restaurant-primary", primaryColor);
      root.style.setProperty("--restaurant-secondary", secondaryColor);
      root.style.setProperty("--restaurant-accent", accentColor);

      // Override default theme colors with restaurant colors
      root.style.setProperty("--primary", primaryColor);
      root.style.setProperty("--secondary", secondaryColor);
      root.style.setProperty("--accent", accentColor);
    }
  }, [theme, restaurantSettings]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const updateRestaurantSettings = (newSettings) => {
    setRestaurantSettings(newSettings);
    localStorage.setItem("restaurantSettings", JSON.stringify(newSettings));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        restaurantSettings,
        updateRestaurantSettings,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
