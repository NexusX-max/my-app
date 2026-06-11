import React, { createContext, useState, useEffect, useContext, useMemo, useCallback, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

// ✅ ১. ডাইনামিক এপিআই ইউআরএল
const getLiveNode = () => {
  // আপনার মূল প্রোডাকশন ইউআরএল এখানে সেট করুন
  const PRODUCTION_URL = "https://my-app-v6xz.onrender.com";
  
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://localhost:5005";
  }
  return PRODUCTION_URL;
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

  // 🛠️ ২. Axios Instance
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    });

    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token && !token.startsWith("sandbox_token_signature_")) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, []);

  // 🛠️ ৩. ডাটা ক্লিনআপ
  const clearAuthData = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    if (socket) {
      socket.disconnect();
    }
    setUser(null);
    setSocket(null);
    socketConnecting.current = false;
  }, [socket]);

  // 🛠️ ৪. সকেট ম্যানেজমেন্ট
  useEffect(() => {
    if (!user?._id || socketConnecting.current) return;

    socketConnecting.current = true;
    const socketInstance = io(BASE_URL, {
      query: { userId: user._id },
      transports: ['websocket'], // মোবাইল অ্যাপের জন্য শুধুমাত্র websocket সেরা
      secure: true,
      withCredentials: true
    });

    socketInstance.on("connect", () => {
      console.log("🚀 Neural link active");
      setSocket(socketInstance);
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("📡 Signal Pending:", err.message);
    });

    return () => {
      socketInstance.disconnect();
      socketConnecting.current = false;
    };
  }, [user?._id]); 

  // 🛠️ ৫. সেশন রিকভারি
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        setLoading(false);
        return;
      }

      // স্যান্ডবক্স ইউজার হ্যান্ডলিং
      if (token.startsWith("sandbox_token_signature_")) {
        const uId = token.replace("sandbox_token_signature_", "");
        setUser({ _id: uId, username: "Operator" });
        setLoading(false);
        return;
      }

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

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    clearAuthData();
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, socket, loading, login, logout, api }}>
      {!loading ? children : (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="text-cyan-500 animate-pulse">Syncing_Neural_Core...</div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;