import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/config';

export interface AdminUser {
  username: string;
  name: string;
  role: string;
  lastLogin?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  adminUser: AdminUser | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (data: { currentPassword?: string; newPassword?: string; name?: string; username?: string }) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  adminUser: null,
  login: async () => ({ success: false }),
  logout: () => {},
  updateProfile: async () => ({ success: false })
});

const TOKEN_KEY = 'smart_parking_admin_token';
const USER_KEY = 'smart_parking_admin_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verify token on initial load
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await apiFetch<{ success: boolean; user: AdminUser }>('/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (res.success && res.user) {
          setAdminUser(res.user);
          setIsAuthenticated(true);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        } else {
          logout();
        }
      } catch (err) {
        console.warn('Session verification fallback to offline state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiFetch<{
        success: boolean;
        token: string;
        user: AdminUser;
        message?: string;
      }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });

      if (res.success && res.token) {
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        setAdminUser(res.user);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to authenticate admin credentials' };
    }
  };

  const logout = () => {
    try {
      apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    } catch {}
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAdminUser(null);
    setIsAuthenticated(false);
  };

  const updateProfile = async (data: { currentPassword?: string; newPassword?: string; name?: string; username?: string }) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await apiFetch<{
        success: boolean;
        message: string;
        user: AdminUser;
      }>('/auth/update-profile', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (res.success && res.user) {
        setAdminUser(res.user);
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        return { success: true, message: res.message };
      }

      return { success: false, message: res.message || 'Failed to update profile' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update profile' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        adminUser,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
