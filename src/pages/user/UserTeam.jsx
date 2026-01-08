import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Users, UserPlus, Trash2, Edit2, X, Phone, MessageSquare, Save, Loader, Shield, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const UserTeam = () => {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null); // Detail View
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
        const res = await fetch(`${API_BASE_URL}/api/team/agents`, { headers: { token: `Bearer ${token}` } });
        if (res.ok) setAgents(await res.json());
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAgents(); }, []);

  // 2. Handle Agent Click (View Details)
  const handleAgentClick = async (agent) => {
      setSelectedAgent(agent);
      // Fetch Chats for Agent
      const chatRes = await fetch(`${API_BASE_URL}/api/crm/contacts?agentId=${agent._id}`, { 
          headers: { token: `Bearer ${token}` } 
      });
      if(chatRes.ok) {
          const chats = await chatRes.json();
          setAgentChats(chats);
          
          // Calculate Stats locally (Preserving Call Campaign Logic)
          setAgentStats({
              total: chats.length,
              answered: chats.filter(c => c.callStatus === 'Answered').length,
              rejected: chats.filter(c => c.callStatus === 'Reject').length,
              pending: chats.filter(c => c.callStatus === 'Pending').length
          });
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

      try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
            body: JSON.stringify(formData)
        });

        if(res.ok) {
            setShowModal(false);
            fetchAgents();
            alert(isEditMode ? "Agent Updated!" : "Agent Added Successfully!");
        } else {
            const err = await res.json();
            alert(err.message || "Operation Failed");
        }
      } catch(err) { console.error(err); }
      finally { setLoading(false); }
  };

  // 4. Handle Delete
  const handleDelete = async (e, id) => {
      e.stopPropagation(); // Prevent card click
      if(!window.confirm("Are you sure? This agent and their assignment data will be lost.")) return;
      
      try {
          await fetch(`${API_BASE_URL}/api/team/agent/${id}`, {
              method: 'DELETE',
              headers: { token: `Bearer ${token}` }
          });
          fetchAgents();
          if(selectedAgent?._id === id) setSelectedAgent(null);
      } catch(err) { console.error(err); }
  };

  // Open Modal Logic
  const openAddModal = () => {
      setIsEditMode(false);
      setFormData({ id: '', name: '', email: '', password: '' });
      setShowModal(true);
  };

  const openEditModal = (e, agent) => {
      e.stopPropagation();
      setIsEditMode(true);
      setFormData({ id: agent._id, name: agent.name, email: agent.email, password: '' }); // Password empty by default
      setShowModal(true);
  };

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-6 h-[85vh]">
        
        {/* --- LEFT: AGENT LIST --- */}
        <div className={`${selectedAgent ? 'w-full lg:w-1/3' : 'w-full'} transition-all duration-300 flex flex-col`}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white">My Team</h2>
                    <p className="text-slate-400 text-sm">Manage your sales agents</p>
                </div>
                <button onClick={openAddModal} className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl flex gap-2 font-bold shadow-lg shadow-blue-500/20 transition">
                    <UserPlus size={20}/> Add Agent
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                {agents.length === 0 ? <p className="text-slate-500 text-center mt-10">No agents added yet.</p> : 
                 agents.map((agent) => (
                    <div key={agent._id} onClick={() => handleAgentClick(agent)} 
                        className={`glass-panel p-4 rounded-2xl border cursor-pointer hover:bg-white/5 transition group relative ${selectedAgent?._id === agent._id ? 'border-blue-500 bg-blue-500/10' : 'border-white/5'}`}>
                        
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                                {agent.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-white text-lg">{agent.name}</h3>
                                <p className="text-sm text-slate-400">{agent.email}</p>
                            </div>
                        </div>

                        {/* Quick Actions (Visible on Hover) */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => openEditModal(e, agent)} className="p-2 bg-white/10 hover:bg-blue-500 hover:text-white rounded-lg text-slate-300 transition"><Edit2 size={14}/></button>
                            <button onClick={(e) => handleDelete(e, agent._id)} className="p-2 bg-white/10 hover:bg-red-500 hover:text-white rounded-lg text-slate-300 transition"><Trash2 size={14}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- RIGHT: AGENT DETAILS DRAWER --- */}
        {selectedAgent && (
            <div className="flex-1 glass-panel rounded-3xl border border-white/10 bg-[#0f172a]/95 p-6 flex flex-col animate-in slide-in-from-right duration-300 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                {/* Header */}
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-blue-500/25">
                            {selectedAgent.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{selectedAgent.name}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                                    <Shield size={10}/> Agent
                                </span>
                                <span className="text-slate-400 text-sm">{selectedAgent.email}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setSelectedAgent(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition"><X size={20}/></button>
                </div>

                {/* KPI Cards (Preserving Call Campaign Stats) */}
                {agentStats && (
                    <div className="grid grid-cols-4 gap-4 mb-8 relative z-10">
                        <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 text-center">
                            <h3 className="text-3xl font-bold text-white">{agentStats.total}</h3>
                            <p className="text-xs text-blue-300 uppercase font-bold tracking-wider mt-1">Assigned</p>
                        </div>
                        <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-center">
                            <h3 className="text-3xl font-bold text-white">{agentStats.answered}</h3>
                            <p className="text-xs text-emerald-300 uppercase font-bold tracking-wider mt-1">Answered</p>
                        </div>
                        <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 text-center">
                            <h3 className="text-3xl font-bold text-white">{agentStats.rejected}</h3>
                            <p className="text-xs text-red-300 uppercase font-bold tracking-wider mt-1">Rejected</p>
                        </div>
                        <div className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20 text-center">
                            <h3 className="text-3xl font-bold text-white">{agentStats.pending}</h3>
                            <p className="text-xs text-yellow-300 uppercase font-bold tracking-wider mt-1">Pending</p>
                        </div>
                    </div>
                )}

                {/* Assigned Chats List */}
                <div className="flex-1 flex flex-col min-h-0 relative z-10">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-blue-400"/> Recent Activity & Chats</h3>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 rounded-2xl p-4 space-y-2 border border-white/5">
                        {agentChats.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                <MessageSquare size={40} className="mb-2 opacity-20"/>
                                <p>No leads assigned to this agent yet.</p>
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
                                            {chat.callStatus}
                                        </span>
                                        <p className="text-[10px] text-slate-600 mt-1">{new Date(chat.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}

      </div>

      {/* --- ADD/EDIT AGENT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition"><X/></button>
                
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500">
                        {isEditMode ? <Edit2 size={32}/> : <UserPlus size={32}/>}
                    </div>
                    <h3 className="text-2xl font-bold text-white">{isEditMode ? "Edit Agent" : "Add New Agent"}</h3>
                    <p className="text-slate-400 text-sm">Fill in the details below</p>
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
                            className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none mt-1" placeholder={isEditMode ? "Leave empty to keep current" : "Create a password"}/>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-4 transition shadow-lg shadow-blue-500/25">
                        {loading ? <Loader className="animate-spin"/> : <>{isEditMode ? <Save size={20}/> : <UserPlus size={20}/>} {isEditMode ? "Save Changes" : "Create Account"}</>}
                    </button>
                </form>
            </div>
        </div>
      )}
    </MainLayout>
  );
};

export default UserTeam;