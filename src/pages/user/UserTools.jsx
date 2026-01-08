import React, { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Link, Copy } from 'lucide-react';

const UserTools = () => {
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState('');
  const link = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-white">WhatsApp Tools</h2>
        <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-4 bg-white/5">
            <h3 className="font-bold text-white flex items-center gap-2"><Link size={20}/> Link Generator</h3>
            <input type="text" placeholder="Phone (e.g. 9477...)" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-white outline-none"/>
            <input type="text" placeholder="Message" value={msg} onChange={(e) => setMsg(e.target.value)} className="w-full bg-black/20 border border-white/10 p-3 rounded-xl text-white outline-none"/>
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 text-xs text-primary font-mono break-all">{link}</div>
            <button onClick={() => {navigator.clipboard.writeText(link); alert("Copied!");}} className="w-full py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2"><Copy size={18}/> Copy Link</button>
        </div>
      </div>
    </MainLayout>
  );
};
export default UserTools;