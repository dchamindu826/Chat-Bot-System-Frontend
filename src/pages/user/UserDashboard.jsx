import React, { useEffect, useState } from 'react';
import axios from 'axios'; // 🔥 අලුතින් Import කරා
import MainLayout from '../../layouts/MainLayout';
import { Users, PhoneCall, MessageCircle, TrendingUp, BarChart2, Download, Layers, Filter, Clock, Calendar } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const UserDashboard = () => {
  const [activePhase, setActivePhase] = useState('All'); 
  const [timeFilter, setTimeFilter] = useState('All'); 
  
  // Date range states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [stats, setStats] = useState({ totalCalls: 0, totalMessages: 0, responseRate: 0 });
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const [autoFollowup, setAutoFollowup] = useState(false);

  const fetchData = async (phase, time, start, end) => {
    setLoading(true);
    try {
        let queryParams = new URLSearchParams();
        if (phase !== 'All') queryParams.append('phase', phase);
        
        // Handle Time Filters
        if (time === 'today') {
            queryParams.append('time', 'today');
        } else if (time === 'custom') {
            if (start) queryParams.append('startDate', start);
            if (end) queryParams.append('endDate', end);
        }
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

        const statsRes = await fetch(`${API_BASE_URL}/api/analytics/user-stats${queryString}`, { 
            headers: { token: `Bearer ${token}` } 
        });
        if(statsRes.ok) setStats(await statsRes.json());

        const reportRes = await fetch(`${API_BASE_URL}/api/analytics/agent-performance${queryString}`, { 
            headers: { token: `Bearer ${token}` } 
        });
        if(reportRes.ok) setReport(await reportRes.json());

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    } finally {
        setLoading(false);
    }
  };
  
  useEffect(() => {
      const fetchSettings = async () => {
          try {
              const res = await axios.get(`${API_BASE_URL}/api/users/settings`, {
                  headers: { token: `Bearer ${localStorage.getItem('token')}` }
              });
              
              // Database එකේ තියෙන අගය Button එකට Set කරනවා
              // (null හරි false හරි නම් false, true නම් true)
              setAutoFollowup(res.data.auto_followup_enabled === true); 
          } catch (error) {
              console.error("Failed to fetch follow-up settings", error);
          }
      };
      
      fetchSettings();
  }, []);

  useEffect(() => {
    // Custom filter දාලා තියෙනකොට Dates දෙකම select කරනකන් API call එක යවන්නේ නෑ
    if (timeFilter === 'custom' && (!startDate || !endDate)) {
        return;
    }
    fetchData(activePhase, timeFilter, startDate, endDate);
  }, [activePhase, timeFilter, startDate, endDate]);

  const downloadCSV = () => {
    if (report.length === 0) return alert("No data available to download!");

    const headers = ["Agent Name", "Phase", "Assigned", "Answered", "No Answer", "Reject", "Response Rate", "Need to Cover"];
    const rows = report.map(row => [
      row.agentName,
      activePhase === 'All' ? 'Mixed' : `Phase 0${activePhase}`,
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

    let timeLabel = timeFilter;
    if (timeFilter === 'custom') timeLabel = `${startDate}_to_${endDate}`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Campaign_Report_${activePhase}_${timeLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCurrentViewText = () => {
      if (timeFilter === 'today') return "Today's Stats";
      if (timeFilter === 'custom' && startDate && endDate) return `${startDate} to ${endDate}`;
      if (timeFilter === 'custom') return "Select Date Range";
      return activePhase === 'All' ? "All Phases" : `Phase 0${activePhase}`;
  };

  // 🔥 එළියේ තිබ්බ JSX ඔක්කොම මෙතනින් පල්ලෙහා return එක ඇතුළට ගෙනාවා
  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-[#1e293b]/60 p-4 rounded-3xl border border-white/5 backdrop-blur-md">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <BarChart2 className="text-indigo-400"/> Campaign Overview
                </h1>
                <p className="text-slate-400 text-sm">Monitor agent performance across campaign phases</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-3 items-center flex-wrap justify-end">
                
                {/* Custom Date Picker View */}
                {timeFilter === 'custom' && (
                    <div className="flex items-center gap-2 bg-[#0f172a]/50 p-1.5 rounded-xl border border-white/10 animate-in fade-in slide-in-from-right-4">
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent text-sm text-slate-300 outline-none px-2 cursor-pointer"
                            style={{ colorScheme: 'dark' }}
                        />
                        <span className="text-slate-500 text-xs font-bold">TO</span>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent text-sm text-slate-300 outline-none px-2 cursor-pointer"
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>
                )}

                {/* Time Filter Buttons */}
                <div className="flex bg-[#0f172a]/50 p-1.5 rounded-xl border border-white/10">
                    <button
                        onClick={() => setTimeFilter('All')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${timeFilter === 'All' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        All Time
                    </button>
                    <button
                        onClick={() => setTimeFilter('today')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${timeFilter === 'today' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Clock size={14}/> Today
                    </button>
                    <button
                        onClick={() => setTimeFilter('custom')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${timeFilter === 'custom' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Calendar size={14}/> Custom
                    </button>
                </div>

                <div className="flex bg-[#0f172a]/50 p-1.5 rounded-xl border border-white/10">
                    {['All', 1, 2, 3].map((phase) => (
                        <button
                            key={phase}
                            onClick={() => setActivePhase(phase)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                                activePhase === phase 
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {phase === 'All' ? <Filter size={14}/> : <Layers size={14}/>}
                            {phase === 'All' ? 'Overall' : `Phase 0${phase}`}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* 🔥 Auto Follow-up Settings Toggle (Moved Inside Return) */}
        <div className="flex items-center justify-between p-5 bg-slate-800/40 rounded-2xl border border-white/5 shadow-sm">
            <div>
                <h3 className="text-white font-bold text-sm">Auto Follow-up Message (20-Hour Rule)</h3>
                <p className="text-slate-400 text-xs mt-1">
                    Send an automatic interactive message to unread chats after 20 hours to keep the 24-hour window open.
                </p>
            </div>
            
            <button 
                onClick={async () => {
                    const newValue = !autoFollowup;
                    setAutoFollowup(newValue);
                    try {
                        await axios.put(`${API_BASE_URL}/api/users/update-settings`, { 
                            auto_followup_enabled: newValue 
                        }, { headers: { token: `Bearer ${localStorage.getItem('token')}` } });
                    } catch (error) {
                        console.error("Failed to update auto follow-up settings", error);
                        // Optional: Revert state if API fails
                        // setAutoFollowup(!newValue);
                    }
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none ${autoFollowup ? 'bg-emerald-500' : 'bg-slate-600'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoFollowup ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard 
                title={activePhase === 'All' ? "Total Leads" : `Phase 0${activePhase} Leads`} 
                value={stats.totalCalls} 
                icon={<Users size={24}/>} 
                color="blue" 
            />
            <StatsCard 
                title="Total Messages" 
                value={stats.totalMessages} 
                icon={<MessageCircle size={24}/>} 
                color="purple" 
            />
            <StatsCard 
                title="Response Rate" 
                value={`${stats.responseRate}%`} 
                icon={<TrendingUp size={24}/>} 
                color="emerald" 
            />
            <StatsCard 
                title="Current View" 
                value={getCurrentViewText()} 
                icon={<Layers size={24}/>} 
                color="orange" 
                isText={true}
            />
        </div>

        {/* Table & Charts Section */}
        <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-[#1e293b]/60 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"/>

            <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    <PhoneCall className="text-blue-400" size={20}/> 
                    Agent Performance 
                    <span className="text-slate-500 text-sm font-normal ml-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                        {activePhase === 'All' ? 'All Phases' : `Phase 0${activePhase} Only`} 
                        {timeFilter === 'today' && ' (Today)'}
                        {timeFilter === 'custom' && ` (${startDate || '?'} to ${endDate || '?'})`}
                    </span>
                </h2>
                <button onClick={downloadCSV} className="flex items-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-xl text-sm transition">
                    <Download size={16}/> Export CSV
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0f172a]/40">
                {loading ? (
                    <div className="p-12 text-center text-slate-400">Loading data...</div>
                ) : (
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-black/20 text-slate-400 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-5">Agent Name</th>
                                <th className="p-5 text-center">Assigned</th>
                                <th className="p-5 text-center text-emerald-400">Answered</th>
                                <th className="p-5 text-center text-amber-400">No Answer</th>
                                <th className="p-5 text-center text-red-400">Reject</th>
                                <th className="p-5 text-center text-blue-400">Rate</th>
                                <th className="p-5 text-center text-orange-400">To Cover</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {report.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-slate-500">No data found for this filter.</td></tr>
                            ) : report.map((row, index) => (
                                <tr key={index} className="hover:bg-white/5 transition duration-200">
                                    <td className="p-4 font-bold text-white flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs border border-white/10 shadow-inner">
                                            {row.agentName ? row.agentName.charAt(0) : 'A'}
                                        </div>
                                        {row.agentName}
                                    </td>
                                    <td className="p-4 text-center font-bold text-slate-200">{row.totalAllocated}</td>
                                    <td className="p-4 text-center">{row.answered}</td>
                                    <td className="p-4 text-center">{row.noAnswer}</td>
                                    <td className="p-4 text-center">{row.reject}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${parseFloat(row.responseRate) > 50 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                            {row.responseRate}%
                                        </span>
                                    </td>
                                    <td className="p-4 text-center font-bold text-orange-400/80">{row.toCover}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-black/40 border-t border-white/10 font-bold text-white">
                            <tr>
                                <td className="p-5 text-right uppercase tracking-wider text-slate-400 text-xs">Total Overall:</td>
                                <td className="p-5 text-center text-blue-400">{report.reduce((sum, r) => sum + (r.totalAllocated || 0), 0)}</td>
                                <td className="p-5 text-center text-emerald-400">{report.reduce((sum, r) => sum + (r.answered || 0), 0)}</td>
                                <td className="p-5 text-center text-amber-400">{report.reduce((sum, r) => sum + (r.noAnswer || 0), 0)}</td>
                                <td className="p-5 text-center text-red-400">{report.reduce((sum, r) => sum + (r.reject || 0), 0)}</td>
                                <td className="p-5 text-center text-indigo-400">
                                    {report.reduce((sum, r) => sum + (r.totalAllocated || 0), 0) > 0 
                                        ? ((report.reduce((sum, r) => sum + (r.answered || 0), 0) / report.reduce((sum, r) => sum + (r.totalAllocated || 0), 0)) * 100).toFixed(1) 
                                        : 0}%
                                </td>
                                <td className="p-5 text-center text-orange-400">{report.reduce((sum, r) => sum + (r.toCover || 0), 0)}</td>
                            </tr>
                        </tfoot>
                    </table>
                )}
            </div>
        </div>

        {/* Chart Section */}
        <div className="h-[350px] glass-panel p-6 rounded-3xl border border-white/5 bg-[#1e293b]/60 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <BarChart2 size={18} className="text-slate-400"/> 
                Visual Breakdown <span className="text-xs text-slate-500 font-normal">(Answered vs No Answer)</span>
            </h3>
            <div style={{ minHeight: '250px', height: '85%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={report} barSize={20}> 
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="agentName" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            cursor={{fill: '#ffffff05'}}
                            contentStyle={{backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '12px'}} 
                        />
                        <Bar dataKey="answered" name="Answered" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="noAnswer" name="No Answer" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

      </div>
    </MainLayout>
  );
};

const StatsCard = ({ title, value, icon, color, isText = false }) => {
    const colors = {
        blue: "from-blue-600/20 to-blue-900/10 text-blue-400 bg-blue-500/20",
        purple: "from-purple-600/20 to-purple-900/10 text-purple-400 bg-purple-500/20",
        emerald: "from-emerald-600/20 to-emerald-900/10 text-emerald-400 bg-emerald-500/20",
        orange: "from-orange-600/20 to-orange-900/10 text-orange-400 bg-orange-500/20",
    };

    const style = colors[color] || colors.blue;
    const [bgGradient, iconColor] = style.split(' text-');

    return (
        <div className={`glass-panel p-6 rounded-3xl border border-white/5 bg-gradient-to-br ${bgGradient.split(' ')[0]} ${bgGradient.split(' ')[1]}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
                    <h3 className={`font-bold text-white mt-2 ${isText ? 'text-[16px]' : 'text-3xl'} truncate max-w-[150px]`}>{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${iconColor.replace('text-', 'bg-').split(' ')[1]} ${iconColor.split(' ')[0]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;