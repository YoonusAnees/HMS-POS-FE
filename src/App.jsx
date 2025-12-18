import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleHomeRedirect from './routes/RoleHomeRedirect';
import Login from './pages/Login';
import NotFound from './pages/NotFound';





export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

  

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
