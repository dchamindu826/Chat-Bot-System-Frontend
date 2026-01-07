import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Loader } from 'lucide-react';
import { API_BASE_URL } from '../config'; // <--- 1. මේ LINE එක අනිවාර්යයෙන්ම තියෙන්න ඕන!

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      console.log("Login Response:", data); // Response එක Console එකේ බලාගන්න මේක දාන්න

      if (res.ok) {
        // මෙතන තමයි වෙනස! (Token එක හරියටම ගන්න)
        const token = data.accessToken || data.token;
        
        if (!token) {
           setError("Login success but no token received!");
           return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userId', data._id || data.userId); // userId එකත් සමහරවිට වෙනස් වෙන්න පුළුවන්
        
        if (data.role === 'admin') navigate('/admin/dashboard');
        else navigate('/user/dashboard');
      } else {
        setError(data || 'Login failed');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b]/50 p-8 rounded-3xl border border-white/10 w-full max-w-md backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to manage your bot empire</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-sm mb-2 ml-1">Email Address</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                placeholder="admin@smartreply.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? <Loader className="animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;