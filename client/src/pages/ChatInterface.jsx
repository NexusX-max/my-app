import React, { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash } from 'react-icons/fa';
import AgoraRTC from 'agora-rtc-sdk-ng'; 
import axios from 'axios'; 
import { AuthContext } from '../context/AuthContext';

const AGORA_APP_ID = "4feceac3c45a4f19ae8074935cf4e94e"; 

const CallPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, socket } = useContext(AuthContext);

  const callType = searchParams.get('type') || 'video';
  const mode = searchParams.get('mode') || 'outbound'; 
  const callerId = location.state?.callerId;

  const [callAccepted, setCallAccepted] = useState(mode === 'inbound');
  const [callStatus, setCallStatus] = useState(mode === 'inbound' ? 'connected' : 'idle'); 
  const [remoteUser, setRemoteUser] = useState(null);
  
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');
  const [callDuration, setCallDuration] = useState(0);

  const agoraClientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const localVideoTrackRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const isMediaInitialized = useRef(false);

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

  useEffect(() => {
    const fetchRemoteUser = async () => {
      try {
        if (!roomId) return;
        const targetId = callerId || roomId.split("-").find(id => id !== user?._id);
        if (targetId) {
          const token = localStorage.getItem('onyx_token') || localStorage.getItem('token');
          const response = await axios.get(`/api/users/${targetId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setRemoteUser(response.data);
        }
      } catch (err) {
        console.error("Failed to fetch remote user profile:", err);
      }
    };
    if (user && roomId) fetchRemoteUser();
  }, [roomId, callerId, user]);

  useEffect(() => {
    if (!socket || !user || !roomId || isMediaInitialized.current) return;
    isMediaInitialized.current = true; 

    const validChannelName = String(roomId).trim();
    if (!validChannelName || validChannelName === 'undefined') {
      navigate('/messages');
      return;
    }

    const initAgoraCall = async () => {
      try {
        agoraClientRef.current = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

        agoraClientRef.current.on("user-published", async (remoteUserObj, mediaType) => {
          await agoraClientRef.current.subscribe(remoteUserObj, mediaType);
          setCallAccepted(true);
          setCallStatus('connected');

          if (mediaType === "video" && remoteVideoRef.current) {
            remoteUserObj.videoTrack.play(remoteVideoRef.current);
          }
          if (mediaType === "audio") {
            remoteUserObj.audioTrack.play();
          }
        });

        agoraClientRef.current.on("user-unpublished", () => {
          cleanupAndExit();
        });

        await agoraClientRef.current.join(AGORA_APP_ID, validChannelName, null, user._id);

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          { encoderConfig: "music_standard" },
          { encoderConfig: "720p_1" }
        );

        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;

        if (localVideoRef.current && callType === 'video') {
          localVideoTrackRef.current.play(localVideoRef.current);
        }

        if (callType === 'video') {
          await agoraClientRef.current.publish([localAudioTrackRef.current, localVideoTrackRef.current]);
        } else {
          await agoraClientRef.current.publish([localAudioTrackRef.current]);
          localVideoTrackRef.current.close(); 
        }

        // ⚡ সিগন্যালিং পেলোড ফিক্স করা হলো যাতে রিসিভারের অবজেক্ট ফিল্টার ক্লিয়ার হয়
        const targetId = callerId || validChannelName.split("-").find(id => id !== user?._id);
        if (mode === 'outbound') {
          setCallStatus('ringing');
          socket.emit("$incomingCall", { 
            userToCall: targetId,
            from: user._id,
            name: user.fullName || "Onyx Drifter",
            avatar: user.profilePic || "",
            callType: callType,
            roomId: validChannelName
          });
        }

      } catch (error) {
        console.error("❌ Agora Engine Error:", error);
        cleanupAndExit();
      }
    };

    initAgoraCall();

    socket.on("callAccepted", () => {
      setCallAccepted(true);
      setCallStatus('connected');
    });

    socket.on("callEnded", () => cleanupAndExit());
    socket.on("endCall", () => cleanupAndExit());

    return () => {
      socket.off("callAccepted");
      socket.off("callEnded");
      socket.off("endCall");
      leaveAgoraChannels();
    };
  }, [socket, user, roomId, mode]);

  const leaveAgoraChannels = () => {
    if (localAudioTrackRef.current) {
      localAudioTrackRef.current.stop();
      localAudioTrackRef.current.close();
      localAudioTrackRef.current = null;
    }
    if (localVideoTrackRef.current) {
      localVideoTrackRef.current.stop();
      localVideoTrackRef.current.close();
      localVideoTrackRef.current = null;
    }
    if (agoraClientRef.current) {
      agoraClientRef.current.leave();
    }
  };

  const cleanupAndExit = () => {
    leaveAgoraChannels();
    navigate('/messages');
    setTimeout(() => window.location.reload(), 200); 
  };

  const endCall = () => {
    const targetId = callerId || roomId.split("-").find(id => id !== user?._id);
    socket.emit("endCall", { to: targetId, roomId: roomId });
    cleanupAndExit();
  };

  const toggleMic = async () => {
    if (localAudioTrackRef.current) {
      await localAudioTrackRef.current.setEnabled(!isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrackRef.current && callType === 'video') {
      await localVideoTrackRef.current.setEnabled(!isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  return (
    <div className="h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[#020617] flex items-center justify-center">
        {callAccepted ? (
            <div ref={remoteVideoRef} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-8">
             <div className="w-40 h-40 rounded-[2.5rem] border border-cyan-500/20 flex items-center justify-center relative bg-zinc-900/50 backdrop-blur-xl">
                <div className="absolute inset-0 rounded-[2.5rem] border-2 border-cyan-500 animate-ping opacity-10" />
                <div className="w-32 h-32 rounded-[2rem] bg-zinc-800 overflow-hidden border border-white/5 flex items-center justify-center shadow-2xl">
                    <img 
                      src={remoteUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(remoteUser?.fullName || 'Onyx')}&background=06b6d4&color=fff&size=128`} 
                      className="w-full h-full object-cover" 
                      alt="avatar" 
                    />
                </div>
             </div>
             <div className="text-center space-y-2">
                <p className="text-white text-xl font-bold tracking-tight">{remoteUser?.fullName || "Syncing Name..."}</p>
                <p className="text-cyan-500 text-xs font-black uppercase tracking-[0.6em] animate-pulse">
                    {callStatus === 'ringing' ? 'Ringing_Pulse...' : 'Syncing_Neural_Link...'}
                </p>
             </div>
          </div>
        )}
      </div>

      {callAccepted && (
        <div className="absolute top-10 z-[60] bg-black/40 backdrop-blur-xl px-5 py-2 rounded-full border border-cyan-500/30">
          <p className="text-cyan-400 font-black tracking-widest text-sm font-mono">
            {formatTime(callDuration)}
          </p>
        </div>
      )}

      <motion.div className="absolute top-10 right-6 w-32 md:w-44 aspect-[3/4] bg-zinc-900 rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl z-50 ring-1 ring-cyan-500/30 backdrop-blur-3xl">
        <div ref={localVideoRef} className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-500 ${!isVideoOn ? 'opacity-0' : 'opacity-100'}`} />
        {!isVideoOn && <div className="absolute inset-0 flex items-center justify-center bg-zinc-800"><FaVideoSlash className="text-zinc-600" size={24} /></div>}
      </motion.div>

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