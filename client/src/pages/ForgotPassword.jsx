import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // সরাসরি axios ব্যবহার করা হয়েছে পাথ এরর এড়াতে
import { toast } from "react-hot-toast";

// প্রোডাকশন এপিআই ইউআরএল
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://onyx-drift.com/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading("Transmitting recovery request...");
    
    try {
      // সরাসরি axios দিয়ে কল করা হচ্ছে
      await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
      
      toast.success("Recovery link sent to your neural mail!", { id: loadingToast });
      
      // ৩ সেকেন্ড পর লগইন পেজে পাঠিয়ে দেবে
      setTimeout(() => navigate("/"), 3000);
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Link transmission failed.";
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#06b6d4_0%,_transparent_70%)] opacity-10 pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2 uppercase italic">ONYXDRIFT</h1>
          <h2 className="text-xl font-bold text-cyan-500 tracking-tight mb-2">RECOVER ACCESS.</h2>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Enter email to sync recovery key</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-mono text-cyan-500/50 uppercase mb-2 ml-2">Neural Identity (Email)</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-cyan-500/50 transition-all font-mono"
              placeholder="name@onyx.drift"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] active:scale-95 disabled:opacity-50"
          >
            {loading ? "TRANSMITTING..." : "SEND RECOVERY LINK"}
          </button>
        </form>

        <button 
          onClick={() => navigate("/")}
          className="w-full mt-6 text-zinc-600 hover:text-zinc-400 font-mono text-[10px] uppercase transition-colors"
        >
          [ Abort and Return ]
        </button>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;