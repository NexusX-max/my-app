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
  const host = window.location.hostname;
  
  // If we are testing on Google AI Studio's preview sandboxes or running locally
  if (
    host === "localhost" || 
    host === "127.0.0.1" || 
    host.includes("run.app") || 
    host.includes("ais-") || 
    host.includes("webcontainer")
  ) {
    return window.location.origin;
  }
  
  // Otherwise, fallback to your custom Render/production URLs
  return API_NODES[0] || "https://www.onyx-drift.com"; 
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

  // Configure Axios Instance
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

  // Data cleanup (logout logic)
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

  // Socket connection & active call signaling setup
  useEffect(() => {
    let socketInstance = null;

    if (user?._id && !socketConnecting.current) {
      socketConnecting.current = true;
      const currentUserId = user._id;

      socketInstance = io(BASE_URL, {
        query: { userId: currentUserId },
        transports: ['polling', 'websocket'], 
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
        if (typeof Notification !== 'undefined' && Notification.permission === "granted") {
          new Notification(`Onyx Call from ${data.name}`, { body: `Tap to accept ${data.type} link.` });
        }
        
        sessionStorage.setItem("onyx_incoming_signal", JSON.stringify(data.signalData || data.signal));
        sessionStorage.setItem("onyx_caller_id", data.from);
        sessionStorage.setItem("onyx_caller_name", data.name || "Unknown Link");
        sessionStorage.setItem("onyx_caller_avatar", data.avatar || "");
        sessionStorage.setItem("onyx_call_type", data.type);
        sessionStorage.setItem("onyx_call_room", data.roomId); // Call UI roomId
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

  // Session Recovery
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) { 
        // Fallback or temporary local user initialization if token is missing
        const activeUserId = localStorage.getItem('onyx_selected_user_id') || 'me';
        const savedProfile = localStorage.getItem('onyx_profile_node');
        let defaultProfile = savedProfile ? JSON.parse(savedProfile) : {
          _id: "me",
          firstName: "Operator",
          lastName: "Node",
          username: "me_operator",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
          bio: "Rogue Quantum Deck Architect"
        };
        
        if (activeUserId !== 'me' && (!savedProfile || JSON.parse(savedProfile)._id !== activeUserId)) {
          const match = [
            { _id: "user-kaelen", firstName: "Kaelen", lastName: "Vex", username: "kaelen_deck", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", bio: "Underground network decker and freelance ingress engineer." },
            { _id: "user-sasha", firstName: "Sasha", lastName: "Glimmer", username: "sasha_design", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", bio: "Synthetic interface architect." }
          ].find(u => u._id === activeUserId);
          if (match) {
            defaultProfile = match;
          }
        }
        
        setUser(defaultProfile);
        setLoading(false); 
        return; 
      }

      try {
        const res = await api.get('/auth/me'); 
        if (isMounted) setUser(res.data.user || res.data);
      } catch (err) {
        if (isMounted) {
          // If auth fails on real backend, fallback to default local operator
          const activeUserId = localStorage.getItem('onyx_selected_user_id') || 'me';
          const savedProfile = localStorage.getItem('onyx_profile_node');
          let defaultProfile = savedProfile ? JSON.parse(savedProfile) : {
            _id: "me",
            firstName: "Operator",
            lastName: "Node",
            username: "me_operator",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
            bio: "Rogue Quantum Deck Architect"
          };
          if (activeUserId !== 'me' && (!savedProfile || JSON.parse(savedProfile)._id !== activeUserId)) {
            const match = [
              { _id: "user-kaelen", firstName: "Kaelen", lastName: "Vex", username: "kaelen_deck", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", bio: "Underground network decker and freelance ingress engineer." },
              { _id: "user-sasha", firstName: "Sasha", lastName: "Glimmer", username: "sasha_design", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", bio: "Synthetic interface architect." }
            ].find(u => u._id === activeUserId);
            if (match) {
              defaultProfile = match;
            }
          }
          setUser(defaultProfile);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initAuth();
    return () => { isMounted = false; };
  }, [api, clearAuthData]);

  // Handle local switching of operative profile identities
  const switchUser = useCallback((userId) => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.setItem('onyx_selected_user_id', userId);
    
    if (socket) {
      socket.disconnect();
    }
    setSocket(null);
    socketConnecting.current = false;
    
    let profile = {
      _id: "me",
      firstName: "Operator",
      lastName: "Node",
      username: "me_operator",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      bio: "Rogue Quantum Deck Architect"
    };
    
    if (userId !== 'me') {
      const match = [
        { _id: "user-kaelen", firstName: "Kaelen", lastName: "Vex", username: "kaelen_deck", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", bio: "Underground network decker and freelance ingress engineer." },
        { _id: "user-sasha", firstName: "Sasha", lastName: "Glimmer", username: "sasha_design", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80", bio: "Synthetic interface architect." }
      ].find(u => u._id === userId);
      if (match) profile = match;
    }
    
    setUser(profile);
    localStorage.setItem('onyx_profile_node', JSON.stringify({
      name: `${profile.firstName} ${profile.lastName}`,
      avatar: profile.avatar,
      bio: profile.bio,
      _id: profile._id
    }));
  }, [socket]);

  // Auth Actions
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
    user, socket, loading, login, signup, logout, switchUser,
    isAuthenticated: !!user, api, currentNode: BASE_URL 
  }), [user, socket, loading, login, signup, logout, switchUser, api]);

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
