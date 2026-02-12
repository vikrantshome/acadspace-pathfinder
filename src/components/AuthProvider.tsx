/**
 * AuthProvider - Global authentication state management
 * Handles user session, authentication state, and profile management
 * Updated to use Spring Boot backend instead of Supabase
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService, type User } from '@/lib/api';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isNlpSession: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  lookup: (studentID: string, mobileNo: string) => Promise<any>;
  signUp: (
    email: string, 
    password: string, 
    name: string, 
    fullName?: string,
    parentName?: string,
    schoolName?: string, 
    grade?: number, 
    board?: string,
    mobileNo?: string,
    city?: string,
    state?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNlpSession, setIsNlpSession] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      if (apiService.isAuthenticated()) {
        try {
          const userData = apiService.getCurrentUserFromStorage();
          setUser(userData);
          setIsNlpSession(apiService.isNlpLogin());
        } catch (error) {
          console.error('Error loading user data:', error);
          apiService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signIn = async (username: string, password: string) => {
    try {
      const response = await apiService.login(username, password);
      setUser(response.user);
      setIsNlpSession(false);
      toast.success('Logged in successfully');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const lookup = async (studentID: string, mobileNo: string) => {
    try {
      const response = await apiService.lookup(studentID, mobileNo);
      
      if (response.token && response.user) {
        setUser(response.user);
        setIsNlpSession(false);
        toast.success('Logged in successfully');
      }
      
      return response;
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
      throw error;
    }
  };

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    fullName?: string,
    parentName?: string,
    schoolName?: string, 
    grade?: number, 
    board?: string,
    mobileNo?: string,
    city?: string,
    state?: string
  ) => {
    try {
      const response = await apiService.register(
        email, 
        password, 
        name, 
        fullName,
        parentName,
        schoolName, 
        grade, 
        board,
        mobileNo,
        city,
        state
      );
      setUser(response.user);
      setIsNlpSession(false);
      toast.success('Account created successfully');
    } catch (error: any) {
      // Log full error object for debugging (Render logs / device logs)
      console.error('signUp error:', error);

      // Show exact server message when available (dev-friendly)
      const userMessage = error?.message || error?.toString() || 'Registration failed';
      toast.error(userMessage);

      throw error;
    }

  };

  const signOut = async () => {
    try {
      apiService.logout();
      setUser(null);
      setIsNlpSession(false);
      toast.success('Logged out successfully');
      window.location.href = 'https://www.naviksha.co.in/'; // Redirect after logout
    } catch (error: any) {
      toast.error('Error signing out');
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const updatedUser = await apiService.updateProfile(updates);
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const refreshProfile = async () => {
    try {
      const userData = await apiService.getCurrentUser();
      setUser(userData);
      setIsNlpSession(apiService.isNlpLogin());
      localStorage.setItem('user_data', JSON.stringify(userData));
    } catch (error: any) {
      console.error('Error refreshing profile:', error);
    }
  };

  const value = {
    user,
    loading,
    isNlpSession,
    signIn,
    lookup,
    signUp,
    signOut,
    updateProfile,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};