import React, { useState, useEffect, useRef, useMemo } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { API_BASE_URL } from '../../config';

// Paths updated to point to the correct folder
import ContactSidebar from "../../components/chat/ContactSidebar";
import ChatArea from "../../components/chat/ChatArea";
import CampaignSidebar from "../../components/chat/CampaignSidebar";
import ChatModals from "../../components/chat/ChatModals";

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

  const [theme, setTheme] = useState('whatsapp');
  const themes = {
      light: { bg: 'bg-[#efeae2]', bubbleMe: 'bg-[#d9fdd3] text-[#111b21]', bubbleThem: 'bg-white text-[#111b21]', header: 'bg-[#f0f2f5] border-gray-300', text: 'text-[#111b21]', subText: 'text-gray-500', icon: 'text-gray-500 hover:text-gray-700 hover:bg-black/5', inputBg: 'bg-white', patternUrl: 'https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png' },
      whatsapp: { bg: 'bg-[#0b141a]', bubbleMe: 'bg-[#005c4b] text-white', bubbleThem: 'bg-[#202c33] text-gray-100', header: 'bg-[#202c33] border-slate-600/50', text: 'text-white', subText: 'text-gray-400', icon: 'text-gray-400 hover:text-white hover:bg-white/10', inputBg: 'bg-[#2a3942]' },
      blue: { bg: 'bg-slate-900', bubbleMe: 'bg-blue-600 text-white', bubbleThem: 'bg-slate-700 text-gray-100', header: 'bg-slate-800 border-slate-600/50', text: 'text-white', subText: 'text-gray-400', icon: 'text-gray-400 hover:text-white hover:bg-white/10', inputBg: 'bg-slate-800' }
  };
  const currentTheme = themes[theme];

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

  const activeContactRef = useRef(null);
  useEffect(() => {
      activeContactRef.current = selectedContact;
  }, [selectedContact]);

  const [drafts, setDrafts] = useState({});
  
  const newMessage = selectedContact && drafts[selectedContact._id] !== undefined ? drafts[selectedContact._id] : "";
  const setNewMessage = (val) => {
      if (selectedContact) {
          setDrafts(prev => ({ ...prev, [selectedContact._id]: val }));
      }
  };
  
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
  
  const getUserId = () => {
      let id = localStorage.getItem('id') || localStorage.getItem('userId') || localStorage.getItem('_id');
      if (token) {
          try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              if (payload && (payload.id || payload._id)) {
                  id = payload.id || payload._id;
              }
          } catch (e) {}
      }
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
      if(!selectedContact) {
          alert("❌ Error: No contact selected!");
          return;
      }
      
      setSending(true);

      let targetPhone = selectedContact.phoneNumber || selectedContact.phone_number || "";
      let targetId = selectedContact._id || selectedContact.id || "";
      targetPhone = targetPhone.toString().replace(/\D/g, '');

      if (targetPhone.startsWith('0')) {
          targetPhone = '94' + targetPhone.substring(1);
      }

      let actualBodyText = "";
      let sendComponents = [];
      let actualMediaUrl = null;

      if (template.components) {
          // --- 1. HEADER (IMAGE/VIDEO/DOCUMENT) ---
          const header = template.components.find(c => c.type === 'HEADER');
          if (header && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(header.format)) {
              
              // Meta එකෙන් දෙන link එක තියෙනවා නම් ඒක ගන්නවා
              if (header.example && header.example.header_url && header.example.header_url[0]) {
                  actualMediaUrl = header.example.header_url[0];
              } 
              // 🔥 ලොකුම වෙනස: Meta එකෙන් link එක එවන්නේ නැත්නම්, 
              // අපි template එක create කරද්දී පාවිච්චි කරපු 'header_handle' එක බලනවා
              else if (header.example && header.example.header_handle && header.example.header_handle[0]) {
                  // handle එක විතරක් යවන්න පුළුවන් (Meta API එක මේකත් ගන්නවා)
                  actualMediaUrl = header.example.header_handle[0];
              }

              if (actualMediaUrl) {
                  const mediaParam = { type: header.format.toLowerCase() };
                  // Link එකක් නම් 'link' key එක, handle එකක් නම් 'handle' key එක පාවිච්චි කරනවා
                  if (actualMediaUrl.startsWith('http')) {
                      mediaParam[header.format.toLowerCase()] = { link: actualMediaUrl };
                  } else {
                      mediaParam[header.format.toLowerCase()] = { handle: actualMediaUrl };
                  }

                  sendComponents.push({
                      type: "header",
                      parameters: [mediaParam]
                  });
              } else {
                  // තාමත් media එකක් හොයාගන්න බැරි නම්, alert එකක් දෙනවා
                  alert("❌ Template Error: Meta did not provide the image/video for this approved template. Please try refreshing or re-creating the template.");
                  setSending(false);
                  return;
              }
          }

          // --- 2. BODY TEXT & VARIABLES ---
          const body = template.components.find(c => c.type === 'BODY');
          if (body) {
              actualBodyText = body.text;
              let customerName = (selectedContact.name && !selectedContact.name.toLowerCase().includes('guest')) 
                  ? selectedContact.name : "Customer";
              
              // Variable {{1}} replace කරනවා
              actualBodyText = actualBodyText.replace(/\{\{1\}\}/g, customerName);

              if (body.text.includes('{{1}}')) {
                  sendComponents.push({
                      type: "body",
                      parameters: [{ type: "text", text: customerName }]
                  });
              }
          }
      }

      try {
          const payload = {
              contactId: targetId,
              to: targetPhone,              
              templateName: template.name,
              language: template.language || 'en_US',
              components: sendComponents, 
              templateBodyText: actualBodyText || `Template: ${template.name}`,
              templateMediaUrl: actualMediaUrl.startsWith('http') ? actualMediaUrl : null
          };

          const res = await fetch(`${API_BASE_URL}/api/templates/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
              body: JSON.stringify(payload)
          });
          
          const data = await res.json();

          if(res.ok) {
              setMessages(prev => [...prev, data]);
              setShowSendTemplateModal(false);
              alert("✅ Template Sent Successfully!");
          } else {
              alert(`❌ Message Failed: ${data.message || "Meta API error"}`);
          }
      } catch(err) { 
          alert("❌ System Error: Check your connection."); 
      } 
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

  useEffect(() => {
      setMediaPreview(null);
      setReplyingTo(null);
      if (isRecording) {
          cancelRecording();
      }
      setSuggestedReplies([]);
  }, [selectedContact?._id]);

  useEffect(() => { 
      const timer = setTimeout(() => {
          if (scrollRef.current) {
              scrollRef.current.scrollIntoView({ behavior: "auto", block: "end" });
          }
      }, 100); 
      return () => clearTimeout(timer);
  }, [messages, selectedContact, mediaPreview, replyingTo]);

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
              const rawContact = await res.json();
              
              const newContact = {
                  ...rawContact,
                  _id: rawContact.id || rawContact._id,
                  phoneNumber: rawContact.phone_number || rawContact.phoneNumber,
                  assignedTo: rawContact.assigned_to || rawContact.assignedTo,
                  lastMessage: rawContact.last_message || rawContact.lastMessage,
                  lastMessageTime: rawContact.last_message_time || rawContact.lastMessageTime
              };

              const assignedId = typeof newContact.assignedTo === 'object' ? (newContact.assignedTo?._id || newContact.assignedTo?.id) : newContact.assignedTo;

              if (userRole === 'agent' && assignedId && String(assignedId).trim() !== String(userId).trim()) {
                  alert("This number already exists in the system and is assigned to another agent.");
                  return;
              }

              setContacts(prev => {
                  const exists = prev.find(c => c.phoneNumber === newContact.phoneNumber);
                  if(exists) {
                      alert("This number already exists in your list.");
                      return prev;
                  }
                  return [newContact, ...prev];
              });

              setSelectedContact(newContact);
              setShowAddChatModal(false);
              setNewChatPhone("");
              setNewChatName("");
          } else {
              const err = await res.json();
              alert(err.message || "Failed to add contact.");
          }
      } catch(err) { console.error(err); alert("Network Error"); }
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
                      const normalized = addedContacts.map(c => ({
                          ...c,
                          _id: c.id || c._id,
                          phoneNumber: c.phone_number || c.phoneNumber,
                          assignedTo: c.assigned_to || c.assignedTo,
                          lastMessage: c.last_message || c.lastMessage,
                          lastMessageTime: c.last_message_time || c.lastMessageTime
                      }));

                      setContacts(prev => {
                          const existingPhones = new Set(prev.map(p => p.phoneNumber));
                          const trulyNew = normalized.filter(n => !existingPhones.has(n.phoneNumber));
                          return [...trulyNew, ...prev];
                      });
                      alert(`Successfully imported ${addedContacts.length} new contacts!`);
                  }
                  setShowAddChatModal(false);
                  setCsvFile(null);
              } else {
                  const err = await res.json();
                  alert(err.message || "Failed to import contacts.");
              }
          } catch (err) {
              console.error(err);
              alert("Network Error");
          } finally {
              setIsImporting(false);
          }
      };
      reader.readAsText(csvFile);
  };

 const handleSendMessage = async (e) => {
      if(e) e.preventDefault();
      if(!selectedContact) return;

      // 🔥 Send ඔබන තත්පරේම හිටපු කස්ටමර්ගේ ඩේටා ටික Lock කරගන්නවා
      const targetContact = selectedContact;
      const targetContactId = targetContact._id;

      const textToSend = (drafts[targetContactId] || "").trim(); 
      const mediaToSend = mediaPreview ? mediaPreview.url : null;
      const typeToSend = mediaPreview ? mediaPreview.type : 'text';

      if(!textToSend && !mediaToSend) return; 

      setSending(true);
      try {
          const payload = {
            contactId: targetContactId,
            to: targetContact.phoneNumber,
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
              
              // යවපු කෙනාගේ Draft එක විතරක් මකනවා
              setDrafts(prev => ({ ...prev, [targetContactId]: "" }));
              
              // 🔥 ලොකුම වෙනස: අපි තාමත් ඉන්නේ ඒ යවපු කෙනාගේ Chat එකේද කියලා බලලා විතරක් UI එකට දානවා!
              if (activeContactRef.current && activeContactRef.current._id === targetContactId) {
                  setMessages(prev => [...prev, sentMsg]);
                  setMediaPreview(null);
                  setReplyingTo(null); 
                  setSuggestedReplies([]); 
              }
              
              // Contact List එකේ Last Message එක අප්ඩේට් කරනවා
              setContacts(prev => prev.map(c => c._id === targetContactId ? { ...c, lastMessage: textToSend || "Media File", lastMessageTime: new Date().toISOString() } : c));
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
        let sortedUnassigned = [...filteredContacts].filter(c => !c.assignedTo && !c.assigned_to);
        if (assignDirection === 'newest') {sortedUnassigned.sort((a, b) => new Date(b.lastMessageTime || b.last_message_time || 0) - new Date(a.lastMessageTime || a.last_message_time || 0));
   } else {sortedUnassigned.sort((a, b) => new Date(a.lastMessageTime || a.last_message_time || 0) - new Date(b.lastMessageTime || b.last_message_time || 0));
     } 

        const unassignedLeads = sortedUnassigned.slice(0, assignAmount).map(c => c._id || c.id);
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
            setContacts(prev => prev.map(c => leadsToAssign.includes(c._id || c.id) ? { ...c, assignedTo: agents.find(a => a._id === agentId) } : c));
            setSelectedIds([]); setShowAssignModal(false); alert(`Successfully assigned ${leadsToAssign.length} leads!`);
        }
    } catch(err) { alert("Error assigning leads"); }
  };

// 🔥 Manager ගේ "Mark All as Read" Function එක
  const handleMarkAllRead = async () => {
      if (!window.confirm("Are you sure you want to mark ALL unread messages as read?")) return;
      
      // Frontend එකේ ක්ෂණිකව ඔක්කොම 0 කරලා පෙන්නනවා (Optimistic update)
      setContacts(prev => prev.map(c => ({ ...c, unreadCount: 0, unread_count: 0 })));
      
      try {
          const res = await fetch(`${API_BASE_URL}/api/crm/mark-all-read`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` }
          });
          if (!res.ok) {
              alert("Failed to update database.");
              loadData(); // Database එකේ අවුලක් ගියොත් පරණ ඩේටා ටික ආයෙ ගන්නවා
          }
      } catch (err) {
          console.error(err);
          loadData();
      }
  };

  const filteredContacts = useMemo(() => {
    return contacts
      .filter(c => {
        const contactPhone = c.phoneNumber || c.phone_number || "";
        const matchesSearch = contactPhone.includes(searchTerm);
        
        let matchesTab = true;
        const msgText = c.lastMessage || c.last_message || "";
        const isImported = msgText === 'Created Manually' || msgText === 'Imported via CSV';
        
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
            // 🔥 Agent ටත් Agent Filter එක අදාළ වෙන්න 'matchesAgent' එක ඇතුලත් කරා
            return matchesTab && matchesAgent && matchesStatus && matchesPhase && matchesSearch;
        }

        return matchesTab && matchesAgent && matchesStatus && matchesPhase && matchesSearch;
      })
      .sort((a, b) => {
          const aUnread = (a.unreadCount || a.unread_count) > 0 ? 1 : 0;
          const bUnread = (b.unreadCount || b.unread_count) > 0 ? 1 : 0;
          if (aUnread !== bUnread) {
              return bUnread - aUnread; 
          }
          return new Date(b.lastMessageTime || b.last_message_time || 0) - new Date(a.lastMessageTime || a.last_message_time || 0);
      });
  }, [contacts, searchTerm, activeTab, selectedAgentFilter, selectedStatusFilter, selectedPhaseFilter, userRole, userId]);

  const stateProps = {
    contacts, agents, messages, selectedContact, setSelectedContact, selectedIds, setSelectedIds,
    isDarkMode, toggleDarkMode, fontIndex, adjustFontSize, showThemePicker, setShowThemePicker,
    theme, setTheme, currentTheme,
    chatBgColor, setChatBgColor, senderColor, setSenderColor, receiverColor, setReceiverColor,
    activeTab, setActiveTab, searchTerm, setSearchTerm, selectedAgentFilter, setSelectedAgentFilter,
    selectedStatusFilter, setSelectedStatusFilter, selectedPhaseFilter, setSelectedPhaseFilter,
    showLeadDetails, setShowLeadDetails, showAddChatModal, setShowAddChatModal, addChatMethod, setAddChatMethod,
    newChatPhone, setNewChatPhone, newChatName, setNewChatName, csvFile, setCsvFile, isImporting, handleCsvUpload, handleAddNewChat,
    showSendTemplateModal, setShowSendTemplateModal, approvedTemplates, handleSendTemplateMessage, fetchApprovedTemplates,
    newMessage, setNewMessage, sending, mediaPreview, setMediaPreview, uploading, handleFileUpload,
    isRecording, recordingTime, startRecording, stopRecording, cancelRecording, formatTime, scrollRef,
    showAssignModal, setShowAssignModal, assignAmount, setAssignAmount, assignDirection, setAssignDirection, handleBulkAssign,
    showTemplates, setShowTemplates, templates, suggestedReplies, handleSelectTemplate, handleTyping, handleSelectAutoSuggest, fetchQuickReplies,
    newTemplateTitle, setNewTemplateTitle, newTemplateMsg, setNewTemplateMsg, isCreatingTemplate, setIsCreatingTemplate,
    uploadingTemplateMedia, templateMediaPreview, setTemplateMediaPreview, handleTemplateMediaUpload, handleCreateQuickReply, handleDeleteQuickReply,
    replyingTo, setReplyingTo, loadData, handleSendMessage, filteredContacts, userRole, userId, handleMarkAllRead
  };

  const content = (
      <div className={`flex h-full rounded-3xl overflow-hidden shadow-2xl relative transition-colors duration-300 border ${isDarkMode ? 'bg-[#0B1120] border-white/10' : 'bg-white border-gray-200'}`}>
        <ContactSidebar {...stateProps} />
        <ChatArea {...stateProps} />
        {/* FIX: Removed userRole check so Agents can also see the Campaign Details */}
        {showLeadDetails && <CampaignSidebar {...stateProps} />}
        <ChatModals {...stateProps} />
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