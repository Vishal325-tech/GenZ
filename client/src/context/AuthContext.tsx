import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserType {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'manager' | 'editor' | 'delivery';
  phone?: string;
  addressBook?: Array<{
    _id?: string;
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    isDefault?: boolean;
  }>;
  wishlist?: string[];
  savedCards?: Array<{
    cardId: string;
    cardNumber: string;
    expiryDate: string;
    cardHolder: string;
  }>;
  notifications?: Array<{
    _id?: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }>;
}

interface AuthContextType {
  user: UserType | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserType>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<UserType>;
  loginWithOTP: (email: string, otp: string) => Promise<UserType>;
  requestOTP: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (updateData: Partial<UserType>) => Promise<UserType>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('gift_movers_token'));
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Token expired or invalid
        logout();
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [token]);

  const login = async (email: string, password: string): Promise<UserType> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    localStorage.setItem('gift_movers_token', data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<UserType> => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    localStorage.setItem('gift_movers_token', data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const requestOTP = async (email: string): Promise<void> => {
    const res = await fetch('/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to request code');
    }
  };

  const loginWithOTP = async (email: string, otp: string): Promise<UserType> => {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Invalid code');

    localStorage.setItem('gift_movers_token', data.token);
    setToken(data.token);
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('gift_movers_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (updateData: Partial<UserType>): Promise<UserType> => {
    if (!token) throw new Error('Not authenticated');

    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update profile');

    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      requestOTP,
      loginWithOTP,
      logout,
      updateUser,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
