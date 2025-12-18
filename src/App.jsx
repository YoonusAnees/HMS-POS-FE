import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleHomeRedirect from './routes/RoleHomeRedirect';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

import AdminLayout from './layouts/AdminLayout';
// import ManagerLayout from './layouts/ManagerLayout';
// import CashierLayout from './layouts/CashierLayout';
// import ReceptionLayout from './layouts/ReceptionLayout';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import AdminReports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';





export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute><RoleHomeRedirect /></ProtectedRoute>} />

      {/* ADMIN */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

      

  

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
