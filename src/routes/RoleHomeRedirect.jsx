import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RoleHomeRedirect() {
  const { role } = useAuth();

  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'manager') return <Navigate to="/manager" replace />;
  if (role === 'cashier') return <Navigate to="/cashier" replace />;
  if (role === 'reception') return <Navigate to="/reception" replace />;

  return <Navigate to="/" replace />;
}
