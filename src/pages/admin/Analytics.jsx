import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, MessageCircle, Zap, AlertOctagon, Activity, ServerCrash } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const StatCard = ({ title, value, icon: Icon, color, bg, loading }) => (
  <div className="glass-panel p-6 rounded-3xl border border-white/5 relative overflow-hidden group h-36 flex flex-col justify-center">
    <div className={`absolute -right-6 -top-6 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
      <Icon size={100} />
    </div>
    <div className="relative z-10 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${bg} shrink-0`}>
          <Icon size={24} className="text-white" />
      </div>
      <div>
          <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
          {loading ? (
              <div className="h-8 w-24 bg-white/10 animate-pulse rounded"></div>
          ) : (
              <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
          )}
      </div>
    </div>
  </div>
);

const Analytics = () => {
  const [stats, setStats] = useState({ totalMessages: 0, activeClients: 0, totalErrors: 0, chartData: [] });
  const [logs, setLogs] = useState([]); // Logs තියාගන්න state එක
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Overview Stats
        const statsRes = await fetch(`${API_BASE_URL}/api/analytics/overview`, {
          headers: { token: `Bearer ${token}` }
        });
        const statsData = await statsRes.json();
        if(statsRes.ok) setStats(statsData);

        // 2. Fetch System Logs (Client Names එක්ක)
        const logsRes = await fetch(`${API_BASE_URL}/api/analytics/logs`, {
          headers: { token: `Bearer ${token}` }
        });
        const logsData = await logsRes.json();
        if(logsRes.ok) setLogs(logsData);

      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
           <h2 className="text-3xl font-bold text-white mb-2">Analytics Overview</h2>
           <p className="text-slate-400">Monitor your system performance and traffic.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard loading={loading} title="Total Messages" value={stats.totalMessages} icon={MessageCircle} color="text-blue-500" bg="bg-blue-500/20" />
          <StatCard loading={loading} title="Active Clients" value={stats.activeClients} icon={Users} color="text-purple-500" bg="bg-purple-500/20" />
          <StatCard loading={loading} title="System Errors" value={stats.totalErrors} icon={AlertOctagon} color="text-red-500" bg="bg-red-500/20" />
          <StatCard loading={loading} title="Bot Efficiency" value="100%" icon={Zap} color="text-yellow-500" bg="bg-yellow-500/20" />
        </div>

        {/* Charts & Logs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart: Message Volume */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5">
            <h3 className="text-lg font-bold text-white mb-6">Message Volume (7 Days)</h3>
            <div className="h-[350px] w-full">
              {loading ? (
                 <div className="h-full w-full flex items-center justify-center text-slate-500">Loading...</div>
              ) : stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData}>
                    <defs>
                        <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff20', borderRadius: '10px' }} itemStyle={{ color: '#fff' }} />
                    <Area type="monotone" dataKey="messages" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMsg)" />
                    </AreaChart>
                </ResponsiveContainer>
              ) : (
                 <div className="h-full w-full flex items-center justify-center text-slate-500">No data available</div>
              )}
            </div>
          </div>

          {/* System Health Logs (New Section with Client Names) */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col h-[450px]">
             <div className="flex items-center gap-3 mb-6">
                <Activity className="text-red-500" />
                <h3 className="text-lg font-bold text-white">System Health Logs</h3>
             </div>
             
             <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                {logs.length === 0 ? (
                    <div className="text-center text-slate-500 mt-10">No system logs found.</div>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log) => (
                            <div key={log._id} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition flex items-start gap-4">
                                <div className={`mt-1 p-2 rounded-lg shrink-0 ${log.type === 'ERROR' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                    {log.type === 'ERROR' ? <ServerCrash size={18} /> : <Activity size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-white font-medium text-sm">{log.source}</h4>
                                        <span className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-slate-400 text-xs mt-1 truncate">{log.message}</p>
                                    
                                    {/* මෙන්න මේ කොටසෙන් තමයි Client ගේ නම පෙන්නන්නේ */}
                                    {log.clientId ? (
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
                                                Client: <span className="text-primary font-bold">{log.clientId.businessName || log.clientId.name}</span>
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="mt-2 text-[10px] text-slate-600">System Log</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default Analytics;