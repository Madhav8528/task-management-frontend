"use client";

import { createContext, useState, useEffect } from "react";
import api from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const response = await api.get("/api/v1/user/refresh-access-token");
        if (response.data.data) {
          setUser(response.data.data);
        }
      } catch (err) {
        console.log("Not authenticated");
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await api.post("/api/v1/user/login", {
        email,
        password,
      });
      setUser(response.data.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      throw err;
    }
  };

  const adminLogin = async (email, password) => {
    try {
      setError(null);
      const response = await api.post("/api/v1/admin/login", {
        email,
        password,
      });
      setUser(response.data.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Admin login failed");
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post("/api/v1/user/register", userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      throw err;
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      setError(null);
      const response = await api.post("/api/v1/user/register", { email, otp });
      setUser(response.data.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/v1/user/logout");
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError(null);
      const response = await api.post("/api/v1/user/forgot-password", {
        email,
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send recovery email");
      throw err;
    }
  };

  const resetPassword = async (token, password, confirmPassword) => {
    try {
      setError(null);
      const response = await api.post(`/api/v1/user/reset-password/${token}`, {
        password,
        confirmPassword,
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed");
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        adminLogin,
        register,
        verifyOtp,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
