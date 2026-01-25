
import React, { createContext, useContext, useState } from 'react';
import { ADMIN_USER, ADMIN_PASS } from '../constants';

interface AuthContextType {
  isAdmin: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('jx4_admin_logged') === 'true';
  });

  const login = (user: string, pass: string) => {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      setIsAdmin(true);
      localStorage.setItem('jx4_admin_logged', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('jx4_admin_logged');
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
