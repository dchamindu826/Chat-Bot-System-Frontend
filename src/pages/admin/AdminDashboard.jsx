import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../../layouts/MainLayout';
import StatCard from '../../components/StatCard';
import { Users, Database, MessageCircle, LayoutTemplate, Download, RefreshCw, Terminal, HardDrive, Activity } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
      totalContacts: 0,
      totalAgents: 0,
      totalMessagesSent: 0,
      totalTemplates: 0,
      systemHealth: "100%"
  });
  
  const [backups, setBackups] = useState([]);
  const [logs, setLogs] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  const terminalEndRef = useRef(null);
  const token = localStorage.getItem('token');

  // 1. Fetch Dashboard Stats
  const fetchStats = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/api/admin/stats`, { headers: { token: `Bearer ${token}` } });
          if(res.ok) setStats(await res.json());
      } catch (err) { console.error("Error fetching stats", err); }
  };

  // 2. Fetch Backups List
  const fetchBackups = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/api/admin/backups`, { headers: { token: `Bearer ${token}` } });
          if(res.ok) setBackups(await res.json());
      } catch (err) { console.error("Error fetching backups", err); }
  };

  // 3. Fetch Live Logs
  const fetchLogs = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/api/admin/logs`, { headers: { token: `Bearer ${token}` } });
          if(res.ok) {
              const data = await res.json();
              setLogs(data.logs);
          }
      } catch (err) { console.error("Error fetching logs", err); }
  };

  // Initial Load & Polling for Logs
  useEffect(() => {
      fetchStats();
      fetchBackups();
      fetchLogs();

      // Refresh Logs every 3 seconds to make it "Live"
      const logInterval = setInterval(fetchLogs, 3000);
      // Refresh Stats every 30 seconds
      const statInterval = setInterval(fetchStats, 30000);

      return () => {
          clearInterval(logInterval);
          clearInterval(statInterval);
      };
  }, []);

  // Auto-scroll Terminal to bottom
  useEffect(() => {
      if (terminalEndRef.current) {
          terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
  }, [logs]);

  // 4. Download Backup
  const handleDownloadBackup = async (filename) => {
      try {
          const res = await fetch(`${API_BASE_URL}/api/admin/backups/download/${filename}`, {
              headers: { token: `Bearer ${token}` }
          });
          
          if (!res.ok) throw new Error("Download failed");

          // Convert response to a blob and download securely
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          
      } catch (err) {
          alert("Failed to download backup.");
          console.error(err);
      }
  };

  // 5. Manual Backup Trigger
  const handleManualBackup = async () => {
      setIsGenerating(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/admin/backups/manual`, { 
              method: 'POST',
              headers: { token: `Bearer ${token}` } 
          });
          if(res.ok) {
              alert("Backup process started! It will appear in the list in a few seconds.");
              setTimeout(fetchBackups, 3000); // refresh list after 3s
          } else {
              alert("Failed to start backup.");
          }
      } catch (err) {
          console.error(err);
      } finally {
          setIsGenerating(false);
      }
  };

  return (
    <MainLayout>
      <div className="space-y-8 p-4 min-h-screen bg-[#0B1120] text-white">
        
        {/* === STATS GRID (Real Data) === */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Contacts" value={stats.totalContacts.toLocaleString()} icon={Users} colorClass="bg-blue-600" />
          <StatCard title="Active Agents" value={stats.totalAgents.toLocaleString()} icon={Activity} colorClass="bg-emerald-500" />
          <StatCard title="Messages Sent" value={stats.totalMessagesSent.toLocaleString()} icon={MessageCircle} colorClass="bg-indigo-500" />
          <StatCard title="Approved Templates" value={stats.totalTemplates.toLocaleString()} icon={LayoutTemplate} colorClass="bg-orange-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* === BACKUP MANAGEMENT SECTION === */}
          <div className="glass-panel rounded-3xl p-6 bg-[#1e293b]/50 border border-white/5 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Database className="text-emerald-400"/> Database Backups
                </h3>
                <button 
                    onClick={handleManualBackup} 
                    disabled={isGenerating}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 disabled:opacity-50"
                >
                    {isGenerating ? <RefreshCw className="animate-spin" size={16}/> : <HardDrive size={16}/>}
                    {isGenerating ? "Backing up..." : "Backup Now"}
                </button>
            </div>
            
            <p className="text-xs text-slate-400 mb-4 bg-black/20 p-3 rounded-lg border border-white/5">
                Auto-backups run every 12 hours. Files older than 2 days are automatically deleted to save storage.
            </p>

            <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3">
                {backups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500">
                        <Database size={40} className="mb-2 opacity-20"/>
                        <p>No backups available yet.</p>
                    </div>
                ) : (
                    backups.map((backup, idx) => (
                        <div key={idx} className="bg-black/30 border border-white/5 p-4 rounded-xl flex justify-between items-center hover:bg-white/5 transition">
                            <div>
                                <p className="font-bold text-sm text-slate-200">{backup.name}</p>
                                <div className="flex gap-3 text-xs text-slate-400 mt-1">
                                    <span>{new Date(backup.date).toLocaleString()}</span>
                                    <span>•</span>
                                    <span className="text-emerald-400 font-mono">{backup.size}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDownloadBackup(backup.name)}
                                className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition"
                                title="Download SQL File"
                            >
                                <Download size={18}/>
                            </button>
                        </div>
                    ))
                )}
            </div>
          </div>

          {/* === LIVE PM2 TERMINAL === */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 bg-[#1e293b]/50 border border-white/5 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2 text-white">
                    <Terminal className="text-green-400"/> Live Server Terminal
                </h3>
                <div className="flex items-center gap-2">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-xs text-green-400 font-bold uppercase tracking-wider">Live</span>
                </div>
            </div>

            <div className="bg-[#0D1117] border border-slate-700/50 rounded-2xl p-4 flex-1 overflow-hidden relative group">
                {/* Terminal Header */}
                <div className="absolute top-0 left-0 w-full h-8 bg-black/40 border-b border-white/5 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-4 text-xs font-mono text-slate-500">root@crm-backend:~ pm2 logs</span>
                </div>

                {/* Terminal Output */}
                <div className="mt-6 h-full overflow-y-auto custom-scrollbar font-mono text-[11px] md:text-xs leading-relaxed text-slate-300">
                    {logs ? (
                        <pre className="whitespace-pre-wrap break-words">
                            {logs.split('\n').map((line, i) => {
                                // Basic syntax highlighting for logs
                                let color = 'text-slate-300';
                                if (line.includes('Error') || line.includes('❌') || line.includes('Failed')) color = 'text-red-400 font-bold';
                                else if (line.includes('✅') || line.includes('Success')) color = 'text-green-400 font-bold';
                                else if (line.includes('WARN')) color = 'text-yellow-400';
                                else if (line.includes('Incoming message') || line.includes('Sending')) color = 'text-blue-400';
                                
                                return <div key={i} className={color}>{line}</div>
                            })}
                            <div ref={terminalEndRef} />
                        </pre>
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-600">
                            Connecting to server stream...
                        </div>
                    )}
                </div>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;