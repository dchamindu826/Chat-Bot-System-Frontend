import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { User, Send, RefreshCw, Image as ImageIcon, FileText, Video } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const Inbox = () => {
  const { clientId } = useParams(); // URL එකෙන් Client ID එක ගන්නවා
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const token = localStorage.getItem('token');

  // 1. Chat List එක ගන්න
  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/conversations/${clientId}`, {
        headers: { token: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setConversations(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // 2. තෝරාගත් නම්බර් එකේ Chat History එක ගන්න
  const fetchMessages = async (phone) => {
    setSelectedPhone(phone);
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/messages/${clientId}/${phone}`, {
        headers: { token: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMessages(data);
    } catch (err) { console.error(err); }
    finally { setChatLoading(false); }
  };

  useEffect(() => {
    fetchConversations();
    // තත්පර 10 කට සැරයක් අලුත් මැසේජ් බලන්න (Auto Refresh)
    const interval = setInterval(fetchConversations, 10000); 
    return () => clearInterval(interval);
  }, [clientId]);

  return (
    <MainLayout>
      <div className="flex h-[80vh] bg-[#1e293b]/50 rounded-3xl overflow-hidden border border-white/5 backdrop-blur-xl">
        
        {/* LEFT SIDEBAR: Conversations List */}
        <div className="w-1/3 border-r border-white/5 bg-[#0f172a]/50 flex flex-col">
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <h2 className="font-bold text-white">Inbox</h2>
            <button onClick={fetchConversations}><RefreshCw size={18} className="text-slate-400 hover:text-white" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="p-4 text-slate-500 text-center text-sm">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-slate-500 text-center text-sm">No conversations yet.</div>
            ) : (
              conversations.map((chat) => (
                <div 
                  key={chat._id} 
                  onClick={() => fetchMessages(chat._id)}
                  className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition ${selectedPhone === chat._id ? 'bg-primary/10 border-l-4 border-primary' : ''}`}
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-bold text-white text-sm">{chat._id}</span>
                    <span className="text-[10px] text-slate-500">{new Date(chat.lastActive).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-slate-400 text-xs truncate">
                    {chat.type === 'image' ? '📷 Image' : chat.lastMessage}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT SIDE: Chat Window */}
        <div className="w-2/3 flex flex-col bg-[#0b1120]">
          {selectedPhone ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-white/5 bg-[#1e293b] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white">{selectedPhone}</h3>
                  <span className="text-xs text-emerald-400">● Active</span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-900/50">
                {chatLoading ? (
                  <div className="text-center text-slate-500 text-sm">Loading messages...</div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg._id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl ${
                        msg.direction === 'outbound' 
                          ? 'bg-emerald-600 text-white rounded-br-none' 
                          : 'bg-slate-700 text-slate-200 rounded-bl-none'
                      }`}>
                        {/* Media Display */}
                        {msg.type === 'image' && (
                          <img src={msg.content} alt="sent" className="rounded-lg mb-2 max-h-48 object-cover border border-white/10" />
                        )}
                        {msg.type === 'video' && (
                          <div className="flex items-center gap-2 bg-black/20 p-2 rounded mb-2">
                             <Video size={16} /> <span className="text-xs">Video Message</span>
                          </div>
                        )}
                        {msg.type === 'document' && (
                          <div className="flex items-center gap-2 bg-black/20 p-2 rounded mb-2">
                             <FileText size={16} /> <a href={msg.content} target="_blank" rel="noreferrer" className="text-xs underline">View Document</a>
                          </div>
                        )}

                        {/* Text Content */}
                        {(msg.type === 'text' || (msg.type !== 'text' && msg.content && !msg.content.startsWith('http'))) && (
                            <p className="text-sm">{msg.content.startsWith('http') ? '' : msg.content}</p>
                        )}
                        
                        <span className="text-[10px] opacity-50 block text-right mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <User size={48} className="mb-4 opacity-20" />
              <p>Select a conversation to view details</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Inbox;