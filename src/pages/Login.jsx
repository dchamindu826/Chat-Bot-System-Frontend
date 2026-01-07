import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Lock, Mail } from 'lucide-react';


const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // API Call to Backend
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();

      if (res.ok) {
        // Save Token & Role
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        
        // Redirect based on Role
        if (data.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      } else {
        alert(data); // Show error
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1121] flex items-center justify-center relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-blob mix-blend-screen"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-blob animation-delay-2000 mix-blend-screen"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-10 rounded-3xl w-full max-w-md z-10 border border-white/10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
            <Zap className="text-white" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-slate-400">Enter your details to access the workspace.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                placeholder="admin@smartreply.com"
              />
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all transform hover:scale-[1.02]">
            Sign In
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;