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
  
  // AuthContext থেকে গ্লোবাল সকেট এবং নোটিফিকেশন স্টেটগুলো নিয়ে আসা হলো
  const { 
    user, 
    loading, 
    api, 
    socket, 
    globalIncomingCall, 
    globalNotification, 
    clearGlobalCallState 
  } = useContext(AuthContext);
  
  const [reelsData, setReelsData] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(true);

  // Audio Refs (হাই-কোয়ালিটি অডিও লিংক)
  const msgSound = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"));
  const ringtone = useRef(new Audio("https://assets.mixkit.co/active_storage/sfx/1357/1357-84.wav"));

  /* ==========================================================
      ⚡ NEURAL NOTIFICATION & CALL ENGINE (সকেট ইভেন্ট সিঙ্ক)
  ========================================================== */
  useEffect(() => {
    if (user && socket) {
      const onConnect = () => {
        console.log("%c 🚀 Onyx Link Active: " + socket.id, "color: #06b6d4; font-weight: bold;");
        socket.emit("addNewUser", user._id);
        socket.emit("registerUser", user._id); // কল ট্র্যাকিংয়ের জন্য ব্যাকএন্ডের সাথে সিঙ্ক
      };

      // গ্লোবাল পুশ বা মেসেজ নোটিফিকেশন আসলে
      const onNotification = (data) => {
        msgSound.current.play().catch(() => {});
        const senderName = data?.senderName || "Onyx Drifter";
        toast(`${senderName}: ${data?.content || data?.text || "sent a quantum transmission"}`, {
          icon: '💬',
          style: {
            borderRadius: '16px',
            background: '#09090b',
            color: '#06b6d4',
            border: '1px solid rgba(6,182,212,0.2)',
            fontSize: '11px',
            fontFamily: 'monospace',
            backdropBlur: '12px'
          },
        });
      };

      // 📞 ইনকামিং কল রিসিভ লিসেনার (কোড নেমিং ফিক্সড: $incomingCall)
      const onIncomingCall = (data) => {
        if (data.from === user._id) return; // নিজের করা কল ফিল্টার

        ringtone.current.loop = true;
        ringtone.current.play().catch(() => console.log("Ringtone muted by browser autoplay rules. Wait for click."));

        toast((t) => (
          <div className="flex flex-col gap-3 p-2 min-w-[240px] font-sans selection:bg-transparent">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-cyan-500 animate-ping rounded-full" />
              <div className="flex flex-col">
                <span className="text-[12px] font-black uppercase text-white tracking-wide">
                  Incoming {data?.type || 'video'} Call
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  Node: {data?.name || 'Anonymous'}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <button 
                onClick={() => {
                  ringtone.current.pause();
                  ringtone.current.currentTime = 0;
                  toast.dismiss(t.id);
                  if (clearGlobalCallState) clearGlobalCallState(); // গ্লোবাল স্টেট রিসেট

                  // কলিং পেজে রাউট এবং সিগন্যাল ডাটা পাস
                  navigate(`/call/${data.roomId || data.from}`, { 
                    state: { 
                      incomingSignal: data.signalData || data.signal, 
                      callerId: data.from,
                      callType: data.type || 'video'
                    } 
                  });
                }}
                className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                Accept
              </button>
              <button 
                onClick={() => {
                  ringtone.current.pause();
                  ringtone.current.currentTime = 0;
                  toast.dismiss(t.id);
                  if (clearGlobalCallState) clearGlobalCallState();
                  socket.emit("endCall", { to: data.from });
                }}
                className="flex-1 bg-zinc-800 hover:bg-red-950/40 text-red-400 border border-red-500/20 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all"
              >
                Decline
              </button>
            </div>
          </div>
        ), {
          duration: 35000, // ৩৫ সেকেন্ড পর্যন্ত রিং হবে
          position: "top-center",
          style: { background: '#09090b', color: '#fff', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '24px' }
        });
      };

      const onCallEnded = () => {
        ringtone.current.pause();
        ringtone.current.currentTime = 0;
        toast.dismiss();
        if (clearGlobalCallState) clearGlobalCallState();
      };

      socket.on("connect", onConnect);
      socket.on("getNotification", onNotification);
      socket.on("getMessage", onNotification); // চ্যাট মেসেজের জন্যও গ্লোবাল পপ-আপ অ্যালার্ট
      socket.on("$incomingCall", onIncomingCall); // ওনিক্স স্ট্যান্ডার্ড $ সিগন্যালিং
      socket.on("incomingCall", onIncomingCall);  // ফলব্যাক সিকিউরিটি
      socket.on("callEnded", onCallEnded);
      socket.on("endCall", onCallEnded);

      return () => {
        socket.off("connect", onConnect);
        socket.off("getNotification", onNotification);
        socket.off("getMessage", onNotification);
        socket.off("$incomingCall", onIncomingCall);
        socket.off("incomingCall", onIncomingCall);
        socket.off("callEnded", onCallEnded);
        socket.off("endCall", onCallEnded);
      };
    }
  }, [user, socket, navigate, clearGlobalCallState]);

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
      {/* গ্লোবাল টোস্ট কন্টেইনার */}
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