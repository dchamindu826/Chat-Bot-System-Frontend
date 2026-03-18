import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart2, MessageCircle, Users, Send, Calendar, Percent } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';
import { API_BASE_URL } from '../../config';

// Datetime-local Input එකට හරියන විදිහට Local Time එක හදාගන්න Function එකක්
const getLocalISOString = (date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format එක
};

const AgentStats = () => {
    const [data, setData] = useState({ summary: {}, agents: [] });
    const [loading, setLoading] = useState(true);
    
    // Default Start Time -> අද උදේ 9:00
    const today9AM = new Date();
    today9AM.setHours(9, 0, 0, 0);
    const [startDateTime, setStartDateTime] = useState(getLocalISOString(today9AM));

    // Default End Time -> දැනට තියෙන වෙලාව (Current Time)
    const now = new Date();
    const [endDateTime, setEndDateTime] = useState(getLocalISOString(now));

    useEffect(() => {
        fetchStats();
    }, [startDateTime, endDateTime]); 

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // තත්පර ගාණත් (:00 සහ :59) එක්කම URL එකට යවනවා
            const res = await axios.get(`${API_BASE_URL}/api/team/agent-stats?startDate=${startDateTime}:00&endDate=${endDateTime}:59`, {
                headers: { token: `Bearer ${token}` }
            });
            setData(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching stats:", error);
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="p-6 max-w-7xl mx-auto">
                
                {/* Header & Date-Time Filters */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <BarChart2 className="text-blue-500" />
                            Analytics & Agent Performance
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Filter by date and time to see accurate response rates.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-[#1e293b]/50 p-2 rounded-xl border border-white/10 backdrop-blur-md">
                        <div className="flex items-center gap-2 px-2">
                            <Calendar size={16} className="text-slate-400" />
                            <input 
                                type="datetime-local" 
                                value={startDateTime} 
                                onChange={(e) => setStartDateTime(e.target.value)}
                                className="bg-transparent text-white text-sm outline-none cursor-pointer"
                            />
                        </div>
                        <span className="text-slate-500">to</span>
                        <div className="flex items-center gap-2 px-2">
                            <input 
                                type="datetime-local" 
                                value={endDateTime} 
                                onChange={(e) => setEndDateTime(e.target.value)}
                                className="bg-transparent text-white text-sm outline-none cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center text-slate-400 py-10">Loading statistics...</div>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-6 rounded-2xl shadow-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><MessageCircle size={20}/></div>
                                    <h3 className="text-slate-300 font-medium">New Numbers Received</h3>
                                </div>
                                <p className="text-3xl font-bold text-white mt-4">{data.summary.totalInbound || 0}</p>
                            </div>

                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-6 rounded-2xl shadow-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-500/20 rounded-lg text-green-400"><Send size={20}/></div>
                                    <h3 className="text-slate-300 font-medium">Total Numbers Replied</h3>
                                </div>
                                <p className="text-3xl font-bold text-white mt-4">{data.summary.totalReplied || 0}</p>
                            </div>

                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 p-6 rounded-2xl shadow-lg">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><Percent size={20}/></div>
                                    <h3 className="text-slate-300 font-medium">Overall Response Rate</h3>
                                </div>
                                <p className="text-3xl font-bold text-white mt-4">
                                    {data.summary.rate || 0}<span className="text-lg text-slate-400 ml-1">%</span>
                                </p>
                            </div>
                        </div>

                        {/* Agent Table */}
                        <div className="bg-[#1e293b]/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
                            <div className="p-5 border-b border-white/5">
                                <h3 className="text-lg font-semibold text-white">Agent Breakdown</h3>
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 bg-black/20">
                                        <th className="p-4 text-slate-300 font-semibold text-sm">Agent Name</th>
                                        <th className="p-4 text-slate-300 font-semibold text-sm text-green-400">Replied Numbers</th>
                                        <th className="p-4 text-slate-300 font-semibold text-sm text-blue-400">Total Sent Messages</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.agents && data.agents.length > 0 ? data.agents.map((agent, index) => (
                                        <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-white font-medium flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                                                    {agent.agentName.charAt(0).toUpperCase()}
                                                </div>
                                                {agent.agentName}
                                            </td>
                                            <td className="p-4 font-bold text-green-400">
                                                <div className="flex items-center gap-2">
                                                    <Users size={16} />
                                                    {agent.uniqueNumbersReplied} Numbers
                                                </div>
                                            </td>
                                            <td className="p-4 font-bold text-blue-400">
                                                <div className="flex items-center gap-2">
                                                    <Send size={16} />
                                                    {agent.messagesSent} Msgs
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="3" className="p-8 text-center text-slate-400">No agent activity found for this date range.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </MainLayout>
    );
};

export default AgentStats;