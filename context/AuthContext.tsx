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
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    school?: string;
    grade?: string;
  }) => Promise<User>;
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
      const userData = await getCurrentUser();

      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
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
    setLoading(false);
  };

  useEffect(() => {
    // Skip initial auth check if we're on the auth page
    if (typeof window !== "undefined" && window.location.pathname === "/auth") {
      setLoading(false);
      return;
    }
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

      if (!response || !response.data) {
        console.error("AuthContext: Invalid login response", response);
        throw new Error("Invalid login response format");
      }

      console.log("AuthContext: Setting user data:", response.data);
      setUser(response.data);
      setIsAuthenticated(true);

      return response.data; // Return the user data for the calling component
    } catch (error) {
      console.error("AuthContext: Login failed:", error);
      // Clear any partial authentication state that might have been set
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    school?: string;
    grade?: string;
  }) => {
    try {
      console.log("AuthContext: Attempting registration for:", userData.email);

      const response = await registerUser(userData);
      console.log("AuthContext: Registration response:", response);

      if (!response || !response.data) {
        console.error("AuthContext: Invalid registration response", response);
        throw new Error("Invalid registration response format");
      }

      console.log(
        "AuthContext: Setting user data after registration:",
        response.data
      );
      setUser(response.data);
      setIsAuthenticated(true);

      return response.data; // Return the user data for the calling component
    } catch (error) {
      console.error("AuthContext: Registration failed:", error);
      // Clear any partial authentication state that might have been set
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log("AuthContext: Initiating logout");

      // First clear the local state before the API call
      // This ensures the UI updates immediately even if the API call is slow
      setUser(null);
      setIsAuthenticated(false);

      // Then call the API to complete the server-side logout
      await logoutUser();
      console.log("AuthContext: Logout successful");
    } catch (error) {
      console.error("AuthContext: Logout failed:", error);
      // Even if the logout API call fails, we've already cleared the local state
      // No need to do anything else here
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
