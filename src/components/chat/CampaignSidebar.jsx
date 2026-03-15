import React from 'react';
import { ClipboardList, Phone, Tag, FileText, X } from 'lucide-react';

const CampaignSidebar = (props) => {
    const { selectedContact, isDarkMode, setShowLeadDetails, agents } = props;

    if (!selectedContact) return null;

    return (
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
                        {selectedContact.assignedTo || selectedContact.assigned_to ? (
                            <>
                                <div className={`w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                                    {(typeof (selectedContact.assignedTo || selectedContact.assigned_to) === 'object' ? (selectedContact.assignedTo || selectedContact.assigned_to).name : (agents.find(a => a._id === (selectedContact.assignedTo || selectedContact.assigned_to))?.name || 'A')).charAt(0).toUpperCase()}
                                </div>
                                <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {typeof (selectedContact.assignedTo || selectedContact.assigned_to) === 'object' ? (selectedContact.assignedTo || selectedContact.assigned_to).name : (agents.find(a => a._id === (selectedContact.assignedTo || selectedContact.assigned_to))?.name || 'Agent')}
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
                        Last interaction: {new Date(selectedContact.lastMessageTime || selectedContact.last_message_time).toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CampaignSidebar;