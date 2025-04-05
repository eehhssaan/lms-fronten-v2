"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { registerUser, loginUser, logoutUser, getCurrentUser } from "@/lib/api";
import { isAuthenticated as checkAuth } from "@/lib/auth";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    role?: "student" | "teacher" | "admin";
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      console.log("AuthContext: Attempting to fetch current user data");
      const userData = await getCurrentUser();
      console.log("AuthContext: User data retrieved successfully:", userData);

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
        console.log("AuthContext: User state updated:", {
          userData,
          isAuthenticated: true,
        });
      } else {
        console.log("AuthContext: No user data received");
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("AuthContext: Failed to fetch user:", error);
      setUser(null);
      setIsAuthenticated(false);
    }
    console.log("AuthContext: Setting loading to false");
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      console.log(
        "AuthContext: Attempting login with email:",
        credentials.email
      );
      const response = await loginUser(credentials);
      console.log("AuthContext: Login response received:", response);

      if (response.user) {
        console.log("AuthContext: Setting user data:", response.user);
        setUser(response.user);
        setIsAuthenticated(true);
      } else {
        console.error("AuthContext: No user data in login response");
        throw new Error("Invalid login response format");
      }
    } catch (error) {
      console.error("AuthContext: Login failed:", error);
      throw error;
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    role?: "student" | "teacher" | "admin";
  }) => {
    try {
      console.log(
        "AuthContext: Attempting registration for:",
        userData.username
      );
      const response = await registerUser(userData);
      console.log("AuthContext: Registration response:", response);

      if (response.data) {
        setUser(response.data);
        setIsAuthenticated(true);
      } else {
        throw new Error("Invalid registration response format");
      }
    } catch (error) {
      console.error("AuthContext: Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("AuthContext: Initiating logout");
      await logoutUser();
      console.log("AuthContext: Logout successful");
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("AuthContext: Logout failed:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
