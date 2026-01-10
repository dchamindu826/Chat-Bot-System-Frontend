import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Loader, AlertCircle } from "lucide-react";
import { API_BASE_URL } from "../config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed! Check credentials.");
      }

      // Token Save
      localStorage.setItem("token", data.accessToken);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data._id);
      localStorage.setItem("name", data.name);
      if(data.businessName) localStorage.setItem("businessName", data.businessName);

      // ✅ REDIRECT LOGIC
      if (data.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.role === "agent") {
        navigate("/user/agent-dashboard"); // Agent Dashboard
      } else {
        navigate("/user/dashboard"); // Client Dashboard
      }
      
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Connection Error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-white/10 p-8 rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25 mb-4">
            <Zap className="text-white" fill="white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400">Sign in to SmartReply CRM</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 mb-6">
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Email</label>
            <input type="email" required className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="user@example.com" onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Password</label>
            <input type="password" required className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button disabled={loading} className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/20 flex justify-center items-center gap-2 mt-4">
            {loading ? <Loader className="animate-spin" /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;