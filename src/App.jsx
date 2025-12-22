import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleHomeRedirect from './routes/RoleHomeRedirect';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

import AdminLayout from './layouts/AdminLayout';
import ManagerLayout from './layouts/ManagerLayout';
import CashierLayout from './layouts/CashierLayout';
// import ReceptionLayout from './layouts/ReceptionLayout';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import AdminReports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

// Manager pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import Categories from './pages/manager/Categories';
import Items from './pages/manager/Items';
import Tables from './pages/manager/Tables';
import ManagerReports from './pages/manager/Reports';
import Rooms from './pages/manager/Rooms';

// Cashier pages
import CashierDashboard from './pages/cashier/CashierDashboard';
import CashierPOS from './pages/cashier/POS';
import CashierOrders from './pages/cashier/Orders';

//Toast

import { Toaster } from 'react-hot-toast';






export default function App() {
  return (
<>

      <Toaster position="top-right" />

    <Routes>
      <Route path="/" element={<Login />} />
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

           {/* MANAGER */}
        <Route element={<ProtectedRoute roles={['manager', 'admin']} />}>
          <Route path="/manager" element={<ManagerLayout />}>
            <Route index element={<ManagerDashboard />} />
            <Route path="categories" element={<Categories />} />
            <Route path="items" element={<Items />} />
            <Route path="tables" element={<Tables />} />
            <Route path="reports" element={<ManagerReports />} />
            <Route path="rooms" element={<Rooms />} />
          </Route>
        </Route>

           {/* CASHIER */}
        <Route element={<ProtectedRoute roles={['cashier', 'manager', 'admin']} />}>
          <Route path="/cashier" element={<CashierLayout />}>
            <Route index element={<CashierDashboard />} />
            <Route path="pos" element={<CashierPOS />} />
            <Route path="orders" element={<CashierOrders />} />
          </Route>
        </Route>

      

  

      <Route path="*" element={<NotFound />} />
    </Routes>

</>
  );
}
