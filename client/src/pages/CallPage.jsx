import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";
import { 
  FaArrowLeft, FaPhone, FaVideo, FaPaperPlane, FaMicrophone, 
  FaLock, FaPlus, FaCheck, FaCheckDouble
} from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const ONYX_SECRET_KEY = "onyx_neural_shield_2026"; 

// --- ZegoCloud Neural Environment Config ---
const ZEGO_APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID) || 1822629215;
const ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET || "c90ccf1f9bf7ee0e27a29539fc4d03ed";

// --- Encryption Helpers ---
const encryptMessage = (text) => CryptoJS.AES.encrypt(text, ONYX_SECRET_KEY).toString();
const decryptMessage = (cipherText) => {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, ONYX_SECRET_KEY);
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return originalText || "⚠️ Decryption Error";
    } catch (err) { return "⚠️ Encryption Mismatch"; }
};

// --- Avatar Helper ---
const getAvatarUrl = (target) => {
  if (!target) return `https://ui-avatars.com/api/?name=User&background=27272a&color=fff`;
  const pic = target.profilePic || target.avatar || target.profileImage || target.userAvatar;
  if (pic && typeof pic === 'string' && pic.startsWith('http')) return pic;
  const name = target.fullName || target.name || "Onyx";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=06b6d4&color=fff&bold=true`;
};

const CallPage = ({ activeChat, onBack, isGroup = false }) => {
  const { user, socket } = useContext(AuthContext);
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  
  // ✅ আইডি হ্যান্ডলিং এখানে সম্পূর্ণ সেফগার্ড করা হলো যেন কোনোভাবেই ভুল আইডি জেনারেট না হয়
  const chatId = activeChat?._id || activeChat?.id;
  const chatName = activeChat?.fullName || activeChat?.name || "Neural Node";
  const storageKey = isGroup ? `group_chat_${chatId}` : `chat_${chatId}`;
  
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [{ id: 'sys-1', text: "Neural link established. E2EE Active. 🔐", sender: 'system' }];
  });
  
  const [msg, setMsg] = useState("");
  const [isListening, setIsListening] = useState(false);

  // ১. পুশ নোটিফিকেশন পারমিশন
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // ২. ইনকামিং মেসেজ লিসেনার
  const handleGetMessage = useCallback((data) => {
    if (data.senderId === chatId) {
      if (data.isCallSignal || data.isIncomingCall) return; 

      const decryptedText = data.type === 'media' ? data.text : decryptMessage(data.text);
      const newMsg = { 
        ...data, 
        text: decryptedText, 
        sender: 'them',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };

      setMessages(prev => {
        if (prev.find(m => m.id === data.id)) return prev;
        const updated = [...prev, newMsg];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
      
      socket.emit("messageSeen", { senderId: data.senderId, receiverId: user?._id });
    }
  }, [chatId, socket, user?._id, storageKey]);

  useEffect(() => {
    if (!socket || !chatId) return;
    socket.on("getMessage", handleGetMessage);
    return () => socket.off("getMessage", handleGetMessage);
  }, [socket, chatId, handleGetMessage]);

  // ৩. মেসেজ পাঠানোর লজিক
  const handleSend = (content = msg, type = 'text', additionalData = {}) => {
    const textToSend = typeof content === 'string' ? content : msg;
    if (!textToSend.trim() || !chatId || !user?._id) return;
    
    const messageId = `${Date.now()}-${Math.random()}`;
    const isCall = additionalData.isCallSignal || additionalData.isIncomingCall;
    
    const finalContent = (type === 'text' && !isCall) ? encryptMessage(textToSend) : textToSend;

    const msgPayload = {
      id: messageId, 
      receiverId: chatId, 
      senderId: user._id,
      senderName: user.fullName || user.name || "Onyx Member",
      text: finalContent, 
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...additionalData 
    };

    if (socket?.connected) {
      if (isCall) {
        socket.emit("$incomingCall", msgPayload);
        socket.emit("incomingCall", msgPayload); 
      } else {
        socket.emit("sendMessage", msgPayload);
      }
    }

    if (!isCall) {
      const myNewMsg = { ...msgPayload, text: textToSend, sender: 'me', status: 'sent' };
      setMessages(prev => {
        const updated = [...prev, myNewMsg];
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
      setMsg("");
    }
  };

  // ৪. 📞 ZEGO CLOUD ROOM SYNC CALLING (আইডি ওলটপালট ফিক্সড ম্যাট্রিক্স)
  const handleCallClick = (type) => {
    if (!chatId || !user?._id || !socket?.connected) {
      alert("Neural connection unstable. Please wait...");
      return;
    }

    // হোমসক্রিনের ড্যাশ (-) আর্কিটেকচারের সাথে ১০০% লক করা ইউনিক রুম আইডি জেনারেটর
    const roomId = [user._id, chatId].sort().join("-"); 
    
    const callMetadata = {
      isIncomingCall: true,
      isCallSignal: true,
      userToCall: chatId,
      from: user._id,
      name: user.fullName || user.name || "Onyx Drifter",
      avatar: getAvatarUrl(user),
      type: type, 
      roomId: roomId,
      zegoAppId: ZEGO_APP_ID,
      zegoSecret: ZEGO_SERVER_SECRET
    };

    // রিসিভার এন্ডে নোটিফিকেশন সিগন্যাল ট্রিগার
    handleSend(`Incoming ${type} call...`, type, callMetadata);

    // পুশ রাউটিং বাফারিং ফিক্স
    navigate(`/call/${roomId}`, { 
      state: { 
        callType: type,
        mode: 'outbound',
        callerId: user._id,
        receiverId: chatId,
        appId: ZEGO_APP_ID,
        serverSecret: ZEGO_SERVER_SECRET
      } 
    });
  };

  const startVoiceCapture = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => setMsg(e.results[0][0].transcript);
    rec.start();
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="fixed inset-0 bg-[#020617] z-[9999] flex flex-col h-full w-full overflow-hidden"
    >
      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-white/5 bg-black/60 backdrop-blur-3xl z-50">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-3 text-zinc-400 hover:text-white transition-all active:scale-90 rounded-2xl bg-white/5 border border-white/5">
            <FaArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${chatId}`)}>
            <div className="relative">
              <img src={getAvatarUrl(activeChat)} className="w-11 h-11 rounded-2xl border border-white/10 object-cover" alt="" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-[#020617] rounded-full"></div>
            </div>
            <div>
              <h4 className="font-bold text-[14px] text-white tracking-tight">{chatName}</h4>
              <p className="text-[8px] text-cyan-400 font-black uppercase flex items-center gap-1 tracking-widest opacity-80">
                <FaLock size={7} /> Neural E2EE Active
              </p>
            </div>
          </div>
        </div>
        
        {/* Call Buttons */}
        <div className="flex gap-2">
           <button onClick={() => handleCallClick('audio')} className="p-3.5 bg-zinc-900 rounded-2xl text-cyan-500 hover:bg-cyan-500/10 transition-all border border-white/5 shadow-lg active:scale-95">
             <FaPhone size={13}/>
           </button>
           <button onClick={() => handleCallClick('video')} className="p-3.5 bg-zinc-900 rounded-2xl text-cyan-500 hover:bg-cyan-500/10 transition-all border border-white/5 shadow-lg active:scale-95">
             <FaVideo size={13}/>
           </button>
        </div>
      </header>
      
      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((m, idx) => (
          <div key={m.id || idx} className={`flex ${m.sender === 'me' ? 'justify-end' : m.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
            <div className={`relative p-3.5 rounded-[1.8rem] max-w-[85%] text-[13px] border shadow-sm ${
              m.sender === 'me' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-50 rounded-tr-none' 
              : m.sender === 'system' ? 'bg-white/5 border-transparent text-zinc-600 text-[8px] font-black uppercase'
              : 'bg-zinc-900/50 border-white/5 text-zinc-300 rounded-tl-none'
            }`}>
              {m.type === 'media' ? (
                <img src={m.text} className="rounded-2xl max-w-full" alt="Transmission" />
              ) : (
                <span className="leading-relaxed">{m.text}</span>
              )}
              
              {m.sender !== 'system' && (
                <div className="flex items-center justify-end gap-1 mt-1.5 opacity-30 text-[7px] font-black">
                   {m.timestamp} 
                   {m.sender === 'me' && (
                     m.status === 'seen' ? <FaCheckDouble className="text-cyan-400" /> : <FaCheck />
                   )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </main>

      {/* Footer & Input */}
      <footer className="p-4 bg-black/80 backdrop-blur-2xl border-t border-white/5 pb-10">
        <div className="flex items-center gap-2 bg-zinc-900/40 border border-white/5 rounded-[2rem] p-1.5 shadow-inner">
          <button className="p-3.5 text-zinc-600 hover:text-cyan-500 transition-colors">
            <FaPlus size={14} />
          </button>
          <input 
            type="text" placeholder="Transmit signal..." 
            className="flex-1 bg-transparent outline-none text-[14px] text-white px-2 py-2 placeholder:text-zinc-700" 
            value={msg} onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={startVoiceCapture} className={`p-3.5 rounded-2xl transition-all ${isListening ? 'text-rose-500 animate-pulse' : 'text-zinc-600'}`}>
            <FaMicrophone size={14} />
          </button>
          <button 
            onClick={() => handleSend()} 
            disabled={!msg.trim()} 
            className="p-3.5 bg-cyan-600 disabled:bg-zinc-800 rounded-2xl text-white active:scale-90 transition-all"
          >
            <FaPaperPlane size={14} />
          </button>
        </div>
      </footer>
    </motion.div>
  );
};

export default CallPage;