import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { 
  LayoutTemplate, Plus, RefreshCw, CheckCircle, XCircle, 
  Clock, UploadCloud, FileText, X, Loader, Trash2, 
  Paperclip, PlusCircle 
} from 'lucide-react';

import { API_BASE_URL } from '../../config';

const UserTemplates = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [uploading, setUploading] = useState(false);
  const [headerMediaUrl, setHeaderMediaUrl] = useState(null); 
  
  const token = localStorage.getItem('token');

  const CLOUD_NAME = "dyixoaldi"; 
  const UPLOAD_PRESET = "Chat Bot System"; 

  // 🔥 NEW: buttons array එකතු කරලා තියෙනවා
  const [formData, setFormData] = useState({
    name: '', category: 'MARKETING', language: 'en_US', headerType: 'NONE', headerText: '', bodyText: '', footerText: '', buttons: []
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
        const res = await fetch(`${API_BASE_URL}/api/templates`, { headers: { token: `Bearer ${token}` } });
        const data = await res.json();
        if(Array.isArray(data)) setTemplates(data);
        else alert(data.message || "Error fetching templates.");
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleDeleteTemplate = async (templateName) => {
      if(!window.confirm(`Are you sure you want to delete '${templateName}'? This will permanently delete it from Meta.`)) return;
      
      try {
          const res = await fetch(`${API_BASE_URL}/api/templates/${templateName}`, {
              method: 'DELETE',
              headers: { token: `Bearer ${token}` }
          });
          
          if(res.ok) {
              alert("Template deleted successfully! ✅");
              fetchTemplates();
          } else {
              const data = await res.json();
              alert("Error: " + (data.message || "Could not delete"));
          }
      } catch (err) {
          console.error(err);
          alert("Failed to delete template.");
      }
  };

  const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setUploading(true);
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", UPLOAD_PRESET); 
      data.append("cloud_name", CLOUD_NAME);

      try {
          const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: data });
          const result = await res.json();
          if (result.secure_url) {
              setHeaderMediaUrl(result.secure_url);
          } else {
              alert("Cloudinary Upload Failed!");
          }
      } catch (error) {
          alert("Upload Failed");
      } finally {
          setUploading(false);
      }
  };

  // 🔥 NEW: Button Management Functions
  const handleAddButton = () => {
      if (formData.buttons.length < 3) {
          setFormData({ ...formData, buttons: [...formData.buttons, { type: 'QUICK_REPLY', text: '' }] });
      } else {
          alert("Meta only allows a maximum of 3 quick reply buttons per template.");
      }
  };

  const handleButtonTextChange = (index, text) => {
      const newButtons = [...formData.buttons];
      newButtons[index].text = text;
      setFormData({ ...formData, buttons: newButtons });
  };

  const handleRemoveButton = (index) => {
      const newButtons = formData.buttons.filter((_, i) => i !== index);
      setFormData({ ...formData, buttons: newButtons });
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      const nameRegex = /^[a-z0-9_]+$/;
      if (!nameRegex.test(formData.name)) return alert("Name must be lowercase letters, numbers, and underscores only.");
      if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(formData.headerType) && !headerMediaUrl) return alert(`Please upload a ${formData.headerType} first!`);
      
      // Check if button texts are filled
      const hasEmptyButtons = formData.buttons.some(btn => btn.text.trim() === '');
      if (hasEmptyButtons) return alert("Please fill in all button texts or remove the empty buttons.");

      setLoading(true);
      try {
        const payload = { ...formData, headerUrl: headerMediaUrl };
        const res = await fetch(`${API_BASE_URL}/api/templates/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json", token: `Bearer ${token}` },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (res.ok) {
            alert("Template Submitted for Approval! ✅");
            setFormData({ name: '', category: 'MARKETING', language: 'en_US', headerType: 'NONE', headerText: '', bodyText: '', footerText: '', buttons: [] });
            setHeaderMediaUrl(null); 
            setActiveTab('list');
            fetchTemplates();
        } else {
            alert("Error: " + JSON.stringify(result));
        }
      } catch (err) { alert("Submission Failed"); } 
      finally { setLoading(false); }
  };

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
                    <p className="text-slate-400 text-sm">Create & Manage WhatsApp Templates.</p>
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
                        
                        {loading ? <p className="text-white text-center">Loading...</p> : templates.length === 0 ? <p className="text-slate-500 text-center">No templates found.</p> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {templates.map((tpl) => (
                                    <div key={tpl.id} className="bg-[#1e293b]/50 border border-white/5 p-5 rounded-2xl hover:border-blue-500/30 transition relative group flex flex-col h-full">
                                        
                                        <button 
                                            onClick={() => handleDeleteTemplate(tpl.name)} 
                                            className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-500 hover:text-white"
                                            title="Delete Template"
                                        >
                                            <Trash2 size={16} />
                                        </button>

                                        <div className="flex justify-between items-start mb-2 pr-10">
                                            <h3 className="text-white font-bold text-lg truncate">{tpl.name}</h3>
                                        </div>
                                        <div className="mb-3">{getStatusBadge(tpl.status)}</div>
                                        <p className="text-slate-500 text-xs uppercase font-bold mb-3">{tpl.category} • {tpl.language}</p>
                                        
                                        <div className="bg-black/30 p-3 rounded-lg text-slate-300 text-sm mb-3 whitespace-pre-wrap font-mono flex-1">
                                            {/* Show Header Text if exists */}
                                            {tpl.components.find(c => c.type === 'HEADER' && c.format === 'TEXT') && (
                                                <div className="font-bold mb-2 pb-2 border-b border-white/5">{tpl.components.find(c => c.type === 'HEADER').text}</div>
                                            )}
                                            {/* Show Media Tag if exists */}
                                            {tpl.components.find(c => c.type === 'HEADER' && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format)) && (
                                                <div className="text-blue-400 text-xs mb-2 flex items-center gap-1"><Paperclip size={12}/> Media Header Attached</div>
                                            )}
                                            
                                            {tpl.components.find(c => c.type === 'BODY')?.text}
                                            
                                            {/* Show Footer if exists */}
                                            {tpl.components.find(c => c.type === 'FOOTER') && (
                                                <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-white/5">{tpl.components.find(c => c.type === 'FOOTER').text}</div>
                                            )}

                                            {/* 🔥 Show Buttons if exist */}
                                            {tpl.components.find(c => c.type === 'BUTTONS') && (
                                                <div className="mt-3 flex flex-col gap-1">
                                                    {tpl.components.find(c => c.type === 'BUTTONS').buttons.map((btn, idx) => (
                                                        <div key={idx} className="bg-[#2A3942] text-[#00A884] text-center py-1.5 rounded-lg text-xs font-bold border border-[#00A884]/30">
                                                            {btn.text}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[10px] text-slate-600">ID: {tpl.id}</span>
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
                                    <p className="text-[10px] text-slate-500 mt-1">Lowercase only, use underscores.</p>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold">Category</label>
                                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                                        <option value="MARKETING">Marketing</option>
                                        <option value="UTILITY">Utility</option>
                                        <option value="AUTHENTICATION">Authentication</option>
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
                                    <select value={formData.headerType} onChange={e => {
                                        setFormData({...formData, headerType: e.target.value});
                                        setHeaderMediaUrl(null); 
                                    }} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none">
                                        <option value="NONE">None</option>
                                        <option value="TEXT">Text Header</option>
                                        <option value="IMAGE">Image</option>
                                        <option value="VIDEO">Video</option>
                                        <option value="DOCUMENT">Document</option>
                                    </select>
                                </div>
                            </div>

                            {formData.headerType === 'TEXT' && (
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold">Header Text</label>
                                    <input type="text" maxLength={60} value={formData.headerText} onChange={e => setFormData({...formData, headerText: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"/>
                                </div>
                            )}

                            {['IMAGE', 'VIDEO', 'DOCUMENT'].includes(formData.headerType) && (
                                <div className="bg-black/20 border border-white/10 rounded-xl p-4">
                                    <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Upload Sample {formData.headerType}</label>
                                    
                                    {!headerMediaUrl ? (
                                        <label className={`flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-white/5 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                            {uploading ? (
                                                <div className="flex flex-col items-center">
                                                    <Loader className="animate-spin text-blue-500 mb-2"/>
                                                    <span className="text-sm text-slate-300">Uploading...</span>
                                                </div>
                                            ) : (
                                                <>
                                                    <UploadCloud className="text-slate-400 mb-2"/>
                                                    <span className="text-sm text-slate-300">Click to upload sample file</span>
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept={formData.headerType === 'IMAGE' ? "image/*" : formData.headerType === 'VIDEO' ? "video/*" : ".pdf"}
                                                        onChange={handleFileUpload}
                                                        disabled={uploading}
                                                    />
                                                </>
                                            )}
                                        </label>
                                    ) : (
                                        <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {formData.headerType === 'IMAGE' ? (
                                                    <img src={headerMediaUrl} alt="preview" className="w-10 h-10 rounded object-cover"/>
                                                ) : (
                                                    <FileText className="text-emerald-400"/>
                                                )}
                                                <div className="overflow-hidden">
                                                    <span className="text-xs font-bold text-emerald-400 block">Uploaded Successfully!</span>
                                                    <a href={headerMediaUrl} target="_blank" rel="noreferrer" className="text-[10px] text-slate-400 hover:text-white truncate block max-w-[200px] underline">View Link</a>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => setHeaderMediaUrl(null)} className="text-slate-400 hover:text-red-400"><X size={18}/></button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold">Body Text (Message)</label>
                                <textarea required rows={5} placeholder="Hello {{1}}, we have a special offer..." value={formData.bodyText} onChange={e => setFormData({...formData, bodyText: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"/>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold">Footer (Optional)</label>
                                <input type="text" placeholder="e.g. Reply STOP to unsubscribe" value={formData.footerText} onChange={e => setFormData({...formData, footerText: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white outline-none"/>
                            </div>

                            {/* 🔥 NEW: Quick Reply Buttons Section */}
                            <div className="bg-black/20 border border-white/10 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-xs text-slate-400 uppercase font-bold block">Quick Reply Buttons (Max 3)</label>
                                    {formData.buttons.length < 3 && (
                                        <button type="button" onClick={handleAddButton} className="text-[10px] bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-2 py-1 rounded flex items-center gap-1 transition">
                                            <PlusCircle size={12} /> Add Button
                                        </button>
                                    )}
                                </div>

                                {formData.buttons.length === 0 ? (
                                    <p className="text-xs text-slate-500 italic">No buttons added.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {formData.buttons.map((btn, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-slate-500 w-6">{index + 1}.</span>
                                                <input 
                                                    type="text" 
                                                    maxLength={25}
                                                    placeholder="Button Text (e.g. Yes, Contact Us)" 
                                                    value={btn.text} 
                                                    onChange={(e) => handleButtonTextChange(index, e.target.value)}
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                                                />
                                                <button type="button" onClick={() => handleRemoveButton(index)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button disabled={loading || uploading} className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed">
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