import React, { useState } from 'react';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// API Base URL (তোমার ব্যাকএন্ড ইউআরএল অনুযায়ী চেক করে নিও)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000/api';

const LoginPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isRegisterMode, setIsRegisterMode] = useState(false); // রেজিস্ট্রেশন মোড ট্র্যাক করার জন্য

    /**
     * 🛡️ ১. পাসকি রেজিস্ট্রেশন ফাংশন
     * এটি নতুন ডিভাইসে ফিঙ্গারপ্রিন্ট সেটআপ করবে।
     */
    const handlePasskeyRegister = async () => {
        setIsLoading(true);
        const loadToast = toast.loading("Linking Neural Identity...");
        try {
            // ব্যাকএন্ড থেকে রেজিস্ট্রেশন অপশন আনা
            const resp = await fetch(`${API_BASE_URL}/auth/register-options`);
            if (!resp.ok) throw new Error("Neural Core Offline.");
            const opts = await resp.json();

            // ডোমেইন ডাইনামিক হ্যান্ডলিং
            const finalOpts = {
                ...opts,
                rp: { ...opts.rp, id: window.location.hostname === 'localhost' ? 'localhost' : opts.rp.id }
            };

            // ব্রাউজার পপ-আপ (Registration)
            const regResp = await startRegistration(finalOpts);

            // ভেরিফিকেশন সার্ভারে পাঠানো
            const verifyResp = await fetch(`${API_BASE_URL}/auth/verify-registration`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(regResp),
            });

            const result = await verifyResp.json();
            if (result.success) {
                toast.success("Device Linked! You can now login.", { id: loadToast });
                setIsRegisterMode(false); // রেজিস্ট্রেশন সফল হলে লগইন মোডে ফিরে যাওয়া
            } else {
                throw new Error(result.msg || "Registration failed.");
            }
        } catch (err) {
            console.error("Register Error:", err);
            toast.error(err.message || "Registration Denied.", { id: loadToast });
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 🔑 ২. পাসকি লগইন ফাংশন
     * এটি রেজিস্টার করা ফিঙ্গারপ্রিন্ট দিয়ে লগইন করবে।
     */
    const handlePasskeyLogin = async () => {
        setIsLoading(true);
        const loadToast = toast.loading("Establishing Neural Link...");
        try {
            const resp = await fetch(`${API_BASE_URL}/auth/login-options`);
            if (!resp.ok) throw new Error("Neural Core Offline.");
            const opts = await resp.json();

            // ব্রাউজার পপ-আপ (Authentication)
            const authResp = await startAuthentication({
                ...opts,
                rpId: window.location.hostname === 'localhost' ? 'localhost' : opts.rpId
            });

            const verifyResp = await fetch(`${API_BASE_URL}/auth/verify-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(authResp),
            });

            const result = await verifyResp.json();
            if (result.success || result.verified) {
                toast.success("Welcome back, Drifter!", { id: loadToast });
                if (result.token) localStorage.setItem('token', result.token);
                setTimeout(() => window.location.href = '/feed', 1000);
            } else {
                throw new Error("Neural mismatch.");
            }
        } catch (err) {
            console.error("Login Error:", err);
            toast.error("No Passkey found! Click 'Link Device' first.", { id: loadToast });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans">
            
            {/* ফিউচারিস্টিক গ্রাডিয়েন্ট */}
            <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative p-10 w-full max-w-[420px] mx-4 rounded-[40px] bg-white/[0.02] backdrop-blur-3xl border border-white/5 shadow-2xl text-center z-10"
            >
                <h1 className="text-4xl font-black text-white mb-2 tracking-[0.2em] uppercase italic">ONYXDRIFT</h1>
                <p className="text-cyan-400/50 text-[10px] font-mono mb-10 tracking-[0.3em] uppercase">Private Neural Network</p>

                {/* লোগো */}
                <div className="relative w-28 h-28 mx-auto mb-10">
                    <div className="w-full h-full rounded-full border border-cyan-500/20 flex items-center justify-center bg-[#020617]/40 shadow-inner">
                        <span className="text-5xl group-hover:scale-110 transition-transform duration-500">🧠</span>
                    </div>
                    <div className="absolute inset-0 rounded-full bg-cyan-500/5 blur-2xl animate-pulse" />
                </div>

                <div className="mb-10">
                    <h2 className="text-white text-xl font-light italic">
                        {isRegisterMode ? "New Identity " : "Identity Verified "}
                        <span className="text-cyan-400 font-bold">Drifter</span>
                    </h2>
                </div>

                {/* মেইন বাটন */}
                <button 
                    onClick={isRegisterMode ? handlePasskeyRegister : handlePasskeyLogin} 
                    disabled={isLoading}
                    className="group relative w-full py-5 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-800 text-white font-black transition-all hover:shadow-[0_0_50px_rgba(6,182,212,0.4)] active:scale-[0.98] disabled:opacity-50 overflow-hidden"
                >
                    <span className="relative z-10 uppercase tracking-widest text-sm">
                        {isLoading ? '📡 Syncing...' : (isRegisterMode ? '🛡️ Link New Device' : '⚔️ Access Neural Link')}
                    </span>
                </button>

                {/* মোড সুইচ (এটিই রেজিস্ট্রেশন অপশন) */}
                <button 
                    onClick={() => setIsRegisterMode(!isRegisterMode)}
                    className="mt-8 text-gray-500 hover:text-cyan-400 text-[11px] font-mono tracking-widest uppercase transition-colors block w-full text-center"
                >
                    {isRegisterMode ? "← Already Linked? Login" : "First time? Link this device →"}
                </button>

                <div className="mt-8 flex justify-center gap-4 opacity-20">
                   <span className="text-white text-[8px]">FINGERPRINT</span>
                   <span className="text-white text-[8px]">•</span>
                   <span className="text-white text-[8px]">FACE ID</span>
                </div>
            </motion.div>

            <div className="absolute bottom-8 text-white/5 text-[8px] tracking-[1.2em] uppercase font-mono w-full text-center">
                Onyx_Core_System_v3.0_Stable
            </div>
        </div>
    );
};

export default LoginPage;