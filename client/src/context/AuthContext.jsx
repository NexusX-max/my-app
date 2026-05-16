import React, { createContext, useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// ✅ ১. লোড ব্যালেন্সিং লজিক (৪টি রেন্ডার সার্ভার)
const API_NODES = [
  'https://my-app-v6xz.onrender.com',
  'https://my-app-2-uzoi.onrender.com',
  'https://my-app-3-kn3k.onrender.com',
  'https://my-app-4-btda.onrender.com'
];

// র‍্যান্ডমলি একটি নোড সিলেক্ট করার ফাংশন
const getLiveNode = () => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:5005";
  }
  return API_NODES[Math.floor(Math.random() * API_NODES.length)];
};

const BASE_URL = getLiveNode();
const API_BASE_URL = `${BASE_URL}/api`;
const TOKEN_KEY = 'onyx_token';

// --- Sound Assets ---
const GLOBAL_MSG_SOUND = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"; 
const GLOBAL_CALL_SOUND = "https://assets.mixkit.co/active_storage/sfx/1357/1357-84.wav";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ─── গ্লোবাল নোটিফিকেশন ও কল স্টেট ──────────────────────────────────
  const [globalIncomingCall, setGlobalIncomingCall] = useState(null);
  const [globalNotification, setGlobalNotification] = useState(null);
  
  const socketConnecting = useRef(false);
  const msgAudio = useRef(new Audio(GLOBAL_MSG_SOUND));
  const callAudio = useRef(new Audio(GLOBAL_CALL_SOUND));

  // 🛠️ ২. Axios Instance কনফিগারেশন
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    });

    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => Promise.reject(error));

    return instance;
  }, []);

  // 🛠️ ৩. ডাটা ক্লিনআপ (Logout logic)
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    if (socket) {
      socket.emit("logout_user", user?._id);
      socket.disconnect();
    }
    if (callAudio.current) {
      callAudio.current.pause();
      callAudio.current.currentTime = 0;
    }
    setUser(null);
    setSocket(null);
    setGlobalIncomingCall(null);
    setGlobalNotification(null);
    window.socket = null;
    socketConnecting.current = false;
  }, [socket, user?._id]);

  // 🛠️ ৪. সকেট কানেকশন এবং গ্লোবাল সিগন্যাল লিসেনিং
  useEffect(() => {
    let socketInstance = null;

    if (user?._id && !socketConnecting.current) {
      socketConnecting.current = true;
      const currentUserId = user._id;

      socketInstance = io(BASE_URL, {
        query: { userId: currentUserId },
        transports: ['websocket'], 
        reconnection: true,
        reconnectionAttempts: 15, // লোড ব্যালেন্সারের জন্য রিকানেকশন বাড়ানো হলো
        reconnectionDelay: 2000,
        secure: true,
        withCredentials: true
      });

      socketInstance.on("connect", () => {
        console.log(`%c 🚀 Onyx Core Linked: ${BASE_URL}`, "color: #06b6d4; font-weight: bold;");
        window.socket = socketInstance;
        
        // ব্যাকএন্ডে সকেট ম্যাপিং রেজিস্টার করা
        socketInstance.emit("addNewUser", currentUserId);
        socketInstance.emit("registerUser", currentUserId); 
        
        setSocket(socketInstance);
      });

      // ─── 🔔 গ্লোবাল মেসেজ নোটিফিকেশন লিসেনার ──────────────────────
      socketInstance.on("getMessage", (data) => {
        // যদি ডাটা কলের কোনো সিগন্যাল না হয়
        if (data.isIncomingCall || data.isCallSignal) return;

        // নোটিফিকেশন স্টেট সেট করা (স্ক্রিনে পপ-আপ দেখানোর জন্য)
        setGlobalNotification({
          type: 'message',
          title: data.senderName || "New Transmission",
          body: data.text || "Encrypted text package received...",
          senderId: data.senderId
        });

        // মেসেজ টোন প্লে করা
        msgAudio.current.play().catch(() => {});
        
        // ৫ সেকেন্ড পর নোটিফিকেশন পপ-আপ রিমুভ করা
        setTimeout(() => setGlobalNotification(null), 5000);
      });

      // ─── 📞 গ্লোবাল ইনকামিং কল সিগন্যাল লিসেনার ────────────────────
      socketInstance.on("$incomingCall", (data) => {
        if (data.from === currentUserId) return; // নিজের কল ফিল্টার

        setGlobalIncomingCall(data);
        
        // রিংটোন লুপ অন করে প্লে করা
        callAudio.current.loop = true;
        callAudio.current.play().catch(e => console.warn("Ringtone blocked by browser autoplay policy. Waiting for user interaction."));
      });

      // ─── 📵 কল কেটে দেওয়ার গ্লোবাল লিসেনার ────────────────────────
      const handleCallStop = () => {
        setGlobalIncomingCall(null);
        callAudio.current.pause();
        callAudio.current.currentTime = 0;
      };

      socketInstance.on("callEnded", handleCallStop);
      socketInstance.on("endCall", handleCallStop);

      socketInstance.on("connect_error", (err) => {
        console.warn("📡 Neural Core Signal Weak. Re-routing package...");
        socketConnecting.current = false;
      });

      return () => {
        if (socketInstance) {
          socketInstance.disconnect();
          window.socket = null;
          socketConnecting.current = false;
          handleCallStop();
          console.log("📡 Neural link closed.");
        }
      };
    }
  }, [user?._id]); 

  // 🛠️ ৫. সেশন রিকভারি
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me'); 
        if (isMounted) {
          const userData = res.data.user || res.data.data || res.data;
          setUser(userData);
        }
      } catch (err) {
        if (isMounted) clearAuthData();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();
    return () => { isMounted = false; };
  }, [api, clearAuthData]);

  // 🛠️ ৬. লগইন এবং সাইনআপ মেথড
  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      setUser(userData || res.data);
    }
    return res.data;
  }, [api]);

  const signup = useCallback(async (formData) => {
    const res = await api.post('/auth/register', formData);
    const { token, user: userData } = res.data;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      setUser(userData || res.data);
    }
    return res.data;
  }, [api]);

  const logout = useCallback(() => {
    clearAuthData();
    window.location.href = '/';
  }, [clearAuthData]);

  // কল ম্যানুয়ালি রেসপন্স বা রিং বন্ধ করার হেল্পার (UI ক্লিয়ারের জন্য)
  const clearGlobalCallState = useCallback(() => {
    if (callAudio.current) {
      callAudio.current.pause();
      callAudio.current.currentTime = 0;
    }
    setGlobalIncomingCall(null);
  }, []);

  const contextValue = useMemo(() => ({
    user, 
    socket, 
    loading, 
    login, 
    signup, 
    logout,
    isAuthenticated: !!user,
    api,
    currentNode: BASE_URL,
    globalIncomingCall,      // যে কোনো স্ক্রিন থেকে ইনকামিং কল ট্র্যাক করার জন্য
    globalNotification,      // যে কোনো স্ক্রিনে মেসেজ নোটিফিকেশন পপ-আপ ট্রিগার করার জন্য
    clearGlobalCallState     // কল রিসিভ বা রিজেক্টের পর রিংটোন অফ করার ফাংশন
  }), [user, socket, loading, login, signup, logout, api, globalIncomingCall, globalNotification, clearGlobalCallState]);

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading ? children : (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-cyan-500/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-cyan-500 font-mono animate-pulse uppercase tracking-[0.4em] text-[10px]">
                  Syncing_Neural_Core...
                </div>
            </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;