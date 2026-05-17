import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FaCommentDots, FaCog, FaPhoneAlt, FaVideo, FaTimes, FaCheck 
} from 'react-icons/fa';

import { AuthContext } from '../context/AuthContext';
import SearchScreen from './SearchScreen'; 
import ChatInterface from './ChatInterface';
import SettingsScreen from './SettingsScreen'; // SettingsScreen ইমপোর্ট করা হলো

// --- Sound Assets ---
const MSG_SOUND = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"; 
const CALL_SOUND = "https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3";

const getAvatarUrl = (target) => {
  if (!target) return `https://ui-avatars.com/api/?name=User&background=27272a&color=fff`;
  const pic = target.profilePic || target.avatar || target.profileImage;
  if (pic && typeof pic === 'string' && pic.startsWith('http')) return pic;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(target.fullName || target.name || target.username || "Onyx")}&background=06b6d4&color=fff&bold=true`;
};

const OnyxMessengerHome = () => {
  const { user, socket } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  const msgAudio = useRef(new Audio(MSG_SOUND));
  const callAudio = useRef(new Audio(CALL_SOUND));

  // চ্যাট লিস্ট স্টেট (Local Storage sync সহ)
  const [chatList, setChatList] = useState(() => {
    const savedChats = localStorage.getItem('onyx_recent_connections');
    return savedChats ? JSON.parse(savedChats) : [
      { _id: "u1", fullName: "Onyx Support", lastMsg: "System status: Optimal.", time: "Online", online: true },
    ];
  });

  useEffect(() => {
    localStorage.setItem('onyx_recent_connections', JSON.stringify(chatList));
  }, [chatList]);

  /* ==========================================================
      ⚡ NEURAL SIGNAL HANDLING (Socket Logic)
  ========================================================== */
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (data) => {
      if (data.isIncomingCall || data.isCallSignal) return;

      setChatList(prev => {
        const filtered = prev.filter(c => c._id !== data.senderId);
        const updatedChat = {
          _id: data.senderId,
          fullName: data.senderName || "Unknown Node",
          lastMsg: data.text || "Encrypted transmission...",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          online: true,
          profilePic: data.senderAvatar || null
        };
        return [updatedChat, ...filtered];
      });

      if (!selectedChat || selectedChat._id !== data.senderId) {
        msgAudio.current.play().catch(() => {});
      }
    };

    const handleIncomingCall = (data) => {
      setIncomingCall(data);
      callAudio.current.loop = true;
      callAudio.current.play().catch(e => console.warn("Audio blocked by browser policy"));
    };

    const handleCallEnded = () => {
      setIncomingCall(null);
      callAudio.current.pause();
      callAudio.current.currentTime = 0;
    };

    socket.on("getMessage", handleIncomingMessage);
    socket.on("$incomingCall", handleIncomingCall);
    socket.on("callEnded", handleCallEnded);

    return () => {
      socket.off("getMessage", handleIncomingMessage);
      socket.off("$incomingCall", handleIncomingCall);
      socket.off("callEnded", handleCallEnded);
    };
  }, [socket, selectedChat]);
/* ==========================================================
      📞 CALL ACTIONS (Fixed: Emitting Socket Signal Like Chat)
  ========================================================== */
  const initiateCall = useCallback((targetUser, type) => {
    // ১. ভ্যালিডেশন চেক (আইডি ঠিক আছে কি না)
    const targetId = targetUser?._id || targetUser?.id;
    if (!targetId || !user?._id || !socket) {
      console.warn("📡 Onyx Engine: Cannot initiate call. Socket or User ID missing.");
      return;
    }

    const roomId = [user._id, targetId].sort().join("-"); 
    
    // 🎯 চ্যাটের মতো এখানেও সকেট ইমিট করতে হবে, যাতে ব্যাকএন্ড অন্য আইডিতে সিগন্যাল পাঠাতে পারে
    socket.emit("callUser", {
      userToCall: targetId,                 // যার কাছে কল যাবে (Other ID)
      signalData: null,                     // প্রাথমিক হ্যান্ডশেক পালস
      from: user._id,                       // আমার আইডি
      name: user.fullName || "Onyx Node",   // আমার নাম (যাতে রিসিভারের স্ক্রিনে নাম দেখায়)
      avatar: user.profilePic || null,
      type: type,                           // 'audio' অথবা 'video'
      roomId: roomId
    });

    console.log(`📡 Outbound Pulse Emitted to Node: ${targetId}`);

    // কল স্ক্রিনে নেভিগেট করা
    navigate(`/call/${roomId}?type=${type}&mode=outbound`);
  }, [user, socket, navigate]);

  const acceptCall = () => {
    if (!incomingCall || !user || !socket) return;
    
    callAudio.current.pause();
    callAudio.current.currentTime = 0;
    
    const roomId = incomingCall.roomId || [user._id, incomingCall.from].sort().join("-");
    const callType = incomingCall.callType || incomingCall.type || 'video';
    
    // 🎯 কল অ্যাকসেপ্ট করার পর ওনিক্স নেটওয়ার্কের ওপারে থাকা কলারকে সকেট দিয়ে জানানো
    socket.emit("answerCall", { 
      to: incomingCall.from, 
      signal: incomingCall.signalData,
      roomId: roomId 
    });

    navigate(`/call/${roomId}?type=${callType}&mode=inbound`, {
      state: { incomingSignal: incomingCall.signalData, callerId: incomingCall.from }
    });
    
    setIncomingCall(null);
  };
  

  /* ==========================================================
      🎯 USER SELECTION
  ========================================================== */
  const handleUserSelect = useCallback((u) => {
    if (!u) return;
    
    const userId = u._id || u.id;
    if (!userId) return;

    const normalizedUser = {
      _id: userId,
      fullName: u.fullName || u.name || u.username || "Drifter",
      profilePic: u.profilePic || u.avatar || u.profileImage,
      lastMsg: "Neural link established",
      time: "Just now",
      online: true
    };

    setChatList(prev => {
      const filtered = prev.filter(c => c._id !== userId);
      return [normalizedUser, ...filtered];
    });

    setSelectedChat(normalizedUser);
    setShowSearch(false);
  }, []);

  return (
    <div className="bg-black h-[100dvh] text-white flex flex-col overflow-hidden font-sans select-none">
      
      {activeTab === 'chats' ? (
        <>
          {/* Header */}
          <header className="p-6 pb-2 sticky top-0 bg-black z-40 border-b border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter">
                ONYX<span className="text-cyan-500">CHAT</span>
              </h2>
              <div 
                onClick={() => navigate('/my-profile')} 
                className="flex items-center gap-3 bg-zinc-900/50 p-1.5 pr-4 rounded-2xl border border-white/5 cursor-pointer active:scale-95 transition-transform"
              >
                <img src={getAvatarUrl(user)} className="w-8 h-8 rounded-xl object-cover border border-white/10" alt="me" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  {user?.fullName?.split(' ')[0] || "Drifter"}
                </span>
              </div>
            </div>
            
            {/* Search Bar Trigger */}
            <div 
              onClick={() => setShowSearch(true)} 
              className="relative mb-4 bg-zinc-900/40 border border-white/5 rounded-2xl py-4 pl-5 cursor-text text-zinc-500 text-[11px] uppercase tracking-widest hover:bg-zinc-900/60 transition-all flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              Search neural nodes...
            </div>
          </header>

          {/* Main Content: Chat List */}
          <main className="flex-1 overflow-y-auto px-6 pb-32 no-scrollbar pt-4">
            <div className="space-y-3">
              {chatList.map((chat) => (
                <motion.div 
                  layout 
                  key={chat._id} 
                  className="flex items-center gap-4 p-4 rounded-[1.8rem] bg-zinc-900/20 border border-white/5 hover:border-cyan-500/30 transition-all group"
                >
                  <div 
                    onClick={() => setSelectedChat(chat)} 
                    className="flex flex-1 items-center gap-4 cursor-pointer min-w-0"
                  >
                    <div className="relative shrink-0">
                      <img src={getAvatarUrl(chat)} className="w-12 h-12 rounded-2xl object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" alt="" />
                      {chat.online && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-[3px] border-black rounded-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-zinc-100 truncate">{chat.fullName}</h4>
                      <p className="text-[11px] text-zinc-500 truncate">{chat.lastMsg}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 shrink-0">
                     <button 
                      onClick={(e) => { e.stopPropagation(); initiateCall(chat, 'audio'); }} 
                      className="p-3.5 rounded-xl bg-zinc-800/50 text-zinc-400 hover:bg-cyan-500 hover:text-black transition-all"
                     >
                       <FaPhoneAlt size={12} />
                     </button>
                     <button 
                      onClick={(e) => { e.stopPropagation(); initiateCall(chat, 'video'); }} 
                      className="p-3.5 rounded-xl bg-zinc-800/50 text-zinc-400 hover:bg-purple-500 hover:text-white transition-all"
                     >
                       <FaVideo size={12} />
                     </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </main>
        </>
      ) : (
        /* Settings Tab: আপনার নতুন SettingsScreen এখানে লোড হবে */
        <SettingsScreen onBack={() => setActiveTab('chats')} />
      )}

      {/* Navigation Bar */}
      <nav className="fixed bottom-8 left-8 right-8 h-20 bg-black/80 backdrop-blur-3xl border border-white/10 rounded-[35px] flex items-center justify-around z-40 shadow-2xl">
        <button onClick={() => setActiveTab('chats')} className={`transition-all p-4 ${activeTab === 'chats' ? 'text-cyan-500 scale-125' : 'text-zinc-600'}`}><FaCommentDots size={22} /></button>
        <button onClick={() => setActiveTab('settings')} className={`transition-all p-4 ${activeTab === 'settings' ? 'text-cyan-500 scale-125' : 'text-zinc-600'}`}><FaCog size={22} /></button>
      </nav>

      {/* Overlays */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md p-6">
            <div className="w-full max-w-sm bg-zinc-900 border border-white/10 rounded-[40px] p-8 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500 animate-pulse" />
              <img src={getAvatarUrl({ name: incomingCall.name, profilePic: incomingCall.avatar })} className="w-24 h-24 rounded-[30px] mx-auto mb-6 border-2 border-cyan-500/30 p-1 object-cover" alt="caller" />
              <h3 className="text-xl font-black uppercase mb-1 tracking-tight">{incomingCall.name || "Unknown Link"}</h3>
              <p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.4em] mb-10 animate-pulse">Incoming Pulse</p>
              <div className="flex justify-center gap-10">
                <button onClick={declineCall} className="w-16 h-16 flex items-center justify-center bg-zinc-800 hover:bg-red-600 rounded-full text-white transition-all shadow-lg"><FaTimes size={24} /></button>
                <button onClick={acceptCall} className="w-16 h-16 flex items-center justify-center bg-cyan-600 hover:bg-cyan-500 rounded-full text-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"><FaCheck size={24} /></button>
              </div>
            </div>
          </motion.div>
        )}

        {showSearch && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "tween" }} className="fixed inset-0 z-[6000] bg-black">
            <SearchScreen onSelect={handleUserSelect} onBack={() => setShowSearch(false)} />
          </motion.div>
        )}

        {selectedChat && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 30, stiffness: 200 }} className="fixed inset-0 z-[5000] bg-black">
            <ChatInterface activeChat={selectedChat} onBack={() => setSelectedChat(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnyxMessengerHome;