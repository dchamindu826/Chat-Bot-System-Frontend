import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Activity, AlertTriangle, Info, RefreshCw, User, Server } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchLogs = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}/api/analytics/logs`, {
            headers: { token: `Bearer ${token}` }
        });
        const data = await res.json();
        if(res.ok) {
            setLogs(data);
        } else {
            console.error("Failed to fetch logs");
        }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const getIcon = (type) => {
    if (type === 'ERROR') return <AlertTriangle className="text-red-500" size={20} />;
    if (type === 'WARNING') return <Activity className="text-yellow-500" size={20} />;
    return <Info className="text-blue-500" size={20} />;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                <Activity className="text-red-500" /> System Health Logs
            </h2>
            <button onClick={fetchLogs} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition">
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
        </div>

        <div className="bg-[#1e293b]/50 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-400">
                    <thead className="text-xs uppercase bg-white/5 text-slate-300">
                        <tr>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Source</th>
                            <th className="px-6 py-4">Message</th>
                            <th className="px-6 py-4">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center">System is healthy! No errors found.</td></tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log._id} className="hover:bg-white/5 transition">
                                    <td className="px-6 py-4 font-bold flex items-center gap-2">
                                        {getIcon(log.type)} {log.type}
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        {log.clientId ? (
                                            <div>
                                                <span className="text-white font-medium block">{log.clientId.businessName}</span>
                                                <span className="text-xs text-blue-400 flex items-center gap-1">
                                                    <User size={12}/> {log.clientId.name}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-600 text-xs uppercase font-bold tracking-wider flex items-center gap-1">
                                                <Server size={12}/> System
                                            </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-white">{log.source}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-red-300 block">{log.message}</span>
                                        <span className="text-xs text-slate-500 font-mono mt-1 break-all">
                                            {JSON.stringify(log.metaData)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs whitespace-nowrap">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SystemLogs;