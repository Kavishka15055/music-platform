'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'student' | 'teacher' | 'admin';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  qualifications?: string;
  teachingExperience?: string;
  bio?: string;
  profileImageUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerStudent: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  registerTeacher: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    qualifications: string;
    teachingExperience: string;
    bio?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        return { success: false, message: error.message || 'Login failed' };
      }

      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }, []);

  const registerStudent = useCallback(async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => {
    try {
      const res = await fetch(`${API_BASE}/v1/auth/register/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        return { success: false, message: error.message || 'Registration failed' };
      }

      const result = await res.json();
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }, []);

  const registerTeacher = useCallback(async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    qualifications: string;
    teachingExperience: string;
    bio?: string;
  }) => {
    try {
      const res = await fetch(`${API_BASE}/v1/auth/register/teacher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        return { success: false, message: error.message || 'Registration failed' };
      }

      const result = await res.json();
      return { success: true, message: result.message };
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerStudent, registerTeacher, logout }}>
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
