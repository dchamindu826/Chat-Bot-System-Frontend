import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, Loader, AlertCircle } from "lucide-react";
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
      // Role eka 'admin' widihata hardcode kala first user nisa
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, role: 'admin' }), 
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed!");
      }

      alert("Admin Account Created Successfully! Now Login.");
      navigate("/login");
      
    } catch (err) {
      console.error("Register Error:", err);
      setError(err.message || "Connection Error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-white/10 p-8 rounded-3xl shadow-2xl">
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4 text-blue-500">
            <UserPlus size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Admin</h1>
          <p className="text-slate-400 text-sm">One-time setup for Super Admin</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 mb-6">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="name" onChange={handleChange} required placeholder="Full Name" className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
          <input name="businessName" onChange={handleChange} required placeholder="Business Name" className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
          <input name="phone" onChange={handleChange} required placeholder="Phone Number" className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
          <input name="email" type="email" onChange={handleChange} required placeholder="Email Address" className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />
          <input name="password" type="password" onChange={handleChange} required placeholder="Password" className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none" />

          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex justify-center items-center gap-2 mt-2">
            {loading ? <Loader className="animate-spin" /> : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
            <Link to="/login" className="text-slate-400 text-sm hover:text-white">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;