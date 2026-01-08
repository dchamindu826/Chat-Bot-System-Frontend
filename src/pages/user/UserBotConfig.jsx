import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Bot, Power, Lock, Image, Video, FileText, Smartphone } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const UserBotConfig = () => {
  const [steps, setSteps] = useState([]);
  const [isBotOn, setIsBotOn] = useState(true);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  // Fetch Logic
  useEffect(() => {
    const fetchConfig = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/bot/my/config`, {
                headers: { token: `Bearer ${token}` }
            });
            if(res.ok) {
                const data = await res.json();
                setSteps(data.replies || []);
                setIsBotOn(data.isActive !== undefined ? data.isActive : true);
            }
        } catch(err) { console.error(err); }
        finally { setLoading(false); }
    };
    fetchConfig();
  }, []);

  // Toggle Function
  const toggleBot = async () => {
      const newState = !isBotOn;
      setIsBotOn(newState);
      try {
          await fetch(`${API_BASE_URL}/api/bot/my/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', token: `Bearer ${token}` },
              body: JSON.stringify({ isActive: newState })
          });
      } catch(err) { setIsBotOn(!newState); }
  };

  if(loading) return <MainLayout><div className="flex h-screen items-center justify-center text-white">Loading Bot Config...</div></MainLayout>;

  return (
    <MainLayout>
      <div className="flex flex-col lg:flex-row gap-8 h-[85vh]">
        
        {/* --- LEFT: CONTROL PANEL --- */}
        <div className="flex-1 flex flex-col min-h-0">
            {/* Header & Toggle */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 mb-6 bg-gradient-to-r from-slate-900 to-slate-800">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Bot className="text-blue-500" size={32}/> 
                            Auto Reply Bot
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Managed by Admin • View Only Mode</p>
                    </div>
                    
                    {/* Switch */}
                    <button 
                        onClick={toggleBot}
                        className={`flex items-center gap-3 px-4 py-2 rounded-full border transition-all ${isBotOn ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-red-500/20 border-red-500 text-red-500'}`}
                    >
                        <Power size={18} />
                        <span className="font-bold text-sm">{isBotOn ? "BOT ACTIVE" : "BOT OFF"}</span>
                    </button>
                </div>
            </div>
            
            {/* Steps List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {steps.length === 0 ? (
                    <div className="text-center p-10 border border-dashed border-white/10 rounded-2xl text-slate-500">
                        Bot flow is empty. Contact admin to configure.
                    </div>
                ) : steps.map((step, index) => (
                    <div key={index} className="glass-panel p-5 rounded-2xl border border-white/5 bg-[#1e293b]/50 relative">
                        
                        <div className="absolute top-4 right-4 text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded border border-blue-500/20 flex items-center gap-1">
                            <Lock size={10}/> Read Only
                        </div>

                        <div className="flex gap-4">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30">
                                    {index + 1}
                                </div>
                                {index !== steps.length - 1 && <div className="w-0.5 flex-1 bg-white/10 my-1"></div>}
                            </div>
                            
                            <div className="flex-1">
                                <p className="text-xs text-slate-400 font-bold uppercase mb-2">Bot Reply</p>
                                
                                {/* Text Content */}
                                {step.text && (
                                    <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-slate-200 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                                        {step.text}
                                    </div>
                                )}

                                {/* Media Content Display */}
                                {step.media && (
                                    <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                        <p className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                                            {step.mediaType === 'image' && <><Image size={14} className="text-purple-400"/> Image Attached</>}
                                            {step.mediaType === 'video' && <><Video size={14} className="text-pink-400"/> Video Attached</>}
                                            {step.mediaType === 'document' && <><FileText size={14} className="text-orange-400"/> Document Attached</>}
                                        </p>
                                        
                                        {step.mediaType === 'image' && (
                                            <img src={step.media} alt="bot-media" className="w-48 h-32 object-cover rounded-lg border border-white/10" />
                                        )}
                                        
                                        {step.mediaType === 'video' && (
                                            <video src={step.media} controls className="w-48 h-32 object-cover rounded-lg border border-white/10" />
                                        )}

                                        {step.mediaType === 'document' && (
                                            <a href={step.media} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-black/40 rounded-lg hover:bg-black/60 transition">
                                                <FileText className="text-orange-400" size={24}/>
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-bold text-slate-200 truncate w-40">{step.fileName || "Download File"}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">Click to open</p>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* --- RIGHT: LIVE PREVIEW (Mobile Mockup) --- */}
        <div className="w-[380px] hidden lg:flex flex-col items-center justify-center shrink-0">
            <div className="mockup-phone border-gray-800 bg-[#0b141a] rounded-[40px] border-[8px] h-[700px] w-full shadow-2xl relative overflow-hidden flex flex-col">
                
                {/* Header */}
                <div className="bg-[#202c33] h-16 flex items-center px-4 gap-3 shadow-md z-10 shrink-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">Bot</div>
                    <div>
                        <p className="text-white text-sm font-bold">Auto Assistant</p>
                        <p className="text-[10px] text-slate-400">● Online</p>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 bg-[#0b141a] overflow-y-auto p-4 space-y-4 relative scrollbar-hide">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")'}}></div>
                    
                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col gap-1 relative z-10 animate-in slide-in-from-left duration-500" style={{animationDelay: `${i * 150}ms`}}>
                            <div className="bg-[#202c33] p-2 rounded-lg rounded-tl-none text-white text-xs max-w-[85%] shadow-sm self-start">
                                
                                {/* Image/Video Preview inside Phone */}
                                {step.media && step.mediaType === 'image' && (
                                    <img src={step.media} className="rounded-md mb-2 w-full object-cover max-h-40" alt="preview"/>
                                )}
                                {step.media && step.mediaType === 'video' && (
                                    <div className="rounded-md mb-2 bg-black/50 h-24 flex items-center justify-center border border-white/10">
                                        <Video size={20} className="text-white opacity-80"/>
                                    </div>
                                )}

                                <p className="leading-relaxed whitespace-pre-wrap">{step.text}</p>
                                <span className="text-[9px] text-slate-500 block text-right mt-1">10:0{i} AM</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="bg-[#202c33] h-14 flex items-center px-2 gap-2 shrink-0 z-10">
                    <div className="p-2 text-slate-500"><Smartphone size={20}/></div>
                    <div className="flex-1 h-8 bg-[#2a3942] rounded-full px-3 flex items-center text-slate-500 text-xs">Type a message...</div>
                </div>

            </div>
            <p className="mt-6 text-slate-500 text-xs uppercase tracking-widest font-bold">Live Preview</p>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserBotConfig;