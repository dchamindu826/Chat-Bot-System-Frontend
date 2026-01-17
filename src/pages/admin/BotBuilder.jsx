import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { Save, Plus, Trash2, MessageSquare, Image as ImageIcon, Video, FileText, UploadCloud, Smartphone, Loader } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const BotBuilder = () => {
  // 1. Get Params Correctly
  const { userId } = useParams(); // URL එකෙන් එන ID එක (Admin ගේ පැත්තෙන්)
  const loggedUserRole = localStorage.getItem('role');
  const loggedUserId = localStorage.getItem('userId');
  
  // Decide Target User ID (Admin නම් URL එකේ ID එක, නැත්නම් Log වුන User ගේ ID එක)
  const targetUserId = loggedUserRole === 'admin' ? userId : loggedUserId;

  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // ⚠️ YOUR CLOUDINARY CONFIG
  const CLOUD_NAME = "dyixoaldi"; 
  const UPLOAD_PRESET = "Chat Bot System"; 

  useEffect(() => {
    const fetchConfig = async () => {
      if (!targetUserId || targetUserId === 'undefined') return;

      const token = localStorage.getItem('token');
      const url = loggedUserRole === 'admin' 
        ? `${API_BASE_URL}/api/bot-config/${targetUserId}` 
        : `${API_BASE_URL}/api/bot-config/my/config`;

      try {
        const res = await fetch(url, { headers: { token: `Bearer ${token}` } });
        if (res.ok) {
           const data = await res.json();
           const loadedReplies = data.replies ? data.replies : (Array.isArray(data) ? data : []);
           setReplies(loadedReplies);
        }
      } catch (err) {
        console.error("Fetch Error", err);
      }
    };
    fetchConfig();
  }, [targetUserId, loggedUserRole]);

  // --- SAVE FUNCTION (FIXED) ---
  const handleSave = async () => {
    if (!targetUserId || targetUserId === 'undefined') {
        alert("⚠️ Error: User ID is missing! Please go back to Clients page and click 'Config Bot' again.");
        return;
    }

    setLoading(true);
    const token = localStorage.getItem('token');
    
    // Construct Payload
    const bodyData = { 
        ownerId: targetUserId, // 🔥 FIX: ownerId එක අනිවාර්යයෙන් යවන්න ඕන (Backend eke bot.js eka balanna meka)
        userId: targetUserId,  // Backup field
        replies: replies,
        isActive: true // Default Active
    };

    console.log("📤 Sending Data:", bodyData); 

    try {
      const res = await fetch(`${API_BASE_URL}/api/bot-config/save`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json', 
            token: `Bearer ${token}` 
        },
        body: JSON.stringify(bodyData)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Bot Flow Saved Successfully! ✅');
      } else {
        console.error("Server Error:", data);
        alert(`❌ Save Failed: ${data.message || "Server Error"}`);
      }
    } catch (err) {
      console.error("Network Error:", err);
      alert('❌ Network Error: Cannot connect to backend.');
    }
    setLoading(false);
  };

  // --- FILE UPLOAD ---
  const handleFileUpload = async (file, index) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET); 
    formData.append("cloud_name", CLOUD_NAME);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        const newReplies = [...replies];
        newReplies[index].media = data.secure_url;
        newReplies[index].fileName = file.name;
        if (file.type.startsWith('image/')) newReplies[index].mediaType = 'image';
        else if (file.type.startsWith('video/')) newReplies[index].mediaType = 'video';
        else newReplies[index].mediaType = 'document';
        setReplies(newReplies);
      }
    } catch (error) {
      alert("Upload Failed!");
    } finally {
      setUploading(false);
    }
  };

  // Helper Functions
  const addStep = () => {
    setReplies([...replies, { id: Date.now(), text: '', media: '', mediaType: 'text', fileName: '' }]);
    setActiveStep(replies.length);
  };

  const updateStep = (index, field, value) => {
    const newReplies = [...replies];
    newReplies[index][field] = value;
    setReplies(newReplies);
  };

  const deleteStep = (index) => {
    const newReplies = replies.filter((_, i) => i !== index);
    setReplies(newReplies);
    if (activeStep >= newReplies.length) setActiveStep(Math.max(0, newReplies.length - 1));
  };

  const renderPreview = () => {
    if (replies.length === 0) return <div className="text-slate-500 text-center mt-20">No steps created.</div>;
    const step = replies[activeStep];
    if (!step) return null;

    return (
        <div className="bg-[#e5ddd5] h-full w-full overflow-y-auto p-4 custom-scrollbar">
            <div className="flex justify-start mb-4">
                <div className="bg-white text-black p-3 rounded-lg rounded-tl-none shadow-sm max-w-[80%] text-sm">
                   Incoming Message...
                </div>
            </div>
            <div className="flex justify-end mb-4 animate-fade-in">
                <div className="bg-[#d9fdd3] text-black p-2 rounded-lg rounded-tr-none shadow-sm max-w-[85%] min-w-[120px]">
                    {step.media && (
                        <div className="mb-2 rounded-lg overflow-hidden bg-black/10 flex items-center justify-center">
                            {step.mediaType === 'image' && <img src={step.media} alt="preview" className="w-full h-auto" />}
                            {step.mediaType === 'video' && <video src={step.media} controls className="w-full h-auto" />}
                            {step.mediaType === 'document' && (
                                <div className="p-4 flex items-center gap-3 bg-white/50 w-full"><FileText className="text-red-500"/><span className="text-sm font-bold truncate">{step.fileName}</span></div>
                            )}
                        </div>
                    )}
                    <p className="text-sm whitespace-pre-line px-1">{step.text || "..."}</p>
                </div>
            </div>
        </div>
    );
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-100px)]">
        {/* DEBUG BAR - වැඩේ හරි ගියාම මකන්න */}
        <div className="bg-blue-900/50 p-2 text-xs text-blue-200 mb-2 border border-blue-500 rounded flex justify-between">
            <span>TARGET USER ID: <b>{targetUserId || "UNDEFINED ❌"}</b></span>
            <span>ROLE: {loggedUserRole}</span>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Bot Builder</h2>
          <button onClick={handleSave} disabled={loading} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-white flex items-center gap-2 transition-all">
            {loading ? <Loader className="animate-spin" size={20}/> : <Save size={20}/>} Save Flow
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full pb-10">
          <div className="lg:col-span-8 h-full overflow-y-auto pr-2 custom-scrollbar space-y-4">
             {replies.map((step, index) => (
                <div key={index} onClick={() => setActiveStep(index)} className={`border p-6 rounded-2xl relative cursor-pointer ${activeStep === index ? 'bg-[#1e293b] border-primary' : 'bg-[#0f172a] border-white/5'}`}>
                    <div className="absolute -left-3 top-6 w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center font-bold text-sm text-white">{index + 1}</div>
                    <button onClick={(e) => { e.stopPropagation(); deleteStep(index); }} className="absolute top-4 right-4 text-slate-500 hover:text-red-500"><Trash2 size={18}/></button>
                    
                    <div className="pl-4 space-y-4">
                        <div className="flex gap-2 p-1 bg-black/20 rounded-lg w-fit">
                            {['text', 'image', 'video', 'document'].map(type => (
                                <button key={type} onClick={() => updateStep(index, 'mediaType', type)} className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase ${step.mediaType === type ? 'bg-primary text-white' : 'text-slate-400'}`}>{type}</button>
                            ))}
                        </div>
                        <textarea value={step.text} onChange={(e) => updateStep(index, 'text', e.target.value)} placeholder="Type message..." className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white min-h-[80px] text-sm"/>
                        {step.mediaType !== 'text' && (
                            <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                                <input type="file" id={`file-${index}`} className="hidden" onChange={(e) => handleFileUpload(e.target.files[0], index)} />
                                <label htmlFor={`file-${index}`} className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-bold flex items-center gap-2">
                                    {uploading && activeStep === index ? <Loader className="animate-spin" size={16}/> : <UploadCloud size={16}/>} Upload
                                </label>
                                <span className="text-xs text-emerald-400 truncate flex-1">{step.fileName || "No file"}</span>
                            </div>
                        )}
                    </div>
                </div>
             ))}
             <button onClick={addStep} className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-slate-400 hover:text-white flex items-center justify-center gap-2 font-bold"><Plus size={20}/> Add Step</button>
          </div>

          <div className="hidden lg:block lg:col-span-4 h-full">
            <div className="border-[8px] border-[#1e293b] rounded-[3rem] h-[600px] bg-black overflow-hidden relative shadow-2xl">
                <div className="bg-[#075e54] h-16 w-full flex items-center px-4 pt-4 text-white z-10 relative">
                     <p className="text-sm font-bold ml-2">WhatsApp Preview</p>
                </div>
                {renderPreview()}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BotBuilder;