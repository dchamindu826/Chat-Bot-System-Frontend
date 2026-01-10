import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import BotBuilder from './pages/admin/BotBuilder';
import Customers from './pages/admin/Customers';
import Inbox from './pages/admin/Inbox'; 
import SystemLogs from './pages/admin/SystemLogs';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import Register from './pages/Register';
import { ThemeProvider } from './context/ThemeContext';

// User Imports
import UserDashboard from './pages/user/UserDashboard';
import UserInbox from './pages/user/UserInbox';
import UserBotConfig from './pages/user/UserBotConfig';
import UserTools from './pages/user/UserTools';
import UserSettings from './pages/user/UserSettings';
import UserTeam from './pages/user/UserTeam';
import UserAgentDash from './pages/user/UserAgentDash';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;

  if (Array.isArray(allowedRole)) {
    if (!allowedRole.includes(role)) return <Navigate to="/login" replace />;
  } else {
    if (allowedRole && role !== allowedRole) return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* --- ADMIN ROUTES --- */}
          <Route path="/admin/*" element={
            <ProtectedRoute allowedRole="admin">
               <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="customers" element={<Customers />} />
                  
                  {/* ✅ FIXED ROUTE: Removed '/admin' prefix because parent handles it */}
                  <Route path="bot-builder/:userId" element={<BotBuilder />} />
                  
                  <Route path="logs" element={<SystemLogs />} />
                  <Route path="inbox/:clientId" element={<Inbox />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<Settings />} />
               </Routes>
            </ProtectedRoute>
          } />

          {/* --- USER ROUTES --- */}
          <Route path="/user/*" element={
            <ProtectedRoute allowedRole={['user', 'agent']}> 
                <Routes>
                   <Route path="dashboard" element={<UserDashboard />} />
                   <Route path="inbox" element={<UserInbox />} />
                   <Route path="team" element={<UserTeam />} />
                   <Route path="my-bot" element={<UserBotConfig />} />
                   <Route path="tools" element={<UserTools />} />
                   <Route path="agent-dashboard" element={<UserAgentDash />} />
                   <Route path="settings" element={<UserSettings />} />
                </Routes>
            </ProtectedRoute>
          } />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;