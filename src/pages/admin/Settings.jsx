import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { User, Lock, Save, Shield, UserPlus, Loader, CheckCircle, Trash2, Edit } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState([]); // Admin List State
  const token = localStorage.getItem('token');

  const [newAdmin, setNewAdmin] = useState({ username: '', email: '', password: '' });

  // Fetch Admins List
  const fetchAdmins = async () => {
    try {
        const res = await fetch(`${API_BASE_URL}/api/users`, { // All users ගන්නවා
            headers: { token: `Bearer ${token}` }
        });
        const data = await res.json();
        // Filter only Admins
        const adminList = data.filter(u => u.role === 'admin');
        setAdmins(adminList);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if(activeTab === 'admins') fetchAdmins();
  }, [activeTab]);

  // Create Admin Function
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAdmin, role: 'admin' }) 
      });
      const data = await res.json();
      if(res.ok) {
        alert("New Admin Created Successfully! 🎉");
        setNewAdmin({ username: '', email: '', password: '' });
        fetchAdmins(); // Refresh List
      } else {
        alert(data.message || "Failed to create admin");
      }
    } catch (err) { alert("Error connecting to server"); }
    finally { setLoading(false); }
  };

  // Delete Admin
  const handleDeleteAdmin = async (id) => {
      if(!window.confirm("Are you sure? This cannot be undone.")) return;
      try {
          await fetch(`${API_BASE_URL}/api/users/${id}`, {
              method: 'DELETE',
              headers: { token: `Bearer ${token}` }
          });
          fetchAdmins();
      } catch (err) { console.error(err); }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Settings</h2>
          <p className="text-slate-400">Manage system administrators and security.</p>
        </div>

        <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
          {/* Settings Sidebar */}
          <div className="w-full md:w-64 bg-white/5 border-r border-white/5 p-4 space-y-2">
            <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <User size={18} /> Profile
            </button>
            <button onClick={() => setActiveTab('admins')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'admins' ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              <UserPlus size={18} /> Manage Admins
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-8 overflow-y-auto">
            
            {/* --- PROFILE TAB --- */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <User className="text-primary" size={24}/> My Profile
                </h3>
                <div className="p-6 bg-slate-800/50 rounded-2xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">A</div>
                        <div>
                            <h4 className="text-white font-bold">Current Admin Session</h4>
                            <p className="text-slate-400 text-sm">You have full access</p>
                        </div>
                    </div>
                </div>
              </div>
            )}

            {/* --- MANAGE ADMINS TAB --- */}
            {activeTab === 'admins' && (
              <div className="space-y-8">
                {/* Create Form */}
                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <UserPlus size={20} className="text-primary"/> Add New Admin
                    </h3>
                    <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input required type="text" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} className="bg-[#0f172a] border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none" placeholder="Username" />
                        <input required type="email" value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} className="bg-[#0f172a] border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none" placeholder="Email" />
                        <input required type="password" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="bg-[#0f172a] border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none" placeholder="Password" />
                        
                        <div className="md:col-span-3">
                            <button disabled={loading} className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center gap-2 transition-all w-full md:w-auto justify-center">
                                {loading ? <Loader className="animate-spin" size={18}/> : <><CheckCircle size={18} /> Create Admin Account</>}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Admins List */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">Existing Admins ({admins.length})</h3>
                    <div className="space-y-3">
                        {admins.map(admin => (
                            <div key={admin._id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                        {admin.username?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold">{admin.username}</h4>
                                        <p className="text-slate-400 text-xs">{admin.email}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {/* Delete Button */}
                                    <button onClick={() => handleDeleteAdmin(admin._id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition" title="Remove Admin">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;