import React from 'react';
import { X, MessageSquarePlus, FileSpreadsheet, Loader, Zap, ArrowUp, ArrowDown, Users, ChevronRight, LayoutTemplate } from 'lucide-react';

const ChatModals = (props) => {
    const {
        isDarkMode, showAddChatModal, setShowAddChatModal, addChatMethod, setAddChatMethod,
        newChatPhone, setNewChatPhone, newChatName, setNewChatName, handleAddNewChat,
        csvFile, setCsvFile, handleCsvUpload, isImporting,
        showAssignModal, setShowAssignModal, selectedIds, assignAmount, setAssignAmount,
        assignDirection, setAssignDirection, agents, handleBulkAssign,
        showSendTemplateModal, setShowSendTemplateModal, approvedTemplates, handleSendTemplateMessage
    } = props;

    return (
        <>
            {/* ADD NEW CHAT MODAL */}
            {showAddChatModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className={`border rounded-3xl w-full max-w-sm shadow-2xl p-6 ${isDarkMode ? 'bg-[#0f172a] border-white/10' : 'bg-white border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-5">
                            <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><MessageSquarePlus className="text-emerald-500" size={20}/> Add New Lead</h3>
                            <button onClick={() => setShowAddChatModal(false)} className="text-slate-400 hover:text-red-500"><X size={18}/></button>
                        </div>

                        <div className="flex border-b border-gray-200 dark:border-white/10 mb-5">
                            <button onClick={() => setAddChatMethod('manual')} className={`flex-1 pb-2 text-sm font-bold transition-colors ${addChatMethod === 'manual' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-300'}`}>Manual Entry</button>
                            <button onClick={() => setAddChatMethod('csv')} className={`flex-1 pb-2 text-sm font-bold transition-colors ${addChatMethod === 'csv' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-300'}`}>CSV Upload</button>
                        </div>
                        
                        {addChatMethod === 'manual' ? (
                            <div className="space-y-4 animate-in slide-in-from-left-2 fade-in">
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Phone Number (with country code, no +)</label>
                                    <input type="text" placeholder="e.g. 9477..." value={newChatPhone} onChange={(e) => setNewChatPhone(e.target.value)} className={`w-full p-3 rounded-xl border focus:outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 mb-1 block">Customer Name</label>
                                    <input type="text" placeholder="Enter name..." value={newChatName} onChange={(e) => setNewChatName(e.target.value)} className={`w-full p-3 rounded-xl border focus:outline-none focus:border-emerald-500 ${isDarkMode ? 'bg-black/20 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`} />
                                </div>
                                <button onClick={handleAddNewChat} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition mt-2">Add Contact</button>
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in slide-in-from-right-2 fade-in">
                                <p className="text-xs text-slate-400 mb-2">Upload a CSV file containing your contacts. <br/>Format should be: <b>Phone, Name</b></p>
                                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isDarkMode ? 'border-white/20 hover:border-emerald-500/50 bg-white/5' : 'border-gray-300 hover:border-emerald-500/50 bg-gray-50'}`}>
                                    <input type="file" accept=".csv" id="csvUpload" className="hidden" onChange={(e) => setCsvFile(e.target.files[0])} />
                                    <label htmlFor="csvUpload" className="cursor-pointer flex flex-col items-center">
                                        <FileSpreadsheet size={32} className={`mb-3 ${csvFile ? 'text-emerald-500' : 'text-slate-400'}`} />
                                        <span className="text-sm font-bold text-slate-300">{csvFile ? csvFile.name : 'Click to select CSV file'}</span>
                                    </label>
                                </div>
                                <button onClick={handleCsvUpload} disabled={!csvFile || isImporting} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition disabled:opacity-50 flex justify-center mt-2">
                                    {isImporting ? <Loader className="animate-spin" size={20}/> : 'Import Contacts'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* BULK ASSIGN MODAL */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className={`border rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] ${isDarkMode ? 'bg-[#0f172a] border-white/10' : 'bg-white border-gray-200'}`}>
                        <div className={`p-5 border-b flex justify-between items-center ${isDarkMode ? 'bg-[#1e293b] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
                            <div><h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Assign Leads</h3><p className="text-xs text-slate-400">Distribute leads to your team</p></div>
                            <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-black/10 rounded-full text-slate-400 transition"><X size={18}/></button>
                        </div>

                        <div className="p-5 overflow-y-auto custom-scrollbar space-y-6">
                            {selectedIds.length === 0 && (
                                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-[#1e293b]/50 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                                    <h4 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><Zap size={16} className="text-amber-500"/> Quick Auto-Assign</h4>
                                    <div className="space-y-3">
                                        <p className="text-xs text-slate-400">Select amount and direction:</p>
                                        <div className="flex items-center gap-2">
                                            <input type="number" min="1" max="100" value={assignAmount} onChange={(e) => setAssignAmount(Math.max(1, parseInt(e.target.value) || 1))} className={`w-16 border rounded-lg p-2 text-center text-sm focus:outline-none focus:border-amber-500 ${isDarkMode ? 'bg-black/30 border-white/10 text-white' : 'bg-white border-gray-300 text-gray-900'}`}/>
                                            <div className={`flex-1 flex p-1 rounded-lg border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-gray-100 border-gray-200'}`}>
                                                <button onClick={() => setAssignDirection('newest')} className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition ${assignDirection === 'newest' ? 'bg-amber-500 text-white shadow' : 'text-slate-400 hover:text-black'}`}>
                                                    <ArrowUp size={12}/> Newest (Top)
                                                </button>
                                                <button onClick={() => setAssignDirection('oldest')} className={`flex-1 py-1.5 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition ${assignDirection === 'oldest' ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:text-black'}`}>
                                                    <ArrowDown size={12}/> Oldest (Bottom)
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Agent</h4>
                                <div className="space-y-2">
                                    {agents.length === 0 ? <div className={`text-center p-4 text-slate-500 rounded-xl border border-dashed ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}><Users size={32} className="mx-auto mb-2 opacity-50"/><p className="text-sm">No agents available.</p></div> : agents.map(agent => (
                                        <div key={agent._id} className={`flex items-center justify-between p-3 rounded-xl border transition group ${isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'}`}>
                                            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">{agent.name.charAt(0).toUpperCase()}</div><div><h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{agent.name}</h4><p className="text-[10px] text-slate-400">{agent.email}</p></div></div>
                                            <button onClick={() => handleBulkAssign(agent._id, selectedIds.length === 0)} className={`px-4 py-2 ${selectedIds.length === 0 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30 hover:bg-amber-500 hover:text-black' : (isDarkMode ? 'bg-white/5 text-slate-300 hover:bg-white/20 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black')} rounded-lg text-xs font-bold transition flex items-center gap-2`}>
                                                {selectedIds.length === 0 ? `Assign ${assignAmount} (${assignDirection === 'newest' ? 'Top' : 'Bottom'})` : 'Assign Selected'} <ChevronRight size={14}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* OFFICIAL TEMPLATES MODAL */}
            {showSendTemplateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className={`border rounded-2xl w-full max-w-sm shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-2 ${isDarkMode ? 'bg-[#1e293b] border-white/10' : 'bg-white border-gray-200'}`}>
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
                </div>
            )}
        </>
    );
};

export default ChatModals;