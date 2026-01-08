import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Phone, MessageSquare, Save, User, Clock } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const UserAgentDash = () => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Data Entry Form State
  const [formData, setFormData] = useState({
      callStatus: 'Pending',
      stream: '',
      attempt: '1st Call',
      groupJoin: 'No',
      remark: ''
  });

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // 1. Fetch My Leads
  useEffect(() => {
    const fetchLeads = async () => {
      const res = await fetch(`${API_BASE_URL}/api/crm/contacts?agentId=${userId}`, {
         headers: { token: `Bearer ${token}` }
      });
      if(res.ok) setLeads(await res.json());
    };
    fetchLeads();
  }, []);

  // 2. Select Lead & Load Data
  const handleSelectLead = (lead) => {
      setSelectedLead(lead);
      setFormData({
          callStatus: lead.callStatus || 'Pending',
          stream: lead.stream || '',
          attempt: lead.attempt || '1st Call',
          groupJoin: lead.groupJoin || 'No',
          remark: lead.remark || ''
      });
  };

  // 3. Save Record
  const handleSave = async () => {
      if(!selectedLead) return;
      try {
          await fetch(`${API_BASE_URL}/api/crm/contact/${selectedLead._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
              body: JSON.stringify(formData)
          });
          alert("Record Updated!");
          
          // Local Update
          setLeads(leads.map(l => l._id === selectedLead._id ? { ...l, ...formData } : l));
      } catch(err) { console.error(err); }
  };

  return (
    <MainLayout>
      <div className="flex h-[85vh] gap-4">
        
        {/* LEFT: MY ASSIGNED NUMBERS */}
        <div className="w-1/3 glass-panel p-0 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 bg-blue-600/10">
                <h2 className="font-bold text-white flex items-center gap-2">
                    <User size={18}/> My Assigned List ({leads.length})
                </h2>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar p-2">
                {leads.map(lead => (
                    <div key={lead._id} onClick={() => handleSelectLead(lead)} 
                         className={`p-4 mb-2 rounded-xl cursor-pointer transition border ${selectedLead?._id === lead._id ? 'bg-blue-600/20 border-blue-500' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-white">{lead.phoneNumber}</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded ${lead.callStatus === 'Answered' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                {lead.callStatus}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate">{lead.remark || "No remarks"}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* RIGHT: WORKSPACE (Chat + Form) */}
        <div className="w-2/3 flex flex-col gap-4">
            
            {selectedLead ? (
                <>
                    {/* Top: WhatsApp Chat View (Placeholder) */}
                    <div className="flex-1 glass-panel p-4 relative flex flex-col">
                        <div className="border-b border-white/10 pb-2 mb-2">
                            <h3 className="text-white font-bold flex items-center gap-2"><MessageSquare size={18}/> Chat History</h3>
                        </div>
                        <div className="flex-1 bg-black/20 rounded-xl p-4 text-slate-400 text-sm overflow-y-auto">
                            {/* මෙතන Chat Messages Load කරන්න ඕන */}
                            <p>Chat messages for {selectedLead.phoneNumber} will appear here...</p>
                        </div>
                    </div>

                    {/* Bottom: Call Record Form (Excel Data Entry) */}
                    <div className="h-auto glass-panel p-6 bg-[#1e293b] border-t-4 border-primary">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Phone size={18}/> Update Call Record</h3>
                        
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Status</label>
                                <select className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm"
                                    value={formData.callStatus} onChange={e => setFormData({...formData, callStatus: e.target.value})}>
                                    <option value="Pending">Pending</option>
                                    <option value="Answered">Answered</option>
                                    <option value="No Answer">No Answer</option>
                                    <option value="Reject">Reject</option>
                                    <option value="Call Later">Call Later</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Stream</label>
                                <select className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm"
                                    value={formData.stream} onChange={e => setFormData({...formData, stream: e.target.value})}>
                                    <option value="">Select...</option>
                                    <option value="Arts">Arts</option>
                                    <option value="Commerce">Commerce</option>
                                    <option value="Science">Science</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Group Join?</label>
                                <select className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm"
                                    value={formData.groupJoin} onChange={e => setFormData({...formData, groupJoin: e.target.value})}>
                                    <option value="Pending">Pending</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="text-xs text-slate-400 block mb-1">Remark</label>
                            <input type="text" className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm"
                                placeholder="Type remarks here..."
                                value={formData.remark} onChange={e => setFormData({...formData, remark: e.target.value})} />
                        </div>

                        <button onClick={handleSave} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition">
                            <Save size={20}/> Save Record
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-1 glass-panel flex items-center justify-center text-slate-500">
                    Select a number to start working
                </div>
            )}
        </div>
      </div>
    </MainLayout>
  );
};

export default UserAgentDash;