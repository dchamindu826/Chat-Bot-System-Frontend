import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { MessageSquare, Users, Zap, ArrowRight, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalMessages: 0, totalContacts: 0 });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/analytics/user-stats`, {
            headers: { token: `Bearer ${token}` }
        });
        const data = await res.json();
        if(res.ok) setStats(data);
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-gradient-to-r from-primary/10 to-secondary/10 relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome Back! 👋</h1>
                <p className="text-slate-400">Your AI Bot is active. Check your latest stats here.</p>
                <button onClick={() => navigate('/user/inbox')} className="mt-6 px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition flex items-center gap-2">
                    Go to Inbox <ArrowRight size={18}/>
                </button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5">
                <MessageSquare className="text-blue-500 mb-4" size={30} />
                <p className="text-slate-400 text-sm">Total Messages</p>
                <h3 className="text-3xl font-bold text-white">{stats.totalMessages}</h3>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5">
                <Users className="text-purple-500 mb-4" size={30} />
                <p className="text-slate-400 text-sm">Contacts Reached</p>
                <h3 className="text-3xl font-bold text-white">{stats.totalContacts}</h3>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-white/5">
                <TrendingUp className="text-emerald-500 mb-4" size={30} />
                <p className="text-slate-400 text-sm">Bot Efficiency</p>
                <h3 className="text-3xl font-bold text-white">100%</h3>
            </div>
        </div>
      </div>
    </MainLayout>
  );
};
export default UserDashboard;