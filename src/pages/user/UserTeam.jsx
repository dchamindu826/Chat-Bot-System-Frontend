import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Users, UserPlus, Trash2, Shield } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const UserTeam = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // New Agent Form
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');

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
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAgents(); }, []);

  // 2. Create Agent
  const handleCreate = async (e) => {
    e.preventDefault();
    setMsg('Creating...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/team/add-agent`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            token: `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setMsg('');
        setShowModal(false);
        setFormData({ name: '', email: '', password: '' });
        fetchAgents(); // Refresh list
        alert("Agent Created Successfully!");
      } else {
        setMsg('Failed to create agent.');
      }
    } catch (err) { setMsg('Error occurred.'); }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold text-white mb-2">Team Management</h2>
                <p className="text-slate-400">Create logins for your support agents.</p>
            </div>
            <button 
                onClick={() => setShowModal(true)} 
                className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition flex items-center gap-2"
            >
                <UserPlus size={20}/> Add New Agent
            </button>
        </div>

        {/* Agents List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? <div className="text-slate-500">Loading agents...</div> : 
             agents.length === 0 ? <div className="text-slate-500">No agents found. Add one!</div> :
             agents.map((agent) => (
                <div key={agent._id} className="glass-panel p-6 rounded-3xl border border-white/5 bg-[#1e293b]/50 group hover:border-primary/50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                            {agent.name.charAt(0)}
                        </div>
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-xs border border-emerald-500/20">Active</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{agent.name}</h3>
                    <p className="text-slate-400 text-sm mb-4">{agent.email}</p>
                    
                    <div className="pt-4 border-t border-white/5 flex gap-2">
                        <button className="flex-1 py-2 bg-white/5 rounded-lg text-slate-300 text-sm hover:bg-white/10">Reset Pass</button>
                        <button className="p-2 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20"><Trash2 size={18}/></button>
                    </div>
                </div>
            ))}
        </div>

        {/* Add Agent Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-[#0f172a] border border-white/10 rounded-3xl p-8 w-full max-w-md relative">
                    <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
                    <h3 className="text-2xl font-bold text-white mb-6">Add Support Agent</h3>
                    
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">Agent Name</label>
                            <input required type="text" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white" 
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">Login Email</label>
                            <input required type="email" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white" 
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-slate-400 text-sm mb-1 block">Password</label>
                            <input required type="password" className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white" 
                                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                        </div>
                        
                        <button type="submit" className="w-full py-3 bg-primary text-white font-bold rounded-xl mt-4">Create Agent</button>
                        {msg && <p className="text-center text-sm text-yellow-400 mt-2">{msg}</p>}
                    </form>
                </div>
            </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UserTeam;