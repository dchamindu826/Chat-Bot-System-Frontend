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

// User Imports
import UserDashboard from './pages/user/UserDashboard';
import UserInbox from './pages/user/UserInbox';
import UserBotConfig from './pages/user/UserBotConfig';
import UserTools from './pages/user/UserTools';
import UserSettings from './pages/user/UserSettings';
import UserTeam from './pages/user/UserTeam';
import UserAgentDash from './pages/user/UserAgentDash';

// ✅ ProtectedRoute එක Update කළා (Array support කරන්න)
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;

  // Role එක Array එකක්ද කියලා බලලා check කරනවා
  if (Array.isArray(allowedRole)) {
    if (!allowedRole.includes(role)) return <Navigate to="/login" replace />;
  } else {
    if (allowedRole && role !== allowedRole) return <Navigate to="/login" replace />;
  }
  
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
                <Route path="bot-builder/:id" element={<BotBuilder />} />
                <Route path="logs" element={<SystemLogs />} />
                <Route path="inbox/:clientId" element={<Inbox />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
             </Routes>
          </ProtectedRoute>
        } />

        {/* User & Agent Routes */}
        <Route path="/user/*" element={
          // ✅ මෙතන තමයි වෙනස: 'user' සහ 'agent' දෙන්නටම අවසර දුන්නා
          <ProtectedRoute allowedRole={['user', 'agent']}> 
              <Routes>
                 <Route path="dashboard" element={<UserDashboard />} />
                 <Route path="inbox" element={<UserInbox />} />
                 <Route path="team" element={<UserTeam />} />
                 <Route path="my-bot" element={<UserBotConfig />} />
                 <Route path="tools" element={<UserTools />} />
                 
                 {/* ✅ Agent Dashboard Route එක */}
                 <Route path="agent-dashboard" element={<UserAgentDash />} />
                 
                 <Route path="settings" element={<UserSettings />} />
              </Routes>
          </ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;