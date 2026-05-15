import React, { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://onyx-drift.com/api';

const RegisterPasskey = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegister = async () => {
    setIsRegistering(true);
    const loadToast = toast.loading("Linking Neural Identity...");

    try {
      // ১. ব্যাকএন্ড থেকে রেজিস্ট্রেশন অপশন আনা
      const resp = await fetch(`${API_BASE_URL}/auth/register-options`);
      const opts = await resp.json();

      // ২. বায়োমেট্রিক পপ-আপ (রেজিস্ট্রেশনের জন্য)
      // এটি তোমার ফোনে ফিঙ্গারপ্রিন্ট চাইবে এবং ফোনে চাবিটি সেভ করবে
      const regResp = await startRegistration(opts);

      // ৩. রেজাল্ট ব্যাকএন্ডে পাঠানো
      const verifyResp = await fetch(`${API_BASE_URL}/auth/verify-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regResp),
      });

      const result = await verifyResp.json();

      if (result.success) {
        toast.success("Mobile Linked Successfully!", { id: loadToast });
      } else {
        throw new Error("Verification failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Registration Failed", { id: loadToast });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <button 
      onClick={handleRegister}
      disabled={isRegistering}
      className="px-6 py-3 bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 rounded-xl hover:bg-cyan-600/30 transition-all font-mono text-xs tracking-widest uppercase"
    >
      {isRegistering ? "📡 Syncing..." : "🛡️ Register Mobile Passkey"}
    </button>
  );
};

export default RegisterPasskey;