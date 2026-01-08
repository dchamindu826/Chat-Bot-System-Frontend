import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import { ShieldCheck } from 'lucide-react';

const UserSettings = () => (
  <MainLayout>
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white">Settings</h2>
      <div className="glass-panel p-8 rounded-3xl border border-white/5 bg-white/5 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">U</div>
          <div>
            <h3 className="text-white font-bold text-lg">Client Account</h3>
            <p className="text-slate-400 text-sm">Standard Plan</p>
          </div>
        </div>
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
           <ShieldCheck size={20}/> Security is managed by your Admin.
        </div>
      </div>
    </div>
  </MainLayout>
);
export default UserSettings;