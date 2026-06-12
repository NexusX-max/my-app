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
    }, (error) => Promise.reject(error));

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
    let socketInstance = null;

    if (user?._id && !socketConnecting.current) {
      socketConnecting.current = true;
      const currentUserId = user._id;

      socketInstance = io(BASE_URL, {
        query: { userId: currentUserId },
        transports: ['websocket', 'polling'],
        secure: true,
        withCredentials: true
      });

      socketInstance.on("connect", () => {
        console.log("🚀 Neural link active:", socketInstance.id);
        socketInstance.emit("addNewUser", currentUserId);
        setSocket(socketInstance);
        socketConnecting.current = false;
      });

      return () => {
        if (socketInstance) socketInstance.disconnect();
        socketConnecting.current = false;
      };
    }
  }, [user?._id]);

  // 🛠️ ৫. সেশন রিকভারি
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      let token = localStorage.getItem(TOKEN_KEY);
      
      if (!token) {
        setLoading(false);
        return;
      }

      if (token.startsWith("sandbox_token_signature_")) {
        const uId = token.replace("sandbox_token_signature_", "");
        setUser({ _id: uId, username: "operator", firstName: "Operator", lastName: "Node" });
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (isMounted) setUser(res.data.user || res.data);
      } catch (err) {
        console.error("Neural Recovery Error:", err);
        clearAuthData();
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
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
    return res.data;
  }, [api]);

  const signup = useCallback(async (formData) => {
    const res = await api.post('/auth/register', formData);
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
    return res.data;
  }, [api]);

  const logout = useCallback(() => {
    clearAuthData();
    window.location.href = '/login';
  }, [clearAuthData]);

  // 🛠️ ৭. Context Value (এখানেই কমা দেওয়া হয়েছে)
  const contextValue = useMemo(() => ({
    user,
    socket,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    api,
    currentNode: BASE_URL
  }), [user, socket, loading, login, signup, logout, api]);

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading ? children : (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center">
            <div className="text-cyan-500 font-mono animate-pulse uppercase tracking-[0.4em] text-[10px]">
              Syncing_Neural_Core...
            </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;