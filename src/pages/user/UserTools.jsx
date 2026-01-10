import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { 
    Link, Copy, Send, Users, FileText, Download, 
    Calendar, Paperclip, Search, CheckSquare, Square, Loader 
} from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useTheme } from '../../context/ThemeContext';

const UserTools = () => {
  const { theme } = useTheme(); // Theme eka gannawa styling walata witharak (Toggle eka ain kala)

  // Cloudinary Config (Make sure these match your UserInbox settings)
  const CLOUD_NAME = "dyixoaldi"; 
  const UPLOAD_PRESET = "Chat Bot System"; 

  // Tabs State
  const [activeTab, setActiveTab] = useState('link'); // 'link', 'broadcast', 'contacts'

  // Data States
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false); // Broadcast sending state

  // Link Gen State
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');

  // Broadcast State
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [mediaFile, setMediaFile] = useState(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem('token');

  // --- 1. LOAD CONTACTS ---
  useEffect(() => {
    const fetchContacts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/crm/contacts`, { 
                headers: { token: `Bearer ${token}` } 
            });
            const data = await res.json();
            if(Array.isArray(data)) setContacts(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchContacts();
  }, []);

  // --- 2. CSV EXPORT LOGIC ---
  const exportToCSV = () => {
    const csvRows = [];
    csvRows.push(['Phone Number', 'Name', 'Status']); // Header

    contacts.forEach(c => {
        csvRows.push([c.phoneNumber, c.name || 'Unknown', c.status || 'Active']);
    });

    const csvContent = "data:text/csv;charset=utf-8," 
        + csvRows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `whatsapp_contacts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // --- 3. HELPER: UPLOAD MEDIA ---
  const uploadMedia = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET); 
    formData.append("cloud_name", CLOUD_NAME);

    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: formData });
        const data = await res.json();
        return data.secure_url; // Return the URL
    } catch (err) {
        console.error("Upload Error", err);
        return null;
    }
  };

  // --- 4. REAL BROADCAST LOGIC ---
  const handleBroadcast = async () => {
    if(selectedContacts.length === 0) return alert("Please select contacts first!");
    if(!broadcastMsg && !mediaFile) return alert("Please enter a message or attach a file!");

    // Confirm Action
    if(!window.confirm(`Are you sure you want to send this to ${selectedContacts.length} people?`)) return;

    setSending(true);
    let successCount = 0;
    let failCount = 0;
    
    // 1. Upload Media if exists (Once)
    let finalMediaUrl = null;
    let msgType = 'text';

    if (mediaFile) {
        finalMediaUrl = await uploadMedia(mediaFile);
        if (!finalMediaUrl) {
            setSending(false);
            return alert("Media upload failed. Broadcast cancelled.");
        }
        // Determine type based on file
        if (mediaFile.type.startsWith('image')) msgType = 'image';
        else if (mediaFile.type.startsWith('video')) msgType = 'video';
        else if (mediaFile.type.startsWith('audio')) msgType = 'audio';
        else msgType = 'document';
    }

    // 2. Loop through contacts and send messages
    for (const contactId of selectedContacts) {
        const contact = contacts.find(c => c._id === contactId);
        if (!contact) continue;

        try {
            const payload = {
                contactId: contact._id,
                to: contact.phoneNumber,
                text: broadcastMsg,
                type: msgType,
                mediaUrl: finalMediaUrl
            };

            const res = await fetch(`${API_BASE_URL}/api/messages/send`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    token: `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) successCount++;
            else failCount++;

        } catch (error) {
            console.error(`Failed to send to ${contact.phoneNumber}`, error);
            failCount++;
        }
    }

    setSending(false);
    alert(`Broadcast Completed!\n✅ Success: ${successCount}\n❌ Failed: ${failCount}`);
    
    // Clear form
    setBroadcastMsg('');
    setMediaFile(null);
    setSelectedContacts([]);
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
    if(selectedContacts.length === contacts.length) {
        setSelectedContacts([]);
    } else {
        setSelectedContacts(contacts.map(c => c._id));
    }
  };

  // Filter & Pagination
  const filteredContacts = contacts.filter(c => c.phoneNumber.includes(searchTerm));
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const currentData = filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // --- STYLES (Dynamic based on Theme) ---
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
        <div className="max-w-5xl mx-auto flex justify-between items-center mb-8">
            <div>
                <h2 className={`text-3xl font-bold ${textColor}`}>Power Tools</h2>
                <p className={subText}>Manage broadcasts, links, and contacts.</p>
            </div>
            {/* Theme Toggle Button Removed (Now in Sidebar) */}
        </div>

        {/* TABS */}
        <div className="max-w-5xl mx-auto mb-6 flex gap-4 overflow-x-auto pb-2">
            {[
                { id: 'link', icon: Link, label: 'Link Generator' },
                { id: 'broadcast', icon: Send, label: 'Broadcast' },
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
        <div className="max-w-5xl mx-auto">
            
            {/* 1. LINK GENERATOR */}
            {activeTab === 'link' && (
                <div className={`${cardColor} p-8 rounded-3xl border animate-in fade-in slide-in-from-bottom-4`}>
                    <h3 className={`font-bold text-xl mb-6 flex items-center gap-2 ${textColor}`}><Link className="text-blue-500"/> WhatsApp Link Generator</h3>
                    <div className="space-y-4 max-w-2xl">
                        <input type="text" placeholder="Phone (e.g. 9477...)" value={phone} onChange={(e) => setPhone(e.target.value)} className={`w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}/>
                        <textarea placeholder="Your Message..." rows={3} value={msg} onChange={(e) => setMsg(e.target.value)} className={`w-full p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 ${inputBg}`}/>
                        
                        {phone && (
                            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500 font-mono text-sm break-all">
                                https://wa.me/{phone}?text={encodeURIComponent(msg)}
                            </div>
                        )}
                        <button onClick={() => {navigator.clipboard.writeText(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`); alert("Copied!");}} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-blue-500 transition shadow-lg">
                            <Copy size={18}/> Copy Link
                        </button>
                    </div>
                </div>
            )}

            {/* 2. BROADCAST */}
            {activeTab === 'broadcast' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
                    {/* Left: Message Compose */}
                    <div className={`${cardColor} p-6 rounded-3xl border`}>
                        <h3 className={`font-bold text-lg mb-4 ${textColor}`}>Compose Message</h3>
                        <div className="space-y-4">
                            <textarea value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} placeholder="Type your broadcast message..." rows={6} className={`w-full p-4 rounded-xl outline-none ${inputBg}`}/>
                            
                            <div className="flex gap-2">
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer border border-dashed transition ${isDark ? 'border-slate-600 hover:bg-white/5' : 'border-slate-300 hover:bg-gray-50'}`}>
                                    <Paperclip size={18} className={subText}/> <span className={subText}>{mediaFile ? mediaFile.name : "Attach Image/Doc"}</span>
                                    <input type="file" className="hidden" onChange={(e) => setMediaFile(e.target.files[0])}/>
                                </label>
                            </div>

                            <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={18} className="text-orange-500"/> <span className={`font-bold ${textColor}`}>Schedule (Optional)</span>
                                </div>
                                <input type="datetime-local" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className={`w-full p-2 rounded-lg outline-none ${inputBg}`}/>
                                <p className="text-xs text-slate-500 mt-1">* Schedule feature coming soon. Messages will send instantly.</p>
                            </div>

                            <button onClick={handleBroadcast} disabled={sending} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition disabled:opacity-50">
                                {sending ? <Loader className="animate-spin" size={20}/> : <Send size={20}/>}
                                {sending ? 'Sending...' : 'Send Broadcast Now'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Select Contacts */}
                    <div className={`${cardColor} p-6 rounded-3xl border flex flex-col h-[600px]`}>
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

            {/* 3. CONTACT LIST (PAGINATED + CSV) */}
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

                    {/* Pagination Controls */}
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