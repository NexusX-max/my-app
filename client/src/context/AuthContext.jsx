import React, { createContext, useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// ✅ ১. গ্লোবাল ওনিক্স নেটওয়ার্ক নোডস
const API_NODES = [
  'https://my-app-v6xz.onrender.com', 
  'https://my-app-2-uzoi.onrender.com',
  'https://my-app-3-kn3k.onrender.com',
  'https://my-app-4-btda.onrender.com'
];

const getLiveNode = () => {
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:5005";
  }
  return API_NODES[0]; 
};

const BASE_URL = getLiveNode();
const API_BASE_URL = `${BASE_URL}/api`;
const TOKEN_KEY = 'onyx_token';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const socketConnecting = useRef(false);

  // 🛠️ ২. Axios Instance কনফিগারেশন
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    });

    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) config.headers.Authorization = `Bearer ${token}`;
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
    setUser(null);
    setSocket(null);
    socketConnecting.current = false;
  }, [socket, user?._id]);

  // 🛠️ ৪. সকেট কানেকশন ও গ্লোবাল কলিং পাইপলাইন
  useEffect(() => {
    let socketInstance = null;

    if (user?._id && !socketConnecting.current) {
      socketConnecting.current = true;
      const currentUserId = user._id;

      socketInstance = io(BASE_URL, {
        query: { userId: currentUserId },
        transports: ['websocket'], 
        reconnection: true,
        reconnectionAttempts: 15, 
        reconnectionDelay: 1000,
        secure: true,
        withCredentials: true
      });

      socketInstance.on("connect", () => {
        console.log(`%c 🚀 Onyx Synapse Connected: ${BASE_URL}`, "color: #06b6d4; font-weight: bold;");
        socketInstance.emit("addNewUser", currentUserId);
        socketInstance.emit("registerUser", currentUserId); 
        setSocket(socketInstance);
      });

      /* 📞 GLOBAL CALL SYNAPSE LISTENERS */
      socketInstance.on("$incomingCall", (data) => {
        console.log("📡 Incoming Onyx Pulse Detected:", data);
        
        // Browser Notification
        if (Notification.permission === "granted") {
          new Notification(`Onyx Call from ${data.name}`, { body: `Tap to accept ${data.type} link.` });
        }
        
        sessionStorage.setItem("onyx_incoming_signal", JSON.stringify(data.signalData || data.signal));
        sessionStorage.setItem("onyx_caller_id", data.from);
        sessionStorage.setItem("onyx_caller_name", data.name || "Unknown Link");
        sessionStorage.setItem("onyx_caller_avatar", data.avatar || "");
        sessionStorage.setItem("onyx_call_type", data.type);
        sessionStorage.setItem("onyx_call_room", data.roomId); // Call UI রেন্ডার করার জন্য রুম আইডি
      });

      socketInstance.on("callEnded", () => {
        console.log("🛑 Remote node ended the call session.");
        sessionStorage.removeItem("onyx_incoming_signal");
        sessionStorage.removeItem("onyx_caller_id");
        sessionStorage.removeItem("onyx_call_room");
      });

      return () => {
        if (socketInstance) {
          console.log("📡 Retaining neural link for active session routing...");
        }
      };
    }
  }, [user?._id]); 

  // 🛠️ ৫. সেশন রিকভারি
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) { setLoading(false); return; }

      try {
        const res = await api.get('/auth/me'); 
        if (isMounted) setUser(res.data.user || res.data);
      } catch (err) {
        if (isMounted) clearAuthData();
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initAuth();
    return () => { isMounted = false; };
  }, [api, clearAuthData]);

  // 🛠️ ৬. Auth Actions
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

  const contextValue = useMemo(() => ({
    user, socket, loading, login, signup, logout,
    isAuthenticated: !!user, api, currentNode: BASE_URL 
  }), [user, socket, loading, login, signup, logout, api]);

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading ? children : (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16 animate-spin rounded-full border-4 border-cyan-500/10 border-t-cyan-500"></div>
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