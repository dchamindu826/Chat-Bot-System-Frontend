import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Users, PhoneCall, MessageCircle, TrendingUp, BarChart2, Download } from 'lucide-react'; // Download icon added
import { API_BASE_URL } from '../../config';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const UserDashboard = () => {
  const [stats, setStats] = useState({ totalCalls: 0, totalMessages: 0, responseRate: 0 });
  const [report, setReport] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
        // 1. Cards Data
        const statsRes = await fetch(`${API_BASE_URL}/api/analytics/user-stats`, { headers: { token: `Bearer ${token}` } });
        if(statsRes.ok) setStats(await statsRes.json());

        // 2. Table Data
        const reportRes = await fetch(`${API_BASE_URL}/api/analytics/agent-performance`, { headers: { token: `Bearer ${token}` } });
        if(reportRes.ok) setReport(await reportRes.json());
    };
    fetchData();
  }, []);

  // ✅ CSV Download Function (Only new addition)
  const downloadCSV = () => {
    if (report.length === 0) return alert("No data available to download!");

    const headers = ["Agent Name", "Assigned", "Answered", "No Answer", "Reject", "Response Rate", "Need to Cover"];
    const rows = report.map(row => [
      row.agentName,
      row.totalAllocated,
      row.answered,
      row.noAnswer,
      row.reject,
      row.responseRate,
      row.toCover
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "agent_performance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* 1. Top Cards Section (Original UI Preserved) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-blue-600/20 to-blue-900/10">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-sm font-bold uppercase">Total Leads</p>
                        <h3 className="text-3xl font-bold text-white mt-2">{stats.totalCalls}</h3>
                    </div>
                    <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400"><Users size={24}/></div>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-purple-600/20 to-purple-900/10">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-sm font-bold uppercase">Messages</p>
                        <h3 className="text-3xl font-bold text-white mt-2">{stats.totalMessages}</h3>
                    </div>
                    <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400"><MessageCircle size={24}/></div>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-emerald-600/20 to-emerald-900/10">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-sm font-bold uppercase">Response Rate</p>
                        <h3 className="text-3xl font-bold text-white mt-2">{stats.responseRate}%</h3>
                    </div>
                    <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><TrendingUp size={24}/></div>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br from-orange-600/20 to-orange-900/10">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-slate-400 text-sm font-bold uppercase">Campaign Status</p>
                        <h3 className="text-xl font-bold text-white mt-2">Active 🟢</h3>
                    </div>
                    <div className="p-3 bg-orange-500/20 rounded-xl text-orange-400"><BarChart2 size={24}/></div>
                </div>
            </div>
        </div>

        {/* 2. Main Campaign Report Table */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <PhoneCall className="text-blue-400"/> Call Campaign Report
                </h2>
                {/* ✅ Updated: Added onClick event to the Download button */}
                <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm text-slate-300 transition border border-white/5">
                    <Download size={16}/> Download CSV
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/5">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-black/40 text-slate-400 uppercase font-bold text-xs">
                        <tr>
                            <th className="p-5">Agent Name</th>
                            <th className="p-5 text-center">Assigned</th>
                            <th className="p-5 text-center text-green-400">Answered</th>
                            <th className="p-5 text-center text-yellow-400">No Answer</th>
                            <th className="p-5 text-center text-red-400">Reject</th>
                            <th className="p-5 text-center text-blue-400">Response Rate</th>
                            <th className="p-5 text-center text-orange-400">Need to Cover</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {report.length === 0 ? (
                            <tr><td colSpan="7" className="p-8 text-center text-slate-500">No data available yet.</td></tr>
                        ) : report.map((row) => (
                            <tr key={row.id} className="hover:bg-white/5 transition">
                                <td className="p-5 font-bold text-white flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs">
                                        {row.agentName.charAt(0)}
                                    </div>
                                    {row.agentName}
                                </td>
                                <td className="p-5 text-center font-bold">{row.totalAllocated}</td>
                                <td className="p-5 text-center">{row.answered}</td>
                                <td className="p-5 text-center">{row.noAnswer}</td>
                                <td className="p-5 text-center">{row.reject}</td>
                                <td className="p-5 text-center font-bold text-white bg-white/5 rounded-lg">{row.responseRate}</td>
                                <td className="p-5 text-center font-bold text-orange-400">{row.toCover}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* 3. Visual Chart (Response Rates) */}
        <div className="h-[300px] glass-panel p-6 rounded-3xl border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4">Agent Performance Visualization</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="agentName" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '12px'}} />
                    <Bar dataKey="answered" name="Answered" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="noAnswer" name="No Answer" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>

      </div>
    </MainLayout>
  );
};

export default UserDashboard;