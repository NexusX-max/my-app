import React, { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import axios from 'axios'; 
import { AuthContext } from '../context/AuthContext';

// --- ZegoCloud Neural Matrix Config ---
const ZEGO_APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID) || 1822629215;
const ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET || "c90ccf1f9bf7ee0e27a29539fc4d03ed";

const CallPage = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, socket } = useContext(AuthContext);

  const callType = location.state?.callType || 'video';
  const callerId = location.state?.callerId || location.state?.receiverId;

  const [remoteUser, setRemoteUser] = useState(null);
  const [zegoInitialized, setZegoInitialized] = useState(false);
  const videoContainerRef = useRef(null);
  const zpInstanceRef = useRef(null);

  // ১. রিমোট ইউজারের ডাটা ফেচিং মেকানিজম (UI ব্যাকিং এর জন্য)
  useEffect(() => {
    const fetchRemoteUser = async () => {
      try {
        const targetId = callerId || (roomId && roomId.includes("-") ? roomId.split("-").find(id => id !== user?._id) : null);
        
        if (targetId) {
          const response = await axios.get(`/api/users/${targetId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setRemoteUser(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch remote user profile:", err);
      }
    };
    if (user && roomId) fetchRemoteUser();
  }, [roomId, callerId, user]);

  // ২. ZegoCloud Core SDK এবং UI ইঞ্জিন ইনিশিয়ালাইজেশন
  useEffect(() => {
    if (!user || !roomId || !videoContainerRef.current) return;

    const initZegoCall = async () => {
      try {
        // ডাইনামিকালি ZegoUIKitPrebuilt ইমপোর্ট করা হচ্ছে ক্লায়েন্ট সাইড বাফারিং এড়াতে
        const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');

        // টোকেন জেনারেটর (ইউনিক রুম আইডি এবং ইউজারের ক্রেডেনশিয়ালস দিয়ে ক্রিপ্টোগ্রাফিক লিংক তৈরি)
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          ZEGO_APP_ID,
          ZEGO_SERVER_SECRET,
          roomId,
          user._id || String(Date.now()),
          user.fullName || user.name || "Onyx Drifter"
        );

        // ক্লায়েন্ট ইন্সট্যান্স ক্রিয়েশন
        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpInstanceRef.current = zp;

        // ওনিক্স মিনিমালিস্টিক ডার্ক থিম কাস্টমাইজেশন ও UI রেন্ডারিং
        zp.joinRoom({
          container: videoContainerRef.current,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: callType === 'video',
          showMyCameraToggleButton: callType === 'video',
          showAudioVideoSettingsButton: true,
          showScreenSharingButton: false, // ওনিক্স স্পিড অপ্টিমাইজেশনের জন্য অফ রাখা হলো
          showUserList: false,
          maxUsers: 2,
          mode: ZegoUIKitPrebuilt.OneONoneCall,
          scenario: {
            mode: ZegoUIKitPrebuilt.GroupCall, // স্মুথ ২-ওয়ে স্ট্রিমিং লকিং এর জন্য গ্রপ মোড ব্যাকআপ
          },
          config: {
            role: ZegoUIKitPrebuilt.Host
          },
          onJoinRoom: () => {
            setZegoInitialized(true);
          },
          onLeaveRoom: () => {
            cleanupAndExit();
          }
        });

      } catch (error) {
        console.error("ZegoCloud Initialization Fatal Error:", error);
        cleanupAndExit();
      }
    };

    initZegoCall();

    // ৩. গ্লোবাল সকেট ইভেন্ট দিয়ে কল এন্ড ট্র্যাকিং সিস্টেমে সিঙ্ক
    if (socket) {
      socket.on("callEnded", () => cleanupAndExit());
    }

    return () => {
      if (socket) socket.off("callEnded");
      if (zpInstanceRef.current) {
        try {
          zpInstanceRef.current.destroy();
        } catch (e) {
          console.log("Zego instance cleanup passive log:", e);
        }
      }
    };
  }, [roomId, user, callType, socket]);

  const cleanupAndExit = () => {
    // সকেট এর মাধ্যমে অন্য প্রান্তকে ওনিক্স সেশন ক্লোজ করার নোটিফিকেশন পাঠানো
    if (socket && user && roomId) {
      const targetId = callerId || roomId.split("-").find(id => id !== user?._id);
      socket.emit("endCall", { to: targetId });
    }
    
    navigate('/messages');
    setTimeout(() => window.location.reload(), 250); // ব্রাউজার মেমোরি ক্লিয়ারিং বাফার
  };

  return (
    <div className="h-screen w-screen bg-[#020617] flex flex-col relative overflow-hidden font-sans text-white">
      
      {/* ওনিক্স নিউরাল সিকিউরিটি টপ বার */}
      <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-50 backdrop-blur-md border-b border-white/5">
        <button 
          onClick={cleanupAndExit}
          className="p-3 text-zinc-400 hover:text-white transition-all active:scale-90 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-2 text-xs font-bold"
        >
          <FaArrowLeft size={14} /> Disconnect
        </button>
        <div className="flex items-center gap-1.5 text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
          <FaShieldAlt className="animate-pulse" /> E2EE Secure Matrix
        </div>
      </header>

      {/* ZegoCloud ভিডিও ইন্টারফেস হোল্ডার */}
      <div 
        ref={videoContainerRef} 
        className="w-full h-full z-10 bg-black zego-custom-container"
      />

      {/* ওনিক্স কাস্টম ডার্ক বাফারিং স্ক্রিন (Zego কানেক্ট হওয়ার আগ পর্যন্ত দেখাবে) */}
      {!zegoInitialized && (
        <div className="absolute inset-0 bg-[#020617] flex flex-col items-center justify-center z-40 space-y-6">
          <div className="w-36 h-36 rounded-[2.5rem] border border-cyan-500/20 flex items-center justify-center relative bg-zinc-900/50 backdrop-blur-2xl">
            <div className="absolute inset-0 rounded-[2.5rem] border-2 border-cyan-500 animate-ping opacity-10" />
            <div className="w-28 h-28 rounded-[2rem] bg-zinc-800 overflow-hidden border border-white/5 flex items-center justify-center shadow-2xl">
              <img 
                src={remoteUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(remoteUser?.fullName || 'Onyx')}&background=06b6d4&color=fff&size=128`} 
                className="w-full h-full object-cover" 
                alt="Neural Node" 
              />
            </div>
          </div>
          <div className="text-center space-y-1.5">
            <h3 className="text-white text-lg font-bold tracking-tight">
              {remoteUser?.fullName || location.state?.receiverName || "Onyx Node"}
            </h3>
            <p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">
              Locking_Secure_Stream...
            </p>
          </div>
        </div>
      )}

      {/* Zego-র ডিফল্ট সাদা ব্যাকগ্রাউন্ড ওভাররাইড করার জন্য গ্লোবাল CSS ইনজেকশন */}
      <style>{`
        .zego-custom-container div {
          background-color: #020617 !important;
          color: white !important;
        }
        .zego-custom-container button {
          border-radius: 1.25rem !important;
        }
      `}</style>

    </div>
  );
};

export default CallPage;