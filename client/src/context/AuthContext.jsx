import React, { createContext, useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// ✅ ১. ডাইনামিক এপিআই এবং সকেট ইউআরএল

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
const API_BASE_URL = `${BASE_URL}/api`
const TOKEN_KEY = 'onyx_token';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ডুপ্লিকেট কানেকশন ট্র্যাকিং এর জন্য useRef
  const socketConnecting = useRef(false);

  // 🛠️ ২. Axios Instance
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

  // 🛠️ ৩. ডাটা ক্লিনআপ (Logout and cleanup logic)
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    if (socket) {
      socket.emit("logout_user", user?._id);
      socket.disconnect();
    }
    setUser(null);
    setSocket(null);
    window.socket = null;
    socketConnecting.current = false;
  }, [socket, user?._id]);

  // 🛠️ ৪. সকেট ম্যানেজমেন্ট (Optimized for single connection)
  useEffect(() => {
    let socketInstance = null;

    // ইউজার থাকলে এবং সকেট কানেকশন ইতিমধ্যে না থাকলে তবেই কানেক্ট হবে
    if (user?._id && !socketConnecting.current) {
      socketConnecting.current = true;
      const currentUserId = user._id;

      socketInstance = io(BASE_URL, {
        query: { userId: currentUserId },
        transports: ['websocket', 'polling'], // অটো-ফলব্যাক অপশন রাখা ভালো
        reconnection: true,
        reconnectionAttempts: 10, 
        reconnectionDelay: 2000,
        secure: true,
        withCredentials: true
      });

      socketInstance.on("connect", () => {
        console.log("%c 🚀 Neural link active: " + socketInstance.id, "color: #06b6d4; font-weight: bold;");
        window.socket = socketInstance;
        socketInstance.emit("addNewUser", currentUserId);
        setSocket(socketInstance);
      });

      socketInstance.on("connect_error", (err) => {
        console.warn("📡 Signal Pending/Error. Adjusting transports...");
      });

      const interval = setInterval(() => {
        if (socketInstance?.connected) {
          socketInstance.emit("heartbeat", currentUserId);
        }
      }, 30000);

      return () => {
        clearInterval(interval);
        if (socketInstance) {
          socketInstance.disconnect();
          window.socket = null;
          socketConnecting.current = false;
          console.log("📡 Neural link closed.");
        }
      };
    }
  }, [user?._id]); 

  // 🛠️ ৫. সেশন রিকভারি (Mounting logic optimized)
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
        console.error("Neural Recovery Error:", err);
        // যদি টোকেন এক্সপায়ার হয় তবে ক্লিনআপ
        if (isMounted) clearAuthData();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();
    return () => { isMounted = false; };
  }, [api, clearAuthData]);

  // 🛠️ ৬. অথেনটিকেশন মেথডসমূহ
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
    // রিফ্রেশ দিয়ে ক্লিন এনভায়রনমেন্ট নিশ্চিত করা
    window.location.href = '/';
  }, [clearAuthData]);

  const contextValue = useMemo(() => ({
    user, 
    socket, 
    loading, 
    login, 
    signup, 
    logout,
    isAuthenticated: !!user,
    api 
  }), [user, socket, loading, login, signup, logout, api]);

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