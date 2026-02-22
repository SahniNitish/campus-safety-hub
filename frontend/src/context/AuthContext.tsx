import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profile_photo?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { full_name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
        const response = await authAPI.getMe();
        setUser(response.data);
      }
    } catch (error) {
      console.log('Error loading auth:', error);
      await AsyncStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    const { token: newToken, user: userData } = response.data;
    await AsyncStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const signup = async (data: { full_name: string; email: string; phone: string; password: string }) => {
    const response = await authAPI.signup(data);
    const { token: newToken, user: userData } = response.data;
    await AsyncStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    const response = await authAPI.updateProfile(data);
    setUser(response.data);
  };

  const refreshUser = async () => {
    const response = await authAPI.getMe();
    setUser(response.data);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
