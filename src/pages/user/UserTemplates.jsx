import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { LayoutTemplate, Plus, RefreshCw, Trash2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const UserTemplates = () => {
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'create'
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'MARKETING',
    language: 'en_US',
    headerType: 'NONE',
    headerText: '',
    bodyText: '',
    footerText: ''
  });

  // 1. Fetch Templates
  const fetchTemplates = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}/api/templates`, {
            headers: { token: `Bearer ${token}` }
        });
        const data = await res.json();
        if(Array.isArray(data)) setTemplates(data);
        else alert(data.message || "Error fetching templates. Check WABA ID.");
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  // 2. Submit Template
  const handleSubmit = async (e) => {
      e.preventDefault();
      // Validate Name (Must be lowercase, underscores only)
      const nameRegex = /^[a-z0-9_]+$/;
      if (!nameRegex.test(formData.name)) {
          return alert("Name must be lowercase letters, numbers, and underscores only. (e.g., new_year_promo)");
      }

      setLoading(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/templates/create`, {
              method: "POST",
              headers: { "Content-Type": "application/json", token: `Bearer ${token}` },
              body: JSON.stringify(formData)
          });
          const data = await res.json();
          
          if (res.ok) {
              alert("Template Submitted for Approval! ✅");
              setFormData({ name: '', category: 'MARKETING', language: 'en_US', headerType: 'NONE', headerText: '', bodyText: '', footerText: '' });
              setActiveTab('list');
              fetchTemplates();
          } else {
              alert("Error: " + JSON.stringify(data));
          }
      } catch (err) {
          alert("Submission Failed");
      } finally {
          setLoading(false);
      }
  };

  // Helper: Status Color
  const getStatusBadge = (status) => {
      switch(status) {
          case 'APPROVED': return <span className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-xs font-bold"><CheckCircle size={12}/> APPROVED</span>;
          case 'REJECTED': return <span className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-1 rounded text-xs font-bold"><XCircle size={12}/> REJECTED</span>;
          default: return <span className="flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2 py-1 rounded text-xs font-bold"><Clock size={12}/> {status}</span>;
      }
  };

  return (
    <MainLayout>
        <div className="p-6 min-h-screen bg-[#0B1120]">
            
            <div className="flex justify-between items-center mb-6 max-w-5xl mx-auto">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-2"><LayoutTemplate className="text-blue-500"/> Template Manager</h2>
                    <p className="text-slate-400 text-sm">Create & Manage WhatsApp Templates to bypass 24hr rule.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-xl font-bold transition ${activeTab==='list' ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-slate-400'}`}>My Templates</button>
                    <button onClick={() => setActiveTab('create')} className={`px-4 py-2 rounded-xl font-bold transition ${activeTab==='create' ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-slate-400'}`}>+ Create New</button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                
                {/* LIST VIEW */}
                {activeTab === 'list' && (
                    <div className="space-y-4">
                        <div className="flex justify-end mb-2">
                            <button onClick={fetchTemplates} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm"><RefreshCw size={14}/> Refresh Status</button>
                        </div>
                        
                        {loading ? <p className="text-white text-center">Loading...</p> : templates.length === 0 ? <p className="text-slate-500 text-center">No templates found. Create one!</p> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {templates.map((tpl) => (
                                    <div key={tpl.id} className="bg-[#1e293b]/50 border border-white/5 p-5 rounded-2xl hover:border-blue-500/30 transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-white font-bold text-lg">{tpl.name}</h3>
                                            {getStatusBadge(tpl.status)}
                                        </div>
                                        <p className="text-slate-500 text-xs uppercase font-bold mb-3">{tpl.category} • {tpl.language}</p>
                                        
                                        <div className="bg-black/30 p-3 rounded-lg text-slate-300 text-sm mb-3 whitespace-pre-wrap font-mono">
                                            {tpl.components.find(c => c.type === 'BODY')?.text}
                                        </div>

                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-slate-500">ID: {tpl.id}</span>
                                            {/* Delete button can be added here if needed */}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* CREATE FORM */}
                {activeTab === 'create' && (
                    <div className="bg-[#1e293b]/50 border border-white/5 p-8 rounded-3xl animate-in fade-in">
                        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold">Template Name</label>
                                    <input required type="text" placeholder="e.g. promo_offer_jan" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toLowerCase()})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"/>
                                    <p className="text-[10px] text-slate-500 mt-1">Lowercase only, use underscores ( _ ) for spaces.</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold">Category</label>
                                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                                        <option value="MARKETING">Marketing</option>
                                        <option value="UTILITY">Utility (Updates)</option>
                                        <option value="AUTHENTICATION">Authentication (OTP)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold">Language</label>
                                    <select value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                                        <option value="en_US">English (US)</option>
                                        <option value="si_LK">Sinhala</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold">Header Type</label>
                                    <select value={formData.headerType} onChange={e => setFormData({...formData, headerType: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                                        <option value="NONE">None</option>
                                        <option value="IMAGE">Image</option>
                                        <option value="VIDEO">Video</option>
                                        <option value="DOCUMENT">Document</option>
                                        <option value="TEXT">Text Header</option>
                                    </select>
                                </div>
                            </div>

                            {formData.headerType === 'TEXT' && (
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold">Header Text</label>
                                    <input type="text" maxLength={60} value={formData.headerText} onChange={e => setFormData({...formData, headerText: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"/>
                                </div>
                            )}

                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold">Body Text (Message)</label>
                                <textarea required rows={5} placeholder="Hello {{1}}, we have a special offer for you! Check it out." value={formData.bodyText} onChange={e => setFormData({...formData, bodyText: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"/>
                                <p className="text-[10px] text-slate-500 mt-1">Use {'{{1}}'}, {'{{2}}'} for variables (Customer Name, Date, etc.)</p>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold">Footer (Optional)</label>
                                <input type="text" placeholder="e.g. Reply STOP to unsubscribe" value={formData.footerText} onChange={e => setFormData({...formData, footerText: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"/>
                            </div>

                            <button disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition">
                                {loading ? "Submitting..." : <><Plus size={20}/> Submit to Meta</>}
                            </button>

                        </form>
                    </div>
                )}
            </div>
        </div>
    </MainLayout>
  );
};

export default UserTemplates;