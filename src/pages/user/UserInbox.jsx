import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { 
  Search, UserPlus, Send, Paperclip, MoreVertical, 
  CheckSquare, Square, Filter, Mic, Image as ImageIcon, 
  ExternalLink, CheckCheck, MessageSquare, Phone, X, Loader, StopCircle, Trash2, FileText
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const UserInbox = () => {
  const [contacts, setContacts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); 
  
  // Filters & Search
  const [activeTab, setActiveTab] = useState('Unassigned'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  // Message & Sending State
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef(null);

  const scrollRef = useRef(); 

  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); 
  const currentUserId = localStorage.getItem('userId');

  // Cloudinary Config (Check these keys)
  const CLOUD_NAME = "dyixoaldi"; 
  const UPLOAD_PRESET = "Chat Bot System"; 

  // --- 1. LOAD DATA ---
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
    } catch(err) { console.error("Data Load Error", err); }
  };

  useEffect(() => { 
      loadData(); 
      const interval = setInterval(loadData, 5000); 
      return () => clearInterval(interval);
  }, []);

  // --- 2. LOAD MESSAGES ---
  useEffect(() => {
    if(selectedContact) {
        fetch(`${API_BASE_URL}/api/crm/messages/${selectedContact._id}`, { headers: { token: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                if(Array.isArray(data)) setMessages(data);
            })
            .catch(err => console.error(err));
    }
  }, [selectedContact]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // --- 3. BULK ASSIGN ---
  const handleBulkAssign = async (agentId) => {
    if(selectedIds.length === 0) return alert("Select leads first!");
    const agentName = agents.find(a => a._id === agentId)?.name;
    
    if(!window.confirm(`Assign ${selectedIds.length} leads to ${agentName}?`)) return;

    try {
        await fetch(`${API_BASE_URL}/api/team/assign-chats`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
            body: JSON.stringify({ contactIds: selectedIds, agentId })
        });
        alert("Assigned Successfully! 🚀");
        setSelectedIds([]);
        loadData();
    } catch(err) { alert("Error assigning chats"); }
  };

  // --- 4. SEND MESSAGE (INTERNAL API) ---
  const handleSendMessage = async (text = newMessage, type = 'text', mediaUrl = null) => {
      if(!selectedContact) return;
      if(!text && !mediaUrl) return; // Don't send empty

      setSending(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/messages/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
              body: JSON.stringify({
                  contactId: selectedContact._id,
                  to: selectedContact.phoneNumber,
                  text: text || "",
                  type: type,
                  mediaUrl: mediaUrl
              })
          });
          if(res.ok) {
              setNewMessage("");
              const sentMsg = await res.json();
              setMessages(prev => [...prev, sentMsg]);
          }
      } catch(err) { console.error(err); } 
      finally { setSending(false); }
  };

  // --- 5. CLOUDINARY UPLOAD HELPER ---
  const uploadToCloudinary = async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET); 
      formData.append("cloud_name", CLOUD_NAME);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: formData });
      return await res.json();
  };

  // --- 6. FILE UPLOAD HANDLER (Docs, Images, Video) ---
  const handleFileUpload = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      setUploading(true);

      try {
          const data = await uploadToCloudinary(file);
          if(data.secure_url) {
              let type = 'document';
              if(file.type.startsWith('image')) type = 'image';
              else if(file.type.startsWith('video')) type = 'video';
              else if(file.type.startsWith('audio')) type = 'audio';
              
              // Send the file immediately. You can modify this to let the user add a caption if needed.
              // For now, it sends with the filename as caption/text.
              await handleSendMessage(file.name, type, data.secure_url);
          }
      } catch(err) { alert("Upload Failed!"); }
      finally { setUploading(false); }
  };

  // --- 7. VOICE RECORDING LOGIC ---
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
              const data = await uploadToCloudinary(file);
              setUploading(false);

              if(data.secure_url) {
                  await handleSendMessage("🎤 Voice Message", "audio", data.secure_url);
              }
              setIsRecording(false);
              setRecordingTime(0);
          };

          recorder.start();
          setMediaRecorder(recorder);
          setIsRecording(true);
          
          // Timer
          timerRef.current = setInterval(() => {
              setRecordingTime(prev => prev + 1);
          }, 1000);

      } catch(err) {
          console.error("Mic Access Error:", err);
          alert("Cannot access microphone. Please allow permissions.");
      }
  };

  const stopRecording = () => {
      if(mediaRecorder) {
          mediaRecorder.stop();
          clearInterval(timerRef.current);
      }
  };

  const cancelRecording = () => {
      if(mediaRecorder) {
          mediaRecorder.stop(); 
          setMediaRecorder(null);
          setIsRecording(false);
          setRecordingTime(0);
          clearInterval(timerRef.current);
      }
  };

  const formatTime = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- FILTERING ---
  const filteredContacts = contacts.filter(c => {
      const matchesSearch = c.phoneNumber.includes(searchTerm);
      if(userRole === 'agent') return c.assignedTo?._id === currentUserId && matchesSearch;
      if (activeTab === 'Unassigned') return !c.assignedTo && matchesSearch;
      if (activeTab === 'Assigned') return c.assignedTo && matchesSearch;
      return matchesSearch; 
  });

  const PriorityBadge = ({ p }) => {
      const colors = {
          High: "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse",
          Mid: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          Low: "bg-blue-500/20 text-blue-400 border-blue-500/30"
      };
      return <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${colors[p] || colors.Low}`}>{p || 'Low'} Priority</span>;
  };

  return (
    <MainLayout>
      <div className="flex h-[88vh] bg-[#0f172a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative">
        
        {/* LEFT SIDEBAR */}
        <div className="w-[420px] border-r border-white/10 flex flex-col bg-[#0f172a]/95 backdrop-blur-xl">
            <div className="p-5 border-b border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white tracking-tight">Inbox</h2>
                    <div className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20">{filteredContacts.length} Chats</div>
                </div>
                {userRole !== 'agent' && (
                    <div className="flex p-1 bg-[#1e293b] rounded-xl">
                        {['Unassigned', 'Assigned', 'All'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>{tab}</button>
                        ))}
                    </div>
                )}
                <div className="relative group">
                    <Search className="absolute left-3 top-3 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18}/>
                    <input type="text" placeholder="Search leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#1e293b] rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 border border-transparent transition-all"/>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="bg-blue-600/10 border-b border-blue-500/20 p-3 flex justify-between items-center animate-in slide-in-from-top-2">
                    <span className="text-blue-400 text-xs font-bold ml-2">{selectedIds.length} Selected</span>
                    <div className="flex gap-2">
                        <button onClick={() => setSelectedIds([])} className="p-2 hover:bg-white/10 rounded-lg text-slate-400"><X size={16}/></button>
                        <div className="relative group z-50">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-blue-600/20">Assign <UserPlus size={14}/></button>
                            <div className="absolute left-0 mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl hidden group-hover:block overflow-hidden">
                                {agents.map(agent => (
                                    <div key={agent._id} onClick={() => handleBulkAssign(agent._id)} className="p-3 text-sm text-slate-200 hover:bg-blue-600 hover:text-white cursor-pointer border-b border-white/5 last:border-0 transition-colors">{agent.name}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {filteredContacts.map(contact => (
                    <div key={contact._id} onClick={() => setSelectedContact(contact)} className={`p-4 rounded-2xl cursor-pointer flex gap-4 transition-all duration-300 border group relative ${selectedContact?._id === contact._id ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.15)]' : 'bg-[#1e293b]/40 border-transparent hover:bg-[#1e293b] hover:border-white/5'}`}>
                        {userRole !== 'agent' && (
                            <div className={`absolute left-2 top-2 z-10 ${selectedIds.includes(contact._id) ? 'block' : 'hidden group-hover:block'}`}>
                                <button onClick={(e) => { e.stopPropagation(); selectedIds.includes(contact._id) ? setSelectedIds(selectedIds.filter(id => id !== contact._id)) : setSelectedIds([...selectedIds, contact._id]) }}>
                                    {selectedIds.includes(contact._id) ? <CheckSquare className="text-blue-500 bg-[#0f172a] rounded" size={20}/> : <Square className="text-slate-500 bg-[#0f172a] rounded" size={20}/>}
                                </button>
                            </div>
                        )}
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-sm shrink-0 shadow-lg ${contact.assignedTo ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-gradient-to-br from-slate-600 to-slate-700'}`}>
                            {contact.phoneNumber.slice(-2)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`font-bold text-sm truncate ${selectedContact?._id === contact._id ? 'text-white' : 'text-slate-200'}`}>{contact.phoneNumber}</h4>
                                <span className="text-[10px] text-slate-500 font-medium">{new Date(contact.lastMessageTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-xs text-slate-400 truncate mb-2">{contact.lastMessage || "New Lead"}</p>
                            <div className="flex justify-between items-center">
                                <PriorityBadge p={contact.priority || 'Low'} />
                                {contact.assignedTo ? (
                                    <div className="flex items-center gap-1 bg-[#0f172a] px-2 py-0.5 rounded-md border border-white/5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        <span className="text-[9px] text-slate-300">{contact.assignedTo.name}</span>
                                    </div>
                                ) : (<span className="text-[9px] text-yellow-500 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">UNASSIGNED</span>)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* RIGHT SIDEBAR - CHAT */}
        <div className="flex-1 flex flex-col bg-[#0b1221] relative">
            {selectedContact ? (
                <>
                    <div className="h-20 bg-[#0f172a]/90 backdrop-blur-md flex items-center justify-between px-6 border-b border-white/5 z-20">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-white border border-white/10">
                                {selectedContact.phoneNumber.slice(-2)}
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">{selectedContact.phoneNumber}</h3>
                                <div className="flex items-center gap-2 text-xs">
                                    <span className={`w-2 h-2 rounded-full ${selectedContact.assignedTo ? 'bg-emerald-500' : 'bg-yellow-500'}`}></span>
                                    <span className="text-slate-400">{selectedContact.assignedTo ? `Agent: ${selectedContact.assignedTo.name}` : 'Waiting for assignment'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* WhatsApp Web Button Removed */}
                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition"><MoreVertical size={20}/></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0b1221] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0b1221] to-[#0b1221]">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.direction === 'outbound' || msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-4 rounded-2xl text-sm shadow-xl backdrop-blur-sm border ${msg.direction === 'outbound' || msg.sender === 'me' ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none border-blue-500/50' : 'bg-[#1e293b]/80 text-slate-200 rounded-tl-none border-white/5'}`}>
                                    
                                    {/* Media Rendering */}
                                    {msg.type === 'image' && <img src={msg.content} className="rounded-xl mb-3 border border-white/10 max-w-sm" alt="media"/>}
                                    {msg.type === 'audio' && <audio controls src={msg.content} className="mb-2 w-full"/>}
                                    {msg.type === 'video' && <video controls src={msg.content} className="rounded-xl mb-3 border border-white/10 max-w-sm"/>}
                                    {msg.type === 'document' && (
                                        <a href={msg.content} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-300 underline bg-white/5 p-2 rounded-lg mb-2 hover:bg-white/10 transition">
                                            <FileText size={18}/> {msg.text !== msg.content ? msg.text : "View Document"}
                                        </a>
                                    )}
                                    
                                    {/* Text Content */}
                                    {(msg.type === 'text' || (msg.text && msg.text !== msg.content)) && (
                                        <p className="whitespace-pre-line leading-relaxed text-[15px]">{msg.text}</p>
                                    )}

                                    <div className={`flex items-center justify-end gap-1.5 mt-2 text-[10px] ${msg.direction === 'outbound' || msg.sender === 'me' ? 'text-blue-200' : 'text-slate-500'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                        {(msg.direction === 'outbound' || msg.sender === 'me') && <CheckCheck size={14}/>}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>

                    {/* INPUT AREA */}
                    <div className="p-4 bg-[#0f172a] border-t border-white/5">
                        <div className="bg-[#1e293b] rounded-2xl p-2 flex items-center gap-2 border border-white/5 focus-within:border-blue-500/50 transition-colors shadow-lg relative overflow-hidden">
                            
                            {isRecording ? (
                                /* RECORDING UI */
                                <div className="flex-1 flex items-center gap-4 px-2 animate-pulse">
                                    <StopCircle className="text-red-500 animate-pulse" size={24}/>
                                    <span className="text-white font-mono text-sm">{formatTime(recordingTime)}</span>
                                    <span className="text-slate-400 text-sm">Recording...</span>
                                    <div className="flex-1"></div>
                                    <button onClick={cancelRecording} className="p-2 text-slate-400 hover:text-red-400 transition"><Trash2 size={20}/></button>
                                    <button onClick={stopRecording} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-500 transition"><Send size={18}/></button>
                                </div>
                            ) : (
                                /* NORMAL INPUT UI */
                                <>
                                    <label className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer" title="Attach File">
                                        <Paperclip size={20}/>
                                        <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*,application/pdf,audio/*"/>
                                    </label>
                                    
                                    <input 
                                        type="text" 
                                        placeholder="Type a message..." 
                                        className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500 px-2"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        disabled={uploading}
                                    />

                                    {newMessage.trim() ? (
                                        <button onClick={() => handleSendMessage()} disabled={sending} className="p-3 bg-blue-600 rounded-xl text-white hover:bg-blue-500 transition shadow-lg shadow-blue-600/30">
                                            {sending ? <Loader className="animate-spin" size={20}/> : <Send size={20}/>}
                                        </button>
                                    ) : (
                                        <button onClick={startRecording} className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition" title="Hold to Record (Simulated Click)">
                                            <Mic size={20} />
                                        </button>
                                    )}
                                </>
                            )}
                            
                            {uploading && (
                                <div className="absolute inset-0 bg-[#1e293b]/90 flex items-center justify-center gap-2 z-10">
                                    <Loader className="animate-spin text-blue-500" size={20}/>
                                    <span className="text-xs text-blue-400 font-bold">Uploading Media...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#0b1221]">
                    <div className="w-24 h-24 bg-[#1e293b] rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-blue-900/20 animate-bounce-slow">
                        <MessageSquare size={40} className="text-blue-500 opacity-80"/>
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">SmartReply CRM</h1>
                    <p className="text-slate-400">Select a chat to view history or start replying.</p>
                </div>
            )}
        </div>
      </div>
    </MainLayout>
  );
};

export default UserInbox;