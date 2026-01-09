import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { motion } from 'framer-motion';
import { Save, Image as ImageIcon, Video, FileText, Plus, Trash2, ArrowLeft, Loader, UploadCloud } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const BotBuilder = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [replies, setReplies] = useState([]);
  
  const fileInputRef = useRef(null);
  const [activeReplyIdForUpload, setActiveReplyIdForUpload] = useState(null);
  const [uploadType, setUploadType] = useState(null);

  const token = localStorage.getItem('token');
  const CLOUD_NAME = "dyixoaldi"; 
  const UPLOAD_PRESET = "Chat Bot System"; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/bot/${id}`, {
          headers: { token: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.length > 0) setReplies(data);
        else setReplies([{ id: Date.now(), type: 'text', text: 'Hello! How can I help you?', media: null }]); 
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleTextChange = (id, val) => {
    setReplies(replies.map(r => r.id === id ? { ...r, text: val } : r));
  };

  const triggerFileUpload = (replyId, type) => {
    setActiveReplyIdForUpload(replyId);
    setUploadType(type);
    fileInputRef.current.click(); 
  };

  const getAcceptType = () => {
    if (uploadType === 'image') return "image/*";
    if (uploadType === 'video') return "video/*";
    if (uploadType === 'document') return ".pdf,.doc,.docx,.txt";
    return "*/*";
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeReplyIdForUpload) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET); 
    
    const resourceType = uploadType === 'image' ? 'image' : (uploadType === 'video' ? 'video' : 'auto');

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();

      if (data.secure_url) {
        setReplies(replies.map(r => 
          r.id === activeReplyIdForUpload 
            ? { ...r, media: data.secure_url, mediaType: uploadType, fileName: file.name } 
            : r
        ));
      }
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Error uploading file.");
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const removeMedia = (id) => {
    setReplies(replies.map(r => r.id === id ? { ...r, media: null, mediaType: null, fileName: null } : r));
  };

  const addNewReply = () => {
    setReplies([...replies, { id: Date.now(), type: 'text', text: '', media: null }]);
  };

  const deleteReply = (id) => {
    setReplies(replies.filter(r => r.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/bot/save`,{
        method: 'POST',
        headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
        body: JSON.stringify({ userId: id, replies: replies })
      });
      if (res.ok) alert("Bot Config Saved Successfully!");
      else alert("Save Failed!");
    } catch (err) { console.error(err); } 
    finally { setSaving(false); }
  };

  if(loading) return <MainLayout><div className="flex h-screen items-center justify-center text-white"><Loader className="animate-spin"/> Loading...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-8rem)]">
        <input type="file" ref={fileInputRef} className="hidden" accept={getAcceptType()} onChange={handleFileChange} />
        
        {uploading && (
            <div className="fixed inset-0 z-[60] bg-black/70 flex items-center justify-center">
                <div className="text-white flex flex-col items-center">
                    <Loader size={40} className="animate-spin mb-4 text-primary" />
                    <p className="font-bold">Uploading Media...</p>
                </div>
            </div>
        )}

        {/* EDITOR */}
        <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
          <div className="mb-6 flex items-center gap-4">
             <Link to="/admin/customers" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-white"><ArrowLeft size={20} /></Link>
             <h2 className="text-2xl font-bold text-white">Bot Configuration</h2>
          </div>

          <div className="space-y-6">
            {replies.map((reply, index) => (
              <motion.div key={reply.id} layout className="glass-panel p-6 rounded-3xl border border-white/5 relative group">
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full">Step #{index + 1}</span>
                  <button onClick={() => deleteReply(reply.id)} className="text-slate-500 hover:text-danger"><Trash2 size={18} /></button>
                </div>
                <div className="space-y-4">
                  <textarea 
                    value={reply.text} 
                    onChange={(e) => handleTextChange(reply.id, e.target.value)} 
                    className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary min-h-[80px]" 
                    placeholder="Type message..." 
                  />
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => triggerFileUpload(reply.id, 'image')} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-sm text-slate-300 hover:bg-white/10 border border-white/5"><ImageIcon size={16} /> Image</button>
                    <button onClick={() => triggerFileUpload(reply.id, 'video')} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-sm text-slate-300 hover:bg-white/10 border border-white/5"><Video size={16} /> Video</button>
                    <button onClick={() => triggerFileUpload(reply.id, 'document')} className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl text-sm text-slate-300 hover:bg-white/10 border border-white/5"><FileText size={16} /> Doc/PDF</button>
                    {reply.media && (
                         <div className="ml-auto flex items-center gap-3">
                            <span className="text-xs text-emerald-400 flex items-center gap-1"><UploadCloud size={12}/> Added</span>
                            <button onClick={() => removeMedia(reply.id)} className="text-xs text-danger hover:underline">Remove</button>
                         </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            <button onClick={addNewReply} className="w-full py-4 border-2 border-dashed border-white/10 rounded-3xl text-slate-500 hover:border-primary hover:text-primary flex items-center justify-center gap-2"><Plus size={20} /> Add Next Step</button>
          </div>
        </div>

        {/* PREVIEW */}
        <div className="w-full lg:w-[400px] flex-shrink-0 flex flex-col items-center">
          <div className="relative w-[320px] h-[600px] bg-black rounded-[3rem] border-8 border-slate-800 shadow-2xl overflow-hidden mb-6">
              <div className="bg-[#075E54] p-4 pt-10 flex items-center gap-3"><p className="text-white font-bold">Bot Preview</p></div>
              <div className="h-full bg-[#0b141a] p-4 overflow-y-auto pb-20">
                {replies.map((r) => (
                  <div key={r.id} className="mb-4 flex justify-start">
                    <div className="bg-[#202c33] text-white p-2 rounded-lg max-w-[85%] text-sm border border-white/5">
                      {r.media && (
                        <div className="mb-2 rounded overflow-hidden">
                           {r.mediaType === 'image' && <img src={r.media} className="w-full object-cover" alt="media" />}
                           {r.mediaType === 'video' && <video src={r.media} className="w-full" controls />}
                           {r.mediaType === 'document' && <div className="bg-black/40 p-3 flex items-center gap-3 rounded"><FileText size={20} className="text-orange-400"/><span className="text-xs truncate w-32">{r.fileName}</span></div>}
                        </div>
                      )}
                      <p>{r.text || "..."}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all flex justify-center items-center gap-2">
            {saving ? <Loader className="animate-spin" /> : <><Save size={20} /> Save Configuration</>}
          </button>
        </div>
      </div>
    </MainLayout>
  );
};
export default BotBuilder;