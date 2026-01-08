import React, { useEffect, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { ShieldAlert, MessageCircle, Key } from 'lucide-react';

const MyBot = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-white">My Bot Configuration</h2>
        
        {/* Warning Card */}
        <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-4 items-start">
            <ShieldAlert className="text-blue-400 shrink-0" size={24} />
            <div>
                <h4 className="text-blue-400 font-bold mb-1">View Only Mode</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                    Your bot flow is managed by the system administrator. You can view the messages but cannot edit them. 
                    If you need to change your bot's reply sequence, please contact support.
                </p>
            </div>
        </div>

        {/* Display Bot Flow (Read Only) */}
        <div className="glass-panel p-8 rounded-3xl border border-white/5 space-y-4">
             <p className="text-slate-500 text-sm">Contact Admin to make changes.</p>
             {/* මෙතන බොට්ගේ පරණ මැසේජ් ටික ලිස්ට් එකක් විදියට පෙන්නන්න විතරක් පුළුවන් */}
        </div>
      </div>
    </MainLayout>
  );
};

export default MyBot;