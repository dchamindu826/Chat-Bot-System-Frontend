import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Loader, AlertCircle, Building2, Mail, Lock, Phone, User, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "../config";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    phone: ""
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // ⚠️ IMPORTANT: First user nisa api 'admin' role eka hardcode karanawa.
      // Passe meka ain karanna puluwan.
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: 'admin' }), 
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed!");
      }

      alert("🎉 Admin Account Created! Please Login.");
      navigate("/login");
      
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.message || "Connection Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1121] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-lg bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25 rotate-3 hover:rotate-0 transition-all duration-300">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Setup Admin Access</h1>
          <p className="text-slate-400 mt-2 text-center">Create your Super Admin account to manage the CRM.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 mb-6 animate-pulse">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Grid for Name & Business */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
                <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input name="name" onChange={handleChange} required placeholder="Full Name" 
                    className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-blue-500 focus:bg-[#0f172a] outline-none transition-all placeholder:text-slate-500" />
            </div>
            <div className="relative group">
                <Building2 className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input name="businessName" onChange={handleChange} required placeholder="Business Name" 
                    className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-blue-500 focus:bg-[#0f172a] outline-none transition-all placeholder:text-slate-500" />
            </div>
          </div>

          <div className="relative group">
            <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input name="email" type="email" onChange={handleChange} required placeholder="Admin Email" 
                className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-blue-500 focus:bg-[#0f172a] outline-none transition-all placeholder:text-slate-500" />
          </div>

          <div className="relative group">
            <Phone className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input name="phone" onChange={handleChange} required placeholder="Phone Number" 
                className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-blue-500 focus:bg-[#0f172a] outline-none transition-all placeholder:text-slate-500" />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input name="password" type="password" onChange={handleChange} required placeholder="Secure Password" 
                className="w-full bg-[#0f172a]/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:border-blue-500 focus:bg-[#0f172a] outline-none transition-all placeholder:text-slate-500" />
          </div>

          <button disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-500/25 flex justify-center items-center gap-2 mt-6 transform active:scale-95">
            {loading ? <Loader className="animate-spin" /> : <>Create Admin Account <ArrowRight size={20}/></>}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-slate-400 text-sm">Already set up?</p>
            <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors inline-block mt-1">
                Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;