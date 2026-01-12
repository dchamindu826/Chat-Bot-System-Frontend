import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Phone, Mail, UserCheck, Plus, X, Loader, Edit, Trash2, Power, Key, LogIn } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Customers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', businessName: '', phone: '',
    phoneNumberId: '',
    accessToken: ''
  });

  const token = localStorage.getItem('token');

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/clients`, {
        headers: { token: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setClients(data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchClients(); }, []);

  // --- 🔥 UPDATED GHOST LOGIN (NEW TAB) ---
  const handleGhostLogin = async (client) => {
    if(!window.confirm(`⚠️ Warning: You are about to log in as "${client.businessName || client.name}".\n\nA new tab will open for this session.`)) return;
    
    try {
      // 1. Request a temporary access token for this user
      const res = await fetch(`${API_BASE_URL}/api/auth/ghost-login/${client._id}`, { // Make sure this route exists in backend
        method: 'POST',
        headers: { token: `Bearer ${token}` }
      });
      
      const data = await res.json();

      if (res.ok) {
        // 2. Open a new tab with the token in the URL
        const url = `${window.location.origin}/ghost-access?token=${data.token}`;
        window.open(url, '_blank');
      } else {
        alert(data.message || "Ghost Login Failed! (Check if backend route exists)");
      }
    } catch (err) {
      console.error(err);
      alert("Network Error during Ghost Login");
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setFormData({ name: '', email: '', password: '', businessName: '', phone: '', phoneNumberId: '', accessToken: '' });
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setIsEditMode(true);
    setEditId(client._id);
    setFormData({ 
      name: client.name || '', 
      email: client.email || '', 
      password: '', 
      businessName: client.businessName || '', 
      phone: client.phone || '',
      phoneNumberId: client.whatsappConfig?.phoneNumberId || '',
      accessToken: client.whatsappConfig?.accessToken || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    const url = isEditMode 
      ? `${API_BASE_URL}/api/users/client/${editId}` 
      : `${API_BASE_URL}/api/users/client`;
    
    const method = isEditMode ? 'PUT' : 'POST';
    
    const dataToSend = {
      name: formData.name,
      email: formData.email,
      businessName: formData.businessName,
      phone: formData.phone,
      whatsappConfig: {
        phoneNumberId: formData.phoneNumberId,
        accessToken: formData.accessToken
      }
    };

    if (formData.password) dataToSend.password = formData.password;

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
        body: JSON.stringify(dataToSend)
      });

      if (res.ok) {
        setShowModal(false);
        fetchClients();
      } else {
        alert("Operation Failed!");
      }
    } catch (err) { console.error(err); } 
    finally { setSubmitLoading(false); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Delete this client?")) return;
    try {
      await fetch(`${API_BASE_URL}/api/users/client/${id}`, {
        method: 'DELETE',
        headers: { token: `Bearer ${token}` }
      });
      fetchClients();
    } catch (err) { console.error(err); }
  };

  const toggleStatus = async (client) => {
    const newStatus = client.status === 'active' ? 'inactive' : 'active';
    try {
      await fetch(`${API_BASE_URL}/api/users/client/${client._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      fetchClients();
    } catch (err) { console.error(err); }
  };

  const filteredClients = clients.filter(client => 
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="space-y-8 relative">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold text-white">Clients</h2>
          <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 rounded-xl text-white font-bold transition-colors">
            <Plus size={20}/> Add Client
          </button>
        </div>

        <div className="relative group max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#1e293b]/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-all"/>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <motion.div key={client._id} layout className={`glass-panel p-6 rounded-3xl border ${client.status === 'inactive' ? 'border-red-500/30 opacity-75' : 'border-white/5'} relative group`}>
              
              {/* 🔥 ACTION BUTTONS */}
              <div className="absolute top-4 right-4 flex gap-2">
                 <button onClick={() => handleGhostLogin(client)} className="p-2 bg-purple-500/20 hover:bg-purple-500/40 rounded-full text-purple-400 hover:text-white transition" title="Login as this User in New Tab">
                    <LogIn size={16} />
                 </button>
                 
                 <button onClick={() => toggleStatus(client)} className={`p-2 rounded-full transition ${client.status === 'active' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}><Power size={16} /></button>
                 <button onClick={() => openEditModal(client)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition"><Edit size={16} /></button>
                 <button onClick={() => handleDelete(client._id)} className="p-2 bg-white/5 hover:bg-red-500/20 rounded-full text-slate-400 hover:text-red-500 transition"><Trash2 size={16} /></button>
              </div>

              <div className="flex items-center gap-4 mb-6 mt-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl font-bold text-white">
                  {client.businessName ? client.businessName.charAt(0).toUpperCase() : client.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">{client.businessName || client.name}</h3>
                  <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${client.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                      <span className="text-[10px] uppercase text-slate-400">{client.status}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 text-sm text-slate-400">
                  <div className="flex gap-3"><UserCheck size={16} className="text-primary/70"/> {client.name}</div>
                  <div className="flex gap-3"><Mail size={16} className="text-secondary/70"/> {client.email}</div>
                  <div className="flex gap-3 items-center"><Phone size={16} className="text-emerald-500/70"/> <span>{client.phone || "No Phone"}</span></div>
                  
                  <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2">
                    <Key size={14} className={client.whatsappConfig?.phoneNumberId ? "text-emerald-400" : "text-slate-600"} />
                    <span className={client.whatsappConfig?.phoneNumberId ? "text-emerald-400 text-xs" : "text-slate-600 text-xs"}>
                        {client.whatsappConfig?.phoneNumberId ? "Meta Connected" : "No API Keys"}
                    </span>
                  </div>
              </div>

              <div className="flex gap-2 mt-4">
                  <button onClick={() => navigate(`/admin/bot-builder/${client._id}`)} className="flex-1 py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition">
                    <MessageSquare size={16} /> Config Bot
                  </button>
                  <button onClick={() => navigate(`/admin/inbox/${client._id}`)} className="px-4 py-3 bg-[#1e293b] hover:bg-slate-700 border border-white/10 text-white font-bold rounded-xl flex items-center justify-center transition" title="View Inbox">
                    <Mail size={18} />
                  </button>
              </div>

            </motion.div>
          ))}
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}/>
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-[#0f172a] border border-white/10 p-8 rounded-3xl w-full max-w-lg z-10 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={24} /></button>
                <h2 className="text-2xl font-bold text-white mb-6">{isEditMode ? 'Edit Client' : 'Add New Client'}</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/5">
                      <h3 className="text-sm font-bold text-slate-300 uppercase">Basic Info</h3>
                      <input name="businessName" value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white" placeholder="Business Name" required />
                      <input name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white" placeholder="Client Name" required />
                      <div className="grid grid-cols-2 gap-4">
                        <input name="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white" placeholder="Phone" />
                        <input name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white" placeholder="Email" required />
                      </div>
                      <input name="password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white" placeholder={isEditMode ? "New Password (Optional)" : "Password"} required={!isEditMode} />
                  </div>

                  <div className="space-y-4 p-4 bg-emerald-900/10 rounded-xl border border-emerald-500/20">
                      <h3 className="text-sm font-bold text-emerald-400 uppercase flex items-center gap-2"><Key size={14}/> Meta API Config</h3>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Phone Number ID</label>
                        <input name="phoneNumberId" value={formData.phoneNumberId} onChange={(e) => setFormData({...formData, phoneNumberId: e.target.value})} className="w-full bg-black/20 border border-emerald-500/20 rounded-xl p-3 text-white font-mono text-sm focus:border-emerald-500" placeholder="e.g. 100609..." />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 mb-1 block">Permanent Access Token</label>
                        <input name="accessToken" value={formData.accessToken} onChange={(e) => setFormData({...formData, accessToken: e.target.value})} className="w-full bg-black/20 border border-emerald-500/20 rounded-xl p-3 text-white font-mono text-sm focus:border-emerald-500" placeholder="e.g. EAAG..." />
                      </div>
                  </div>

                  <button disabled={submitLoading} className="w-full py-3 bg-primary hover:bg-primary/90 rounded-xl text-white font-bold flex justify-center">{submitLoading ? <Loader className="animate-spin" /> : (isEditMode ? "Update Client" : "Register Client")}</button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
};
export default Customers;