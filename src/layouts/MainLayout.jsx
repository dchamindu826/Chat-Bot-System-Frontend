import React from 'react';
import Sidebar from '../components/Sidebar';
import { Bell, Search, User } from 'lucide-react';

const MainLayout = ({ children }) => {
  // Role එක localStorage එකෙන් ගන්නවා (Admin ට විතරක් Pro Plan හංගන්න)
  const userRole = localStorage.getItem('role') || 'admin'; 

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0b1121] text-white">
      
      {/* Animated Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob mix-blend-screen"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-blob animation-delay-2000 mix-blend-screen"></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-blob animation-delay-4000 mix-blend-screen"></div>
      </div>

      {/* Sidebar - role එක pass කරනවා */}
      <Sidebar role={userRole} />
      
      {/* Main Content Area */}
      <div className="pl-24 lg:pl-72 pr-6 py-6 min-h-screen relative z-10">
        
        {/* Header */}
        <header className="h-20 mb-8 rounded-2xl flex items-center justify-between px-6 glass-panel transition-all duration-300">
          
          {/* Search Bar */}
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-transparent border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            <button className="relative text-slate-400 hover:text-primary transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span>
            </button>

            <div className="flex items-center gap-3 cursor-pointer pl-4 border-l border-white/10">
               <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-tr from-primary to-secondary text-white">
                  <User size={20} />
               </div>
               <div className="hidden md:block">
                  <p className="text-sm font-bold capitalize">{userRole === 'admin' ? 'Super Admin' : 'Business User'}</p>
                  <p className="text-xs text-slate-500">Administrator</p>
               </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        {children}
      </div>
    </div>
  );
};

export default MainLayout;