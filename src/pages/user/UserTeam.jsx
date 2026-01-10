import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Users, UserPlus, Trash2, Edit2, X, MessageSquare, Save, Loader, Shield, TrendingUp, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const UserTeam = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null); 
  const [agentStats, setAgentStats] = useState(null);
  const [agentChats, setAgentChats] = useState([]);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '' });
  
  const token = localStorage.getItem('token');

  // 1. Fetch Agents
  const fetchAgents = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/team/agents`, { 
            headers: { token: `Bearer ${token}` } 
        });
        if (res.ok) {
            const data = await res.json();
            setAgents(data);
        }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAgents(); }, []);

  // 2. Handle Agent Click (Calculate Stats)
  const handleAgentClick = async (agent) => {
      setSelectedAgent(agent);
      try {
          const chatRes = await fetch(`${API_BASE_URL}/api/crm/contacts?agentId=${agent._id}`, { 
              headers: { token: `Bearer ${token}` } 
          });
          
          if(chatRes.ok) {
              const chats = await chatRes.json();
              setAgentChats(chats);
              
              // --- CALCULATE STATS ---
              const totalAssigned = chats.length;
              const covered = chats.filter(c => c.callStatus === 'Answered').length;
              
              let rate = 0;
              if (totalAssigned > 0) {
                  rate = ((covered / totalAssigned) * 100).toFixed(1);
              }

              setAgentStats({
                  assigned: totalAssigned,
                  covered: covered,
                  rate: rate
              });
          }
      } catch (err) {
          console.error("Error loading agent details", err);
      }
  };

  // 3. Handle Add/Edit Submit
  const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);

      const url = isEditMode 
        ? `${API_BASE_URL}/api/team/agent/${formData.id}`
        : `${API_BASE_URL}/api/team/add-agent`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const bodyData = { ...formData };
      if(isEditMode && !bodyData.password) delete bodyData.password;

      try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
            body: JSON.stringify(bodyData)
        });

        const data = await res.json();

        if(res.ok) {
            setShowModal(false);
            fetchAgents(); 
            if(selectedAgent && isEditMode) {
                setSelectedAgent({ ...selectedAgent, name: formData.name, email: formData.email });
            }
            alert(isEditMode ? "Agent Updated!" : "Agent Added!");
            setFormData({ id: '', name: '', email: '', password: '' });
        } else {
            alert(data.message || "Operation Failed");
        }
      } catch(err) { 
          alert("Network Error");
      } finally { 
          setLoading(false); 
      }
  };

  // 4. Handle Delete
  const handleDelete = async (e, id) => {
      e.stopPropagation();
      if(!window.confirm("Are you sure? This action cannot be undone.")) return;
      
      try {
          const res = await fetch(`${API_BASE_URL}/api/team/agent/${id}`, {
              method: 'DELETE',
              headers: { token: `Bearer ${token}` }
          });
          
          if (res.ok) {
              fetchAgents();
              if(selectedAgent?._id === id) setSelectedAgent(null);
          } else {
              alert("Failed to delete agent");
          }
      } catch(err) { console.error(err); }
  };

  // Modal Open Logic
  const openAddModal = () => {
      setIsEditMode(false);
      setFormData({ id: '', name: '', email: '', password: '' });
      setShowModal(true);
  };

  const openEditModal = (e, agent) => {
      e.stopPropagation();
      setIsEditMode(true);
      setFormData({ id: agent._id, name: agent.name, email: agent.email, password: '' }); 
      setShowModal(true);
  };

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-[85vh]">
        
        {/* --- LEFT: AGENT LIST --- */}
        <div className={`${selectedAgent ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/3 flex-col transition-all duration-300`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white">My Team</h2>
                    <p className="text-slate-400 text-sm">Manage your sales force</p>
                </div>
                {/* This is the ONLY Add button now */}
                <button onClick={openAddModal} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl flex gap-2 font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition">
                    <UserPlus size={20}/> Add
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                 {agents.map((agent) => (
                    <div key={agent._id} onClick={() => handleAgentClick(agent)} 
                        className={`glass-panel p-4 rounded-2xl border cursor-pointer hover:bg-white/5 transition group relative ${selectedAgent?._id === agent._id ? 'border-blue-500 bg-blue-500/10' : 'border-white/5'}`}>
                        
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold text-lg shadow-inner border border-white/10">
                                {agent.name ? agent.name.charAt(0).toUpperCase() : "A"}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white text-lg">{agent.name}</h3>
                                <p className="text-sm text-slate-400">{agent.email}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => openEditModal(e, agent)} className="p-2 bg-white/10 hover:bg-blue-500 rounded-lg text-slate-300 hover:text-white transition"><Edit2 size={14}/></button>
                            <button onClick={(e) => handleDelete(e, agent._id)} className="p-2 bg-white/10 hover:bg-red-500 rounded-lg text-slate-300 hover:text-white transition"><Trash2 size={14}/></button>
                        </div>
                    </div>
                 ))}
            </div>
        </div>

        {/* --- RIGHT: DETAILS OR CARD VIEW --- */}
        {selectedAgent ? (
            // --- AGENT DETAILS DRAWER ---
            <div className="flex-1 glass-panel rounded-3xl border border-white/10 bg-[#0f172a]/95 p-6 flex flex-col animate-in slide-in-from-right duration-300 relative overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                            {selectedAgent.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{selectedAgent.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                    <Shield size={10}/> Active Agent
                                </span>
                                <span className="text-slate-400 text-sm">{selectedAgent.email}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedAgent(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition"><X size={20}/></button>
                </div>

                {/* KPI STATS */}
                {agentStats && (
                    <div className="grid grid-cols-3 gap-4 mb-8 relative z-10">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition"><Phone size={40}/></div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Assigned</p>
                            <h3 className="text-3xl font-bold text-white">{agentStats.assigned}</h3>
                            <div className="mt-2 text-xs text-slate-500">Total Leads</div>
                        </div>

                        <div className="bg-gradient-to-br from-emerald-900/40 to-emerald-900/10 p-5 rounded-2xl border border-emerald-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition text-emerald-500"><CheckCircle size={40}/></div>
                            <p className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">Covered</p>
                            <h3 className="text-3xl font-bold text-white">{agentStats.covered}</h3>
                            <div className="mt-2 text-xs text-emerald-500/60">Answered Calls</div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-900/40 to-blue-900/10 p-5 rounded-2xl border border-blue-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition text-blue-500"><TrendingUp size={40}/></div>
                            <p className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">Success Rate</p>
                            <h3 className="text-3xl font-bold text-white">{agentStats.rate}%</h3>
                            <div className="mt-2 text-xs text-blue-500/60">Conversion Performance</div>
                        </div>
                    </div>
                )}

                {/* Chat History List */}
                <div className="flex-1 flex flex-col min-h-0 relative z-10">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-blue-400"/> Recent Activity</h3>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 rounded-2xl p-4 space-y-2 border border-white/5">
                        {agentChats.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                <MessageSquare size={40} className="mb-2 opacity-20"/>
                                <p>No leads assigned yet.</p>
                            </div>
                        ) : (
                            agentChats.map(chat => (
                                <div key={chat._id} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center text-slate-300 font-bold border border-white/10">
                                            {chat.phoneNumber.slice(-2)}
                                        </div>
                                        <div>
                                            <p className="text-white font-bold text-sm">{chat.phoneNumber}</p>
                                            <p className="text-xs text-slate-400 truncate w-48">{chat.lastMessage || "No messages"}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${chat.callStatus === 'Answered' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
                                            {chat.callStatus || 'Pending'}
                                        </span>
                                        <p className="text-[10px] text-slate-600 mt-1">{new Date(chat.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        ) : (
            // --- TEAM CARDS OVERVIEW ---
            <div className="hidden lg:flex flex-1 flex-col overflow-hidden animate-in fade-in duration-500">
                <div className="mb-6">
                    <h2 className="text-3xl font-bold text-white">Team Overview</h2>
                    <p className="text-slate-400">View and manage your sales team performance</p>
                </div>

                {/* Removed the 'Add New Agent' Card from here to fix redundancy */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 overflow-y-auto custom-scrollbar pb-20 pr-2">
                    
                    {/* Agent Profile Cards */}
                    {agents.map((agent) => (
                        <div key={agent._id} onClick={() => handleAgentClick(agent)}
                            className="glass-panel p-6 rounded-3xl border border-white/5 hover:border-blue-500/30 hover:bg-white/5 cursor-pointer transition group relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                            
                            {/* Decorative Blur */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition"></div>

                            <div>
                                <div className="flex justify-between items-start mb-5">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-white font-bold text-xl shadow-inner group-hover:scale-105 transition">
                                        {agent.name ? agent.name.charAt(0).toUpperCase() : "A"}
                                    </div>
                                    <div className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 text-xs font-bold flex items-center gap-1">
                                        <Shield size={12}/> Active
                                    </div>
                                </div>
                                
                                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors truncate">{agent.name}</h3>
                                <p className="text-sm text-slate-400 truncate mt-1">{agent.email}</p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-400 transition">View Performance</span>
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition">
                                    <ArrowRight size={14}/>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Show placeholder if no agents */}
                    {agents.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center text-slate-500 p-10 border border-dashed border-white/10 rounded-3xl">
                             <Users size={40} className="mb-4 opacity-50"/>
                             <p>No agents found.</p>
                             <p className="text-sm">Click the "Add" button on the left to start.</p>
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>

      {/* --- ADD/EDIT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition"><X/></button>
                
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500">
                        {isEditMode ? <Edit2 size={32}/> : <UserPlus size={32}/>}
                    </div>
                    <h3 className="text-2xl font-bold text-white">{isEditMode ? "Edit Agent" : "Add New Agent"}</h3>
                    <p className="text-slate-400 text-sm">Enter agent details below</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase ml-1">Full Name</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                            className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none mt-1"/>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase ml-1">Email Address</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                            className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none mt-1"/>
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase ml-1">{isEditMode ? "New Password (Optional)" : "Password"}</label>
                        <input type="password" required={!isEditMode} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
                            className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none mt-1" 
                            placeholder={isEditMode ? "Leave empty to keep current" : "Create password"}/>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-4 transition shadow-lg shadow-blue-500/25">
                        {loading ? <Loader className="animate-spin"/> : <>{isEditMode ? "Save Changes" : "Create Account"}</>}
                    </button>
                </form>
            </div>
        </div>
      )}
    </MainLayout>
  );
};

export default UserTeam;