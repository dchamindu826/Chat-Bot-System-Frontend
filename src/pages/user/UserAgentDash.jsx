import React, { useState, useEffect } from 'react';
import UserInbox from './UserInbox'; 
import { Phone, CheckCircle, Clock, Search, MessageSquare, Download, ChevronLeft, ChevronRight, LogOut, RefreshCcw, User, Activity, Layers } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useNavigate } from 'react-router-dom';

const UserAgentDash = () => {
  const [viewMode, setViewMode] = useState('campaign'); // 'campaign' or 'inbox'
  const [activePhase, setActivePhase] = useState(1); // 1, 2, or 3
  
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Chat Navigation State
  const [chatTarget, setChatTarget] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
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
            // Only my assigned contacts
            const myLeads = data.filter(c => {
                if (!c.assignedTo) return false;
                const assignedId = typeof c.assignedTo === 'object' ? c.assignedTo._id : c.assignedTo;
                return assignedId === userId;
            });
            // Ensure phase is set (default to 1)
            const processedLeads = myLeads.map(c => ({...c, phase: c.phase || 1}));
            setContacts(processedLeads);
        }
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchMyContacts(); }, []);

  // --- 2. LOGIC: UPDATE STATUS & AUTO-MOVE PHASE ---
  const handleUpdateRow = async (id, field, value) => {
      const currentContact = contacts.find(c => c._id === id);
      let updatedFields = { ...currentContact, [field]: value };

      // 🔥 AUTO MOVE LOGIC
      if (field === 'callStatus' && value === 'No Answer') {
          const currentPhase = currentContact.phase || 1;
          
          if (currentPhase < 3) {
              const confirmMove = window.confirm(`Call No Answered. Move to PHASE 0${currentPhase + 1}?`);
              if (confirmMove) {
                  updatedFields.phase = currentPhase + 1; // Increase Phase
                  updatedFields.callStatus = 'Pending';   // Reset Status
                  updatedFields.attemptCount = (parseInt(currentContact.attemptCount || 0) + 1).toString();
                  alert(`Moved to Phase 0${currentPhase + 1} 🚀`);
              }
          } else {
              // Phase 3 No Answer = End of road
              alert("Phase 03 Ended. Marked as No Answer.");
          }
      }

      // Optimistic UI Update
      setContacts(prev => prev.map(c => c._id === id ? { ...c, ...updatedFields } : c));

      // Backend API Call
      try {
        await fetch(`${API_BASE_URL}/api/crm/contact/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
            body: JSON.stringify({ 
                callStatus: updatedFields.callStatus,
                attemptMethod: updatedFields.attemptMethod,
                attemptCount: updatedFields.attemptCount,
                remarks: updatedFields.remarks,
                phase: updatedFields.phase
            })
        });
      } catch(err) {
          console.error("Save failed", err);
          fetchMyContacts(); 
      }
  };

  // --- 3. OPEN CHAT ---
  const handleOpenChat = (contact) => {
      setChatTarget(contact);
      setViewMode('inbox');
  };

  // --- 4. CSV EXPORT (Phase Aware) ---
  const exportToCSV = () => {
      const headers = ["Phone", "Name", "Phase", "Status", "Remarks"];
      const rows = contacts.filter(c => c.phase === activePhase).map(c => [
          c.phoneNumber, c.name, `Phase ${c.phase}`, c.callStatus, c.remarks
      ]);
      let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `Phase_0${activePhase}_Report.csv`);
      document.body.appendChild(link);
      link.click();
  };

  const handleLogout = () => {
      localStorage.clear();
      navigate('/login');
  };

  // --- FILTERS & STATS FOR ACTIVE PHASE ---
  // Only show contacts belonging to the clicked Tab (Phase 1, 2, or 3)
  const phaseContacts = contacts.filter(c => c.phase === activePhase);
  
  const filteredContacts = phaseContacts.filter(c => 
      c.phoneNumber.includes(searchTerm) || (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Stats Logic (Per Phase)
  const totalInPhase = phaseContacts.length;
  // Completed = Answered or Reject (OR No Answer if it's Phase 3)
  const completedInPhase = phaseContacts.filter(c => 
      ['Answered', 'Reject'].includes(c.callStatus) || (activePhase === 3 && c.callStatus === 'No Answer')
  ).length;
  const pendingInPhase = totalInPhase - completedInPhase;

  // Pagination
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
        
        {/* Background Effects */}
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
                    <button onClick={() => setViewMode('inbox')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'inbox' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                        <MessageSquare size={16}/> Inbox
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
                    
                    {/* 🔥 PHASE TABS - Tabs for Phase 1, 2, 3 */}
                    <div className="flex items-center gap-4 border-b border-white/10 pb-1">
                        {[1, 2, 3].map(phase => (
                            <button 
                                key={phase}
                                onClick={() => { setActivePhase(phase); setCurrentPage(1); }}
                                className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activePhase === phase ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                            >
                                <Layers size={16}/> PHASE 0{phase}
                                <span className="bg-white/10 text-white px-1.5 py-0.5 rounded text-[10px]">
                                    {contacts.filter(c => c.phase === phase).length}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* 🔥 OVERVIEW CARDS (Updates based on Active Phase) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Total Card */}
                        <div className="bg-[#1e293b]/40 border border-white/5 p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Total in Phase 0{activePhase}</p>
                                <h3 className="text-3xl font-bold text-white">{totalInPhase}</h3>
                            </div>
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><User size={24}/></div>
                        </div>
                        {/* Completed Card */}
                        <div className="bg-[#1e293b]/40 border border-white/5 p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Completed</p>
                                <h3 className="text-3xl font-bold text-emerald-400">{completedInPhase}</h3>
                            </div>
                            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><CheckCircle size={24}/></div>
                        </div>
                        {/* Pending Card */}
                        <div className="bg-[#1e293b]/40 border border-white/5 p-5 rounded-2xl flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-xs font-bold uppercase mb-1">Pending</p>
                                <h3 className="text-3xl font-bold text-orange-400">{pendingInPhase}</h3>
                            </div>
                            <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400"><Clock size={24}/></div>
                        </div>
                    </div>

                    {/* TABLE CONTROLS */}
                    <div className="flex justify-between items-center gap-4 bg-[#1e293b]/30 p-2 rounded-xl border border-white/5">
                        <div className="relative w-96">
                            <Search className="absolute left-3 top-3 text-slate-500" size={16}/>
                            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#0B1120] border-none rounded-lg py-2.5 pl-10 text-white text-sm focus:ring-1 focus:ring-indigo-500"/>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={fetchMyContacts} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition"><RefreshCcw size={18}/></button>
                            <button onClick={exportToCSV} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition"><Download size={16}/> Export Phase CSV</button>
                        </div>
                    </div>

                    {/* DATA TABLE */}
                    <div className="bg-[#1e293b]/30 border border-white/5 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[#0f172a] text-slate-400 uppercase text-xs">
                                <tr>
                                    <th className="p-4 w-16">#</th>
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 w-64">Remark</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {currentItems.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center text-slate-500">No leads in Phase 0{activePhase}</td></tr>
                                ) : currentItems.map((contact, index) => (
                                    <tr key={contact._id} className="hover:bg-white/[0.02]">
                                        <td className="p-4 text-slate-500">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-white">{contact.phoneNumber}</div>
                                            <div className="text-xs text-slate-500">{contact.name || "Guest"}</div>
                                        </td>
                                        
                                        {/* 🔥 DIRECT CHAT BUTTON */}
                                        <td className="p-4">
                                            <button onClick={() => handleOpenChat(contact)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white rounded-md border border-indigo-500/20 transition-all text-xs font-bold">
                                                <MessageSquare size={14}/> Chat
                                            </button>
                                        </td>

                                        {/* 🔥 STATUS DROPDOWN (Simplified) */}
                                        <td className="p-4">
                                            <select 
                                                value={contact.callStatus || 'Pending'}
                                                onChange={(e) => handleUpdateRow(contact._id, 'callStatus', e.target.value)}
                                                className={`rounded-md px-2 py-1 text-xs font-bold outline-none cursor-pointer border border-transparent focus:border-white/20 ${getStatusColor(contact.callStatus)}`}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Answered">Answered</option>
                                                <option value="No Answer">No Answer</option>
                                                <option value="Reject">Reject</option>
                                            </select>
                                        </td>

                                        <td className="p-4">
                                            <input 
                                                type="text" 
                                                placeholder="Remark..." 
                                                value={contact.remarks || ''} 
                                                onChange={(e) => handleUpdateRow(contact._id, 'remarks', e.target.value)} 
                                                className="bg-transparent border-b border-white/10 w-full outline-none text-slate-300 focus:border-indigo-500 transition-colors"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    <div className="flex justify-between items-center text-xs text-slate-500 px-2 mt-4">
                        <span>Page {currentPage} of {totalPages || 1}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="p-2 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"><ChevronLeft size={16}/></button>
                            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="p-2 bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"><ChevronRight size={16}/></button>
                        </div>
                    </div>

                </div>
            ) : (
                /* INBOX VIEW */
                <div className="h-[82vh] rounded-2xl overflow-hidden border border-white/10 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                    <UserInbox isEmbedded={true} initialSelectedContact={chatTarget} />
                </div>
            )}
        </div>
    </div>
  );
};

export default UserAgentDash;