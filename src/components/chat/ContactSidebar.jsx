import React, { useMemo } from 'react';
import { Search, Square, CheckSquare, MessageSquare, Sun, Moon, Palette, RefreshCw, Zap, Filter, Tag, ClipboardList, MessageSquarePlus, UserPlus, X } from 'lucide-react';

const ContactSidebar = (props) => {
    const {
        isDarkMode, toggleDarkMode, showThemePicker, setShowThemePicker, chatBgColor, setChatBgColor,
        senderColor, setSenderColor, receiverColor, setReceiverColor, loadData, userRole, setShowAssignModal,
        activeTab, setActiveTab, contacts, userId, filteredContacts, selectedIds, setSelectedIds, searchTerm, setSearchTerm,
        setShowAddChatModal, selectedAgentFilter, setSelectedAgentFilter, agents, selectedStatusFilter, setSelectedStatusFilter,
        selectedPhaseFilter, setSelectedPhaseFilter, selectedContact, setSelectedContact
    } = props;

    const tabsToShow = userRole === 'agent' 
        ? ['Imported', 'Assigned', 'All'] 
        : ['New Chat', 'Imported', 'Assigned', 'All'];

    // DATE FORMATTER: WhatsApp Style (Today -> Time, Yesterday -> Yesterday + Time, Older -> Date)
    const formatSidebarDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (date.toDateString() === today.toDateString()) {
            return timeStr;
        } else if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday, ${timeStr}`;
        } else {
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            return `${yyyy}/${mm}/${dd}`;
        }
    };

    const renderedContactsList = useMemo(() => {
        return filteredContacts.map(contact => {
            const rawAssigned = contact.assignedTo || contact.assigned_to;
            const assignedAgentObj = typeof rawAssigned === 'object' ? rawAssigned : agents.find(a => a._id === rawAssigned);
            const displayAgentName = assignedAgentObj ? assignedAgentObj.name : 'Agent';
            const cStatus = contact.callStatus || contact.call_status || 'Pending';
            const unread = contact.unreadCount || contact.unread_count || 0;
            const phone = contact.phoneNumber || contact.phone_number || "";
            const cId = contact._id || contact.id;
            
            const displayName = (contact.name && !contact.name.toLowerCase().includes('guest')) ? contact.name : phone;
  
            return (
                <div key={cId} onClick={() => setSelectedContact(contact)} className={`p-3 rounded-xl cursor-pointer flex gap-3 transition-all duration-300 border group relative ${selectedContact?._id === cId ? `bg-white/10 border-white/20 shadow-inner` : `bg-transparent border-transparent ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}`}>
                    {userRole !== 'agent' && (
                        <div className={`absolute left-2 top-2 z-10 ${selectedIds.includes(cId) ? 'block' : 'hidden group-hover:block'}`}><button onClick={(e) => { e.stopPropagation(); selectedIds.includes(cId) ? setSelectedIds(selectedIds.filter(id => id !== cId)) : setSelectedIds([...selectedIds, cId]) }}>{selectedIds.includes(cId) ? <CheckSquare className={`text-white bg-[#0f172a] rounded`} size={18}/> : <Square className="text-slate-500 bg-[#0f172a] rounded" size={18}/>}</button></div>
                    )}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-lg ${rawAssigned ? 'bg-indigo-500' : 'bg-slate-700'}`}>{phone.slice(-2) || "N"}</div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                            <div className="flex items-center gap-2">
                                <h4 className={`font-bold text-sm truncate ${selectedContact?._id === cId ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-slate-300' : 'text-gray-700')}`}>
                                    {displayName}
                                </h4>
                                {unread > 0 && (
                                    <span className={`h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold shadow-sm animate-pulse`}>
                                        {unread}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] font-medium whitespace-nowrap ml-2 ${isDarkMode ? 'text-slate-500' : 'text-gray-400'}`}>
                                {formatSidebarDate(contact.lastMessageTime || contact.last_message_time)}
                            </span>
                        </div>
                        {(contact.name && !contact.name.toLowerCase().includes('guest') && contact.name !== phone) && <p className="text-[10px] text-slate-500 truncate">{phone}</p>}
                        <p className={`text-xs truncate mb-1 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>{contact.lastMessage || contact.last_message || "New Lead"}</p>
                        
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

    return (
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
                        <button onClick={loadData} className={`p-2 rounded-lg transition ${isDarkMode ? 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} title="Refresh"><RefreshCw size={16}/></button>
                        {userRole !== 'agent' && (
                            <>
                                 <button onClick={props.handleMarkAllRead} className={`p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg transition`} title="Mark All as Read">
                                    <CheckSquare size={16} />
                                 </button>
                                 <button onClick={() => setShowAssignModal(true)} className={`p-2 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg transition`} title="Bulk Assign">
                                    <Zap size={16} />
                                 </button>
                            </>
                        )}
                    </div>
                </div>
                
                <div className="space-y-2">
                    <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-[#1e293b] border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                        {tabsToShow.map(tab => {
                            let badgeCount = 0;
                            const uId = userId;

                            // 1. කලින් Select කරපු Filters (Agent, Status, Phase) වලට අදාලව Contacts ටික පෙරලා ගන්නවා
                            const filterBaseContacts = contacts.filter(c => {
                                const rawAssigned = c.assignedTo || c.assigned_to;
                                const assignedId = typeof rawAssigned === 'object' ? (rawAssigned?._id || rawAssigned?.id) : rawAssigned;
                                
                                let mAgent = true;
                                if (selectedAgentFilter !== 'All') {
                                    mAgent = assignedId && String(assignedId).trim() === String(selectedAgentFilter).trim();
                                }
                        
                                let mStatus = true;
                                if (selectedStatusFilter !== 'All') {
                                    const cStatus = c.callStatus || c.call_status || 'pending';
                                    mStatus = cStatus.toLowerCase() === selectedStatusFilter.toLowerCase();
                                }
                        
                                let mPhase = true;
                                if (selectedPhaseFilter !== 'All') {
                                    const cPhase = c.phase || c.status || 1;
                                    mPhase = String(cPhase) === selectedPhaseFilter;
                                }
                                return mAgent && mStatus && mPhase;
                            });
                            
                            // 2. ඒ Filter වුන අයට අදාලව Unique Unread count එක හදනවා
                            const uniqueUnreadCount = (arr) => new Set(arr.filter(c => c.unreadCount > 0 || c.unread_count > 0).map(c => c.phoneNumber || c.phone_number)).size;
                            
                            if (tab === 'New Chat') {
                                badgeCount = uniqueUnreadCount(filterBaseContacts.filter(c => !c.assignedTo && !c.assigned_to && c.lastMessage !== 'Created Manually' && c.lastMessage !== 'Imported via CSV' && c.last_message !== 'Created Manually' && c.last_message !== 'Imported via CSV'));
                            } else if (tab === 'Imported') {
                                if (userRole === 'agent') {
                                    badgeCount = uniqueUnreadCount(filterBaseContacts.filter(c => {
                                        const rawAssigned = c.assignedTo || c.assigned_to;
                                        const assignedId = typeof rawAssigned === 'object' ? (rawAssigned?._id || rawAssigned?.id) : rawAssigned;
                                        const msgText = c.lastMessage || c.last_message || "";
                                        const isImport = msgText === 'Created Manually' || msgText === 'Imported via CSV';
                                        return assignedId && String(assignedId).trim() === String(uId).trim() && isImport;
                                    }));
                                } else {
                                    badgeCount = uniqueUnreadCount(filterBaseContacts.filter(c => !c.assignedTo && !c.assigned_to && (c.lastMessage === 'Created Manually' || c.lastMessage === 'Imported via CSV' || c.last_message === 'Created Manually' || c.last_message === 'Imported via CSV')));
                                }
                            } else if (tab === 'Assigned') {
                                if (userRole === 'agent') {
                                    badgeCount = uniqueUnreadCount(filterBaseContacts.filter(c => {
                                        const rawAssigned = c.assignedTo || c.assigned_to;
                                        const assignedId = typeof rawAssigned === 'object' ? (rawAssigned?._id || rawAssigned?.id) : rawAssigned;
                                        return assignedId && String(assignedId).trim() === String(uId).trim();
                                    }));
                                } else {
                                    badgeCount = uniqueUnreadCount(filterBaseContacts.filter(c => (c.assignedTo || c.assigned_to)));
                                }
                            } else if (tab === 'All') {
                                badgeCount = uniqueUnreadCount(filterBaseContacts);
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
                        <div className="flex gap-1.5">
                            {/* 🔥 Agent Filter එක හැමෝටම පේන්න හැදුවා */}
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none"><Filter size={12} className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}/></div>
                                <select value={selectedAgentFilter} onChange={(e) => setSelectedAgentFilter(e.target.value)} className={`w-full appearance-none rounded-xl py-2 pl-7 pr-2 text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400 border transition-all ${isDarkMode ? 'bg-[#1e293b] text-slate-300 border-white/5' : 'bg-white text-gray-700 border-gray-200'}`}>
                                    <option value="All">All Agents</option>
                                    {/* 🔥 වෙනස කරේ මෙතනයි (a.id එක ගත්තා) */}
                                    {agents && agents.map(a => (
                                        <option key={a.id || a._id} value={a.id || a._id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none"><Tag size={12} className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}/></div>
                                <select value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value)} className={`w-full appearance-none rounded-xl py-2 pl-7 pr-2 text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400 border transition-all ${isDarkMode ? 'bg-[#1e293b] text-slate-300 border-white/5' : 'bg-white text-gray-700 border-gray-200'}`}>
                                    <option value="All">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="answered">Answered</option>
                                    <option value="reject">Reject</option>
                                    <option value="no answer">No Answer</option>
                                </select>
                            </div>
                            
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none"><ClipboardList size={12} className={isDarkMode ? 'text-slate-500' : 'text-gray-400'}/></div>
                                <select value={selectedPhaseFilter} onChange={(e) => setSelectedPhaseFilter(e.target.value)} className={`w-full appearance-none rounded-xl py-2 pl-7 pr-2 text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-indigo-400 border transition-all ${isDarkMode ? 'bg-[#1e293b] text-slate-300 border-white/5' : 'bg-white text-gray-700 border-gray-200'}`}>
                                    <option value="All">All Phases</option>
                                    <option value="1">Phase 1</option>
                                    <option value="2">Phase 2</option>
                                    <option value="3">Phase 3</option>
                                    <option value="4">Phase 4</option>
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
                                else setSelectedIds(filteredContacts.map(c => c._id || c.id));
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
    );
};

export default ContactSidebar;