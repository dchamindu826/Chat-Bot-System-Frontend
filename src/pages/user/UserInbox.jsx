import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { 
  Search, UserPlus, Send, Paperclip, MoreVertical, 
  CheckSquare, Square, Mic, Image as ImageIcon, 
  ExternalLink, CheckCheck, MessageSquare, Phone, X, Loader, StopCircle, Trash2, FileText, Play, Video as VideoIcon, Download, ChevronRight, Users, RefreshCw, Palette, Type, Minus, Plus, Zap 
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

// --- 🔥 THEME CONFIGURATION ---
const THEMES = {
  slate:   { name: 'Clean',   primary: 'bg-slate-500',   hover: 'hover:bg-slate-400',   text: 'text-slate-300',   border: 'border-slate-500',   soft: 'bg-slate-700/30',   ring: 'focus:ring-slate-400', badge: 'bg-white text-black', bubbleMe: 'bg-slate-600', bubbleYou: 'bg-[#1e293b]' },
  emerald: { name: 'Mint',    primary: 'bg-emerald-500', hover: 'hover:bg-emerald-400', text: 'text-emerald-400', border: 'border-emerald-500/50', soft: 'bg-emerald-500/10', ring: 'focus:ring-emerald-400', badge: 'bg-emerald-500 text-white', bubbleMe: 'bg-emerald-600', bubbleYou: 'bg-[#1e293b]' },
  indigo:  { name: 'Ocean',   primary: 'bg-indigo-500',  hover: 'hover:bg-indigo-400',  text: 'text-indigo-400',  border: 'border-indigo-500/50',  soft: 'bg-indigo-500/10',  ring: 'focus:ring-indigo-400', badge: 'bg-indigo-500 text-white', bubbleMe: 'bg-indigo-600', bubbleYou: 'bg-[#1e293b]' },
  rose:    { name: 'Blush',   primary: 'bg-rose-500',    hover: 'hover:bg-rose-400',    text: 'text-rose-400',    border: 'border-rose-500/50',    soft: 'bg-rose-500/10',    ring: 'focus:ring-rose-400', badge: 'bg-rose-500 text-white', bubbleMe: 'bg-rose-600', bubbleYou: 'bg-[#1e293b]' },
};

const FONT_SIZES = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];

const UserInbox = ({ isEmbedded = false }) => {
  const [contacts, setContacts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); 
  
  // Customization States
  const [currentTheme, setCurrentTheme] = useState(() => localStorage.getItem('chatTheme') || 'slate');
  const [fontIndex, setFontIndex] = useState(1);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const theme = THEMES[currentTheme];

  const [activeTab, setActiveTab] = useState('Unassigned'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null); 
  const [uploading, setUploading] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);
  const scrollRef = useRef(); 

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignAmount, setAssignAmount] = useState(10); // 🔥 NEW: Bulk Assign Amount

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); 
  const currentUserId = localStorage.getItem('userId');
  const CLOUD_NAME = "dyixoaldi"; 
  const UPLOAD_PRESET = "Chat Bot System"; 

  // --- ACTIONS ---
  const handleThemeChange = (colorKey) => {
      setCurrentTheme(colorKey);
      localStorage.setItem('chatTheme', colorKey);
      setShowThemePicker(false);
  };

  const adjustFontSize = (dir) => {
      setFontIndex(prev => {
          if (dir === 'up') return Math.min(prev + 1, FONT_SIZES.length - 1);
          if (dir === 'down') return Math.max(prev - 1, 0);
          return prev;
      });
  };

  const loadData = async () => {
    try {
        const [conRes, agentRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/crm/contacts`, { headers: { token: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/api/team/agents`, { headers: { token: `Bearer ${token}` } })
        ]);
        if(conRes.ok) {
            const cData = await conRes.json();
            if(Array.isArray(cData)) setContacts(cData);
        }
        if(agentRes.ok) {
            const aData = await agentRes.json();
            if(Array.isArray(aData)) setAgents(aData);
        }
    } catch(err) { console.error(err); }
  };

  useEffect(() => { 
      loadData(); 
      const interval = setInterval(loadData, 5000); 
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if(selectedContact) {
        fetch(`${API_BASE_URL}/api/messages/${selectedContact._id}`, { headers: { token: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { if(Array.isArray(data)) setMessages(data); })
            .catch(err => console.error(err));
        setContacts(prev => prev.map(c => c._id === selectedContact._id ? { ...c, unreadCount: 0 } : c));
    }
  }, [selectedContact]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, mediaPreview]);

  // --- SENDING LOGIC ---
  const handleSendMessage = async () => {
      if(!selectedContact) return;
      const textToSend = newMessage.trim();
      const mediaToSend = mediaPreview ? mediaPreview.url : null;
      const typeToSend = mediaPreview ? mediaPreview.type : 'text';

      if(!textToSend && !mediaToSend) return; 

      setSending(true);
      try {
          const payload = {
            contactId: selectedContact._id,
            to: selectedContact.phoneNumber,
            text: textToSend,
            type: typeToSend,
            mediaUrl: mediaToSend
          };

          const res = await fetch(`${API_BASE_URL}/api/messages/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
              body: JSON.stringify(payload)
          });
          
          if(res.ok) {
              const sentMsg = await res.json();
              setMessages(prev => [...prev, sentMsg]);
              setNewMessage("");
              setMediaPreview(null);
              setContacts(prev => prev.map(c => c._id === selectedContact._id ? { ...c, lastMessage: textToSend || "Media File", lastMessageTime: new Date().toISOString() } : c));
          }
      } catch(err) { alert("Message Failed!"); } 
      finally { setSending(false); }
  };

  const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET); 
      formData.append("cloud_name", CLOUD_NAME);

      try {
          const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: formData });
          const data = await res.json();
          if(data.secure_url) {
              let type = 'document';
              if(file.type.startsWith('image')) type = 'image';
              else if(file.type.startsWith('video')) type = 'video';
              else if(file.type.startsWith('audio')) type = 'audio';
              setMediaPreview({ url: data.secure_url, type: type, name: file.name });
          }
      } catch(err) { alert("Upload Failed!"); }
      finally { setUploading(false); }
  };

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          let chunks = [];
          recorder.ondataavailable = (e) => chunks.push(e.data);
          recorder.onstop = async () => {
              const blob = new Blob(chunks, { type: 'audio/webm' });
              const file = new File([blob], "voice_note.webm", { type: 'audio/webm' });
              setUploading(true);
              const formData = new FormData();
              formData.append("file", file);
              formData.append("upload_preset", UPLOAD_PRESET); 
              formData.append("cloud_name", CLOUD_NAME);
              const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: formData });
              const data = await res.json();
              setUploading(false);
              if(data.secure_url) {
                    setMediaPreview({ url: data.secure_url, type: 'audio', name: 'Voice Note' });
              }
              setIsRecording(false);
              setRecordingTime(0);
          };
          recorder.start();
          setMediaRecorder(recorder);
          setIsRecording(true);
          timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
      } catch(err) { alert("Cannot access microphone."); }
  };

  const stopRecording = () => { if(mediaRecorder) { mediaRecorder.stop(); clearInterval(timerRef.current); } };
  const cancelRecording = () => { if(mediaRecorder) { mediaRecorder.stop(); setMediaRecorder(null); setIsRecording(false); setRecordingTime(0); clearInterval(timerRef.current); setMediaPreview(null); } };
  const formatTime = (seconds) => { const mins = Math.floor(seconds / 60); const secs = seconds % 60; return `${mins}:${secs < 10 ? '0' : ''}${secs}`; };

  const handleBulkAssign = async (agentId, isQuantityBased = false) => {
    let leadsToAssign = selectedIds;

    // 🔥 NEW: Logic for "Assign First X Leads"
    if (isQuantityBased) {
        const unassignedLeads = contacts
            .filter(c => !c.assignedTo) // Only Unassigned
            .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)) // Newest First
            .slice(0, assignAmount) // Take top X amount
            .map(c => c._id);
        
        if (unassignedLeads.length === 0) return alert("No unassigned leads available!");
        leadsToAssign = unassignedLeads;
    } else {
        if(leadsToAssign.length === 0) return alert("Select leads manually or use the Quantity Assign feature!");
    }

    if(!window.confirm(`Assign ${leadsToAssign.length} leads to this agent?`)) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/team/assign-chats`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
            body: JSON.stringify({ contactIds: leadsToAssign, agentId })
        });
        if(res.ok) {
            setContacts(prev => prev.map(c => leadsToAssign.includes(c._id) ? { ...c, assignedTo: agents.find(a => a._id === agentId) } : c));
            setSelectedIds([]); setShowAssignModal(false); alert(`Successfully assigned ${leadsToAssign.length} leads!`);
        }
    } catch(err) { alert("Error assigning leads"); }
  };

  const filteredContacts = contacts
    .filter(c => {
      const matchesSearch = c.phoneNumber.includes(searchTerm);
      if(userRole === 'agent') {
          if (!c.assignedTo) return false;
          const assignedId = typeof c.assignedTo === 'object' ? c.assignedTo._id : c.assignedTo;
          return assignedId === currentUserId && matchesSearch;
      }
      return (activeTab === 'All' ? true : activeTab === 'Unassigned' ? !c.assignedTo : c.assignedTo) && matchesSearch;
    })
    .sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));

  const renderMessageContent = (msg) => {
    const mediaUrl = msg.mediaUrl || (msg.type !== 'text' ? msg.content : null);
    const hasMedia = !!mediaUrl;
    const isCaption = msg.text && msg.text !== mediaUrl;

    return (
        <div className="flex flex-col">
            {hasMedia && (
                <div className={`mb-2 rounded-lg overflow-hidden ${isCaption ? 'border-b border-white/10 pb-2' : ''}`}>
                    {msg.type === 'image' && (
                        <div className="relative group cursor-pointer" onClick={() => window.open(mediaUrl, '_blank')}>
                            <img src={mediaUrl} className="w-full h-auto max-h-[350px] object-cover rounded-lg hover:scale-[1.02] transition-transform" alt="sent content" />
                        </div>
                    )}
                    {msg.type === 'video' && <video controls src={mediaUrl} className="w-full max-h-[350px] rounded-lg bg-black" />}
                    {msg.type === 'audio' && (
                        <div className="flex items-center gap-3 bg-black/30 p-3 rounded-xl border border-white/10 min-w-[250px]">
                            <div className={`w-10 h-10 ${theme.primary} rounded-full flex items-center justify-center text-white shrink-0 shadow-lg`}><Play size={18} fill="currentColor"/></div>
                            <div className="flex-1"><audio controls src={mediaUrl} className="w-full h-8 opacity-80" /></div>
                        </div>
                    )}
                    {(msg.type === 'document' || msg.type === 'application/pdf') && (
                        <a href={mediaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white/10 p-4 rounded-xl hover:bg-white/20 transition group border border-white/5">
                            <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center shrink-0"><FileText size={24}/></div>
                            <div className="overflow-hidden flex-1">
                                <p className="text-sm font-bold truncate text-white">Attached Document</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Click to Open</p>
                            </div>
                            <div className="bg-white/10 p-2 rounded-full text-slate-300 group-hover:bg-white/20 transition"><Download size={16}/></div>
                        </a>
                    )}
                </div>
            )}
            {(isCaption || (!hasMedia && msg.text)) && (
                <p className={`whitespace-pre-line leading-relaxed ${FONT_SIZES[fontIndex]}`}>
                    {msg.text || msg.content}
                </p>
            )}
        </div>
    );
  };

  const content = (
      <div className="flex h-full bg-[#0B1120] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
        {/* --- LEFT SIDEBAR --- */}
        <div className="w-[380px] border-r border-white/5 flex flex-col bg-[#0f172a]/80 backdrop-blur-xl">
            <div className="p-4 border-b border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className={`text-xl font-bold text-white tracking-tight flex items-center gap-2`}>
                        <MessageSquare className={theme.text}/> Inbox
                    </h2>
                    <div className="flex gap-2">
                        <div className="relative">
                            <button onClick={() => setShowThemePicker(!showThemePicker)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white"><Palette size={16}/></button>
                            {showThemePicker && (
                                <div className="absolute top-10 right-0 bg-[#1e293b] border border-white/10 rounded-xl p-2 z-50 shadow-xl flex flex-col gap-1 w-32 animate-in fade-in zoom-in-95">
                                    {Object.keys(THEMES).map((key) => (
                                        <button key={key} onClick={() => handleThemeChange(key)} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-bold transition ${currentTheme === key ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                                            <div className={`w-3 h-3 rounded-full ${THEMES[key].primary}`}></div> {THEMES[key].name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={loadData} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition text-slate-400 hover:text-white"><RefreshCw size={16}/></button>
                        {/* 🔥 Quick Assign Button (Only for Admins/Owners) */}
                        {userRole !== 'agent' && (
                             <button onClick={() => setShowAssignModal(true)} className={`p-2 ${theme.soft} hover:${theme.primary} text-white rounded-lg transition`} title="Bulk Assign">
                                <Zap size={16} />
                             </button>
                        )}
                    </div>
                </div>
                {userRole !== 'agent' && (
                    <div className="flex p-1 bg-[#1e293b] rounded-xl border border-white/5">
                        {['Unassigned', 'Assigned', 'All'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 ${activeTab === tab ? `${theme.primary} text-white shadow-lg` : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>{tab}</button>
                        ))}
                    </div>
                )}
                <div className="relative group">
                    <Search className={`absolute left-3 top-2.5 text-slate-500 group-focus-within:${theme.text} transition-colors`} size={16}/>
                    <input type="text" placeholder="Search number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full bg-[#1e293b] rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:ring-1 ${theme.ring} border border-transparent transition-all placeholder-slate-600`}/>
                </div>
            </div>
            
            {selectedIds.length > 0 && (
                <div className={`${theme.soft} border-b ${theme.border} border-opacity-30 p-2 flex justify-between items-center animate-in slide-in-from-top-2`}>
                    <span className={`${theme.text} text-xs font-bold ml-2`}>{selectedIds.length} Selected</span>
                    <div className="flex gap-2">
                        <button onClick={() => setSelectedIds([])} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400"><X size={14}/></button>
                        <button onClick={() => setShowAssignModal(true)} className={`${theme.primary} ${theme.hover} text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-lg`}>Assign <UserPlus size={12}/></button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {filteredContacts.map(contact => (
                    <div key={contact._id} onClick={() => setSelectedContact(contact)} className={`p-3 rounded-xl cursor-pointer flex gap-3 transition-all duration-300 border group relative ${selectedContact?._id === contact._id ? `${theme.soft} ${theme.border} border-opacity-40 shadow-inner` : 'bg-transparent border-transparent hover:bg-white/5'}`}>
                        {userRole !== 'agent' && (
                            <div className={`absolute left-2 top-2 z-10 ${selectedIds.includes(contact._id) ? 'block' : 'hidden group-hover:block'}`}><button onClick={(e) => { e.stopPropagation(); selectedIds.includes(contact._id) ? setSelectedIds(selectedIds.filter(id => id !== contact._id)) : setSelectedIds([...selectedIds, contact._id]) }}>{selectedIds.includes(contact._id) ? <CheckSquare className={`${theme.text} bg-[#0f172a] rounded`} size={18}/> : <Square className="text-slate-500 bg-[#0f172a] rounded" size={18}/>}</button></div>
                        )}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-lg ${contact.assignedTo ? theme.primary : 'bg-slate-700'}`}>{contact.phoneNumber.slice(-2)}</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                                <div className="flex items-center gap-2">
                                    <h4 className={`font-bold text-sm truncate ${selectedContact?._id === contact._id ? 'text-white' : 'text-slate-300'}`}>{contact.phoneNumber}</h4>
                                    {(contact.unreadCount > 0) && (
                                        <span className={`h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold shadow-sm animate-pulse`}>
                                            {contact.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] text-slate-600 font-medium">{new Date(contact.lastMessageTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate mb-1">{contact.lastMessage || "New Lead"}</p>
                            {contact.assignedTo ? (
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-[10px] text-slate-400">{typeof contact.assignedTo === 'object' ? contact.assignedTo.name : 'Agent'}</span>
                                </div>
                            ) : (<span className="text-[9px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">UNASSIGNED</span>)}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- RIGHT SIDE: CHAT AREA --- */}
        <div className="flex-1 flex flex-col bg-[#0b1221] relative">
            {selectedContact ? (
                <>
                    <div className="h-16 bg-[#0f172a]/90 backdrop-blur-md flex items-center justify-between px-6 border-b border-white/5 z-20 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg ${theme.primary} flex items-center justify-center font-bold text-white shadow-lg`}>{selectedContact.phoneNumber.slice(-2)}</div>
                            <div>
                                <h3 className="text-white font-bold text-base">{selectedContact.phoneNumber}</h3>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className={`w-1.5 h-1.5 rounded-full ${selectedContact.assignedTo ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                    <span className="text-slate-400">{selectedContact.assignedTo ? (typeof selectedContact.assignedTo === 'object' ? `Agent: ${selectedContact.assignedTo.name}` : 'Assigned') : 'Waiting for assignment'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
                            <button onClick={() => adjustFontSize('down')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition"><Minus size={14}/></button>
                            <Type size={14} className="text-slate-400"/>
                            <button onClick={() => adjustFontSize('up')} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition"><Plus size={14}/></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#0b1221]">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.direction === 'outbound' || msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-4 rounded-2xl shadow-xl backdrop-blur-sm border ${msg.direction === 'outbound' || msg.sender === 'me' ? `${theme.bubbleMe} text-white rounded-tr-none border-white/10` : `${theme.bubbleYou} text-slate-200 rounded-tl-none border-white/5`}`}>
                                    {renderMessageContent(msg)}
                                    <div className={`flex items-center justify-end gap-1 mt-1.5 text-[10px] ${msg.direction === 'outbound' || msg.sender === 'me' ? 'text-white/70' : 'text-slate-500'}`}>{new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} {(msg.direction === 'outbound' || msg.sender === 'me') && <CheckCheck size={12}/>}</div>
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>

                    <div className="p-4 bg-[#0B1120] border-t border-white/5">
                        <div className={`bg-[#1e293b]/50 rounded-2xl flex flex-col border border-white/5 focus-within:${theme.border} transition-colors shadow-lg relative overflow-hidden backdrop-blur-sm`}>
                            {mediaPreview && (
                                <div className="p-3 bg-black/40 border-b border-white/5 flex items-center justify-between animate-in slide-in-from-bottom-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden border border-white/10">
                                            {mediaPreview.type === 'image' && <img src={mediaPreview.url} className="w-full h-full object-cover"/>}
                                            {mediaPreview.type === 'video' && <VideoIcon size={20} className="text-white"/>}
                                            {mediaPreview.type === 'audio' && <Mic size={20} className="text-white"/>}
                                            {mediaPreview.type === 'document' && <FileText size={20} className="text-white"/>}
                                        </div>
                                        <div><p className="text-white text-sm font-bold truncate w-48">{mediaPreview.name}</p><p className={`text-xs ${theme.text} uppercase font-bold`}>{mediaPreview.type}</p></div>
                                    </div>
                                    <button onClick={() => setMediaPreview(null)} className="p-2 bg-white/10 hover:bg-red-500 hover:text-white rounded-full transition text-slate-400"><X size={16}/></button>
                                </div>
                            )}
                            <div className="flex items-end gap-2 p-2">
                                {isRecording ? (
                                    <div className="flex-1 flex items-center gap-4 px-2 py-2">
                                        <StopCircle className="text-red-500 animate-pulse" size={24}/>
                                        <span className="text-white font-mono text-sm">{formatTime(recordingTime)}</span>
                                        <div className="flex-1"></div>
                                        <button onClick={cancelRecording} className="p-2 text-slate-400 hover:text-red-400 transition"><Trash2 size={20}/></button>
                                        <button onClick={stopRecording} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-500 transition shadow-lg shadow-red-500/20"><Send size={18}/></button>
                                    </div>
                                ) : (
                                    <>
                                        <label className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer self-center" title="Attach File"><Paperclip size={20}/><input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*,application/pdf,application/msword,audio/*"/></label>
                                        <textarea placeholder={mediaPreview ? "Add a caption..." : "Type a message..."} className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500 px-2 py-3 resize-none custom-scrollbar max-h-32" rows={1} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} disabled={uploading}/>
                                        {newMessage.trim() || mediaPreview ? (<button onClick={handleSendMessage} disabled={sending} className={`p-3 ${theme.primary} rounded-xl text-white ${theme.hover} transition shadow-lg self-center`}>{sending ? <Loader className="animate-spin" size={20}/> : <Send size={20}/>}</button>) : (<button onClick={startRecording} className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition self-center"><Mic size={20} /></button>)}
                                    </>
                                )}
                            </div>
                            {uploading && <div className="absolute inset-0 bg-[#1e293b]/90 flex items-center justify-center gap-2 z-10 backdrop-blur-sm"><Loader className={`animate-spin ${theme.text}`} size={20}/><span className={`text-xs ${theme.text} font-bold`}>Uploading Media...</span></div>}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#0b1221]">
                    <div className="w-24 h-24 bg-[#1e293b]/50 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/10 border border-white/5 animate-pulse"><MessageSquare size={40} className={`${theme.text} opacity-80`}/></div>
                    <h1 className="text-2xl font-bold text-white mb-2">Select a Conversation</h1>
                    <p className="text-slate-500 text-sm">Choose a contact from the left to start chatting.</p>
                </div>
            )}
        </div>

        {/* --- ASSIGN MODAL (UPDATED) --- */}
        {showAssignModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="p-5 border-b border-white/10 flex justify-between items-center bg-[#1e293b]">
                        <div><h3 className="text-lg font-bold text-white">Assign Leads</h3><p className="text-xs text-slate-400">Distribute leads to your team</p></div>
                        <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition"><X size={18}/></button>
                    </div>

                    <div className="p-5 overflow-y-auto custom-scrollbar space-y-6">
                        {/* 🔥 1. BULK QUANTITY ASSIGN OPTION */}
                        {selectedIds.length === 0 && (
                            <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-white/5">
                                <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Zap size={16} className="text-amber-500"/> Quick Auto-Assign</h4>
                                <p className="text-xs text-slate-400 mb-3">Automatically pick the newest unassigned leads.</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-slate-300">Assign first</span>
                                    <input type="number" min="1" max="100" value={assignAmount} onChange={(e) => setAssignAmount(parseInt(e.target.value) || 1)} className="w-16 bg-black/30 border border-white/10 rounded-lg p-2 text-center text-white text-sm focus:outline-none focus:border-amber-500"/>
                                    <span className="text-xs text-slate-300">leads to:</span>
                                </div>
                            </div>
                        )}

                        {/* 🔥 2. AGENT LIST SELECTION */}
                        <div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Agent</h4>
                            <div className="space-y-2">
                                {agents.length === 0 ? <div className="text-center p-4 text-slate-500 bg-white/5 rounded-xl border border-dashed border-white/10"><Users size={32} className="mx-auto mb-2 opacity-50"/><p className="text-sm">No agents available.</p></div> : agents.map(agent => (
                                    <div key={agent._id} className={`flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:${theme.soft} hover:${theme.border} transition group`}>
                                        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">{agent.name.charAt(0).toUpperCase()}</div><div><h4 className="text-white font-bold text-sm">{agent.name}</h4><p className="text-[10px] text-slate-400">{agent.email}</p></div></div>
                                        <button onClick={() => handleBulkAssign(agent._id, selectedIds.length === 0)} className={`px-4 py-2 ${selectedIds.length === 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-black' : 'bg-white/5 text-slate-300 hover:bg-white/20 hover:text-white'} rounded-lg text-xs font-bold transition flex items-center gap-2`}>
                                            {selectedIds.length === 0 ? `Auto Assign ${assignAmount}` : 'Assign Selected'} <ChevronRight size={14}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
  );

  if (isEmbedded) return content;

  return (
    <MainLayout>
        <div className="h-[88vh]">
            {content}
        </div>
    </MainLayout>
  );
};

export default UserInbox;