import React, { createContext, useContext, useMemo, useState } from 'react';
import { AuthService } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  const token = localStorage.getItem('token');

  const login = async ({ username, password }) => {
    const data = await AuthService.login({ username, password });
    // expected: { token, user: { id, username, role } }
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    token,
    isAuthed: Boolean(token && user),
    role: user?.role || null,
    login,
    logout
  }), [user, token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
