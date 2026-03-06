import React, { useState, useEffect } from 'react';
import UserInbox from './UserInbox'; 
import { Phone, CheckCircle, Clock, Search, MessageSquare, Download, ChevronLeft, ChevronRight, LogOut, RefreshCcw, User, Activity, Layers, Filter } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';

const UserAgentDash = () => {
  const [viewMode, setViewMode] = useState('campaign');
  const [activePhase, setActivePhase] = useState(1);
  
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [chatTarget, setChatTarget] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [pendingSaves, setPendingSaves] = useState(new Set());

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('name');

  // --- 1. FETCH DATA ---
  const fetchMyContacts = async () => {
    try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/crm/contacts`, { 
            headers: { token: `Bearer ${token}` } 
        });
        if (res.ok) {
            const data = await res.json();
            const processedLeads = data.map(c => ({...c, phase: c.phase || 1}));
            setContacts(processedLeads);
        }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { 
      fetchMyContacts(); 
      // Auto refresh to update unread counts
      const interval = setInterval(fetchMyContacts, 10000); 
      return () => clearInterval(interval);
  }, []);

  // --- 2. LOGIC: UPDATE STATUS Lcoally ---
  const handleUpdateRow = (id, field, value) => {
      const currentContact = contacts.find(c => c._id === id);
      let updatedFields = { ...currentContact, [field]: value };

      if (field === 'callStatus' && value === 'No Answer') {
          const currentPhase = currentContact.phase || 1;
          
          if (currentPhase < 3) {
              const confirmMove = window.confirm(`Call No Answered. Move to PHASE 0${currentPhase + 1}?`);
              if (confirmMove) {
                  updatedFields.phase = currentPhase + 1;
                  updatedFields.callStatus = 'Pending';
                  updatedFields.attemptCount = (parseInt(currentContact.attemptCount || 0) + 1).toString();
                  updatedFields.remarks = `${updatedFields.remarks || ''} [P${currentPhase}: No Answer]`.trim();
                  alert(`Phase updated locally. Click 'Save' to confirm! 🚀`);
              }
          } else {
              alert("Phase 03 Ended. Marked as No Answer.");
          }
      }

      setContacts(prev => prev.map(c => c._id === id ? { ...c, ...updatedFields } : c));
      setPendingSaves(prev => new Set(prev).add(id));
  };

  const handleSaveRow = async (id) => {
      const contactToSave = contacts.find(c => c._id === id);
      if(!contactToSave) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/crm/contact/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
            body: JSON.stringify({ 
                callStatus: contactToSave.callStatus,
                attemptMethod: contactToSave.attemptMethod,
                attemptCount: contactToSave.attemptCount,
                remarks: contactToSave.remarks,
                phase: contactToSave.phase
            })
        });

        if(res.ok) {
            setPendingSaves(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        } else {
            alert("Failed to save!");
        }
      } catch(err) {
          console.error("Save failed", err);
          alert("Failed to save!");
      }
  };

  const handleOpenChat = (contact) => {
      setChatTarget(contact);
      setViewMode('inbox');
  };

  const exportToCSV = () => {
      const headers = ["Phone", "Name", "Phase", "Method", "Attempts", "Status", "Remarks"];
      const exportData = activePhase === 'All' ? contacts : contacts.filter(c => c.phase === activePhase);
      
      const rows = exportData.map(c => [
          c.phoneNumber, c.name, `Phase ${c.phase}`, c.attemptMethod, c.attemptCount, c.callStatus, c.remarks
      ]);
      
      let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `Agent_Report_${activePhase}.csv`);
      document.body.appendChild(link);
      link.click();
  };

  const handleLogout = () => {
      localStorage.clear();
      navigate('/login');
  };

  const phaseContacts = activePhase === 'All' ? contacts : contacts.filter(c => c.phase === activePhase);

  const filteredContacts = phaseContacts.filter(c => {
      const pNum = c.phoneNumber || c.phone_number || "";
      const cName = c.name || "";
      return pNum.includes(searchTerm) || cName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalInPhase = phaseContacts.length;
  const completedInPhase = phaseContacts.filter(c => {
      const status = c.callStatus;
      const attempts = parseInt(c.attemptCount || 0);
      return ['Answered', 'Reject', 'No Answer'].includes(status) || attempts > 0;
  }).length;
  const pendingInPhase = totalInPhase - completedInPhase;

  // 🔥 NEW: Calculate overall unread count for Agent
  const totalUnread = contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredContacts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

  const getStatusColor = (status) => {
    switch(status) {
        case 'Answered': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case 'Reject': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'No Answer': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        default: return 'bg-slate-700/50 text-slate-300 border-slate-600/50';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none"/>
        
        {/* --- HEADER --- */}
        <div className="h-18 border-b border-white/5 bg-[#0B1120]/90 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Activity className="text-white" size={20}/>
                </div>
                <div>
                    <h1 className="font-bold text-lg text-white">Agent Workspace</h1>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {userName}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="flex bg-[#1e293b]/50 p-1 rounded-xl border border-white/5">
                    <button onClick={() => setViewMode('campaign')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'campaign' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                        <Phone size={16}/> Campaigns
                    </button>
                    <button onClick={() => setViewMode('inbox')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all relative ${viewMode === 'inbox' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                        <MessageSquare size={16}/> Inbox
                        {/* 🔥 NEW: Unread Count Badge */}
                        {totalUnread > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse shadow-lg border-2 border-[#0B1120]">
                                {totalUnread}
                            </span>
                        )}
                    </button>
                </div>
                <button onClick={handleLogout} className="p-2.5 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors text-slate-400 border border-transparent hover:border-red-500/20" title="Logout">
                    <LogOut size={20}/>
                </button>
            </div>
        </div>

        {/* --- BODY --- */}
        <div className="p-6 max-w-[1800px] mx-auto z-10 relative">
            {viewMode === 'campaign' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* PHASE TABS */}
                    <div className="flex items-center gap-4 border-b border-white/10 pb-1">
                        <button onClick={() => { setActivePhase('All'); setCurrentPage(1); }} className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activePhase === 'All' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}><Filter size={16}/> OVERALL</button>
                        {[1, 2, 3].map(phase => (
                            <button key={phase} onClick={() => { setActivePhase(phase); setCurrentPage(1); }} className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activePhase === phase ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>
                                <Layers size={16}/> PHASE 0{phase}
                                <span className="bg-white/10 text-white px-1.5 py-0.5 rounded text-[10px]">{contacts.filter(c => c.phase === phase).length}</span>
                            </button>
                        ))}
                    </div>

                    {/* OVERVIEW CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#1e293b]/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between">
                            <div><p className="text-slate-400 text-xs font-bold uppercase mb-2">{activePhase === 'All' ? 'Total Assigned (All Phases)' : `Assigned (Phase 0${activePhase})`}</p><h3 className="text-5xl font-bold text-white tracking-tight">{totalInPhase}</h3></div>
                            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400"><User size={32}/></div>
                        </div>
                        <div className="bg-[#1e293b]/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between">
                            <div><p className="text-slate-400 text-xs font-bold uppercase mb-2">Covered / Completed</p><h3 className="text-5xl font-bold text-emerald-400 tracking-tight">{completedInPhase}</h3></div>
                            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400"><CheckCircle size={32}/></div>
                        </div>
                        <div className="bg-[#1e293b]/40 border border-white/5 p-6 rounded-2xl flex items-center justify-between">
                            <div><p className="text-slate-400 text-xs font-bold uppercase mb-2">Pending/ Need to cover</p><h3 className="text-5xl font-bold text-orange-400 tracking-tight">{pendingInPhase}</h3></div>
                            <div className="p-4 bg-orange-500/10 rounded-2xl text-orange-400"><Clock size={32}/></div>
                        </div>
                    </div>

                    {/* TABLE CONTROLS */}
                    <div className="flex justify-between items-center gap-4 bg-[#1e293b]/30 p-2 rounded-xl border border-white/5">
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-3 text-slate-500" size={16}/>
                            <input type="text" placeholder="Search number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0B1120] border-none rounded-lg py-2.5 pl-10 text-white text-sm focus:ring-1 focus:ring-indigo-500"/>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={fetchMyContacts} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition"><RefreshCcw size={18}/></button>
                            <button onClick={exportToCSV} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition"><Download size={16}/> CSV</button>
                        </div>
                    </div>

                    {/* DATA TABLE */}
                    <div className="bg-[#1e293b]/30 border border-white/5 rounded-xl overflow-hidden shadow-xl">
                        <table className="w-full text-sm">
                            <thead className="bg-[#0f172a] text-slate-400 uppercase text-xs font-bold">
                                <tr>
                                    <th className="p-4 w-12">#</th>
                                    <th className="p-4 text-left w-1/4">Customer Info</th>
                                    {activePhase === 'All' && <th className="p-4 text-center">Phase</th>}
                                    <th className="p-4 text-center">Method</th>
                                    <th className="p-4 text-center">Att.</th>
                                    <th className="p-4 text-center">Chat</th>
                                    <th className="p-4 text-center w-40">Status</th>
                                    <th className="p-4 text-left w-1/4">Remark</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {currentItems.length === 0 ? (
                                    <tr><td colSpan="9" className="p-10 text-center text-slate-500">No leads found.</td></tr>
                                ) : currentItems.map((contact, index) => (
                                    <tr key={contact._id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="p-4 text-slate-500 text-left">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        
                                        <td className="p-4 text-left">
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-white text-base">{contact.phoneNumber}</div>
                                                {contact.unreadCount > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-pulse">{contact.unreadCount}</span>}
                                            </div>
                                            <div className="text-xs text-slate-500">{contact.name || "Guest"}</div>
                                        </td>

                                        {activePhase === 'All' && <td className="p-4 text-center"><span className="bg-white/10 text-slate-300 px-2 py-1 rounded text-xs font-bold">P{contact.phase || 1}</span></td>}
                                        
                                        <td className="p-4 text-center">
                                            <select value={contact.attemptMethod || ''} onChange={(e) => handleUpdateRow(contact._id, 'attemptMethod', e.target.value)} className="bg-[#0B1120] border border-white/10 text-slate-300 rounded-lg px-2 py-1.5 text-xs focus:border-indigo-500 outline-none w-24 text-center cursor-pointer">
                                                <option value="">-</option><option value="3CX">3CX</option><option value="Direct">Direct</option><option value="WhatsApp">WhatsApp</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-center">
                                            <select value={contact.attemptCount || '0'} onChange={(e) => handleUpdateRow(contact._id, 'attemptCount', e.target.value)} className="bg-[#0B1120] border border-white/10 text-slate-300 rounded-lg px-2 py-1.5 text-xs focus:border-indigo-500 outline-none w-16 text-center cursor-pointer">
                                                {[0,1,2,3,4,5].map(num => <option key={num} value={num}>{num}</option>)}<option value="5+">5+</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => handleOpenChat(contact)} className="p-2 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-lg transition border border-indigo-500/20 shadow-md">
                                                <MessageSquare size={16}/>
                                            </button>
                                        </td>
                                        <td className="p-4 text-center">
                                            <select value={contact.callStatus || 'Pending'} onChange={(e) => handleUpdateRow(contact._id, 'callStatus', e.target.value)} className={`rounded-lg px-2 py-1.5 text-xs font-bold outline-none cursor-pointer border border-transparent w-32 text-center transition-all ${getStatusColor(contact.callStatus)}`}>
                                                <option value="Pending">Pending</option><option value="Answered">Answered</option><option value="No Answer">No Answer</option><option value="Reject">Reject</option>
                                            </select>
                                        </td>
                                        <td className="p-4 text-left">
                                            <input type="text" placeholder="Write a remark..." value={contact.remarks || ''} onChange={(e) => handleUpdateRow(contact._id, 'remarks', e.target.value)} className="bg-transparent border-b border-white/10 w-full outline-none text-slate-300 text-sm py-1 focus:border-indigo-500 transition-colors placeholder-slate-700"/>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => handleSaveRow(contact._id)} disabled={!pendingSaves.has(contact._id)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-md ${pendingSaves.has(contact._id) ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse' : 'bg-slate-700/50 text-slate-500 cursor-not-allowed'}`}>
                                                {pendingSaves.has(contact._id) ? 'Save' : 'Saved'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-500 px-2 mt-4">
                        <span>Page {currentPage} of {totalPages || 1}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"><ChevronLeft size={16}/></button>
                            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"><ChevronRight size={16}/></button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-[82vh] rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                    <UserInbox isEmbedded={true} initialSelectedContact={chatTarget} />
                </div>
            )}
        </div>
    </div>
  );
};

export default UserAgentDash;