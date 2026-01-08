import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Search, UserPlus, Send, CheckSquare, Square, MoreVertical, Paperclip, CheckCheck } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const UserInbox = () => {
  const [contacts, setContacts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [viewFilter, setViewFilter] = useState('All'); // 'All', 'New', 'Assigned'
  const [searchTerm, setSearchTerm] = useState('');
  
  const scrollRef = useRef(); 
  const token = localStorage.getItem('token');

  // Load Data
  const loadData = async () => {
    try {
        const [conRes, agentRes] = await Promise.all([
            fetch(`${API_BASE_URL}/api/crm/contacts`, { headers: { token: `Bearer ${token}` } }),
            fetch(`${API_BASE_URL}/api/team/agents`, { headers: { token: `Bearer ${token}` } })
        ]);
        if(conRes.ok) setContacts(await conRes.json());
        if(agentRes.ok) setAgents(await agentRes.json());
    } catch(err) { console.error(err); }
  };

  // Initial Load & Auto Refresh (5 Sec)
  useEffect(() => { 
      loadData(); 
      const interval = setInterval(loadData, 5000); 
      return () => clearInterval(interval);
  }, []);

  // Load Messages
  useEffect(() => {
    if(selectedContact) {
        fetch(`${API_BASE_URL}/api/crm/messages/${selectedContact._id}`, { headers: { token: `Bearer ${token}` } })
            .then(res => res.json()).then(setMessages);
    }
  }, [selectedContact]);

  // Scroll to bottom
  useEffect(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Bulk Assign
  const handleAssign = async (agentId) => {
      if(selectedIds.length === 0) return alert("Please select contacts first!");
      if(!window.confirm(`Assign ${selectedIds.length} chats to selected agent?`)) return;

      await fetch(`${API_BASE_URL}/api/team/assign-chats`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
          body: JSON.stringify({ contactIds: selectedIds, agentId })
      });
      setSelectedIds([]);
      loadData();
      alert("Chats Assigned Successfully!");
  };

  // Filter Logic
  const filteredContacts = contacts.filter(c => {
      const matchesSearch = c.phoneNumber.includes(searchTerm);
      if (viewFilter === 'New') return !c.assignedTo && matchesSearch;
      if (viewFilter === 'Assigned') return c.assignedTo && matchesSearch;
      return matchesSearch;
  });

  return (
    <MainLayout>
      <div className="flex h-[85vh] bg-[#111b21] rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
        
        {/* --- LEFT SIDEBAR (Chat List) --- */}
        <div className="w-[400px] border-r border-white/10 flex flex-col bg-[#111b21]">
            
            {/* Header */}
            <div className="p-3 bg-[#202c33] flex justify-between items-center border-b border-white/5 h-16">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold">You</div>
                    <h2 className="font-bold text-slate-200">Chats</h2>
                </div>
                {selectedIds.length > 0 && (
                     <div className="flex items-center gap-2">
                        <span className="text-xs text-blue-400 font-bold">{selectedIds.length} Selected</span>
                        <div className="relative group">
                            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition">
                                Assign <UserPlus size={14}/>
                            </button>
                            <div className="absolute top-full right-0 mt-2 w-48 bg-[#2a3942] border border-white/10 rounded-lg shadow-xl hidden group-hover:block z-50">
                                {agents.map(agent => (
                                    <div key={agent._id} onClick={() => handleAssign(agent._id)} className="p-3 text-sm text-slate-200 hover:bg-[#111b21] cursor-pointer border-b border-white/5 last:border-0">
                                        {agent.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                     </div>
                )}
            </div>

            {/* Filters & Search */}
            <div className="p-2 border-b border-white/5">
                <div className="relative mb-2">
                    <Search className="absolute left-3 top-2 text-slate-400" size={18}/>
                    <input type="text" placeholder="Search or start new chat" className="w-full bg-[#202c33] rounded-lg py-1.5 pl-10 pr-4 text-sm text-white focus:outline-none placeholder-slate-400"
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    {['All', 'New', 'Assigned'].map(f => (
                        <button key={f} onClick={() => setViewFilter(f)} 
                            className={`flex-1 py-1 text-xs font-bold rounded-full transition ${viewFilter === f ? 'bg-[#00a884] text-white' : 'bg-[#202c33] text-slate-400 hover:bg-slate-700'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredContacts.map(contact => (
                    <div key={contact._id} onClick={() => setSelectedContact(contact)}
                         className={`p-3 cursor-pointer hover:bg-[#202c33] flex gap-3 transition border-b border-[#2a3942] group ${selectedContact?._id === contact._id ? 'bg-[#2a3942]' : ''}`}>
                        
                        <div onClick={(e) => { e.stopPropagation(); if(selectedIds.includes(contact._id)) setSelectedIds(selectedIds.filter(i => i !== contact._id)); else setSelectedIds([...selectedIds, contact._id]); }} 
                             className={`mt-1 text-slate-500 hover:text-[#00a884] ${selectedIds.includes(contact._id) ? 'opacity-100 text-[#00a884]' : 'opacity-0 group-hover:opacity-100'}`}>
                            {selectedIds.includes(contact._id) ? <CheckSquare size={20}/> : <Square size={20}/>}
                        </div>

                        <div className="w-12 h-12 rounded-full bg-slate-500 flex items-center justify-center shrink-0 font-bold text-white text-sm">
                            {contact.phoneNumber.slice(-2)}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="text-slate-200 font-medium truncate">{contact.phoneNumber}</h4>
                                <span className={`text-[10px] ${contact.messageCount > 0 ? 'text-[#00a884] font-bold' : 'text-slate-500'}`}>
                                    {new Date(contact.lastMessageTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-400 truncate w-40">{contact.lastMessage || "📷 Media File"}</p>
                                <div className="flex gap-1">
                                    {contact.priority === 'High' && <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 rounded font-bold border border-red-500/30">HIGH</span>}
                                    {contact.assignedTo ? <span className="text-[9px] bg-blue-500/20 text-blue-400 px-1.5 rounded border border-blue-500/30">{contact.assignedTo.name}</span> : 
                                    <span className="w-5 h-5 bg-[#00a884] text-black text-[10px] font-bold flex items-center justify-center rounded-full">{contact.messageCount || 1}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- RIGHT SIDE (Chat Window) --- */}
        <div className="flex-1 flex flex-col bg-[#0b141a] relative border-l border-white/5 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
            {selectedContact ? (
                <>
                    <div className="h-16 bg-[#202c33] flex items-center justify-between px-4 z-10 sticky top-0">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold text-white">{selectedContact.phoneNumber.slice(-2)}</div>
                            <div>
                                <h3 className="text-white font-bold text-sm">{selectedContact.phoneNumber}</h3>
                                <p className="text-xs text-slate-400">{selectedContact.assignedTo ? `Assigned to: ${selectedContact.assignedTo.name}` : 'Not assigned'}</p>
                            </div>
                        </div>
                        <div className="flex gap-4 text-slate-400"><Search size={20}/><MoreVertical size={20}/></div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#0b141a]/90">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'} mb-1`}>
                                <div className={`max-w-[65%] px-3 py-1.5 rounded-lg text-sm shadow-md relative group ${msg.direction === 'outbound' ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-slate-200 rounded-tl-none'}`}>
                                    {msg.type === 'image' && <img src={msg.content} className="rounded-lg mb-1 mt-1 max-w-full" alt="media"/>}
                                    <span>{msg.content}</span>
                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <span className="text-[10px] text-slate-300/70">{new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false})}</span>
                                        {msg.direction === 'outbound' && <CheckCheck size={14} className="text-[#53bdeb]"/>}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>

                    <div className="p-3 bg-[#202c33] flex items-center gap-3 z-10">
                        <Paperclip className="text-slate-400 cursor-pointer hover:text-slate-200"/>
                        <input type="text" placeholder="Type a message" className="flex-1 bg-[#2a3942] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none placeholder-slate-400"/>
                        <button className="text-slate-400 hover:text-[#00a884]"><Send size={24}/></button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 bg-[#222e35] border-b-[6px] border-[#00a884]">
                    <h1 className="text-3xl font-light text-slate-300 mb-4">SmartReply CRM</h1>
                    <p className="text-sm">Select a chat to start messaging.</p>
                </div>
            )}
        </div>
      </div>
    </MainLayout>
  );
};

export default UserInbox;