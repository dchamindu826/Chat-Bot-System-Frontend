import React from 'react';
import MainLayout from '../../layouts/MainLayout';
import { ShieldAlert, Bot } from 'lucide-react';

const UserBotConfig = () => (
  <MainLayout>
    <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3"><Bot className="text-primary"/> My Bot Configuration</h2>
        <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-4">
            <ShieldAlert className="text-blue-400 shrink-0" size={24} />
            <p className="text-slate-400 text-sm">Bot configuration is managed by the administrator. Contact support to request changes.</p>
        </div>
    </div>
  </MainLayout>
);
export default UserBotConfig;