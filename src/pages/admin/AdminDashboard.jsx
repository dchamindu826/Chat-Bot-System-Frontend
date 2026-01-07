import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import StatCard from '../../components/StatCard';
import { Users, DollarSign, MessageCircle, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 6890 },
  { name: 'Sat', revenue: 4390 },
  { name: 'Sun', revenue: 7490 },
];

const AdminDashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Revenue" value="$45,231" icon={DollarSign} trend={12.5} colorClass="bg-emerald-500" />
          <StatCard title="Active Clients" value="1,203" icon={Users} trend={8.2} colorClass="bg-primary" />
          <StatCard title="Messages Sent" value="8.5M" icon={MessageCircle} trend={-2.4} colorClass="bg-secondary" />
          <StatCard title="System Health" value="99.9%" icon={Activity} trend={0.1} colorClass="bg-accent" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Chart */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-8">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white">Revenue Analytics</h3>
                <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-slate-300 focus:outline-none">
                    <option>This Week</option>
                    <option>Last Week</option>
                </select>
            </div>
            
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#475569" axisLine={false} tickLine={false} dy={10} />
                  <YAxis stroke="#475569" axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} 
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity / Users */}
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/20 transition-all">
                    <Users size={20} className="text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">New Client Added</p>
                    <p className="text-xs text-slate-500">2 minutes ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;