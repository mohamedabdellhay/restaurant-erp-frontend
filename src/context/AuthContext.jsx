import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/auth/me");
      const staff = response.data.data;
      setUser(staff);
      localStorage.setItem("user", JSON.stringify(staff));
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  useEffect(() => {
    // Check for existing session/token on mount
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Apply restaurant settings if available
      const restaurantSettings =
        parsedUser.restaurantSettings ||
        JSON.parse(localStorage.getItem("restaurantSettings") || "null");
      if (restaurantSettings) {
        localStorage.setItem(
          "restaurantSettings",
          JSON.stringify(restaurantSettings),
        );
      }
    }

    if (token) {
      fetchProfile();
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { staff, accessToken, refreshToken, restaurantSettings } =
        response.data.data;

      const userData = {
        ...staff,
        restaurantSettings,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);

      // Store restaurant settings separately for theme context
      if (restaurantSettings) {
        localStorage.setItem(
          "restaurantSettings",
          JSON.stringify(restaurantSettings),
        );
      }

      return true;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.put("/auth/profile", data);
      const updatedUser = response.data.data;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { success: true, message: "Profile updated successfully" };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to update profile",
      };
    }
  };

  const changePassword = async (data) => {
    try {
      await api.put("/auth/change-password", data);
      return { success: true, message: "Password changed successfully" };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to change password",
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log(context);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
