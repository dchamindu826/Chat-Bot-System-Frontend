import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import BotBuilder from './pages/admin/BotBuilder';
import Customers from './pages/admin/Customers';

// Protected Route Component... (මේ කෑල්ල වෙනසක් නෑ)
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/login" replace />;
  
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <ProtectedRoute allowedRole="admin">
             <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="customers" element={<Customers />} />
                
                {/* 👇 මෙන්න මේ Line එක වෙනස් කරන්න (/:id එකතු කරන්න) */}
                <Route path="bot-builder/:id" element={<BotBuilder />} />

             </Routes>
          </ProtectedRoute>
        } />

        {/* User Routes */}
        <Route path="/user/*" element={
          <ProtectedRoute allowedRole="user">
             <AdminDashboard /> 
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;