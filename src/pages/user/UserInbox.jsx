import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { 
  Search, Filter, UserPlus, Send, CheckCircle, XCircle, 
  Clock, AlertCircle, MoreVertical, Phone, Check, CheckCheck 
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const UserInbox = () => {
  const [contacts, setContacts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [messages, setMessages] = useState([]);
  
  // Selection States
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedChatIds, setSelectedChatIds] = useState([]); // For Bulk Actions
  const [newMessage, setNewMessage] = useState("");

  // Filter States
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // 1. Initial Data Load (Contacts & Agents)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, agentsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/crm/contacts`, { headers: { token: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/team/agents`, { headers: { token: `Bearer ${token}` } })
        ]);

        if (contactsRes.ok) setContacts(await contactsRes.json());
        if (agentsRes.ok) setAgents(await agentsRes.json());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [token]);

  // 2. Fetch Messages when a Contact is Selected
  useEffect(() => {
    if (selectedContact) {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/crm/messages/${selectedContact._id}`, {
                    headers: { token: `Bearer ${token}` }
                });
                if (res.ok) setMessages(await res.json());
            } catch (err) { console.error(err); }
        };
        fetchMessages();
        // Here you would implement Socket.io listener for real-time updates
    }
  }, [selectedContact, token]);

  // --- ACTIONS ---

  // Bulk Select Handler
  const toggleSelectChat = (id) => {
    if (selectedChatIds.includes(id)) {
        setSelectedChatIds(selectedChatIds.filter(chatId => chatId !== id));
    } else {
        setSelectedChatIds([...selectedChatIds, id]);
    }
  };

  // Assign Agent (Bulk or Single)
  const handleAssignAgent = async (agentId) => {
    const idsToAssign = selectedContact ? [selectedContact._id] : selectedChatIds;
    if (idsToAssign.length === 0) return;

    try {
        await fetch(`${API_BASE_URL}/api/team/assign-chats`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
            body: JSON.stringify({ contactIds: idsToAssign, agentId })
        });
        
        // Refresh Contacts locally
        setContacts(contacts.map(c => idsToAssign.includes(c._id) ? { ...c, assignedTo: agents.find(a => a._id === agentId), status: 'Pending' } : c));
        setSelectedChatIds([]); // Clear selection
        alert("Assigned Successfully!");
    } catch (err) { alert("Failed to assign"); }
  };

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;

    const tempMsg = { 
        _id: Date.now(), text: newMessage, sender: 'me', createdAt: new Date(), isBotReply: false 
    };
    setMessages([...messages, tempMsg]);
    setNewMessage("");

    // API Call would go here...
    // await fetch(...)
  };

  // Update Status/Priority
  const updateContactMeta = async (field, value) => {
      if (!selectedContact) return;
      try {
          const res = await fetch(`${API_BASE_URL}/api/crm/contact/${selectedContact._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
              body: JSON.stringify({ [field]: value })
          });
          if(res.ok) {
              const updated = await res.json();
              setContacts(contacts.map(c => c._id === updated._id ? updated : c));
              setSelectedContact(updated);
          }
      } catch(err) { console.error(err); }
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-8rem)] gap-6 overflow-hidden">
        
        {/* --- LEFT SIDE: CHAT LIST --- */}
        <div className="w-96 flex flex-col bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden">
            
            {/* Header: Search & Filter */}
            <div className="p-4 border-b border-white/5 space-y-3">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={18}/>
                    <input type="text" placeholder="Search chats..." className="w-full bg-black/20 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-blue-500 outline-none"/>
                </div>
                
                {/* Bulk Action Bar (Shows when items selected) */}
                {selectedChatIds.length > 0 ? (
                    <div className="flex items-center justify-between bg-blue-600/20 p-2 rounded-xl border border-blue-500/30">
                        <span className="text-sm text-blue-300 font-bold px-2">{selectedChatIds.length} Selected</span>
                        <div className="relative group">
                            <button className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
                                Assign <UserPlus size={14}/>
                            </button>
                            {/* Dropdown for Bulk Assign */}
                            <div className="absolute top-full left-0 mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl hidden group-hover:block z-50">
                                {agents.map(agent => (
                                    <div key={agent._id} onClick={() => handleAssignAgent(agent._id)} className="p-2 hover:bg-white/5 cursor-pointer text-sm text-slate-300">
                                        {agent.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                        {['All', 'New', 'Pending', 'Answered', 'Rejected'].map(status => (
                            <button key={status} onClick={() => setFilterStatus(status)} 
                                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition ${filterStatus === status ? 'bg-white text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>
                                {status}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {contacts.filter(c => filterStatus === 'All' || c.status === filterStatus).map(contact => (
                    <div key={contact._id} 
                        className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition flex gap-3 group ${selectedContact?._id === contact._id ? 'bg-blue-600/10 border-l-2 border-blue-500' : ''}`}
                    >
                        {/* Checkbox for Bulk Select */}
                        <div className="pt-1" onClick={(e) => { e.stopPropagation(); toggleSelectChat(contact._id); }}>
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedChatIds.includes(contact._id) ? 'bg-blue-500 border-blue-500' : 'border-slate-600'}`}>
                                {selectedChatIds.includes(contact._id) && <Check size={10} className="text-white"/>}
                            </div>
                        </div>

                        {/* Click to Open Chat */}
                        <div className="flex-1 min-w-0" onClick={() => setSelectedContact(contact)}>
                            <div className="flex justify-between items-start">
                                <h4 className="text-white font-bold text-sm truncate">{contact.name || contact.phoneNumber}</h4>
                                <span className="text-[10px] text-slate-500">{new Date(contact.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <p className="text-xs text-slate-400 truncate mt-1">{contact.lastMessage || "No messages yet"}</p>
                            
                            {/* Tags */}
                            <div className="flex items-center gap-2 mt-2">
                                {contact.priority === 'High' && <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">High</span>}
                                {contact.assignedTo ? (
                                    <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                                        <UserPlus size={10}/> {contact.assignedTo.name}
                                    </span>
                                ) : (
                                    <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">Unassigned</span>
                                )}
                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                                    contact.status === 'New' ? 'border-blue-500/30 text-blue-400' : 
                                    contact.status === 'Answered' ? 'border-green-500/30 text-green-400' : 'border-slate-600 text-slate-500'
                                }`}>{contact.status}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- RIGHT SIDE: CHAT AREA --- */}
        <div className="flex-1 bg-[#0f172a]/80 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col relative">
            {selectedContact ? (
                <>
                    {/* Chat Header */}
                    <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                                {selectedContact.name?.charAt(0) || <Phone size={18}/>}
                            </div>
                            <div>
                                <h3 className="text-white font-bold">{selectedContact.name || selectedContact.phoneNumber}</h3>
                                <p className="text-xs text-slate-400">{selectedContact.phoneNumber}</p>
                            </div>
                        </div>

                        {/* Actions (Status / Priority / Assign) */}
                        <div className="flex items-center gap-4">
                            {/* Priority Dropdown */}
                            <select 
                                value={selectedContact.priority} 
                                onChange={(e) => updateContactMeta('priority', e.target.value)}
                                className="bg-black/20 border border-white/10 text-xs text-white rounded-lg px-2 py-1 outline-none"
                            >
                                <option value="Low">Low Priority</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High Priority</option>
                            </select>

                            {/* Status Dropdown */}
                            <select 
                                value={selectedContact.status} 
                                onChange={(e) => updateContactMeta('status', e.target.value)}
                                className="bg-black/20 border border-white/10 text-xs text-white rounded-lg px-2 py-1 outline-none"
                            >
                                <option value="New">New</option>
                                <option value="Pending">Pending</option>
                                <option value="Answered">Answered</option>
                                <option value="Rejected">Rejected</option>
                            </select>

                             {/* Agent Assign Dropdown */}
                             <div className="relative group">
                                <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition">
                                    <MoreVertical size={20}/>
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1e293b] border border-white/10 rounded-xl shadow-xl hidden group-hover:block z-50 p-2">
                                    <p className="text-xs text-slate-500 mb-2 px-2">Assign to Agent:</p>
                                    {agents.map(agent => (
                                        <div key={agent._id} onClick={() => handleAssignAgent(agent._id)} 
                                            className={`p-2 hover:bg-white/5 cursor-pointer text-sm rounded-lg ${selectedContact.assignedTo?._id === agent._id ? 'text-blue-400' : 'text-slate-300'}`}>
                                            {agent.name} {selectedContact.assignedTo?._id === agent._id && '✓'}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-black/20">
                        {messages.length === 0 ? (
                            <div className="text-center text-slate-500 mt-20">
                                <Clock size={40} className="mx-auto mb-4 opacity-20"/>
                                <p>No conversation history yet.</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg._id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                                        msg.sender === 'me' 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-[#1e293b] border border-white/10 text-slate-300 rounded-tl-none'
                                    }`}>
                                        <p>{msg.text}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1 opacity-50 text-[10px]">
                                            <span>{new Date(msg.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                                            {msg.sender === 'me' && <CheckCheck size={12}/>}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-[#1e293b] border-t border-white/5">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input 
                                type="text" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..." 
                                className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition"
                            />
                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition">
                                <Send size={20}/>
                            </button>
                        </form>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                        <Phone size={40} className="opacity-20"/>
                    </div>
                    <h3 className="text-white text-xl font-bold">Select a Chat</h3>
                    <p className="text-sm mt-2 max-w-xs text-center">
                        Select a conversation from the left to start chatting, assign agents, or update status.
                    </p>
                </div>
            )}
        </div>
      </div>
    </MainLayout>
  );
};

export default UserInbox;