import React, { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';
import Peer from 'simple-peer'; 
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

const CallPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, socket } = useContext(AuthContext);

  const callType = searchParams.get('type') || 'video';
  const incomingSignal = location.state?.incomingSignal;
  const callerId = location.state?.callerId;

  const [stream, setStream] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [callStatus, setCallStatus] = useState('idle'); 
  const [remoteUser, setRemoteUser] = useState(null);
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');

  // টাইমার স্টেট
  const [callDuration, setCallDuration] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const connectionRef = useRef(null);

  // ১. কল টাইমার লজিক
  useEffect(() => {
    let interval;
    if (callAccepted) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callAccepted]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ২. রিমোট ইউজারের ডাটা ফেচ
  useEffect(() => {
    const fetchRemoteUser = async () => {
      try {
        const targetId = callerId || roomId.split("-").find(id => id !== user?._id);
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
    if (user) fetchRemoteUser();
  }, [roomId, callerId, user]);

  // ৩. সকেট লিসেনার এবং মিডিয়া ইনিশিয়ালাইজেশন
  useEffect(() => {
    if (!socket || !user) return;

    const initMedia = async () => {
      try {
        const currentStream = await navigator.mediaDevices.getUserMedia({
          video: callType === 'video' ? { width: 1280, height: 720 } : false,
          audio: true,
        });

        setStream(currentStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = currentStream;
        }

        const targetId = callerId || roomId.split("-").find(id => id !== user?._id);

        if (incomingSignal) {
          setCallStatus('connecting');
          answerCall(currentStream, incomingSignal, targetId);
        } else {
          setCallStatus('ringing');
          callUser(currentStream, targetId);
        }
      } catch (err) {
        console.error("❌ Media Error:", err);
        navigate('/messages');
      }
    };

    initMedia();

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      setCallStatus('connected');
      if (connectionRef.current) {
        connectionRef.current.signal(signal);
      }
    });

    socket.on("callEnded", () => cleanupAndExit());

    return () => {
      socket.off("callAccepted");
      socket.off("callEnded");
      if (connectionRef.current) connectionRef.current.destroy();
    };
  }, [socket, user, roomId]);

  /* ==========================================================
      📞 পিয়ার ফাংশনস (রিমোট ফেস এবং অডিও ফিক্স)
  ========================================================== */

  const callUser = (stream, targetId) => {
    const peer = new Peer({ initiator: true, trickle: false, stream, config: { iceServers } });

    peer.on("signal", (data) => {
      socket.emit("callUser", { 
        userToCall: targetId,
        signalData: data,
        from: user._id,
        name: user.fullName || "Onyx User",
        type: callType,
        roomId: roomId
      });
    });

    peer.on("stream", (remoteStream) => {
      setCallAccepted(true);
      // অডিও ফিক্স: সরাসরি প্লে করার চেষ্টা
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.onloadedmetadata = () => {
          remoteVideoRef.current.play().catch(e => console.log("Audio Playback Error:", e));
        };
      }
    });

    connectionRef.current = peer;
  };

  const answerCall = (stream, signal, targetId) => {
    const peer = new Peer({ initiator: false, trickle: false, stream, config: { iceServers } });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: targetId });
    });

    peer.on("stream", (remoteStream) => {
      setCallAccepted(true);
      setCallStatus('connected');
      // অডিও ফিক্স: সরাসরি প্লে করার চেষ্টা
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.onloadedmetadata = () => {
          remoteVideoRef.current.play().catch(e => console.log("Audio Playback Error:", e));
        };
      }
    });

    peer.signal(signal);
    connectionRef.current = peer;
  };

  const cleanupAndExit = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    if (connectionRef.current) connectionRef.current.destroy();
    navigate('/messages');
    setTimeout(() => window.location.reload(), 200); 
  };

  const endCall = () => {
    const targetId = callerId || roomId.split("-").find(id => id !== user?._id);
    socket.emit("endCall", { to: targetId });
    cleanupAndExit();
  };

  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMicOn;
        setIsMicOn(!isMicOn);
      }
    }
  };

  const toggleVideo = () => {
    if (stream && callType === 'video') {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn;
        setIsVideoOn(!isVideoOn);
      }
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* রিমোট ভিডিও গ্রিড (অন্য পাশের ফেস) */}
      <div className="absolute inset-0 bg-[#020617] flex items-center justify-center">
        {callAccepted ? (
            /* অডিওর জন্য muted={false} এবং playsInline নিশ্চিত করা হয়েছে */
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover" 
            />
        ) : (
          <div className="flex flex-col items-center gap-8">
             <div className="w-40 h-40 rounded-[2.5rem] border border-cyan-500/20 flex items-center justify-center relative bg-zinc-900/50 backdrop-blur-xl">
                <div className="absolute inset-0 rounded-[2.5rem] border-2 border-cyan-500 animate-ping opacity-10" />
                <div className="w-32 h-32 rounded-[2rem] bg-zinc-800 overflow-hidden border border-white/5 flex items-center justify-center shadow-2xl">
                    <img 
                      src={remoteUser?.profilePic || `https://ui-avatars.com/api/?name=${remoteUser?.fullName || 'Onyx'}&background=06b6d4&color=fff&size=128`} 
                      className="w-full h-full object-cover" 
                      alt="avatar" 
                    />
                </div>
             </div>
             <div className="text-center space-y-2">
                <p className="text-white text-xl font-bold tracking-tight">{remoteUser?.fullName || "Syncing Name..."}</p>
                <p className="text-cyan-500 text-xs font-black uppercase tracking-[0.6em] animate-pulse">
                    {callStatus === 'ringing' ? 'Initiating_Pulse...' : 'Syncing_Neural_Link...'}
                </p>
             </div>
          </div>
        )}
      </div>

      {/* কল টাইমার (Call Duration) */}
      {callAccepted && (
        <div className="absolute top-10 z-[60] bg-black/40 backdrop-blur-xl px-5 py-2 rounded-full border border-cyan-500/30">
          <p className="text-cyan-400 font-black tracking-widest text-sm font-mono">
            {formatTime(callDuration)}
          </p>
        </div>
      )}

      {/* লোকাল ভিডিও (Floating Window) */}
      <motion.div 
        drag
        dragConstraints={{ left: -150, right: 150, top: -200, bottom: 200 }}
        className="absolute top-10 right-6 w-32 md:w-44 aspect-[3/4] bg-zinc-900 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl z-50 ring-1 ring-cyan-500/30 backdrop-blur-3xl"
      >
        <video 
          ref={localVideoRef} 
          autoPlay 
          playsInline 
          muted 
          className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-500 ${!isVideoOn ? 'opacity-0' : 'opacity-100'}`} 
        />
        {!isVideoOn && <div className="absolute inset-0 flex items-center justify-center bg-zinc-800"><FaVideoSlash className="text-zinc-600" size={24} /></div>}
      </motion.div>

      {/* কন্ট্রোল ইন্টারফেস */}
      <div className="absolute bottom-16 flex items-center gap-8 z-50">
        <motion.button onClick={toggleMic} className={`p-5 rounded-3xl transition-all ${!isMicOn ? 'bg-red-500' : 'bg-zinc-800/80 hover:bg-zinc-700'}`}>
          {isMicOn ? <FaMicrophone size={20} className="text-white" /> : <FaMicrophoneSlash size={20} className="text-white" />}
        </motion.button>

        <motion.button onClick={endCall} className="p-8 rounded-[2.5rem] bg-red-600 text-white shadow-2xl hover:bg-red-500 transition-all border border-red-400/20">
          <FaPhoneSlash size={32} />
        </motion.button>

        {callType === 'video' && (
          <motion.button onClick={toggleVideo} className={`p-5 rounded-3xl transition-all ${!isVideoOn ? 'bg-red-500' : 'bg-zinc-800/80 hover:bg-zinc-700'}`}>
            {isVideoOn ? <FaVideo size={20} className="text-white" /> : <FaVideoSlash size={20} className="text-white" />}
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default CallPage;