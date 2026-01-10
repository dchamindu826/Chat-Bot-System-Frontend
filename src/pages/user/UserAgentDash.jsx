import React, { useState, useEffect } from 'react';
import UserInbox from './UserInbox'; 
import { Phone, CheckCircle, XCircle, Clock, Search, MessageSquare, Save, Download, ChevronLeft, ChevronRight, LogOut, RefreshCcw, User, Activity } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';

const UserAgentDash = () => {
  const [activeTab, setActiveTab] = useState('campaign'); 
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('name');

  // --- 1. FETCH ASSIGNED CONTACTS ---
  const fetchMyContacts = async () => {
    try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/crm/contacts`, { 
            headers: { token: `Bearer ${token}` } 
        });
        if (res.ok) {
            const data = await res.json();
            const myLeads = data.filter(c => {
                if (!c.assignedTo) return false;
                const assignedId = typeof c.assignedTo === 'object' ? c.assignedTo._id : c.assignedTo;
                return assignedId === userId;
            });
            setContacts(myLeads);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
      fetchMyContacts();
  }, []);

  // --- 2. UPDATE LOGIC ---
  const handleUpdateRow = async (id, field, value) => {
      setContacts(prev => prev.map(c => c._id === id ? { ...c, [field]: value } : c));

      try {
        const contactToUpdate = contacts.find(c => c._id === id);
        const updatedFields = { ...contactToUpdate, [field]: value };

        await fetch(`${API_BASE_URL}/api/crm/contact/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
            body: JSON.stringify({ 
                callStatus: updatedFields.callStatus,
                attemptMethod: updatedFields.attemptMethod,
                attemptCount: updatedFields.attemptCount,
                remarks: updatedFields.remarks
            })
        });
      } catch(err) {
          console.error("Save failed", err);
          fetchMyContacts(); 
      }
  };

  // --- 3. CSV EXPORT ---
  const exportToCSV = () => {
      const headers = ["Phone Number", "Name", "Priority", "Status", "Attempt Method", "Attempt Count", "Remarks"];
      const rows = contacts.map(c => [
          c.phoneNumber,
          c.name || "",
          c.priority || "Low",
          c.callStatus || "Pending",
          c.attemptMethod || "-",
          c.attemptCount || "0",
          c.remarks || ""
      ]);

      let csvContent = "data:text/csv;charset=utf-8," 
          + headers.join(",") + "\n" 
          + rows.map(e => e.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `campaign_data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
  };

  const handleLogout = () => {
      localStorage.clear();
      navigate('/login');
  };

  // --- FILTERING ---
  const filteredContacts = contacts.filter(c => 
      c.phoneNumber.includes(searchTerm) || (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Stats
  const totalAssigned = contacts.length;
  const covered = contacts.filter(c => ['Answered', 'Reject', 'Busy', 'No Answer', 'Wrong Number', 'Callback'].includes(c.callStatus)).length;
  const remaining = totalAssigned - covered;

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  // Status Badge Helper
  const getStatusColor = (status) => {
    switch(status) {
        case 'Answered': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case 'Reject': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'Busy': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'Callback': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        default: return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
        
        {/* Ambient Background Glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"/>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"/>

        {/* --- HEADER --- */}
        <div className="h-18 border-b border-white/5 bg-[#0B1120]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Activity className="text-white" size={20}/>
                </div>
                <div>
                    <h1 className="font-bold text-xl text-white tracking-tight">Agent Workspace</h1>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Online as {userName}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex bg-[#1e293b]/50 p-1.5 rounded-xl border border-white/5">
                    <button onClick={() => setActiveTab('campaign')} className={`px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${activeTab === 'campaign' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <Phone size={16}/> Campaigns
                    </button>
                    <button onClick={() => setActiveTab('inbox')} className={`px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-300 ${activeTab === 'inbox' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <MessageSquare size={16}/> Inbox
                    </button>
                </div>

                <button onClick={handleLogout} className="p-2.5 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors text-slate-400 border border-transparent hover:border-red-500/20" title="Logout">
                    <LogOut size={20}/>
                </button>
            </div>
        </div>

        {/* --- CONTENT --- */}
        <div className="p-8 max-w-[1800px] mx-auto z-10 relative">
            
            {activeTab === 'campaign' ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    
                    {/* STATS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#1e293b]/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all duration-300 hover:bg-[#1e293b]/60">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Assigned</p>
                                <h3 className="text-4xl font-bold text-white group-hover:scale-105 transition-transform origin-left">{totalAssigned}</h3>
                            </div>
                            <div className="p-4 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500/20 transition-colors"><User size={28} className="text-indigo-400"/></div>
                        </div>
                        <div className="bg-[#1e293b]/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-emerald-500/30 transition-all duration-300 hover:bg-[#1e293b]/60">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Completed</p>
                                <h3 className="text-4xl font-bold text-emerald-400 group-hover:scale-105 transition-transform origin-left">{covered}</h3>
                            </div>
                            <div className="p-4 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors"><CheckCircle size={28} className="text-emerald-400"/></div>
                        </div>
                        <div className="bg-[#1e293b]/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-orange-500/30 transition-all duration-300 hover:bg-[#1e293b]/60">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pending</p>
                                <h3 className="text-4xl font-bold text-orange-400 group-hover:scale-105 transition-transform origin-left">{remaining}</h3>
                            </div>
                            <div className="p-4 bg-orange-500/10 rounded-2xl group-hover:bg-orange-500/20 transition-colors"><Clock size={28} className="text-orange-400"/></div>
                        </div>
                    </div>

                    {/* CONTROLS BAR */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[#1e293b]/30 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18}/>
                            <input 
                                type="text" 
                                placeholder="Search by name or phone..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#0B1120]/50 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-600"
                            />
                        </div>
                        <div className="flex gap-3 pr-2">
                            <button onClick={fetchMyContacts} className="p-3 bg-[#0B1120]/50 hover:bg-white/5 text-slate-300 hover:text-white rounded-xl border border-white/5 transition active:scale-95" title="Refresh Data">
                                <RefreshCcw size={18}/>
                            </button>
                            <button onClick={exportToCSV} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/20 transition active:scale-95 text-sm">
                                <Download size={18}/> Export CSV
                            </button>
                        </div>
                    </div>

                    {/* MAIN TABLE */}
                    <div className="bg-[#1e293b]/30 border border-white/5 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
                        <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-[#0f172a] text-slate-400 font-bold uppercase text-xs sticky top-0 z-20 shadow-md">
                                    <tr>
                                        <th className="p-5 w-16 tracking-wider">No.</th>
                                        <th className="p-5 tracking-wider">Lead Info</th>
                                        <th className="p-5 tracking-wider">Method</th>
                                        <th className="p-5 tracking-wider">Attempts</th>
                                        <th className="p-5 tracking-wider">Status</th>
                                        <th className="p-5 w-80 tracking-wider">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {currentItems.map((contact, index) => (
                                        <tr key={contact._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="p-5 text-slate-600 font-mono">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                            <td className="p-5">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-base tracking-wide">{contact.phoneNumber}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-slate-400 font-medium px-2 py-0.5 bg-slate-800 rounded-md border border-slate-700">{contact.name || "Unknown"}</span>
                                                        {contact.priority === 'High' && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-red-500/30 text-red-400 bg-red-500/10 font-bold uppercase tracking-wide animate-pulse">High</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <select 
                                                    value={contact.attemptMethod || ''}
                                                    onChange={(e) => handleUpdateRow(contact._id, 'attemptMethod', e.target.value)}
                                                    className="bg-[#0B1120] border border-white/10 text-slate-300 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none cursor-pointer hover:border-white/20 transition-colors w-full"
                                                >
                                                    <option value="">Select Method</option>
                                                    <option value="3CX">3CX Call</option>
                                                    <option value="Direct">Mobile Direct</option>
                                                    <option value="WhatsApp">WhatsApp</option>
                                                </select>
                                            </td>
                                            <td className="p-5">
                                                <select 
                                                    value={contact.attemptCount || ''}
                                                    onChange={(e) => handleUpdateRow(contact._id, 'attemptCount', e.target.value)}
                                                    className="bg-[#0B1120] border border-white/10 text-slate-300 rounded-lg px-3 py-2 text-xs focus:border-indigo-500 outline-none cursor-pointer w-20 text-center"
                                                >
                                                    <option value="0">0</option>
                                                    <option value="1">1</option>
                                                    <option value="2">2</option>
                                                    <option value="3">3</option>
                                                    <option value="4">4</option>
                                                    <option value="5+">5+</option>
                                                </select>
                                            </td>
                                            <td className="p-5">
                                                <select 
                                                    value={contact.callStatus || 'Pending'}
                                                    onChange={(e) => handleUpdateRow(contact._id, 'callStatus', e.target.value)}
                                                    className={`border rounded-lg px-3 py-2 text-xs font-bold outline-none w-36 cursor-pointer appearance-none text-center transition-all ${getStatusColor(contact.callStatus)}`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Answered">Answered</option>
                                                    <option value="No Answer">No Answer</option>
                                                    <option value="Reject">Reject / Cut</option>
                                                    <option value="Busy">Line Busy</option>
                                                    <option value="Callback">Callback</option>
                                                    <option value="Wrong Number">Wrong Number</option>
                                                </select>
                                            </td>
                                            <td className="p-5">
                                                <div className="relative">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Add a remark..." 
                                                        value={contact.remarks || ''}
                                                        onChange={(e) => handleUpdateRow(contact._id, 'remarks', e.target.value)}
                                                        className="w-full bg-transparent border-b border-white/10 focus:border-indigo-500 outline-none text-sm py-1.5 text-slate-300 placeholder-slate-700 transition-colors"
                                                    />
                                                    <div className="absolute right-0 top-2 opacity-0 group-focus-within:opacity-100 transition-opacity text-xs text-indigo-400 font-bold pointer-events-none">
                                                        Typing...
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* PAGINATION */}
                        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-[#0f172a]">
                            <span className="text-xs text-slate-500 font-medium">
                                Showing page {currentPage} of {totalPages || 1}
                            </span>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft size={18}/>
                                </button>
                                <button 
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight size={18}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            ) : (
                /* INBOX TAB */
                <div className="h-[80vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in slide-in-from-right-6 duration-700">
                    <UserInbox isEmbedded={true} />
                </div>
            )}
        </div>
    </div>
  );
};

export default UserAgentDash;