import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext'; // আপনার AuthContext ইমপোর্ট করুন

const LoginPage = () => {
    const { login, currentNode } = useAuth(); // Context থেকে login মেথড নিন
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            return toast.error("Credentials required for Neural Access.");
        }
        
        setIsLoading(true);
        const loadToast = toast.loading("Authenticating Neural Identity...");

        try {
            // debug: কোন নোডে হিট করছে তা দেখার জন্য
            console.log(`🚀 Connecting to Neural Node: ${currentNode}`);
            
            // AuthContext-এর login মেথড ব্যবহার করা হচ্ছে
            // এটি অটোমেটিক আপনার ৪টি সার্ভারের একটিকে বেছে নেবে
            await login(formData.email, formData.password);

            toast.success(`Welcome back, Drifter!`, { id: loadToast });
            
            // ১ সেকেন্ড ডিলে যাতে ইউজার সাকসেস এনিমেশন দেখতে পায়
            setTimeout(() => {
                console.log("🏁 Neural Link Synchronized. Redirecting...");
                window.location.href = "/feed";
            }, 1000);

        } catch (err) {
            console.error("❌ Neural Access Denied:", err);
            const errorMessage = err.response?.data?.msg || err.message || "Connection Failed.";
            toast.error(errorMessage, { id: loadToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans py-10">
            {/* Ambient background light effects */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative p-8 w-full max-w-[420px] mx-4 rounded-[40px] bg-white/[0.02] backdrop-blur-3xl border border-white/10 shadow-2xl z-10"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-black text-white mb-1 tracking-[0.2em] italic uppercase">ONYXDRIFT</h1>
                    <p className="text-cyan-400/50 text-[9px] font-mono tracking-[0.4em] uppercase">Neural Access Point</p>
                    {/* বর্তমানে কোন সার্ভারে কানেক্টেড তা ছোট করে দেখানোর জন্য (Debug purposes) */}
                    <p className="text-white/10 text-[6px] mt-2 font-mono truncate">{currentNode}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="relative group">
                        <input 
                            type="email" 
                            placeholder="NEURAL EMAIL"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-xs font-mono focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div className="relative group">
                        <input 
                            type="password" 
                            placeholder="ACCESS CODE (PASSWORD)"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-xs font-mono focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>

                    <div className="pt-4 flex flex-col gap-6">
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full py-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white font-black transition-all hover:shadow-[0_0_40px_rgba(37,99,235,0.3)] active:scale-[0.98] disabled:opacity-50 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <span className="relative z-10 uppercase text-xs tracking-[0.2em]">
                                {isLoading ? "⚡ Synchronizing..." : "🔓 Initialize Neural Link"}
                            </span>
                        </button>

                        <div className="flex justify-between items-center px-2">
                            <Link to="/join" className="text-gray-500 text-[9px] uppercase tracking-widest hover:text-white transition-colors">
                                New Identity? <span className="text-blue-400">Join Drift</span>
                            </Link>
                            <button type="button" className="text-gray-500 text-[9px] uppercase tracking-widest hover:text-red-400 transition-colors">
                                Lost Key?
                            </button>
                        </div>
                    </div>
                </form>

                {/* Aesthetic Neural Indicators */}
                <div className="mt-12 flex justify-center items-center gap-4 opacity-10">
                    <div className="h-[1px] w-12 bg-white" />
                    <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse delay-75" />
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse delay-150" />
                    </div>
                    <div className="h-[1px] w-12 bg-white" />
                </div>
            </motion.div>

            <div className="absolute bottom-6 text-white/5 text-[7px] tracking-[1.5em] uppercase font-mono w-full text-center">
                System_Node_Authorized_v3.2
            </div>
        </div>
    );
};

export default LoginPage;