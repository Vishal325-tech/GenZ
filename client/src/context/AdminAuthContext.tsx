import React, { createContext, useContext, useEffect, useState } from 'react';

const getApiBase = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (url.endsWith('/api')) return url;
  if (url.endsWith('/api/')) return url.slice(0, -1);
  return `${url}/api`;
};
const API_BASE = getApiBase();


export interface AdminUserType {
  _id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin' | 'manager' | 'editor' | 'delivery' | 'support';
}

interface AdminAuthContextType {
  adminUser: AdminUserType | null;
  adminToken: string | null;
  adminLoading: boolean;
  adminLogin: (email: string, password: string) => Promise<AdminUserType>;
  adminLogout: () => void;
  refreshAdminProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUserType | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(() => localStorage.getItem('royal_admin_token'));
  const [adminLoading, setAdminLoading] = useState(true);

  const refreshAdminProfile = async () => {
    if (!adminToken) {
      setAdminUser(null);
      setAdminLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        // Verify role is admin
        const adminRoles = ['superadmin', 'admin', 'manager', 'editor', 'delivery', 'support'];
        if (adminRoles.includes(data.role)) {
          setAdminUser(data);
        } else {
          adminLogout(); // Not an admin
        }
      } else {
        adminLogout();
      }
    } catch (error) {
      console.error('Failed to load admin profile:', error);
      adminLogout();
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    refreshAdminProfile();
  }, [adminToken]);

  const adminLogin = async (email: string, password: string): Promise<AdminUserType> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    const adminRoles = ['superadmin', 'admin', 'manager', 'editor', 'delivery', 'support'];
    if (!adminRoles.includes(data.role)) {
      throw new Error('This account does not have admin privileges.');
    }

    localStorage.setItem('royal_admin_token', data.token);
    setAdminToken(data.token);
    setAdminUser(data);
    return data;
  };

  const adminLogout = () => {
    localStorage.removeItem('royal_admin_token');
    setAdminToken(null);
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{
      adminUser,
      adminToken,
      adminLoading,
      adminLogin,
      adminLogout,
      refreshAdminProfile
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  return context;
};
