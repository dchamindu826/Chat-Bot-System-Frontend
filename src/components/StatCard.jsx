import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-panel p-6 rounded-3xl relative overflow-hidden group transition-colors duration-300 dark:bg-white/5 bg-white border dark:border-white/10 border-slate-200 shadow-xl"
    >
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-2">{title}</p>
          {/* Text Color Logic Fixed here */}
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">
            {value}
          </h3>
        </div>
        <div className={`p-3.5 rounded-2xl ${colorClass} bg-opacity-10 text-white shadow-inner`}>
          <Icon size={24} className={colorClass.replace('bg-', 'text-')} />
        </div>
      </div>
      
      <div className="mt-5 flex items-center gap-2 z-10 relative">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${trend >= 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">vs last month</span>
      </div>
    </motion.div>
  );
};

export default StatCard;