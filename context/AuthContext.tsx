'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser
} from '@/lib/api';
import { isAuthenticated as checkAuth } from '@/lib/auth';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'student' | 'teacher' | 'admin';
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
      console.log('AuthContext: Attempting to fetch current user data');
      const userData = await getCurrentUser();
      console.log('AuthContext: User data retrieved successfully', userData);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('AuthContext: Failed to fetch user:', error);
      setUser(null);
      setIsAuthenticated(false);
      
      // Only clear token if we're not on auth page (to avoid infinite redirects)
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth')) {
        console.log('AuthContext: Clearing invalid token');
        try {
          await logoutUser(); // Clear invalid token
        } catch (logoutError) {
          console.error('AuthContext: Error during automatic logout:', logoutError);
        }
      }
    }
    console.log('AuthContext: Setting loading to false');
    setLoading(false);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      console.log('AuthContext: Attempting login with email:', credentials.email);
      const response = await loginUser(credentials);
      console.log('AuthContext: Login successful, user data:', response.data);
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'student' | 'teacher' | 'admin';
  }) => {
    try {
      console.log('AuthContext: Attempting registration for:', userData.username);
      const response = await registerUser(userData);
      console.log('AuthContext: Registration successful, user data:', response.data);
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('AuthContext: Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Initiating logout');
      await logoutUser();
      console.log('AuthContext: Logout successful');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('AuthContext: Logout failed:', error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      if (isAuthenticated) {
        console.log('AuthContext: Refreshing user data');
        const userData = await getCurrentUser();
        console.log('AuthContext: User data refreshed successfully:', userData);
        setUser(userData);
      } else {
        console.log('AuthContext: Skip refreshing user - not authenticated');
      }
    } catch (error) {
      console.error('AuthContext: Failed to refresh user:', error);
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
