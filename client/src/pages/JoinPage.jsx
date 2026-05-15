import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:5005/api"  // লোকাল ডেভেলপমেন্টের জন্য
  : "https://api.onyx-drift.com/api"; // লাইভ সার্ভারের জন্য (Cloudflare Tunnel)

const JoinPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        bio: '',
        avatarUrl: ''
    });
    
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        // ভ্যালিডেশন
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            return toast.error("Required fields: Name, Email, and Password.");
        }
        
        if (isLoading) return;
        setIsLoading(true);
        const loadToast = toast.loading("Establishing Neural Identity...");

        try {
            const resp = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await resp.json();

            if (resp.ok) {
                localStorage.setItem('onyx_token', result.token);
                toast.success("Identity Secured in Onyx Core!", { id: loadToast });
                
                // রেজিস্ট্রেশন সফল হলে ড্যাশবোর্ডে পাঠানো
                setTimeout(() => navigate('/feed'), 1500);
            } else {
                throw new Error(result.msg || "Neural Identity rejected.");
            }
        } catch (err) {
            console.error("❌ Join Error:", err);
            toast.error(err.message || "Registration failed.", { id: loadToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans py-10">
            {/* এম্বিয়েন্ট লাইট ইফেক্ট */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative p-8 w-full max-w-[480px] mx-4 rounded-[40px] bg-white/[0.02] backdrop-blur-3xl border border-white/10 shadow-2xl z-10"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-1 tracking-[0.2em] italic uppercase">ONYXDRIFT</h1>
                    <p className="text-cyan-400/50 text-[9px] font-mono tracking-[0.4em] uppercase">Establish New Identity</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    {/* নাম সেকশন */}
                    <div className="flex gap-4">
                        <input 
                            type="text" 
                            placeholder="FIRST NAME"
                            required
                            className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-blue-500/50 transition-all"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                        <input 
                            type="text" 
                            placeholder="LAST NAME"
                            required
                            className="w-1/2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-blue-500/50 transition-all"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                    </div>

                    {/* ইমেইল ও পাসওয়ার্ড */}
                    <input 
                        type="email" 
                        placeholder="NEURAL EMAIL"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-blue-500/50 transition-all"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />

                    <input 
                        type="password" 
                        placeholder="ACCESS CODE (PASSWORD)"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-blue-500/50 transition-all"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    
                    {/* অপশনাল প্রোফাইল ডাটা */}
                    <input 
                        type="text" 
                        placeholder="AVATAR URL (Optional)"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-blue-500/50 transition-all"
                        value={formData.avatarUrl}
                        onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
                    />

                    <textarea 
                        placeholder="NEURAL BIO (Optional...)"
                        rows="2"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-mono focus:outline-none focus:border-blue-500/50 transition-all resize-none"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    />

                    <div className="pt-4">
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full py-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 text-white font-black transition-all hover:shadow-[0_0_40px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50 overflow-hidden"
                        >
                            <span className="relative z-10 uppercase text-xs tracking-[0.2em]">
                                {isLoading ? "⚡ Syncing Identity..." : "🔐 Create Neural Identity"}
                            </span>
                        </button>
                    </div>
                </form>

                <div className="mt-8 flex justify-center">
                    <Link to="/login" className="text-gray-500 text-[10px] uppercase tracking-widest hover:text-white transition-colors duration-300">
                        Existing Identity? <span className="text-blue-400">Reconnect</span>
                    </Link>
                </div>
            </motion.div>

            <div className="absolute bottom-6 text-white/5 text-[7px] tracking-[1.5em] uppercase font-mono w-full text-center">
                Onyx_Genesis_Protocol_v3.2
            </div>
        </div>
    );
};

export default JoinPage;