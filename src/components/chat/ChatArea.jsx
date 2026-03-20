import React from 'react';
// PlusCircle & Reply are properly imported now
import { Paperclip, Zap, LayoutTemplate, Send, Mic, X, StopCircle, Trash2, MessageSquare, Loader, FileText, Play, Download, VideoIcon, ClipboardList, CheckCheck, PlusCircle, Reply } from 'lucide-react';

const FONT_SIZES = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl'];

// 👇 දිනය ලස්සනට Format කරන Function එක
const formatDateLabel = (dateInput) => {
    if (!dateInput) return '';
    const date = new Date(dateInput);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
};

const ChatArea = (props) => {
    const {
        selectedContact, messages, loading, isDarkMode, agents,
        newMessage, setNewMessage, handleTyping, handleSendMessage, sending,
        mediaPreview, setMediaPreview, uploading, handleFileUpload,
        isRecording, recordingTime, startRecording, stopRecording, cancelRecording, formatTime,
        showTemplates, setShowTemplates, fetchQuickReplies, suggestedReplies, handleSelectAutoSuggest,
        fetchApprovedTemplates, replyingTo, setReplyingTo, scrollRef, fontIndex,
        theme, setTheme, currentTheme, showLeadDetails, setShowLeadDetails, templates, handleSelectTemplate,
        isCreatingTemplate, setIsCreatingTemplate, newTemplateTitle, setNewTemplateTitle, newTemplateMsg, setNewTemplateMsg,
        uploadingTemplateMedia, templateMediaPreview, setTemplateMediaPreview, handleTemplateMediaUpload, handleCreateQuickReply, handleDeleteQuickReply
    } = props;

    if (!selectedContact) {
        return (
            <div className={`flex-1 flex flex-col items-center justify-center transition-colors z-10 ${isDarkMode ? 'text-slate-500 bg-[#0B1120]' : 'text-gray-400 bg-[#f0f2f5]'}`}>
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl animate-pulse ${isDarkMode ? 'bg-[#1e293b]/50 shadow-indigo-500/10 border border-white/5' : 'bg-white border border-gray-200'}`}>
                    <MessageSquare size={40} className="text-indigo-400 opacity-80"/>
                </div>
                <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Select a Conversation</h1>
                <p className="text-sm">Choose a contact from the left to start chatting.</p>
            </div>
        );
    }
    

    return (
        <div className={`flex-1 flex flex-col h-full overflow-hidden relative transition-colors duration-300 border-x ${currentTheme.bg} ${theme === 'light' ? 'border-gray-300' : 'border-slate-600'}`}>
            
            {/* Header Section */}
            <div className={`${currentTheme.header} p-4 border-b flex justify-between items-center z-20 shadow-sm transition-colors`}>
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-slate-500 flex items-center justify-center font-bold text-white shadow-lg`}>
                        {((selectedContact.name && !selectedContact.name.toLowerCase().includes('guest') ? selectedContact.name : (selectedContact.phoneNumber || selectedContact.phone_number || '#'))).charAt(0)}
                    </div>
                    <div>
                        <h3 className={`font-bold text-base flex items-center gap-2 ${currentTheme.text}`}>
                            {selectedContact.name && !selectedContact.name.toLowerCase().includes('guest') ? selectedContact.name : (selectedContact.phoneNumber || selectedContact.phone_number)}
                        </h3>
                        <div className={`flex items-center gap-2 text-xs ${currentTheme.subText}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${selectedContact.assignedTo || selectedContact.assigned_to ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                            <span>
                                {selectedContact.assignedTo || selectedContact.assigned_to ? 
                                    `Assigned: ${typeof (selectedContact.assignedTo || selectedContact.assigned_to) === 'object' ? (selectedContact.assignedTo || selectedContact.assigned_to).name : (agents.find(a => a._id === (selectedContact.assignedTo || selectedContact.assigned_to))?.name || 'Agent')}` 
                                : 'Waiting for assignment'}
                            </span>
                            {(selectedContact.name && !selectedContact.name.toLowerCase().includes('guest')) && (
                                <span className="border-l border-slate-500 pl-2 ml-1">
                                    {selectedContact.phoneNumber || selectedContact.phone_number}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex gap-2 bg-black/10 p-1 rounded-lg border border-black/5">
                        <button onClick={() => setTheme('light')} className={`w-5 h-5 rounded-full bg-[#efeae2] border border-gray-400 ${theme === 'light' ? 'ring-2 ring-blue-500' : ''}`}></button>
                        <button onClick={() => setTheme('whatsapp')} className={`w-5 h-5 rounded-full bg-[#005c4b] ${theme === 'whatsapp' ? 'ring-2 ring-white' : ''}`}></button>
                        <button onClick={() => setTheme('blue')} className={`w-5 h-5 rounded-full bg-blue-600 ${theme === 'blue' ? 'ring-2 ring-white' : ''}`}></button>
                    </div>
                    <button 
                        onClick={() => setShowLeadDetails(!showLeadDetails)} 
                        className={`p-2 rounded-lg transition border ${showLeadDetails ? `bg-indigo-500 border-transparent text-white shadow-lg` : `${currentTheme.icon} border-transparent`}`}
                        title="Toggle Campaign Data"
                    >
                        <ClipboardList size={18}/>
                    </button>
                </div>
            </div>

            {/* Background Pattern */}
            {currentTheme.patternUrl && <div className="absolute inset-0 z-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: `url(${currentTheme.patternUrl})`, backgroundSize: '400px' }}></div>}

            {/* Messages Area */}
            <div className={`flex-1 overflow-y-auto p-5 flex flex-col gap-3 z-10 relative custom-scrollbar`}>
                {loading && <div className="text-center text-gray-500 text-xs my-2"><Loader className="animate-spin inline mr-2" size={14}/> Loading messages...</div>}
                
                {messages.filter(msg => {
                    if (!msg) return false;
                    const hasMedia = !!(msg.mediaUrl || msg.media_url);
                    const isTemplate = msg.type === 'template';
                    let text = msg.text || msg.content || "";
                    if (typeof text !== 'string') { try { text = JSON.stringify(text); } catch(e) { text = ""; } }
                    const cleanText = text.replace(/[\u200B-\u200D\uFEFF\s\n]/g, '');
                    if (!hasMedia && !isTemplate && cleanText === "") return false;
                    return true;
                }).map((msg, index, arr) => {
                    
                    // 👇 දිනය පරීක්ෂා කරන කොටස (අලුත් දවසක්ද කියලා බලනවා)
                    const msgDateValue = msg.created_at || msg.createdAt || Date.now();
                    const currentMsgDate = new Date(msgDateValue).toDateString();
                    let showDateSeparator = false;

                    if (index === 0) {
                        showDateSeparator = true;
                    } else {
                        const prevMsgDateValue = arr[index - 1].created_at || arr[index - 1].createdAt || Date.now();
                        const prevMsgDate = new Date(prevMsgDateValue).toDateString();
                        if (currentMsgDate !== prevMsgDate) {
                            showDateSeparator = true;
                        }
                    }

                    const isMe = msg.direction === 'outbound' || msg.sender === 'me';
                    const agentName = msg.agentName || msg.agent_name || 'System';
                    const mediaUrl = msg.mediaUrl || msg.media_url || (msg.type !== 'text' && msg.type !== 'template' ? msg.content : null);
                    const hasMedia = !!mediaUrl;
                    let msgText = msg.text || msg.content || "";
                    if (typeof msgText !== 'string') { try { msgText = JSON.stringify(msgText); } catch(e) { msgText = ""; } }
                    msgText = msgText.replace(/(\s*\n\s*){3,}/g, '\n\n').trim(); 
                    if (msgText.length > 2000) msgText = msgText.substring(0, 2000) + "\n\n... [Message Truncated]";
                    const isCaption = msgText && msgText !== mediaUrl;

                    return (
                        <React.Fragment key={msg._id || msg.id || index}>
                            
                            {/* 👇 දිනය පෙන්වන Badge එක */}
                            {showDateSeparator && (
                                <div className="flex justify-center my-3 relative z-10">
                                    <span className={`text-[10px] font-bold px-3 py-1 rounded-lg backdrop-blur-md shadow-sm border ${isDarkMode ? 'bg-[#1e293b]/80 text-slate-400 border-white/5' : 'bg-white/80 text-slate-500 border-black/5'}`}>
                                        {formatDateLabel(msgDateValue)}
                                    </span>
                                </div>
                            )}

                            <div className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'} mb-2`}>
                                {isMe && (
                                    <span className="text-[10px] font-bold mb-1 flex items-center gap-1">
                                        {msg.type === 'Bot' ? (
                                            <span className="text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">Bot Reply</span>
                                        ) : (
                                            <span className="text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">Sent by: {agentName}</span>
                                        )}
                                    </span>
                                )}

                                <div className={`relative group p-3 rounded-2xl shadow-sm border border-black/5 ${isMe ? `${currentTheme.bubbleMe} rounded-tr-none` : `${currentTheme.bubbleThem} rounded-tl-none`}`}>
                                    
                                    <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 ${isMe ? '-left-10' : '-right-10'}`}>
                                        <button 
                                            onClick={() => setReplyingTo(msg)} 
                                            className="p-1.5 bg-black/10 backdrop-blur-sm rounded-full text-slate-500 hover:text-white hover:bg-black/30 shadow-md border border-white/10 transition-colors"
                                            title="Reply to message"
                                        >
                                            <Reply size={14} />
                                        </button>
                                    </div>

                                    {msg.replyContext && (
                                        <div className={`mb-2 p-2.5 rounded-lg border-l-4 opacity-90 text-[11px] font-medium truncate bg-black/20 text-white/80 border-white/30`}>
                                            <span className="font-bold mr-2 opacity-70">Replied to:</span>
                                            {msg.replyContext}
                                        </div>
                                    )}

                                    {hasMedia && (
                                        <div className={`mb-2 rounded-lg overflow-hidden w-full ${isCaption ? 'border-b border-black/10 pb-2' : ''}`}>
                                            {msg.type === 'image' ? (
                                                <img 
                                                    src={mediaUrl} 
                                                    className="w-full h-auto max-h-[450px] object-contain rounded-lg hover:scale-[1.02] transition-transform cursor-pointer" 
                                                    alt="sent content" 
                                                    onClick={() => window.open(mediaUrl, '_blank')}
                                                />
                                            ) : msg.type === 'video' ? (
                                                <video controls src={mediaUrl} className="w-full max-h-[350px] rounded-lg bg-black" />
                                            ) : msg.type === 'audio' ? (
                                                <div className="flex items-center gap-2 p-2 rounded-lg bg-black/20"><Play size={16}/><audio controls src={mediaUrl} className="w-full h-8 opacity-80" /></div>
                                            ) : (
                                                <a href={mediaUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 rounded-lg bg-black/10 hover:bg-black/20 transition">
                                                    <FileText size={20}/><span className="text-sm font-bold truncate">Attached File</span><Download size={14}/>
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
                                    
                                    {(isCaption || (!hasMedia && msgText !== "")) && (
                                        <p className={`whitespace-pre-wrap leading-relaxed ${FONT_SIZES[fontIndex]}`} style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                            {msgText}
                                        </p>
                                    )}
                                    
                                    <div className="text-[10px] mt-1.5 text-right opacity-70 flex justify-end gap-1 items-center">
                                        {new Date(msg.created_at || msg.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        {isMe && <CheckCheck size={12}/>}
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
                {/* Scroll Target */}
                <div ref={scrollRef} />
            </div>

            {/* Input Section */}
            <div className={`${currentTheme.header} p-3 border-t z-20 flex items-center gap-3 transition-colors relative`}>
                
                {suggestedReplies.length > 0 && (
                    <div className={`absolute bottom-full left-0 mb-2 w-72 border rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-bottom-2 ${currentTheme.inputBg}`}>
                        <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-2 px-2 flex items-center gap-1"><Zap size={12}/> Quick Reply Suggestions</div>
                        <div className="max-h-40 overflow-y-auto custom-scrollbar">
                            {suggestedReplies.map(t => (
                                <div key={t.id || t._id} className={`p-2 rounded-lg cursor-pointer transition-colors ${currentTheme.icon}`} onClick={() => handleSelectAutoSuggest(t)}>
                                    <div className="font-bold text-xs flex items-center gap-2">{t.title} {(t.media_url || t.mediaUrl) && <Paperclip size={10} className="text-blue-400"/>}</div>
                                    <div className="text-[10px] opacity-70 truncate">{t.message || 'Media File'}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {mediaPreview && (
                    <div className={`absolute bottom-full left-0 mb-2 p-3 w-72 rounded-xl flex items-center justify-between animate-in slide-in-from-bottom-2 bg-black/80 border border-white/10 z-50`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white/10">
                                {mediaPreview.type === 'image' && <img src={mediaPreview.url} className="w-full h-full object-cover"/>}
                                {mediaPreview.type === 'video' && <VideoIcon size={18} className="text-white"/>}
                                {mediaPreview.type === 'audio' && <Mic size={18} className="text-white"/>}
                                {mediaPreview.type === 'document' && <FileText size={18} className="text-white"/>}
                            </div>
                            <div><p className={`text-xs font-bold truncate w-36 text-white`}>{mediaPreview.name}</p><p className={`text-[10px] text-indigo-400 uppercase font-bold`}>{mediaPreview.type}</p></div>
                        </div>
                        <button onClick={() => setMediaPreview(null)} className={`text-slate-400 hover:text-red-500 p-1 rounded-full transition`}><X size={14}/></button>
                    </div>
                )}

                {replyingTo && (
                    <div className={`absolute bottom-full left-0 mb-2 p-3 w-full max-w-md border-l-4 border-emerald-500 flex justify-between items-start rounded-r-lg bg-black/80 z-50`}>
                        <div className="flex-1 overflow-hidden pr-2">
                            <p className="text-[10px] font-bold text-emerald-500 mb-0.5">Replying to {replyingTo.sender === 'me' || replyingTo.direction === 'outbound' ? 'Yourself' : 'Customer'}</p>
                            <p className={`text-xs truncate text-slate-300`}>{replyingTo.text || replyingTo.content || 'Media Message'}</p>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className={`text-slate-400 hover:text-red-500 p-1 rounded-md`}><X size={14} /></button>
                    </div>
                )}

                {isRecording ? (
                    <div className={`flex-1 flex items-center gap-4 px-4 py-3 rounded-xl ${currentTheme.inputBg}`}>
                        <StopCircle className="text-red-500 animate-pulse" size={20}/>
                        <span className={`font-mono text-sm ${currentTheme.text}`}>{formatTime(recordingTime)}</span>
                        <div className="flex-1"></div>
                        <button onClick={cancelRecording} className="p-1 text-slate-400 hover:text-red-400 transition"><Trash2 size={18}/></button>
                        <button onClick={stopRecording} className="p-2 bg-[#00a884] text-white rounded-full hover:bg-emerald-600 transition shadow-lg"><Send size={16}/></button>
                    </div>
                ) : (
                    <>
                        <label className={`p-2.5 rounded-xl transition cursor-pointer self-center ${currentTheme.icon}`} title="Attach File">
                            <Paperclip size={20}/><input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*,application/pdf,application/msword,audio/*"/>
                        </label>
                        
                        {/* QUICK REPLIES BUTTON & MODAL */}
                        <div className="relative">
                            <button onClick={() => { setShowTemplates(!showTemplates); fetchQuickReplies(); }} className={`p-2.5 rounded-xl transition self-center text-amber-500 hover:bg-amber-500/10`} title="Quick Reply Templates"><Zap size={20}/></button>
                            {showTemplates && (
                                <div className={`absolute bottom-[130%] left-0 w-80 border rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-bottom-2 ${isDarkMode ? 'bg-[#1e293b] border-white/10' : 'bg-white border-gray-200'}`}>
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
                                                {templateMediaPreview && (<span className="text-[10px] text-emerald-400 truncate w-24">{templateMediaPreview.name}</span>)}
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
                        </div>
                        
                        <button onClick={fetchApprovedTemplates} className={`p-2.5 rounded-xl transition self-center text-blue-400 hover:bg-blue-500/10`} title="Send Official Template"><LayoutTemplate size={20}/></button>

                        <textarea 
                            placeholder={mediaPreview ? "Add a caption..." : "Type '/' for quick replies or a message..."} 
                            className={`flex-1 text-[15px] outline-none px-4 py-3 resize-none rounded-xl custom-scrollbar max-h-32 transition-all ${currentTheme.inputBg} ${currentTheme.text} placeholder-${theme==='light'?'gray-400':'gray-500'}`} 
                            rows={1} 
                            value={newMessage} 
                            onChange={handleTyping} 
                            onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }}} 
                            disabled={uploading}
                        />

                        {newMessage.trim() || mediaPreview ? (
                            <button onClick={handleSendMessage} disabled={sending} className={`p-3 bg-[#00a884] rounded-xl text-white hover:bg-emerald-600 transition shadow-md self-center`}>
                                {sending ? <Loader className="animate-spin" size={20}/> : <Send size={20}/>}
                            </button>
                        ) : (
                            <button onClick={startRecording} className={`p-3 rounded-xl transition self-center ${currentTheme.icon}`}>
                                <Mic size={20} />
                            </button>
                        )}
                    </>
                )}
            </div>
            {uploading && <div className={`absolute inset-0 flex items-center justify-center gap-2 z-50 backdrop-blur-sm ${isDarkMode ? 'bg-[#1e293b]/90' : 'bg-white/80'}`}><Loader className={`animate-spin text-indigo-400`} size={20}/><span className={`text-xs text-indigo-400 font-bold`}>Uploading Media...</span></div>}
        </div>
    );
};

export default ChatArea;