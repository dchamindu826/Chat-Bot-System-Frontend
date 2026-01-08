import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Bot, Settings, LogOut, 
  MessageSquare, Box, ShieldAlert, Zap, Bell, Search, User 
} from 'lucide-react';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const userRole = localStorage.getItem('role') || 'admin'; 
  const userName = localStorage.getItem('name') || (userRole === 'admin' ? 'Super Admin' : 'Business User');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const adminMenu = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'System Logs', path: '/admin/logs', icon: ShieldAlert },
    { name: 'Analytics', path: '/admin/analytics', icon: Zap },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  // ✅ "Team" Button එක එකතු කළා
  const userMenu = [
    { name: 'Overview', path: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Inbox (CRM)', path: '/user/inbox', icon: MessageSquare }, // නම පොඩ්ඩක් වෙනස් කළා
    { name: 'My Team', path: '/user/team', icon: Users }, // <--- New Team Button
    { name: 'My Bot', path: '/user/my-bot', icon: Bot },
    { name: 'Tools', path: '/user/tools', icon: Box },
    { name: 'Settings', path: '/user/settings', icon: Settings },
  ];

  const menuItems = userRole === 'admin' ? adminMenu : userMenu;

  return (
    <div className="min-h-screen relative bg-[#0b1121] text-white flex">
      <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse mix-blend-screen"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-1000 mix-blend-screen"></div>
      </div>

      <aside className="w-64 bg-[#0f172a]/80 backdrop-blur-xl border-r border-white/5 flex flex-col fixed h-full z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
             <Bot className="text-white" size={24}/>
          </div>
          <div>
             <h1 className="text-lg font-bold text-white tracking-tight leading-none">SmartReply</h1>
             <p className="text-[10px] text-slate-400 font-medium">CRM SYSTEM</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white transition-colors'} />
                <span className="font-medium text-sm">{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group">
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-6 relative z-10 min-w-0">
        <header className="h-20 mb-8 rounded-2xl flex items-center justify-between px-6 glass-panel border border-white/5 bg-[#1e293b]/50 backdrop-blur-md sticky top-6 z-40 shadow-xl shadow-black/20">
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input type="text" placeholder="Search anything..." className="w-full bg-black/20 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-black/40 transition-all"/>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-blue-400 transition-colors p-2 hover:bg-white/5 rounded-lg">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1e293b]"></span>
            </button>
            <div className="h-8 w-[1px] bg-white/10"></div>
            <div className="flex items-center gap-3 pl-2">
               <div className="text-right hidden md:block">
                  <p className="text-sm font-bold text-white leading-tight capitalize">{userName}</p>
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{userRole}</p>
               </div>
               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 p-[1px] shadow-lg">
                  <div className="w-full h-full rounded-[10px] bg-[#0f172a] flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
               </div>
            </div>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;