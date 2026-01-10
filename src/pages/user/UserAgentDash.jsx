import React from 'react';
import UserInbox from './UserInbox'; 
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserAgentDash = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="h-screen flex flex-col bg-[#0f172a] text-white">
      {/* Simple Header for Agent */}
      <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#1e293b]">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold">A</div>
            <h1 className="font-bold text-lg">Agent Workspace</h1>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-bold bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 transition">
            <LogOut size={16}/> Logout
        </button>
      </div>

      {/* Inbox Takes Full Space */}
      <div className="flex-1 overflow-hidden p-4">
        <UserInbox /> 
      </div>
    </div>
  );
};

export default UserAgentDash;