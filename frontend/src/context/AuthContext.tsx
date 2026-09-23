import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi, demoApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  seedDemo: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('finstudent_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('finstudent_token');
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('finstudent_token');
      if (savedToken) {
        try {
          const res = await authApi.me();
          setUser(res.data);
          localStorage.setItem('finstudent_user', JSON.stringify(res.data));
        } catch (err) {
          // Token expired or invalid
          setToken(null);
          setUser(null);
          localStorage.removeItem('finstudent_token');
          localStorage.removeItem('finstudent_user');
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('finstudent_token', newToken);
    localStorage.setItem('finstudent_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('finstudent_token');
    localStorage.removeItem('finstudent_user');
  };

  const seedDemo = async () => {
    setIsLoading(true);
    try {
      const res = await demoApi.seed();
      login(res.data.access_token, res.data.user);
    } catch (err) {
      console.error('Failed to seed demo data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updated: User) => {
    setUser(updated);
    localStorage.setItem('finstudent_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        seedDemo,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
