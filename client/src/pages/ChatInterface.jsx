import React, { useEffect, useRef, useState, useContext, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';
import Peer from 'simple-peer/simplepeer.min.js'; // Vite/CRA compatibility ফিক্স
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const iceServers = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  {
    urls: "turn:free.expressturn.com:3478",
    username: "000000002092873381",
    credential: "41a1p2kRNdmvElbOfj71IniQi7Q="
  }
];

// ─── Helper: roomId থেকে target user ID বের করা ───────────────────────
const getTargetId = (roomId, myId, callerId) => {
  if (callerId && callerId !== myId) return callerId;
  if (!roomId) return null;
  const parts = roomId.split("-");

  if (parts.length === 2) {
    return parts[0] === myId ? parts[1] : parts[0];
  }
  if (parts.length === 1 && roomId !== myId) {
    return roomId;
  }
  return null;
};

const CallPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, socket } = useContext(AuthContext);

  const callType = searchParams.get('type') || 'video';
  const incomingSignal = location.state?.incomingSignal;
  const callerId = location.state?.callerId;

  // ─── State ────────────────────────────────────────────────────────────
  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); 
  const [remoteUser, setRemoteUser] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState(null);

  // ─── Refs ─────────────────────────────────────────────────────────────
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const connectionRef = useRef(null);
  const streamRef = useRef(null);       
  const hasInitialized = useRef(false); 
  const isExiting = useRef(false);      

  const targetId = user ? getTargetId(roomId, user._id, callerId) : null;

  // ─── ১. কল টাইমার ────────────────────────────────────────────────────
  useEffect(() => {
    let interval;
    if (callAccepted) {
      interval = setInterval(() => setCallDuration(p => p + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callAccepted]);

  const formatTime = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // ─── ২. Remote user ডাটা ফেচ ─────────────────────────────────────────
  useEffect(() => {
    if (!user || !targetId) return;

    const token = localStorage.getItem('onyx_token') || localStorage.getItem('token');
    axios
      .get(`/api/users/${targetId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setRemoteUser(res.data))
      .catch(err => console.error("Remote user fetch failed:", err));
  }, [targetId, user]);

  // ─── ৩. Cleanup utility ───────────────────────────────────────────────
  const cleanupAndExit = useCallback(() => {
    if (isExiting.current) return;
    isExiting.current = true;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (connectionRef.current) {
      try {
        connectionRef.current.destroy();
      } catch (e) {
        console.warn("Peer already destroyed:", e);
      }
      connectionRef.current = null;
    }

    setCallStatus('ended');
    navigate('/messages', { replace: true });
  }, [navigate]);

  // ─── ৪. Remote stream কে video element এ লাগানো ─────────────────────
  const attachRemoteStream = useCallback((remoteStream) => {
    if (!remoteVideoRef.current) return;

    remoteVideoRef.current.srcObject = remoteStream;
    remoteVideoRef.current.onloadedmetadata = () => {
      remoteVideoRef.current
        ?.play()
        ?.catch(e => console.warn("Remote play error:", e));
    };

    setCallAccepted(true);
    setCallStatus('connected');
  }, []);

  // ─── ৫. Call করা (Initiator) ──────────────────────────────────────────
  const callUser = useCallback((localStream, toId) => {
    if (!socket || !user || !toId) return;

    if (connectionRef.current) {
      connectionRef.current.destroy();
    }

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: localStream,
      config: { iceServers }
    });

    peer.on("signal", (signalData) => {
      console.log("📡 Emitting $incomingCall via WebRTC to:", toId);
      // সকেটের নেমিং কনভেনশন ওনিক্স হোম পেজের সাথে মিলানো হলো ($incomingCall)
      socket.emit("$incomingCall", {
        userToCall: toId,
        signalData,
        from: user._id,
        name: user.fullName || "Onyx Drifter",
        type: callType,
        callType: callType,
        roomId
      });
    });

    peer.on("stream", attachRemoteStream);

    peer.on("error", (err) => {
      console.error("Peer error (caller):", err);
      setError("Connection handshake failed. Retrying...");
    });

    peer.on("close", () => {
      if (!isExiting.current) cleanupAndExit();
    });

    connectionRef.current = peer;
  }, [socket, user, callType, roomId, attachRemoteStream, cleanupAndExit]);

  // ─── ৬. Call রিসিভ করা (Answerer) ────────────────────────────────────
  const answerCall = useCallback((localStream, signal, fromId) => {
    if (!socket || !user || !fromId) return;

    if (connectionRef.current) {
      connectionRef.current.destroy();
    }

    setCallStatus('connecting');

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: localStream,
      config: { iceServers }
    });

    peer.on("signal", (signalData) => {
      console.log("📡 Emitting answerCall back to caller:", fromId);
      socket.emit("answerCall", { signal: signalData, to: fromId });
    });

    peer.on("stream", attachRemoteStream);

    peer.on("error", (err) => {
      console.error("Peer error (answerer):", err);
      setError("WebRTC Link broken. Try reconnecting.");
    });

    peer.on("close", () => {
      if (!isExiting.current) cleanupAndExit();
    });

    peer.signal(signal);
    connectionRef.current = peer;
  }, [socket, user, attachRemoteStream, cleanupAndExit]);

  // ─── ৭. Main effect: media + socket listeners ─────────────────────────
  useEffect(() => {
    if (!socket || !user || hasInitialized.current) return;
    hasInitialized.current = true;

    const initMediaAndConnection = async () => {
      try {
        const constraints = {
          audio: true,
          video: callType === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false
        };

        const localStream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = localStream;
        setStream(localStream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        if (incomingSignal) {
          console.log("📲 Answering incoming call from:", callerId);
          answerCall(localStream, incomingSignal, callerId);
        } else {
          if (!targetId) {
            setError("Neural address not found for this node.");
            return;
          }
          console.log("📞 Calling user:", targetId);
          setCallStatus('ringing');
          callUser(localStream, targetId);
        }
      } catch (err) {
        console.error("❌ Media Error:", err.name, err.message);
        if (err.name === 'NotAllowedError') {
          setError("Camera/Mic permission denied.");
        } else {
          setError("Could not access media node: " + err.message);
        }
      }
    };

    initMediaAndConnection();

    const onCallAccepted = (data) => {
      console.log("✅ Call accepted, syncing WebRTC pipeline");
      setCallAccepted(true);
      setCallStatus('connected');
      
      // ডাটা অবজেক্ট বা ডিরেক্ট সিগন্যাল হ্যান্ডলিং ফিক্স
      const signalPayload = data.signal || data;
      if (connectionRef.current && signalPayload) {
        connectionRef.current.signal(signalPayload);
      }
    };

    const onCallEnded = () => {
      console.log("信号断开 📵 Remote ended the call");
      cleanupAndExit();
    };

    socket.on("callAccepted", onCallAccepted);
    socket.on("callEnded", onCallEnded);
    socket.on("endCall", onCallEnded);

    return () => {
      socket.off("callAccepted", onCallAccepted);
      socket.off("callEnded", onCallEnded);
      socket.off("endCall", onCallEnded);
    };
  }, [socket, user, callType, incomingSignal, callerId, targetId, answerCall, callUser, cleanupAndExit]);

  // ─── ৮. End call ──────────────────────────────────────────────────────
  const endCall = () => {
    if (targetId && socket) {
      socket.emit("endCall", { to: targetId, roomId });
    }
    cleanupAndExit();
  };

  // ─── ৯. Mic / Video toggle ────────────────────────────────────────────
  const toggleMic = () => {
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMicOn(track.enabled);
    }
  };

  const toggleVideo = () => {
    if (!stream || callType !== 'video') return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsVideoOn(track.enabled);
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden font-sans select-none">
      {/* Remote Video Stream */}
      <div className="absolute inset-0 bg-[#020617] flex items-center justify-center">
        <AnimatePresence mode="wait">
          {callAccepted ? (
            <motion.video
              key="remote-video"
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          ) : (
            <motion.div
              key="waiting"
              className="flex flex-col items-center gap-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-40 h-40 rounded-[2.5rem] border border-cyan-500/20 flex items-center justify-center relative bg-zinc-900/50 backdrop-blur-xl">
                <div className="absolute inset-0 rounded-[2.5rem] border-2 border-cyan-500 animate-ping opacity-10" />
                <div className="w-32 h-32 rounded-[2rem] bg-zinc-800 overflow-hidden border border-white/5 shadow-2xl">
                  <img
                    src={remoteUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(remoteUser?.fullName || 'User')}&background=06b6d4&color=fff&size=128`}
                    className="w-full h-full object-cover"
                    alt="avatar"
                  />
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-white text-xl font-bold tracking-tight">
                  {remoteUser?.fullName || "Syncing Connection..."}
                </p>
                <p className="text-cyan-500 text-xs font-black uppercase tracking-[0.6em] animate-pulse">
                  {callStatus === 'ringing' ? 'Ringing...' : callStatus === 'connecting' ? 'Connecting Link...' : 'Waiting...'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Overlay */}
      <AnimatePresence>
        {error && (
          <motion.div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-zinc-900 border border-red-500/30 rounded-3xl p-8 max-w-sm mx-4 text-center space-y-4">
              <p className="text-red-400 text-lg font-bold">⚠️ Link Alert</p>
              <p className="text-zinc-300 text-sm">{error}</p>
              <button onClick={() => navigate('/messages', { replace: true })} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-black rounded-2xl text-sm font-bold transition-all">
                Return to Base
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer */}
      <AnimatePresence>
        {callAccepted && (
          <motion.div className="absolute top-10 z-[60] bg-black/40 backdrop-blur-xl px-5 py-2 rounded-full border border-cyan-500/30" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-cyan-400 font-black tracking-widest text-sm font-mono">{formatTime(callDuration)}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Local Video PiP */}
      <motion.div drag dragConstraints={{ left: -150, right: 150, top: -200, bottom: 200 }} className="absolute top-10 right-6 w-32 md:w-44 aspect-[3/4] bg-zinc-900 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl z-50 ring-1 ring-cyan-500/30 cursor-grab active:cursor-grabbing">
        <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-500 ${!isVideoOn ? 'opacity-0' : 'opacity-100'}`} />
        {!isVideoOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
            <FaVideoSlash className="text-zinc-600" size={24} />
          </div>
        )}
      </motion.div>

      {/* Control Actions */}
      <div className="absolute bottom-16 flex items-center gap-8 z-50">
        <motion.button whileTap={{ scale: 0.92 }} onClick={toggleMic} className={`p-5 rounded-3xl transition-all shadow-lg ${!isMicOn ? 'bg-red-500' : 'bg-zinc-800/80 hover:bg-zinc-700'}`}>
          {isMicOn ? <FaMicrophone size={20} className="text-white" /> : <FaMicrophoneSlash size={20} className="text-white" />}
        </motion.button>

        <motion.button whileTap={{ scale: 0.88 }} onClick={endCall} className="p-8 rounded-[2.5rem] bg-red-600 text-white shadow-2xl hover:bg-red-500 transition-all border border-red-400/20">
          <FaPhoneSlash size={32} />
        </motion.button>

        {callType === 'video' && (
          <motion.button whileTap={{ scale: 0.92 }} onClick={toggleVideo} className={`p-5 rounded-3xl transition-all shadow-lg ${!isVideoOn ? 'bg-red-500' : 'bg-zinc-800/80 hover:bg-zinc-700'}`}>
            {isVideoOn ? <FaVideo size={20} className="text-white" /> : <FaVideoSlash size={20} className="text-white" />}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default CallPage;