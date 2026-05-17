import React, { Suspense, useContext, useState, useEffect, useRef } from "react";
import { Routes, Route, useLocation, Navigate, useParams, useNavigate } from "react-router-dom";
import { Toaster, toast } from 'react-hot-toast';
import { AuthContext } from './context/AuthContext';

// UI Components
import Sidebar from "./components/Sidebar";
import CustomCursor from "./components/CustomCursor";
import MobileNav from "./components/MobileNav";
import OnyxAI from "./components/OnyxAI"; 
import Notification from "./components/NotificationSystem";

// Pages
import PremiumHomeFeed from "./pages/PremiumHomeFeed";
import Messenger from "./pages/Messenger";
import ProfilePage from "./pages/Profile.jsx";
import Settings from "./pages/Settings";
import ReelsFeed from "./pages/ReelsFeed";
import LoginPage from "./pages/LoginPage"; 
import JoinPage from "./pages/JoinPage";
import CallPage from "./pages/CallPage";
import FollowingPage from "./pages/FollowingPage"; 
import ReelsEditor from "./pages/ReelsEditor";
import ForgotPassword from "./pages/ForgotPassword";
import PublicProfile from "./pages/PublicProfile.jsx";
import PostDetails from "./pages/PostDetails"; 
import SearchScreen from './pages/SearchScreen';

// --- Protected Route Helper ---
const Protected = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  if (loading) return null; 
  return user ? children : <Navigate to="/" state={{ from: location }} replace />;
};

// --- Profile Switcher ---
const ProfileSwitch = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const cleanId = id?.startsWith(':') ? id.slice(1) : id;
  return user && (cleanId === user._id || cleanId === user.id) ? <ProfilePage /> : <PublicProfile />;
};

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate(); 
  const { user, loading, api, socket } = useContext(AuthContext);
  
  const [reelsData, setReelsData] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(true);

  // Audio Refs
  const msgSound = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"));
  const ringtone = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3"));

  /* ==========================================================
      ⚡ NEURAL NOTIFICATION & GLOBAL CALL ENGINE (Fixed Sync)
  ========================================================== */
  useEffect(() => {
    if (user && socket) {
      const onConnect = () => {
        console.log("%c 🚀 Neural link established: " + socket.id, "color: #06b6d4; font-weight: bold;");
        socket.emit("addNewUser", user._id);
      };

      const onNotification = (data) => {
        msgSound.current.play().catch(() => {});
        const senderName = data?.senderName || "Onyx Member";
        toast(`${senderName}: ${data?.content || "sent a signal"}`, {
          icon: '🔔',
          style: {
            borderRadius: '12px',
            background: '#0a0a0a',
            color: '#06b6d4',
            border: '1px solid rgba(6,182,212,0.2)',
            fontSize: '11px',
            fontFamily: 'monospace'
          },
        });
      };

      // 🎯 FIXED: ওনিক্স ব্যাকএন্ডের সাথে ম্যাচ রেখে ইভেন্টের নাম "$incomingCall" করা হলো
      const onIncomingCall = (data) => {
        ringtone.current.loop = true;
        ringtone.current.play().catch(() => console.log("Audio blocked by browser"));

        // ডাটা স্ট্রাকচার সেফটি ব্যাকআপ
        const finalRoomId = data?.roomId || [user._id, data?.from].sort().join("-");
        const callType = data?.type || data?.callType || 'video';

        toast((t) => (
          <div className="flex flex-col gap-3 p-1 min-w-[220px]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 animate-ping rounded-full" />
              <span className="text-[11px] font-bold uppercase tracking-tighter">
                Incoming {callType} call from {data?.name || 'Unknown Node'}
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  ringtone.current.pause();
                  ringtone.current.currentTime = 0;
                  toast.dismiss(t.id);
                  
                  // 🎯 FIXED: রাউটিং সরাসরি প্রপার roomId এবং স্টেটে ট্রান্সমিট হবে
                  navigate(`/call/${finalRoomId}?type=${callType}&mode=inbound`, { 
                    state: { 
                      incomingSignal: data?.signalData || data?.signal, 
                      callerId: data?.from,
                      callerName: data?.name || "Onyx Node",
                      callType: callType 
                    } 
                  });
                }}
                className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-lg text-[10px] font-black uppercase text-white transition-all shadow-[0_0_15px_rgba(22,163,74,0.4)]"
              >
                Accept
              </button>
              <button 
                onClick={() => {
                  ringtone.current.pause();
                  ringtone.current.currentTime = 0;
                  toast.dismiss(t.id);
                  socket.emit("endCall", { to: data?.from });
                }}
                className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-500 py-2 rounded-lg text-[10px] font-black uppercase transition-all"
              >
                Decline
              </button>
            </div>
          </div>
        ), {
          duration: 30000,
          position: "top-center",
          style: { background: '#0a0a0a', color: '#fff', border: '1px solid #22c55e' }
        });
      };

      const onCallEnded = () => {
        ringtone.current.pause();
        ringtone.current.currentTime = 0;
        toast.dismiss();
      };

      socket.on("connect", onConnect);
      socket.on("getNotification", onNotification);
      socket.on("$incomingCall", onIncomingCall); // 🎯 FIXED
      socket.on("callEnded", onCallEnded);

      return () => {
        socket.off("connect", onConnect);
        socket.off("getNotification", onNotification);
        socket.off("$incomingCall", onIncomingCall); // 🎯 FIXED
        socket.off("callEnded", onCallEnded);
      };
    }
  }, [user, socket, navigate]);

  /* ==========================================================
      🎬 REELS SYNC LOGIC
  ========================================================== */
  useEffect(() => {
    if (user && location.pathname === "/reels") {
      const fetchReels = async () => {
        try {
          const res = await api.get('/reels'); 
          setReelsData(res.data || []);
        } catch (err) {
          console.error("Reels sync failed:", err);
        } finally {
          setReelsLoading(false);
        }
      };
      fetchReels();
    }
  }, [user, location.pathname, api]);

  if (loading) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center gap-6 text-cyan-500 font-mono tracking-[0.5em] uppercase text-center">
        <div className="w-16 h-16 border-2 border-cyan-500/5 border-t-cyan-500 rounded-full animate-spin" />
        <span className="text-[10px] font-black animate-pulse">Initializing_Neural_Network...</span>
      </div>
    );
  }

  const authRoutes = ["/", "/join", "/forgot-password"];
  const isAuthPage = authRoutes.includes(location.pathname) || location.pathname.startsWith("/reset-password/");
  const isMessenger = location.pathname.startsWith("/messages");
  const isReels = location.pathname === "/reels";
  const showNav = user && !isAuthPage && !isMessenger && !isReels;

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 selection:bg-cyan-500/30 overflow-x-hidden relative">
      <Toaster position="top-right" />
      <CustomCursor />

      {!isMessenger && !isReels && (
        <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_-10%,_#06b6d4_0%,_transparent_70%)] z-0" />
      )}

      <div className="flex w-full min-h-screen relative">
        {showNav && (
          <aside className="hidden md:block fixed left-0 top-0 h-full w-64 z-[100] bg-black/40 backdrop-blur-3xl border-r border-white/5">
            <Sidebar />
          </aside>
        )}

        <main className={`flex-1 min-h-screen relative z-10 transition-all duration-500 ${showNav ? 'md:pl-64' : ''}`}>
          <Suspense fallback={<div className="h-full w-full flex items-center justify-center text-cyan-500/30 font-mono text-[9px] tracking-widest uppercase">Syncing_Neural_Link...</div>}>
            <div className={`w-full h-full ${showNav ? 'pb-20 md:pb-0' : ''}`}>
              <Routes>
                <Route path="/" element={user ? <Navigate to="/feed" replace /> : <LoginPage />} />
                <Route path="/join" element={user ? <Navigate to="/feed" replace /> : <JoinPage />} />
                <Route path="/forgot-password" element={user ? <Navigate to="/feed" replace /> : <ForgotPassword />} />
                
                <Route path="/feed" element={<Protected><PremiumHomeFeed /></Protected>} />
                <Route path="/reels" element={<Protected><ReelsFeed reels={reelsData} loading={reelsLoading} /></Protected>} />
                <Route path="/following" element={<Protected><FollowingPage /></Protected>} />
                <Route path="/post/:id" element={<Protected><PostDetails /></Protected>} />
                <Route path="/profile/:id" element={<Protected><ProfileSwitch /></Protected>} />
                
                <Route path="/search" element={
                  <Protected>
                    <SearchScreen 
                      onBack={() => navigate(-1)} 
                      onSelectUser={(u) => navigate(`/messages/${u._id || u.id}`)} 
                    />
                  </Protected>
                } />
                
                <Route path="/my-profile" element={<Protected><ProfilePage /></Protected>} />
                <Route path="/notifications" element={<Protected><div className="max-w-2xl mx-auto p-10"><Notification /></div></Protected>} />
                <Route path="/messages" element={<Protected><Messenger /></Protected>} />
                <Route path="/messages/:id" element={<Protected><Messenger /></Protected>} />
                <Route path="/settings" element={<Protected><Settings /></Protected>} />
                <Route path="/call/:roomId" element={<Protected><CallPage /></Protected>} />
                <Route path="/onyx-ai" element={<Protected><div className="pt-10 max-w-2xl mx-auto px-4"><OnyxAI /></div></Protected>} />
                <Route path="/reels-editor" element={<Protected><ReelsEditor /></Protected>} />
                <Route path="/reels-editor/:id" element={<Protected><ReelsEditor /></Protected>} />
                <Route path="/following/:id" element={<Protected><PublicProfile /></Protected>} />
                <Route path="*" element={<Navigate to={user ? "/feed" : "/"} replace />} />
              </Routes>
            </div>
          </Suspense>

          {showNav && (
            <div className="md:hidden fixed bottom-0 left-0 w-full z-[1000] border-t border-white/5 bg-black/80 backdrop-blur-3xl">
                <MobileNav />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default AppContent;