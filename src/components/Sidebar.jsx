import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, Users, Bot, BarChart2, Settings, Zap, 
  Activity, LogOut, LayoutTemplate, Send, MessageSquare, Mail, PenTool 
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();

  // --- MENU ITEMS DEFINITION ---
  
  // 1. Admin Menu
  const adminItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'Customers', path: '/admin/customers' },
    { icon: Activity, label: 'System Logs', path: '/admin/logs' },
    { icon: BarChart2, label: 'Analytics', path: '/admin/analytics' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  // 2. User/Client Menu (🔥 Added Templates & Broadcast)
  const userItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/user/dashboard' },
    { icon: Mail, label: 'Inbox', path: '/user/inbox' },
    { icon: Bot, label: 'Bot Config', path: '/user/my-bot' },
    { icon: LayoutTemplate, label: 'Templates', path: '/user/templates' }, // ✅ NEW
    { icon: Send, label: 'Broadcast', path: '/user/broadcast' }, // ✅ NEW
    { icon: PenTool, label: 'Tools', path: '/user/tools' },
    { icon: Settings, label: 'Settings', path: '/user/settings' },
  ];

  // Role එක අනුව පෙන්නන්න ඕන ලිස්ට් එක තෝරාගැනීම
  const menuItems = role === 'admin' ? adminItems : userItems;

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <div className="fixed left-4 top-4 bottom-4 w-20 lg:w-64 rounded-3xl flex flex-col p-4 z-50 glass-sidebar shadow-2xl shadow-black/50 transition-all duration-300 bg-[#0f172a]/90 backdrop-blur-xl border border-white/5">
      
      {/* Brand Logo */}
      <div className="flex items-center gap-3 px-2 mb-10 mt-2">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25">
          <Zap className="text-white" fill="white" size={20} />
        </div>
        <h1 className="text-xl font-bold tracking-wide hidden lg:block text-white">
          Smart<span className="text-blue-500">Reply</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white' 
              }`
            }
          >
            <item.icon size={22} strokeWidth={1.5} />
            <span className="font-medium hidden lg:block">{item.label}</span>
            
            {/* Active Indicator Strip */}
            {/* <div className={`absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} /> */}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto space-y-4 pt-4 border-t border-white/5">
        
        {/* Pro Plan Card (Only for User Role) */}
        {role !== 'admin' && (
          <div className="p-4 rounded-2xl hidden lg:block relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 group">
            <div className="relative z-10">
              <h4 className="font-bold text-sm mb-1 text-white group-hover:text-blue-400 transition">Pro Plan</h4>
              <p className="text-xs text-slate-400 mb-3">Unlock AI Features</p>
              <button className="w-full py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg transition-colors border border-blue-500/20">
                Upgrade Now
              </button>
            </div>
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/10 blur-xl rounded-full group-hover:bg-blue-500/20 transition duration-500"></div>
          </div>
        )}

        {/* LOGOUT BUTTON */}
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-300 group"
        >
          <LogOut size={22} strokeWidth={1.5} />
          <span className="font-medium hidden lg:block">Logout</span>
        </button>
      </div>

    </div>
  );
};

export default Sidebar;