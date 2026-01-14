import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { 
    Link, Copy, Send, Users, FileText, Download, 
    Calendar, Paperclip, Search, CheckSquare, Square, 
    Loader, RefreshCw, Clock, CheckCircle, XCircle 
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useTheme } from '../../context/ThemeContext';

const UserTools = () => {
  const { theme } = useTheme();

  // Cloudinary Config
  const CLOUD_NAME = "dyixoaldi"; 
  const UPLOAD_PRESET = "Chat Bot System"; 

  // Tabs State
  const [activeTab, setActiveTab] = useState('link'); // 'link', 'broadcast', 'contacts'

  // Data States
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Broadcast States (NEW)
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState([]);
  
  // Form States
  const [campaignName, setCampaignName] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaUrl, setMediaUrl] = useState(''); // Store uploaded URL

  // Link Gen State
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem('token');

  // --- 1. LOAD DATA (CONTACTS & HISTORY) ---
  const fetchContacts = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/api/crm/contacts`, { 
              headers: { token: `Bearer ${token}` } 
          });
          const data = await res.json();
          if(Array.isArray(data)) setContacts(data);
      } catch (err) { console.error(err); }
  };

  const fetchHistory = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/api/broadcast`, { 
              headers: { token: `Bearer ${token}` } 
          });
          const data = await res.json();
          if(Array.isArray(data)) setBroadcastHistory(data);
      } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchContacts();
    if(activeTab === 'broadcast') fetchHistory();
  }, [activeTab]);

  // --- 2. CSV EXPORT LOGIC ---
  const exportToCSV = () => {
    const csvRows = [];
    csvRows.push(['Phone Number', 'Name', 'Status']); 
    contacts.forEach(c => {
        csvRows.push([c.phoneNumber, c.name || 'Unknown', c.status || 'Active']);
    });
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `whatsapp_contacts.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // --- 3. HELPER: UPLOAD MEDIA ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    setUploading(true);
    setMediaFile(file);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET); 
    formData.append("cloud_name", CLOUD_NAME);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: formData });
        const data = await res.json();
        setMediaUrl(data.secure_url);
    } catch (err) {
        alert("Upload Failed");
    } finally {
        setUploading(false);
    }
  };

  // --- 4. 🔥 NEW BROADCAST CAMPAIGN LOGIC ---
  const handleCreateCampaign = async () => {
    if(selectedContacts.length === 0) return alert("Please select contacts first!");
    if(!broadcastMsg && !mediaUrl) return alert("Please enter a message or attach a file!");
    if(!campaignName) return alert("Please give a Campaign Name!");
    if(!scheduleTime) return alert("Please select a Schedule Time!");

    if(!window.confirm(`Schedule "${campaignName}" for ${selectedContacts.length} people?`)) return;

    setSending(true);

    // 1. Get Phone Numbers from IDs
    const recipientNumbers = selectedContacts.map(id => {
        const contact = contacts.find(c => c._id === id);
        return contact ? contact.phoneNumber : null;
    }).filter(Boolean);

    // 2. Determine Message Type
    let msgType = 'text';
    if (mediaUrl) {
        if (mediaFile?.type.startsWith('image')) msgType = 'image';
        else if (mediaFile?.type.startsWith('video')) msgType = 'video';
        else if (mediaFile?.type.startsWith('audio')) msgType = 'audio';
        else msgType = 'document';
    }

    // 3. Send to Backend
    try {
        const payload = {
            name: campaignName,
            recipients: recipientNumbers,
            messageType: msgType,
            message: broadcastMsg,
            mediaUrl: mediaUrl,
            scheduledTime: new Date(scheduleTime).toISOString()
        };

        const res = await fetch(`${API_BASE_URL}/api/broadcast/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
            body: JSON.stringify(payload)
        });

        if(res.ok) {
            alert("Campaign Scheduled Successfully! 🚀");
            setCampaignName('');
            setBroadcastMsg('');
            setMediaUrl('');
            setMediaFile(null);
            setScheduleTime('');
            setSelectedContacts([]);
            fetchHistory(); // Refresh History
        } else {
            alert("Failed to create campaign.");
        }
    } catch (err) {
        console.error(err);
        alert("Server Error");
    } finally {
        setSending(false);
    }
  };

  // Helper: Toggle Selection
  const toggleSelect = (id) => {
    if(selectedContacts.includes(id)) {
        setSelectedContacts(selectedContacts.filter(c => c !== id));
    } else {
        setSelectedContacts([...selectedContacts, id]);
    }
  };

  const toggleSelectAll = () => {
    if(selectedContacts.length === contacts.length) setSelectedContacts([]);
    else setSelectedContacts(contacts.map(c => c._id));
  };

  // Filter & Pagination
  const filteredContacts = contacts.filter(c => c.phoneNumber.includes(searchTerm));
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const currentData = filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Styles
  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#0B1120]' : 'bg-gray-100';
  const cardColor = isDark ? 'bg-[#1e293b]/50 border-white/5' : 'bg-white border-gray-200 shadow-sm';
  const textColor = isDark ? 'text-white' : 'text-slate-800';
  const subText = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputBg = isDark ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-slate-800';

  return (
    <MainLayout>
      <div className={`min-h-screen p-6 ${bgColor} transition-colors duration-300`}>
        
        {/* HEADER */}
        <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
            <div>
                <h2 className={`text-3xl font-bold ${textColor}`}>Power Tools</h2>
                <p className={subText}>Manage broadcasts, links, and contacts.</p>
            </div>
        </div>

        {/* TABS */}
        <div className="max-w-6xl mx-auto mb-6 flex gap-4 overflow-x-auto pb-2">
            {[
                { id: 'link', icon: Link, label: 'Link Generator' },
                { id: 'broadcast', icon: Send, label: 'Broadcast Campaign' },
                { id: 'contacts', icon: Users, label: 'Contact List' }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                        : `${isDark ? 'bg-[#1e293b] text-slate-400' : 'bg-white text-slate-500'} hover:opacity-80`}`}
                >
                    <tab.icon size={18}/> {tab.label}
                </button>
            ))}
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="max-w-6xl mx-auto">
            
            {/* 1. LINK GENERATOR (Unchanged) */}
            {activeTab === 'link' && (
                <div className={`${cardColor} p-8 rounded-3xl border animate-in fade-in slide-in-from-bottom-4`}>
                    <h3 className={`font-bold text-xl mb-6 flex items-center gap-2 ${textColor}`}><Link className="text-blue-500"/> WhatsApp Link Generator</h3>
                    <div className="space-y-4 max-w-2xl">
                        <input type="text" placeholder="Phone (e.g. 9477...)" value={phone} onChange={(e) => setPhone(e.target.value)} className={`w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}/>
                        <textarea placeholder="Your Message..." rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} className={`w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}/>
                        <button onClick={() => {navigator.clipboard.writeText(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`); alert("Copied!");}} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-500 transition shadow-lg">
                            <Copy size={18}/> Copy Link
                        </button>
                    </div>
                </div>
            )}

            {/* 2. BROADCAST (🔥 UPDATED WITH CAMPAIGN LOGIC) */}
            {activeTab === 'broadcast' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    
                    {/* Left: Campaign Form + History */}
                    <div className="space-y-6">
                        
                        {/* Form */}
                        <div className={`${cardColor} p-6 rounded-3xl border`}>
                            <h3 className={`font-bold text-lg mb-4 ${textColor}`}>Create Campaign</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold">Campaign Name</label>
                                    <input type="text" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="e.g. New Year Offer" className={`w-full p-3 rounded-xl mt-1 outline-none ${inputBg}`}/>
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 uppercase font-bold">Message</label>
                                    <textarea value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} placeholder="Type your broadcast message..." rows={4} className={`w-full p-3 rounded-xl mt-1 outline-none ${inputBg}`}/>
                                </div>
                                
                                {/* Media Upload */}
                                <div className="flex gap-2">
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border border-dashed transition ${isDark ? 'border-slate-600 hover:bg-white/5' : 'border-slate-300 hover:bg-gray-50'}`}>
                                        {uploading ? <Loader className="animate-spin text-blue-500"/> : <Paperclip size={18} className={subText}/>} 
                                        <span className={subText}>{mediaFile ? mediaFile.name : "Attach Image/Doc"}</span>
                                        <input type="file" className="hidden" onChange={handleFileUpload}/>
                                    </label>
                                </div>
                                {mediaUrl && <p className="text-xs text-emerald-500">File Uploaded: Ready to send</p>}

                                {/* Scheduling */}
                                <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar size={18} className="text-orange-500"/> <span className={`font-bold ${textColor}`}>Schedule Time</span>
                                    </div>
                                    <input type="datetime-local" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className={`w-full p-2 rounded-lg outline-none ${inputBg}`} style={{colorScheme: isDark ? 'dark' : 'light'}}/>
                                </div>

                                <button onClick={handleCreateCampaign} disabled={sending || uploading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 transition disabled:opacity-50">
                                    {sending ? <Loader className="animate-spin" size={20}/> : <Clock size={20}/>}
                                    {sending ? 'Scheduling...' : 'Schedule Campaign'}
                                </button>
                            </div>
                        </div>

                        {/* Broadcast History */}
                        <div className={`${cardColor} p-6 rounded-3xl border h-[300px] overflow-hidden flex flex-col`}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className={`font-bold text-lg ${textColor}`}>History</h3>
                                <button onClick={fetchHistory} className="p-2 bg-white/5 rounded-lg text-slate-400 hover:text-white"><RefreshCw size={16}/></button>
                            </div>
                            <div className="overflow-y-auto custom-scrollbar space-y-3 flex-1">
                                {broadcastHistory.length === 0 ? <p className="text-center text-slate-500 text-sm">No campaigns yet.</p> : 
                                broadcastHistory.map(job => (
                                    <div key={job._id} className="p-3 border border-white/5 rounded-xl bg-white/5 flex justify-between items-center">
                                        <div>
                                            <p className={`font-bold text-sm ${textColor}`}>{job.name}</p>
                                            <p className="text-xs text-slate-400">{new Date(job.scheduledTime).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                                                job.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                                job.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                                                'bg-amber-500/20 text-amber-400'
                                            }`}>{job.status}</span>
                                            <div className="flex gap-2 text-xs mt-1">
                                                <span className="text-emerald-400 flex items-center gap-1"><CheckCircle size={10}/> {job.successCount}</span>
                                                <span className="text-red-400 flex items-center gap-1"><XCircle size={10}/> {job.failCount}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Select Contacts (UNCHANGED) */}
                    <div className={`${cardColor} p-6 rounded-3xl border flex flex-col h-[800px]`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`font-bold text-lg ${textColor}`}>Select Contacts ({selectedContacts.length})</h3>
                            <button onClick={toggleSelectAll} className="text-sm text-blue-500 font-bold hover:underline">
                                {selectedContacts.length === contacts.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <input type="text" placeholder="Search contacts..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full p-3 rounded-xl mb-4 outline-none ${inputBg}`}/>
                        
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                            {filteredContacts.map(contact => (
                                <div key={contact._id} onClick={() => toggleSelect(contact._id)} className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition ${selectedContacts.includes(contact._id) ? 'bg-blue-600/10 border-blue-500/50' : `border-transparent hover:${isDark ? 'bg-white/5' : 'bg-gray-50'}`}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isDark ? 'bg-slate-700' : 'bg-slate-400'}`}>
                                            {contact.phoneNumber.slice(-2)}
                                        </div>
                                        <div>
                                            <p className={`font-bold text-sm ${textColor}`}>{contact.phoneNumber}</p>
                                            <p className="text-xs text-slate-400">{contact.name || "Unknown"}</p>
                                        </div>
                                    </div>
                                    {selectedContacts.includes(contact._id) ? <CheckSquare className="text-blue-500"/> : <Square className="text-slate-500"/>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 3. CONTACT LIST (UNCHANGED) */}
            {activeTab === 'contacts' && (
                <div className={`${cardColor} rounded-3xl border overflow-hidden animate-in fade-in slide-in-from-bottom-4`}>
                    <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4">
                        <div>
                            <h3 className={`font-bold text-xl ${textColor}`}>All Contacts ({contacts.length})</h3>
                            <p className={subText}>List of all numbers that messaged the bot.</p>
                        </div>
                        <div className="flex gap-2">
                             <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`p-2.5 rounded-lg outline-none w-48 ${inputBg}`}/>
                            <button onClick={exportToCSV} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition shadow-lg">
                                <Download size={18}/> Export CSV
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className={`${isDark ? 'bg-black/20 text-slate-400' : 'bg-gray-50 text-slate-500'} text-xs uppercase font-bold`}>
                                <tr>
                                    <th className="p-4">#</th>
                                    <th className="p-4">Phone Number</th>
                                    <th className="p-4">Name</th>
                                    <th className="p-4">Last Active</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                                {currentData.map((contact, index) => (
                                    <tr key={contact._id} className={`transition ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                                        <td className={`p-4 ${subText}`}>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className={`p-4 font-bold ${textColor}`}>{contact.phoneNumber}</td>
                                        <td className={`p-4 ${textColor}`}>{contact.name || "-"}</td>
                                        <td className={`p-4 ${subText}`}>{new Date(contact.updatedAt).toLocaleDateString()}</td>
                                        <td className="p-4"><span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-xs font-bold border border-emerald-500/20">Active</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className={`p-4 flex justify-between items-center ${isDark ? 'bg-black/20' : 'bg-gray-50'}`}>
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className={`px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 ${isDark ? 'bg-white/10 text-white' : 'bg-white text-slate-700 border'}`}>Previous</button>
                        <span className={subText}>Page {currentPage} of {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className={`px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 ${isDark ? 'bg-white/10 text-white' : 'bg-white text-slate-700 border'}`}>Next</button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </MainLayout>
  );
};
export default UserTools;