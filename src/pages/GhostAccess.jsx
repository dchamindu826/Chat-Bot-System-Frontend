import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const GhostAccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // 1. Set the new token (this logs the user in as the client)
      localStorage.setItem('token', token);
      
      // 2. Set role to 'user' because we are simulating a client login
      localStorage.setItem('role', 'user'); 

      // 3. Clear any conflicting admin data if necessary (optional)
      // localStorage.removeItem('adminSpecificData');

      // 4. Redirect to User Dashboard after a short delay
      setTimeout(() => {
          navigate('/user/dashboard'); 
      }, 800);
    } else {
      alert("Invalid Access Token");
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-white flex-col">
      <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl font-bold">Securely Logging you in...</h2>
      <p className="text-slate-400 text-sm mt-2">Setting up your workspace context.</p>
    </div>
  );
};

export default GhostAccess;