import React, { useState, useEffect, useRef, useMemo } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { 
  Search, UserPlus, Send, Paperclip, CheckSquare, Square, Mic, 
  CheckCheck, MessageSquare, Phone, X, Loader, StopCircle, Trash2, 
  FileText, Play, Video as VideoIcon, Download, ChevronRight, Users, 
  RefreshCw, Palette, Type, Minus, Plus, Zap, ArrowUp, ArrowDown, 
  PlusCircle, Sun, Moon, ClipboardList, Tag, Filter, MessageSquarePlus, FileSpreadsheet,
  LayoutTemplate, Reply 
} from 'lucide-react';
import { API_BASE_URL } from '../../config';

const FONT_SIZES = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];

const UserInbox = ({ isEmbedded = false, initialSelectedContact = null }) => {
  const [contacts, setContacts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]); 
  
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('chatDarkMode') !== 'false');
  const [fontIndex, setFontIndex] = useState(1);
  const [showThemePicker, setShowThemePicker] = useState(false);

  const [chatBgColor, setChatBgColor] = useState(() => localStorage.getItem('chatBgColor') || '#0b1221');
  const [senderColor, setSenderColor] = useState(() => localStorage.getItem('senderColor') || '#10b981'); 
  const [receiverColor, setReceiverColor] = useState(() => localStorage.getItem('receiverColor') || '#1e293b'); 

  useEffect(() => {
      localStorage.setItem('chatBgColor', chatBgColor);
      localStorage.setItem('senderColor', senderColor);
      localStorage.setItem('receiverColor', receiverColor);
  }, [chatBgColor, senderColor, receiverColor]);

  const [activeTab, setActiveTab] = useState('All'); 
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedAgentFilter, setSelectedAgentFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [selectedPhaseFilter, setSelectedPhaseFilter] = useState('All'); 

  const [showLeadDetails, setShowLeadDetails] = useState(true);

  const [showAddChatModal, setShowAddChatModal] = useState(false);
  const [addChatMethod, setAddChatMethod] = useState('manual');
  const [newChatPhone, setNewChatPhone] = useState("");
  const [newChatName, setNewChatName] = useState("");
  const [csvFile, setCsvFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const [showSendTemplateModal, setShowSendTemplateModal] = useState(false);
  const [approvedTemplates, setApprovedTemplates] = useState([]);

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
  const [assignAmount, setAssignAmount] = useState(10); 
  const [assignDirection, setAssignDirection] = useState('newest'); 

  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [allQuickReplies, setAllQuickReplies] = useState([]); 
  const [suggestedReplies, setSuggestedReplies] = useState([]); 

  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const [newTemplateMsg, setNewTemplateMsg] = useState("");
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [uploadingTemplateMedia, setUploadingTemplateMedia] = useState(false);
  const [templateMediaPreview, setTemplateMediaPreview] = useState(null);

  const [replyingTo, setReplyingTo] = useState(null);

  const token = localStorage.getItem('token');
  const userRole = (localStorage.getItem('role') || '').toLowerCase(); 
  const userName = localStorage.getItem('name') || 'Agent'; 
  
  // 🔥 FIX: Extract ID correctly from Token bypassing 'undefined' localstorage bugs
  const getUserId = () => {
      if (token) {
          try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              if (payload && (payload.id || payload._id)) return String(payload.id || payload._id);
          } catch (e) {}
      }
      let id = localStorage.getItem('id') || localStorage.getItem('userId') || localStorage.getItem('_id');
      return (id && id !== 'undefined' && id !== 'null') ? String(id) : null;
  };
  const userId = getUserId();
  
  const CLOUD_NAME = "dyixoaldi"; 
  const UPLOAD_PRESET = "Chat Bot System"; 

  useEffect(() => {
      const fetchAllQR = async () => {
          try {
              const res = await fetch(`${API_BASE_URL}/api/quick-replies/my`, { headers: { token: `Bearer ${token}` } });
              if(res.ok) setAllQuickReplies(await res.json());
          } catch(err) {}
      };
      fetchAllQR();
  }, [token]);

  const fetchApprovedTemplates = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/api/templates`, { headers: { token: `Bearer ${token}` } });
          if(res.ok) {
              const data = await res.json();
              setApprovedTemplates(data.filter(t => t.status === 'APPROVED'));
              setShowSendTemplateModal(true);
          }
      } catch(err) { console.error(err); }
  };

  const handleSendTemplateMessage = async (template) => {
      if(!selectedContact) return;
      setSending(true);
      try {
          const res = await fetch(`${API_BASE_URL}/api/templates/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
              body: JSON.stringify({
                  contactId: selectedContact._id,
                  to: selectedContact.phoneNumber,
                  templateName: template.name,
                  language: template.language
              })
          });
          
          if(res.ok) {
              const sentMsg = await res.json();
              setMessages(prev => [...prev, sentMsg]);
              setShowSendTemplateModal(false);
              setContacts(prev => prev.map(c => c._id === selectedContact._id ? { ...c, lastMessage: `Sent Template: ${template.name}`, lastMessageTime: new Date().toISOString() } : c));
          }
      } catch(err) { alert("Message Failed!"); } 
      finally { setSending(false); }
  };

  const fetchQuickReplies = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/api/quick-replies/my`, { headers: { token: `Bearer ${token}` } });
          if(res.ok) {
              const data = await res.json();
              setTemplates(data);
              setAllQuickReplies(data);
          }
      } catch(err) { console.error(err); }
  };

  const handleTemplateMediaUpload = async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      setUploadingTemplateMedia(true);
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
              setTemplateMediaPreview({ url: data.secure_url, type: type, name: file.name });
          }
      } catch(err) { alert("Upload Failed!"); }
      finally { setUploadingTemplateMedia(false); }
  };

  const handleCreateQuickReply = async () => {
      if(!newTemplateTitle) return alert("Title is required!");
      if(!newTemplateMsg && !templateMediaPreview) return alert("Please enter text or attach media!");

      try {
          const payload = { 
              title: newTemplateTitle, 
              message: newTemplateMsg,
              mediaUrl: templateMediaPreview ? templateMediaPreview.url : null,
              mediaType: templateMediaPreview ? templateMediaPreview.type : 'text'
          };

          const res = await fetch(`${API_BASE_URL}/api/quick-replies/add`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
              body: JSON.stringify(payload)
          });
          if(res.ok) {
              const saved = await res.json();
              setTemplates([saved, ...templates]);
              setAllQuickReplies([saved, ...allQuickReplies]);
              setIsCreatingTemplate(false);
              setNewTemplateTitle(""); 
              setNewTemplateMsg("");
              setTemplateMediaPreview(null);
          }
      } catch(err) { alert("Error saving quick reply"); }
  };

  const handleDeleteQuickReply = async (id) => {
      if(!window.confirm("Delete this quick reply?")) return;
      try {
          await fetch(`${API_BASE_URL}/api/quick-replies/${id}`, { method: 'DELETE', headers: { token: `Bearer ${token}` } });
          setTemplates(templates.filter(t => t.id !== id));
          setAllQuickReplies(allQuickReplies.filter(t => t.id !== id));
      } catch(err) { alert("Delete failed"); }
  };

  const handleSelectTemplate = (t) => {
      setNewMessage(t.message || ""); 
      if (t.media_url || t.mediaUrl) {
          setMediaPreview({
              url: t.media_url || t.mediaUrl,
              type: t.media_type || t.mediaType || 'document',
              name: 'Attached Media'
          });
      }
      setShowTemplates(false); 
      setSuggestedReplies([]); 
  };

  const handleTyping = (e) => {
      const val = e.target.value;
      setNewMessage(val);

      const words = val.split(' ');
      const lastWord = words[words.length - 1];

      if (lastWord.startsWith('/')) {
          const searchKeyword = lastWord.substring(1).toLowerCase();
          const matches = allQuickReplies.filter(t => 
              t.title.toLowerCase().includes(searchKeyword)
          );
          setSuggestedReplies(matches);
      } else {
          setSuggestedReplies([]);
      }
  };

  const handleSelectAutoSuggest = (t) => {
      const words = newMessage.split(' ');
      words.pop(); 
      const textBefore = words.join(' ');
      
      setNewMessage((textBefore ? textBefore + ' ' : '') + (t.message || ''));
      if (t.media_url || t.mediaUrl) {
          setMediaPreview({
              url: t.media_url || t.mediaUrl,
              type: t.media_type || t.mediaType || 'document',
              name: 'Attached Media'
          });
      }
      setSuggestedReplies([]);
  };

  useEffect(() => {
      if (initialSelectedContact) setSelectedContact(initialSelectedContact);
  }, [initialSelectedContact]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
        const newVal = !prev;
        localStorage.setItem('chatDarkMode', newVal);
        return newVal;
    });
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
        if(conRes.ok) setContacts(await conRes.json());
        if(agentRes.ok) setAgents(await agentRes.json());
    } catch(err) { console.error(err); }
  };

  useEffect(() => { 
      loadData(); 
      const contactInterval = setInterval(() => {
          loadData();
      }, 15000); 

      return () => clearInterval(contactInterval);
  }, [token]);

  useEffect(() => {
      let msgInterval;
      if (selectedContact) {
          const fetchMsgs = () => {
              fetch(`${API_BASE_URL}/api/messages/${selectedContact._id}`, { headers: { token: `Bearer ${token}` } })
                  .then(res => res.json())
                  .then(data => { 
                      if(Array.isArray(data)) {
                          setMessages(prev => {
                              if (prev.length !== data.length) return data;
                              if (prev.length > 0 && data.length > 0 && prev[prev.length-1]._id !== data[data.length-1]._id) return data;
                              return prev;
                          });
                      }
                  })
                  .catch(err => console.error(err));
          };
          fetchMsgs();
          msgInterval = setInterval(fetchMsgs, 3000);
          
          setContacts(prev => prev.map(c => c._id === selectedContact._id ? { ...c, unreadCount: 0 } : c));
      }
      return () => { if (msgInterval) clearInterval(msgInterval); }
  }, [selectedContact, token]);

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, mediaPreview, replyingTo]);

  const formatPhoneNumber = (phone) => {
      let cleaned = phone.replace(/\D/g, '');
      if (cleaned.startsWith('0')) return '94' + cleaned.substring(1);
      return cleaned;
  };

  const handleAddNewChat = async () => {
      if(!newChatPhone) return alert("Please enter a phone number");
      let formattedPhone = formatPhoneNumber(newChatPhone);

      try {
          const res = await fetch(`${API_BASE_URL}/api/crm/contact/add`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
              body: JSON.stringify({ phoneNumber: formattedPhone, name: newChatName })
          });

          if(res.ok) {
              const newContact = await res.json();
              setContacts(prev => {
                  const exists = prev.find(c => c.phoneNumber === newContact.phoneNumber);
                  if(exists) {
                      alert("This number already exists in the system.");
                      return prev;
                  }
                  return [newContact, ...prev];
              });
              setSelectedContact(newContact);
              setShowAddChatModal(false);
              setNewChatPhone("");
              setNewChatName("");
          }
      } catch(err) { console.error(err); }
  };

  const handleCsvUpload = async () => {
      if (!csvFile) return alert("Please select a CSV file first.");
      setIsImporting(true);
      
      const reader = new FileReader();
      reader.onload = async (e) => {
          const text = e.target.result;
          const lines = text.split(/\r?\n/);
          const newContacts = [];
          
          lines.forEach((line, index) => {
              if (!line.trim()) return;
              const parts = line.split(',');
              const rawPhone = parts[0]?.trim();
              const name = parts[1]?.trim() || '';
              
              if (rawPhone && /\d/.test(rawPhone)) {
                  if (index === 0 && rawPhone.toLowerCase().includes('phone')) return;
                  let formattedPhone = formatPhoneNumber(rawPhone);
                  newContacts.push({ phoneNumber: formattedPhone, name: name });
              }
          });

          if (newContacts.length === 0) {
              setIsImporting(false);
              return alert("No valid contacts found in CSV.");
          }

          try {
              const res = await fetch(`${API_BASE_URL}/api/crm/contact/bulk-add`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
                  body: JSON.stringify({ contacts: newContacts })
              });

              if (res.ok) {
                  const addedContacts = await res.json();
                  if (Array.isArray(addedContacts) && addedContacts.length > 0) {
                      setContacts(prev => [...addedContacts, ...prev]);
                      alert(`Successfully imported ${addedContacts.length} new contacts!`);
                  }
                  setShowAddChatModal(false);
                  setCsvFile(null);
              }
          } catch (err) {
              console.error(err);
          } finally {
              setIsImporting(false);
          }
      };
      reader.readAsText(csvFile);
  };

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
            mediaUrl: mediaToSend,
            replyToMessageId: replyingTo ? replyingTo.whatsapp_message_id : null,
            replyContext: replyingTo ? (replyingTo.text || replyingTo.content || 'Media/Attachment') : null,
            agentName: userRole === 'agent' ? userName : 'Admin' 
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
              setReplyingTo(null); 
              setSuggestedReplies([]); 
              setContacts(prev => prev.map(c => c._id === selectedContact._id ? { ...c, lastMessage: textToSend || "Media File", lastMessageTime: new Date().toISOString() } : c));
          } else {
              alert(`Message Failed: WhatsApp 24h Window Rule might apply.`);
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
              const file = new File([blob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });
              
              setUploading(true);
              const formData = new FormData();
              formData.append("file", file);
              formData.append("upload_preset", UPLOAD_PRESET); 
              formData.append("cloud_name", CLOUD_NAME);

              const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, { method: "POST", body: formData });
              const data = await res.json();
              setUploading(false);
              
              if(data.secure_url) {
                  let convertedUrl = data.secure_url.replace('/upload/', '/upload/f_mp3/');
                  convertedUrl = convertedUrl.substring(0, convertedUrl.lastIndexOf('.')) + '.mp3';
                  setMediaPreview({ url: convertedUrl, type: 'audio', name: 'Voice Note' });
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

    if (isQuantityBased) {
        let sortedUnassigned = [...filteredContacts].filter(c => !c.assignedTo);
        if (assignDirection === 'newest') {sortedUnassigned.sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));
   } else {sortedUnassigned.sort((a, b) => new Date(a.lastMessageTime || 0) - new Date(b.lastMessageTime || 0));
     } 

        const unassignedLeads = sortedUnassigned.slice(0, assignAmount).map(c => c._id);
        if (unassignedLeads.length === 0) return alert("No unassigned leads available in this section!");
        leadsToAssign = unassignedLeads;
    } else {
        if(leadsToAssign.length === 0) return alert("Select leads manually or use the Quantity Assign feature!");
    }

    if(!window.confirm(`Assign/Re-assign ${leadsToAssign.length} leads to this agent?`)) return;

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

  const filteredContacts = useMemo(() => {
    return contacts
      .filter(c => {
        const contactPhone = c.phoneNumber || c.phone_number || "";
        const matchesSearch = contactPhone.includes(searchTerm);
        
        let matchesTab = true;
        const isImported = c.lastMessage === 'Created Manually' || c.lastMessage === 'Imported via CSV';
        
        // 🔥 FIX: Correctly extract Assigned ID for matching
        const rawAssigned = c.assignedTo || c.assigned_to;
        const assignedId = typeof rawAssigned === 'object' ? (rawAssigned?._id || rawAssigned?.id) : rawAssigned;

        if (activeTab === 'New Chat') {
            matchesTab = !assignedId && !isImported;
        } else if (activeTab === 'Imported') {
            if (userRole === 'agent') {
                matchesTab = isImported && assignedId && String(assignedId).trim() === String(userId).trim(); 
            } else {
                matchesTab = isImported && !assignedId; 
            }
        } else if (activeTab === 'Assigned') {
            if (userRole === 'agent') {
                matchesTab = assignedId && String(assignedId).trim() === String(userId).trim(); 
            } else {
                matchesTab = !!assignedId; 
            }
        } else if (activeTab === 'All') {
            matchesTab = true; 
        }
        
        let matchesAgent = true;
        if (selectedAgentFilter !== 'All') {
            matchesAgent = assignedId && String(assignedId).trim() === String(selectedAgentFilter).trim();
        }

        let matchesStatus = true;
        if (selectedStatusFilter !== 'All') {
            const cStatus = c.callStatus || c.call_status || 'pending';
            matchesStatus = cStatus.toLowerCase() === selectedStatusFilter.toLowerCase();
        }

        let matchesPhase = true;
        if (selectedPhaseFilter !== 'All') {
            const cPhase = c.phase || c.status || 1;
            matchesPhase = String(cPhase) === selectedPhaseFilter;
        }

        if (userRole === 'agent') {
            return matchesTab && matchesStatus && matchesPhase && matchesSearch;
        }

        return matchesTab && matchesAgent && matchesStatus && matchesPhase && matchesSearch;
      })
      .sort((a, b) => {
          const aUnread = a.unreadCount > 0 ? 1 : 0;
          const bUnread = b.unreadCount > 0 ? 1 : 0;
          if (aUnread !== bUnread) {
              return bUnread - aUnread; 
          }
          return new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0);
      });
  }, [contacts, searchTerm, activeTab, selectedAgentFilter, selectedStatusFilter, selectedPhaseFilter, userRole, userId]);

  const renderMessageContent = (msg) => {
    const mediaUrl = msg.mediaUrl || msg.media_url || (msg.type !== 'text' ? msg.content : null);
    const hasMedia = !!mediaUrl && msg.type !== 'template';
    const isCaption = msg.text && msg.text !== mediaUrl;
    const isMe = msg.direction === 'outbound' || msg.sender === 'me';
    const textColor = isMe ? 'text-white' : (isDarkMode ? 'text-slate-200' : 'text-gray-800');

    return (
        <div className="flex flex-col">
            {msg.replyContext && (
                <div className={`mb-2 p-2.5 rounded-lg border-l-4 opacity-90 text-[11px] font-medium truncate ${isMe ? 'bg-black/20 text-slate-300 border-white/30' : (isDarkMode ? 'bg-black/30 text-slate-400 border-white/20' : 'bg-gray-100 text-gray-500 border-gray-300')}`}>
                    <span className="font-bold mr-2 opacity-70">Replied to:</span>
                    {msg.replyContext}
                </div>
            )}

            {hasMedia && (
                <div className={`mb-2 rounded-lg overflow-hidden ${isCaption ? 'border-b border-white/10 pb-2' : ''}`}>
                    {msg.type === 'image' && (
                        <div className="relative group cursor-pointer" onClick={() => window.open(mediaUrl, '_blank')}>
                            <img src={mediaUrl} className="w-full h-auto max-h-[350px] object-cover rounded-lg hover:scale-[1.02] transition-transform" alt="sent content" />
                        </div>
                    )}
                    {msg.type === 'video' && <video controls src={mediaUrl} className="w-full max-h-[350px] rounded-lg bg-black" />}
                    {msg.type === 'audio' && (
                        <div className={`flex items-center gap-3 p-3 rounded-xl border min-w-[250px] ${isDarkMode ? 'bg-black/30 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
                            <div className={`w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg`}><Play size={18} fill="currentColor"/></div>
                            <div className="flex-1"><audio controls src={mediaUrl} className="w-full h-8 opacity-80" /></div>
                        </div>
                    )}
                    {(msg.type === 'document' || msg.type === 'application/pdf') && (
                        <a href={mediaUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-4 p-4 rounded-xl transition group border ${isDarkMode ? 'bg-white/10 hover:bg-white/20 border-white/5' : 'bg-gray-100 hover:bg-gray-200 border-gray-200'}`}>
                            <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center shrink-0"><FileText size={24}/></div>
                            <div className="overflow-hidden flex-1">
                                <p className={`text-sm font-bold truncate ${textColor}`}>Attached Document</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Click to Open</p>
                            </div>
                            <div className={`p-2 rounded-full transition ${isDarkMode ? 'bg-white/10 text-slate-300 group-hover:bg-white/20' : 'bg-white text-gray-500 shadow-sm'}`}><Download size={16}/></div>
                        </a>
                    )}
                </div>
            )}
            
            {msg.type === 'template' && (
                <div className="flex items-center gap-2 mb-1 opacity-70">
                    <LayoutTemplate size={14}/>
                    <span className="text-xs font-bold">Template Sent</span>
                </div>
            )}
            
            {(isCaption || (!hasMedia && msg.text)) && (
                <p className={`whitespace-pre-line leading-relaxed ${FONT_SIZES[fontIndex]} ${textColor}`}>
                    {msg.text || msg.content}
                </p>
            )}
        </div>
    );
  };

  const renderedContactsList = useMemo(() => {
      return filteredContacts.slice(0, 50).map(contact => {
          const rawAssigned = contact.assignedTo || contact.assigned_to;
          const assignedAgentObj = typeof rawAssigned === 'object' ? rawAssigned : agents.find(a => a._id === rawAssigned);
          const displayAgentName = assignedAgentObj ? assignedAgentObj.name : 'Agent';
          const cStatus = contact.callStatus || contact.call_status || 'Pending';

          return (
              <div key={contact._id} onClick={() => setSelectedContact(contact)} className={`p-3 rounded-xl cursor-pointer flex gap-3 transition-all duration-300 border group relative ${selectedContact?._id === contact._id ? `bg-white/10 border-white/20 shadow-inner` : `bg-transparent border-transparent ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}`}>
                  {userRole !== 'agent' && (
                      <div className={`absolute left-2 top-2 z-10 ${selectedIds.includes(contact._id) ? 'block' : 'hidden group-hover:block'}`}><button onClick={(e) => { e.stopPropagation(); selectedIds.includes(contact._id) ? setSelectedIds(selectedIds.filter(id => id !== contact._id)) : setSelectedIds([...selectedIds, contact._id]) }}>{selectedIds.includes(contact._id) ? <CheckSquare className={`text-white bg-[#0f172a] rounded`} size={18}/> : <Square className="text-slate-500 bg-[#0f172a] rounded" size={18}/>}</button></div>
                  )}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-lg ${rawAssigned ? 'bg-indigo-500' : 'bg-slate-700'}`}>{contact.phoneNumber?.slice(-2) || "N"}</div>
                  <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                          <div className="flex items-center gap-2">
                              <h4 className={`font-bold text-sm truncate ${selectedContact?._id === contact._id ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-slate-300' : 'text-gray-700')}`}>{contact.phoneNumber}</h4>
                              {(contact.unreadCount > 0) && (
                                  <span className={`h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold shadow-sm animate-pulse`}>
                                      1
                                  </span>
                              )}
                          </div>
                          <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-600' : 'text-gray-400'}`}>{new Date(contact.lastMessageTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                      </div>
                      <p className={`text-xs truncate mb-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{contact.lastMessage || "New Lead"}</p>
                      
                      <div className="flex items-center justify-between">
                          {rawAssigned ? (
                              <div className="flex items-center gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                  <span className="text-[10px] font-bold text-slate-400">{displayAgentName}</span>
                              </div>
                          ) : (<span className="text-[9px] text-amber-500 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">UNASSIGNED</span>)}
                          
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cStatus.toLowerCase() === 'answered' ? 'text-emerald-500 bg-emerald-500/10' : (cStatus.toLowerCase() === 'pending' ? 'text-amber-500 bg-amber-500/10' : 'text-red-500 bg-red-500/10')}`}>
                              {cStatus}
                          </span>
                      </div>
                  </div>
              </div>
          );
      });
  }, [filteredContacts, selectedContact?._id, selectedIds, isDarkMode, agents, userRole]);

  const formatMessageDate = (dateString) => {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
      
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      return `${yyyy}/${mm}/${dd}`;
  };

  const renderedMessagesList = useMemo(() => {
      let lastDateString = null;

      return messages.map((msg, index) => {
          const isMe = msg.direction === 'outbound' || msg.sender === 'me';
          
          const msgDateStr = formatMessageDate(msg.created_at || msg.createdAt || Date.now());
          const showDateSeparator = msgDateStr !== lastDateString;
          lastDateString = msgDateStr;

          return (
            <React.Fragment key={index}>
                {showDateSeparator && (
                    <div className="flex justify-center my-4">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-lg shadow-sm ${isDarkMode ? 'bg-[#1e293b] text-slate-400 border border-white/10' : 'bg-gray-200 text-gray-500 border border-gray-300'}`}>
                            {msgDateStr}
                        </span>
                    </div>
                )}

                <div className={`flex items-center group gap-2 ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
                    {!isMe && (
                        <>
                            <div 
                                className={`max-w-[75%] p-4 rounded-2xl shadow-sm border ${isDarkMode ? 'text-slate-200 border-white/5' : 'text-gray-800 border-gray-200'} rounded-tl-none`}
                                style={{ backgroundColor: receiverColor }} 
                            >
                                {renderMessageContent(msg)}
                                <div className={`flex items-center justify-end gap-1 mt-1.5 text-[10px] ${isDarkMode ? 'text-slate-400/70' : 'text-gray-500/70'}`}>
                                    {new Date(msg.created_at || msg.createdAt || Date.now()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} 
                                </div>
                            </div>

                            {msg.whatsapp_message_id && (
                                <button onClick={() => setReplyingTo(msg)} className={`opacity-0 group-hover:opacity-100 p-2 rounded-full transition shadow-sm ${isDarkMode ? 'bg-white/10 text-slate-400 hover:text-white hover:bg-white/20' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>
                                    <Reply size={14} />
                                </button>
                            )}
                        </>
                    )}

                    {isMe && (
                        <>
                            {msg.whatsapp_message_id && (
                                <button onClick={() => setReplyingTo(msg)} className={`opacity-0 group-hover:opacity-100 p-2 rounded-full transition shadow-sm ${isDarkMode ? 'bg-white/10 text-slate-400 hover:text-white hover:bg-white/20' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}>
                                    <Reply size={14} />
                                </button>
                            )}

                            <div 
                                className={`max-w-[75%] p-4 rounded-2xl shadow-sm border text-white rounded-tr-none ${isDarkMode ? 'border-white/10' : 'border-transparent'}`}
                                style={{ backgroundColor: senderColor }} 
                            >
                                {renderMessageContent(msg)}
                                <div className="flex items-center justify-end gap-2 mt-1.5 text-[10px] text-white/70">
                                    {(msg.agentName || msg.agent_name) && (
                                        <span className="font-semibold text-white/90 bg-black/20 px-1.5 py-0.5 rounded">
                                            By {msg.agentName || msg.agent_name}
                                        </span>
                                    )}
                                    {new Date(msg.created_at || msg.createdAt || Date.now()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} 
                                    <CheckCheck size={12}/>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </React.Fragment>
          )
      });
  }, [messages, isDarkMode, fontIndex, senderColor, receiverColor]);

  const tabsToShow = userRole === 'agent' 
      ? ['Imported', 'Assigned', 'All'] 
      : ['New Chat', 'Imported', 'Assigned', 'All'];

  const content = (
      <div className={`flex h-full rounded-3xl overflow-hidden shadow-2xl relative transition-colors duration-300 border ${isDarkMode ? 'bg-[#0B1120] border-white/10' : 'bg-white border-gray-200'}`}>
        
        {/* LEFT SIDEBAR */}
        <div className={`w-[380px] border-r flex flex-col backdrop-blur-xl transition-colors duration-300 z-30 ${isDarkMode ? 'bg-[#0f172a]/80 border-white/5' : 'bg-white border-gray-200'}`}>
            <div className={`p-4 border-b space-y-4 ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center">
                    <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        <MessageSquare className="text-indigo-400"/> Inbox
                    </h2>
                    <div className="flex gap-2">
                         <button onClick={toggleDarkMode} className={`p-2 rounded-lg transition ${isDarkMode ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                            {isDarkMode ? <Sun size={16}/> : <Moon size={16}/>}
                        </button>
                        
                        <div className="relative">
                            <button onClick={() => setShowThemePicker(!showThemePicker)} className={`p-2 rounded-lg transition ${isDarkMode ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><Palette size={16}/></button>
                            {showThemePicker && (
                                <div className={`absolute top-10 right-0 border rounded-xl p-4 z-50 shadow-2xl flex flex-col gap-3 w-56 animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#1e293b] border-white/10' : 'bg-white border-gray-200'}`}>
                                    <h4 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Customize Colors</h4>
                                    
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400">Chat Background</span>
                                        <input type="color" value={chatBgColor} onChange={(e) => setChatBgColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"/>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400">My Messages (Sender)</span>
                                        <input type="color" value={senderColor} onChange={(e) => setSenderColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"/>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] text-slate-400">Customer Messages</span>
                                        <input type="color" value={receiverColor} onChange={(e) => setReceiverColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"/>
                                    </div>
                                    
                                    <button onClick={() => {
                                        setChatBgColor('#0b1221'); setSenderColor('#10b981'); setReceiverColor('#1e293b');
                                    }} className="mt-2 w-full py-1 text-[10px] bg-red-500/10 text-red-400 rounded hover:bg-red-50 hover:text-white transition">Reset to Default</button>
                                </div>
                            )}
                        </div>

                        <button onClick={loadData} className={`p-2 rounded-lg transition ${isDarkMode ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}><RefreshCw size={16}/></button>
                        {userRole !== 'agent' && (
                             <button onClick={() => setShowAssignModal(true)} className={`p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg transition`} title="Bulk Assign">
                                <Zap size={16} />
                             </button>
                        )}
                    </div>
                </div>
                
                <div className="space-y-2">
                    <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-[#1e293b] border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                        {tabsToShow.map(tab => {
                            let badgeCount = 0;
                            const uId = userId;
                            
                            if (tab === 'New Chat') {
                                badgeCount = contacts.filter(c => !c.assignedTo && c.lastMessage !== 'Created Manually' && c.lastMessage !== 'Imported via CSV' && c.unreadCount > 0).length;
                            } else if (tab === 'Imported') {
                                if (userRole === 'agent') {
                                    badgeCount = contacts.filter(c => {
                                        const rawAssigned = c.assignedTo || c.assigned_to;
                                        const assignedId = typeof rawAssigned === 'object' ? (rawAssigned?._id || rawAssigned?.id) : rawAssigned;
                                        const isImport = c.lastMessage === 'Created Manually' || c.lastMessage === 'Imported via CSV';
                                        return assignedId && String(assignedId).trim() === String(uId).trim() && isImport && c.unreadCount > 0;
                                    }).length;
                                } else {
                                    badgeCount = contacts.filter(c => !c.assignedTo && (c.lastMessage === 'Created Manually' || c.lastMessage === 'Imported via CSV') && c.unreadCount > 0).length;
                                }
                            } else if (tab === 'Assigned') {
                                if (userRole === 'agent') {
                                    badgeCount = contacts.filter(c => {
                                        const rawAssigned = c.assignedTo || c.assigned_to;
                                        const assignedId = typeof rawAssigned === 'object' ? (rawAssigned?._id || rawAssigned?.id) : rawAssigned;
                                        return assignedId && String(assignedId).trim() === String(uId).trim() && c.unreadCount > 0;
                                    }).length;
                                } else {
                                    badgeCount = contacts.filter(c => c.assignedTo && c.unreadCount > 0).length;
                                }
                            } else if (tab === 'All') {
                                badgeCount = contacts.filter(c => c.unreadCount > 0).length;
                            }
                            
                            return (
                                <button 
                                    key={tab} 
                                    onClick={() => setActiveTab(tab)} 
                                    className={`flex-1 py-1.5 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all duration-300 ${activeTab === tab ? `bg-indigo-500 text-white shadow-lg` : (isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200')}`}
                                >
                                    {tab}
                                    {badgeCount > 0 && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full animate-pulse shadow-sm">{badgeCount}</span>}
                                </button>
                            );
                        })}
                    </div>
                    
                    {(activeTab === 'Assigned' || activeTab === 'All') && (
                        <div className="flex gap-2">
                            {userRole !== 'agent' && (
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Filter size={14} className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}/></div>
                                    <select value={selectedAgentFilter} onChange={(e) => setSelectedAgentFilter(e.target.value)} className={`w-full appearance-none rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400 border transition-all ${isDarkMode ? 'bg-[#1e293b] text-slate-300 border-white/5' : 'bg-white text-gray-700 border-gray-200'}`}>
                                        <option value="All">All Agents</option>
                                        {agents.map(a => (<option key={a._id} value={a._id}>{a.name}</option>))}
                                    </select>
                                </div>
                            )}
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><Tag size={14} className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}/></div>
                                <select value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value)} className={`w-full appearance-none rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400 border transition-all ${isDarkMode ? 'bg-[#1e293b] text-slate-300 border-white/5' : 'bg-white text-gray-700 border-gray-200'}`}>
                                    <option value="All">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="answered">Answered</option>
                                    <option value="reject">Reject</option>
                                    <option value="no answer">No Answer</option>
                                </select>
                            </div>
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none"><ClipboardList size={14} className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}/></div>
                                <select value={selectedPhaseFilter} onChange={(e) => setSelectedPhaseFilter(e.target.value)} className={`w-full appearance-none rounded-xl py-2 pl-9 pr-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400 border transition-all ${isDarkMode ? 'bg-[#1e293b] text-slate-300 border-white/5' : 'bg-white text-gray-700 border-gray-200'}`}>
                                    <option value="All">All Phases</option>
                                    <option value="1">Phase 1</option>
                                    <option value="2">Phase 2</option>
                                    <option value="3">Phase 3</option>
                                    
                                </select>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-2">
                    {userRole !== 'agent' && (
                        <button 
                            onClick={() => {
                                if (selectedIds.length === filteredContacts.length && filteredContacts.length > 0) setSelectedIds([]);
                                else setSelectedIds(filteredContacts.map(c => c._id));
                            }} 
                            className={`p-2.5 rounded-xl border transition-all ${selectedIds.length === filteredContacts.length && filteredContacts.length > 0 ? `bg-indigo-500 text-white border-transparent` : (isDarkMode ? 'bg-[#1e293b] border-white/5 text-slate-400' : 'bg-gray-100 border-gray-200 text-gray-500')}`}
                            title="Select All Filtered"
                        >
                            {selectedIds.length === filteredContacts.length && filteredContacts.length > 0 ? <CheckSquare size={16}/> : <Square size={16}/>}
                        </button>
                    )}
                    <div className="relative group flex-1">
                        <Search className={`absolute left-3 top-2.5 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-gray-400'} group-focus-within:text-indigo-400`} size={16}/>
                        <input type="text" placeholder="Search number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-400 border border-transparent transition-all placeholder-slate-600 ${isDarkMode ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-900 placeholder-gray-500'}`}/>
                    </div>
                    <button onClick={() => setShowAddChatModal(true)} className={`p-2.5 rounded-xl border transition-all ${isDarkMode ? 'bg-[#1e293b] border-white/5 text-emerald-400 hover:text-emerald-300 hover:bg-white/5' : 'bg-gray-100 border-gray-200 text-emerald-600 hover:text-emerald-700 hover:bg-gray-200'}`} title="Start New Direct Chat">
                        <MessageSquarePlus size={16}/>
                    </button>
                </div>
            </div>
            
            {selectedIds.length > 0 && (
                <div className={`bg-indigo-500/10 border-b border-indigo-500/30 p-2 flex justify-between items-center animate-in slide-in-from-top-2`}>
                    <span className={`text-indigo-400 text-xs font-bold ml-2`}>{selectedIds.length} Selected</span>
                    <div className="flex gap-2">
                        <button onClick={() => setSelectedIds([])} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400"><X size={14}/></button>
                        <button onClick={() => setShowAssignModal(true)} className={`bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2 transition shadow-lg`}>Assign <UserPlus size={12}/></button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {renderedContactsList}
            </div>
        </div>

        {/* MAIN AREA */}
        <div 
            className="flex-1 flex overflow-hidden relative transition-colors duration-300"
            style={{ backgroundColor: chatBgColor }} 
        >
            {selectedContact ? (
                <>
                    <div className="flex-1 flex flex-col relative z-10 h-full">
                        <div className={`h-16 shrink-0 flex items-center justify-between px-6 border-b z-20 shadow-sm backdrop-blur-md ${isDarkMode ? 'bg-[#0f172a]/90 border-white/5' : 'bg-white/90 border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg`}>{selectedContact.phoneNumber?.slice(-2) || "N"}</div>
                                <div>
                                    <h3 className={`font-bold text-base ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{selectedContact.phoneNumber}</h3>
                                    <div className="flex items-center gap-2 text-xs">
                                        <span className={`w-1.5 h-1.5 rounded-full ${selectedContact.assignedTo ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                        <span className="text-slate-400">
                                            {selectedContact.assignedTo ? 
                                                `Assigned: ${typeof selectedContact.assignedTo === 'object' ? selectedContact.assignedTo.name : (agents.find(a => a._id === selectedContact.assignedTo)?.name || 'Agent')}` 
                                            : 'Waiting for assignment'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className={`flex items-center gap-2 p-1 rounded-lg border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                                    <button onClick={() => adjustFontSize('down')} className={`p-1.5 rounded-md transition ${isDarkMode ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-white text-gray-500 hover:text-black'}`}><Minus size={14}/></button>
                                    <Type size={14} className={isDarkMode ? 'text-slate-400' : 'text-gray-500'}/>
                                    <button onClick={() => adjustFontSize('up')} className={`p-1.5 rounded-md transition ${isDarkMode ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-white text-gray-500 hover:text-black'}`}><Plus size={14}/></button>
                                </div>
                                {userRole !== 'agent' && (
                                    <button 
                                        onClick={() => setShowLeadDetails(!showLeadDetails)} 
                                        className={`ml-3 p-2 rounded-lg transition border ${showLeadDetails ? `bg-indigo-500 border-transparent text-white shadow-lg` : (isDarkMode ? 'bg-white/5 text-slate-400 border-white/5 hover:text-white hover:bg-white/10' : 'bg-gray-100 text-gray-500 border-gray-200 hover:text-black hover:bg-gray-200')}`}
                                        title="Toggle Campaign Data"
                                    >
                                        <ClipboardList size={18}/>
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className={`flex-1 overflow-y-auto p-6 space-y-3 z-10`}>
                            {renderedMessagesList}
                            <div ref={scrollRef} />
                        </div>

                        <div className={`p-4 border-t z-20 shrink-0 ${isDarkMode ? 'bg-[#0B1120] border-white/5' : 'bg-[#f0f2f5] border-gray-200'}`}>
                            <div className={`rounded-2xl flex flex-col border transition-colors shadow-lg relative backdrop-blur-sm 
                                ${isDarkMode ? 'bg-[#1e293b]/50 border-white/5 focus-within:border-indigo-500' : 'bg-white border-gray-200 focus-within:border-gray-300'}`}>
                                
                                {suggestedReplies.length > 0 && (
                                    <div className={`absolute bottom-full left-0 mb-2 w-72 border rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 ${isDarkMode ? 'bg-[#1e293b] border-white/10' : 'bg-white border-gray-200'}`}>
                                        <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-2 px-2 flex items-center gap-1"><Zap size={12}/> Quick Reply Suggestions</div>
                                        <div className="max-h-40 overflow-y-auto custom-scrollbar">
                                            {suggestedReplies.map(t => (
                                                <div key={t.id || t._id} className={`p-2 rounded-lg cursor-pointer transition-colors ${isDarkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100 text-gray-800'}`} onClick={() => handleSelectAutoSuggest(t)}>
                                                    <div className="font-bold text-xs flex items-center gap-2">
                                                        {t.title} 
                                                        {(t.media_url || t.mediaUrl) && <Paperclip size={10} className="text-blue-400"/>}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 truncate">{t.message || 'Media File'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {mediaPreview && (
                                    <div className={`p-3 border-b flex items-center justify-between animate-in slide-in-from-bottom-2 ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden border ${isDarkMode ? 'bg-white/10 border-white/10' : 'bg-white border-gray-200'}`}>
                                                {mediaPreview.type === 'image' && <img src={mediaPreview.url} className="w-full h-full object-cover"/>}
                                                {mediaPreview.type === 'video' && <VideoIcon size={20} className={isDarkMode ? 'text-white' : 'text-gray-600'}/>}
                                                {mediaPreview.type === 'audio' && <Mic size={20} className={isDarkMode ? 'text-white' : 'text-gray-600'}/>}
                                                {mediaPreview.type === 'document' && <FileText size={20} className={isDarkMode ? 'text-white' : 'text-gray-600'}/>}
                                            </div>
                                            <div><p className={`text-sm font-bold truncate w-48 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{mediaPreview.name}</p><p className={`text-xs text-indigo-400 uppercase font-bold`}>{mediaPreview.type}</p></div>
                                        </div>
                                        <button onClick={() => setMediaPreview(null)} className="p-2 hover:bg-red-500 hover:text-white rounded-full transition text-slate-400 bg-transparent"><X size={16}/></button>
                                    </div>
                                )}

                                {replyingTo && (
                                    <div className={`p-3 border-b-2 border-emerald-500 flex justify-between items-start animate-in slide-in-from-bottom-2 ${isDarkMode ? 'bg-black/40 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>
                                        <div className="flex-1 overflow-hidden pr-2 border-l-4 border-emerald-500 pl-2">
                                            <p className="text-[10px] font-bold text-emerald-500 mb-0.5">Replying to {replyingTo.sender === 'me' || replyingTo.direction === 'outbound' ? 'Yourself' : 'Customer'}</p>
                                            <p className="text-xs truncate text-slate-400">{replyingTo.text || replyingTo.content || 'Media Message'}</p>
                                        </div>
                                        <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-red-500 p-1 bg-white/5 rounded-md">
                                            <X size={14} />
                                        </button>
                                    </div>
                                )}

                                <div className="flex items-end gap-2 p-2 relative">
                                    {isRecording ? (
                                        <div className="flex-1 flex items-center gap-4 px-2 py-2">
                                            <StopCircle className="text-red-500 animate-pulse" size={24}/>
                                            <span className={`font-mono text-sm ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{formatTime(recordingTime)}</span>
                                            <div className="flex-1"></div>
                                            <button onClick={cancelRecording} className="p-2 text-slate-400 hover:text-red-400 transition"><Trash2 size={20}/></button>
                                            <button onClick={stopRecording} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-50 transition shadow-lg shadow-red-500/20"><Send size={18}/></button>
                                        </div>
                                    ) : (
                                        <>
                                            <label className={`p-3 rounded-xl transition cursor-pointer self-center ${isDarkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-black hover:bg-gray-100'}`} title="Attach File"><Paperclip size={20}/><input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*,application/pdf,application/msword,audio/*"/></label>
                                            <button onClick={() => { setShowTemplates(!showTemplates); fetchQuickReplies(); }} className="p-3 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-xl transition self-center" title="Quick Reply Templates"><Zap size={20}/></button>
                                            
                                            <button onClick={fetchApprovedTemplates} className="p-3 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-xl transition self-center" title="Send Official Template">
                                                <LayoutTemplate size={20}/>
                                            </button>

                                            <textarea 
                                                placeholder={mediaPreview ? "Add a caption..." : "Type '/' for quick replies or a message..."} 
                                                className={`flex-1 bg-transparent text-sm focus:outline-none px-2 py-3 resize-none custom-scrollbar max-h-32 ${isDarkMode ? 'text-white placeholder-slate-500' : 'text-gray-900 placeholder-gray-400'}`} 
                                                rows={1} 
                                                value={newMessage} 
                                                onChange={handleTyping} 
                                                onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}} 
                                                disabled={uploading}
                                            />
                                            {newMessage.trim() || mediaPreview ? (<button onClick={handleSendMessage} disabled={sending} className={`p-3 bg-indigo-600 rounded-xl text-white hover:bg-indigo-500 transition shadow-lg self-center`}>{sending ? <Loader className="animate-spin" size={20}/> : <Send size={20}/>}</button>) : (<button onClick={startRecording} className={`p-3 rounded-xl transition self-center ${isDarkMode ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}`}><Mic size={20} /></button>)}
                                        </>
                                    )}

                                    {/* QUICK REPLIES MODAL */}
                                    {showTemplates && (
                                        <div className={`absolute bottom-16 left-2 w-80 border rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-bottom-2 ${isDarkMode ? 'bg-[#1e293b] border-white/10' : 'bg-white border-gray-200'}`}>
                                            <div className={`flex justify-between items-center mb-3 pb-2 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                                                <h3 className={`font-bold text-xs flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}><Zap size={14} className="text-amber-400"/> Quick Replies</h3>
                                                <button onClick={() => setShowTemplates(false)}><X size={14} className="text-slate-400 hover:text-red-500"/></button>
                                            </div>
                                            
                                            <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 mb-2">
                                                {templates.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">No templates yet.</p> : templates.map(t => (
                                                    <div key={t.id || t._id} className={`p-2 rounded-lg group cursor-pointer ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'}`} onClick={() => handleSelectTemplate(t)}>
                                                        <div className="flex justify-between items-start">
                                                            <h4 className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                                {t.title}
                                                                {(t.media_url || t.mediaUrl) && <Paperclip size={10} className="inline ml-1 text-blue-400"/>}
                                                            </h4>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteQuickReply(t.id); }} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><Trash2 size={12}/></button>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 truncate">{t.message || 'Media File'}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            {isCreatingTemplate ? (
                                                <div className={`space-y-2 p-2 rounded-lg border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                                    <input type="text" placeholder="Title" className={`w-full bg-transparent border-b text-xs p-1 outline-none ${isDarkMode ? 'border-white/10 text-white' : 'border-gray-300 text-gray-900'}`} value={newTemplateTitle} onChange={(e) => setNewTemplateTitle(e.target.value)} />
                                                    <textarea placeholder="Message content..." className={`w-full bg-transparent border-b text-xs p-1 outline-none resize-none ${isDarkMode ? 'border-white/10 text-slate-300' : 'border-gray-300 text-gray-600'}`} rows={2} value={newTemplateMsg} onChange={(e) => setNewTemplateMsg(e.target.value)} />
                                                    
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <label className={`cursor-pointer p-1.5 rounded bg-white/5 hover:bg-white/10 transition text-slate-400 flex items-center gap-1 text-[10px]`}>
                                                            {uploadingTemplateMedia ? <Loader className="animate-spin" size={12}/> : <Paperclip size={12}/>}
                                                            {templateMediaPreview ? "Change Media" : "Attach Media"}
                                                            <input type="file" className="hidden" onChange={handleTemplateMediaUpload} accept="image/*,video/*,application/pdf,application/msword,audio/*"/>
                                                        </label>
                                                        {templateMediaPreview && (
                                                            <span className="text-[10px] text-emerald-400 truncate w-24">{templateMediaPreview.name}</span>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <button onClick={() => {setIsCreatingTemplate(false); setTemplateMediaPreview(null);}} className="flex-1 py-1 text-xs text-slate-400 hover:bg-black/10 rounded">Cancel</button>
                                                        <button onClick={handleCreateQuickReply} disabled={uploadingTemplateMedia} className="flex-1 py-1 text-xs bg-amber-500 text-black font-bold rounded hover:bg-amber-400 disabled:opacity-50">Save</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={() => setIsCreatingTemplate(true)} className={`w-full py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}><PlusCircle size={14}/> Create New</button>
                                            )}
                                        </div>
                                    )}

                                    {/* OFFICIAL TEMPLATES MODAL */}
                                    {showSendTemplateModal && (
                                        <div className={`absolute bottom-16 left-12 w-80 border rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-bottom-2 ${isDarkMode ? 'bg-[#1e293b] border-white/10' : 'bg-white border-gray-200'}`}>
                                            <div className={`flex justify-between items-center mb-3 pb-2 border-b ${isDarkMode ? 'border-white/5' : 'border-gray-100'}`}>
                                                <h3 className={`font-bold text-sm flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}><LayoutTemplate size={16} className="text-blue-400"/> Send Approved Template</h3>
                                                <button onClick={() => setShowSendTemplateModal(false)}><X size={16} className="text-slate-400 hover:text-red-500"/></button>
                                            </div>
                                            
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-2 mb-2">
                                                {approvedTemplates.length === 0 ? <p className="text-xs text-slate-500 text-center py-4">No approved templates available.</p> : approvedTemplates.map(t => (
                                                    <div key={t.id} className={`p-3 rounded-xl border group ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                                        <h4 className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t.name}</h4>
                                                        <p className="text-[10px] text-slate-400 line-clamp-2 mb-2">{t.components?.find(c => c.type === 'BODY')?.text || "Template Message"}</p>
                                                        <button onClick={() => handleSendTemplateMessage(t)} className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold rounded-lg transition">
                                                            Send to Customer
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {uploading && <div className={`absolute inset-0 flex items-center justify-center gap-2 z-10 backdrop-blur-sm ${isDarkMode ? 'bg-[#1e293b]/90' : 'bg-white/80'}`}><Loader className={`animate-spin text-indigo-400`} size={20}/><span className={`text-xs text-indigo-400 font-bold`}>Uploading Media...</span></div>}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    {userRole !== 'agent' && showLeadDetails && (
                        <div className={`w-[300px] shrink-0 border-l flex flex-col z-20 shadow-[-4px_0_15px_rgba(0,0,0,0.05)] animate-in slide-in-from-right-8 duration-300 ${isDarkMode ? 'bg-[#0f172a] border-white/5' : 'bg-white border-gray-200'}`}>
                            <div className={`h-16 flex items-center justify-between px-5 border-b shrink-0 ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
                                <h3 className={`font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    <ClipboardList size={18} className="text-indigo-400"/> Campaign Data
                                </h3>
                                <button onClick={() => setShowLeadDetails(false)} className="text-slate-400 hover:text-red-500 transition"><X size={16}/></button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1e293b]/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 block">Assigned Agent</span>
                                    <div className="flex items-center gap-3">
                                        {selectedContact.assignedTo ? (
                                            <>
                                                <div className={`w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                                                    {(typeof selectedContact.assignedTo === 'object' ? selectedContact.assignedTo.name : (agents.find(a => a._id === selectedContact.assignedTo)?.name || 'A')).charAt(0).toUpperCase()}
                                                </div>
                                                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {typeof selectedContact.assignedTo === 'object' ? selectedContact.assignedTo.name : (agents.find(a => a._id === selectedContact.assignedTo)?.name || 'Agent')}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-xs text-amber-500 font-bold">Unassigned</span>
                                        )}
                                    </div>
                                </div>

                                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1e293b]/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Phone size={14}/> Call Status</span>
                                    {selectedContact.callStatus || selectedContact.call_status ? (
                                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${['answered', 'success'].includes((selectedContact.callStatus || selectedContact.call_status).toLowerCase()) ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                                            {selectedContact.callStatus || selectedContact.call_status}
                                        </div>
                                    ) : (
                                        <span className="text-sm text-slate-500 italic">Pending...</span>
                                    )}
                                </div>

                                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1e293b]/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><Tag size={14}/> Data Phase</span>
                                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                                        {selectedContact.phase || selectedContact.status || 'New Lead'}
                                    </span>
                                </div>

                                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1e293b]/50 border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2"><FileText size={14}/> Remarks / Notes</span>
                                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} whitespace-pre-wrap`}>
                                        {selectedContact.remarks || selectedContact.notes || <span className="italic opacity-60">No remarks added by the agent yet.</span>}
                                    </p>
                                </div>
                                
                                <div className="text-center pt-2">
                                    <span className="text-[10px] text-slate-500">
                                        Last interaction: {new Date(selectedContact.lastMessageTime).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className={`flex-1 flex flex-col items-center justify-center transition-colors z-10 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-pulse ${isDarkMode ? 'bg-[#1e293b]/50 shadow-indigo-500/10 border border-white/5' : 'bg-white border border-gray-200'}`}><MessageSquare size={40} className="text-indigo-400 opacity-80"/></div>
                    <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select a Conversation</h1>
                    <p className="text-sm">Choose a contact from the left to start chatting.</p>
                </div>
            )}
        </div>
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