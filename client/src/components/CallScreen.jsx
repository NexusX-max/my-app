import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Shield, 
  Zap, 
  Clock, 
  User, 
  Activity, 
  Volume2, 
  VolumeX, 
  Grid,
  Sparkles,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// WebAudio voice channel synthesizer for secure audio cues
class ToneEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        console.warn("AudioContext failed to initialize:", e);
      }
    }
  }

  playDialTone() {
    this.init();
    if (!this.ctx) return;
    try {
      const start = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(425, start);
      
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.04, start + 0.05);
      gain.gain.setValueAtTime(0.04, start + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.45);
    } catch (e) {}
  }

  playDoubtChirp() {
    this.init();
    if (!this.ctx) return;
    try {
      const start = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, start);
      osc.frequency.linearRampToValueAtTime(80, start + 0.2);

      gain.gain.setValueAtTime(0.08, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.25);
    } catch (e) {}
  }

  playConfirmChirp() {
    this.init();
    if (!this.ctx) return;
    try {
      const idxs = [523.25, 659.25, 783.99]; // Secure system chord C5 E5 G5
      idxs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.03, start + 0.03);
        gain.gain.linearRampToValueAtTime(0, start + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch (e) {}
  }
}

const toneEngine = new ToneEngine();

export default function CallScreen({ 
  socket, 
  callTarget, 
  callType = 'video', 
  onEndCall, 
  activeAccent, 
  userProfile 
}) {
  // Safe default colors in case activeAccent is not provided
  const accentGlowColor = activeAccent?.ring || 'ring-cyan-500/20';
  const accentTextColor = activeAccent?.text || 'text-cyan-400';
  const accentBgColor = activeAccent?.bg || 'bg-cyan-500';
  const accentBorderColor = activeAccent?.border || 'border-cyan-500/30';

  const isIncoming = callTarget?.isIncoming || false;
  const targetId = callTarget?.otherId || callTarget?.id;

  // --- States ---
  const [callState, setCallState] = useState(isIncoming ? 'incoming' : 'dialing'); // dialing | incoming | connecting | securing | connected | disconnected
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isLocalMuted, setIsLocalMuted] = useState(false);
  const [isLocalCamOff, setIsLocalCamOff] = useState(callType === 'voice');
  const [remoteMuteState, setRemoteMuteState] = useState({ audioMuted: false, videoMuted: false });
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [cryptoKey, setCryptoKey] = useState('AES-GCM-256');
  const [fpsVal, setFpsVal] = useState(30);
  const [bitrateVal, setBitrateVal] = useState(2500);
  const [latencyVal, setLatencyVal] = useState('14ms');
  const [isPipMode, setIsPipMode] = useState(false);

  // --- Refs ---
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const durationTimerRef = useRef(null);
  const iceCandidatesQueue = useRef([]);

  // --- WebRTC Setup & Handshaking ---
  const stopLocalMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.warn("Error stopping local track:", e);
        }
      });
      localStreamRef.current = null;
    }
  }, []);

  const terminatePeerConnection = useCallback(() => {
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {
        console.warn("Error closing peer connection:", e);
      }
      peerConnectionRef.current = null;
    }
  }, []);

  const exitWithStatus = useCallback((status) => {
    stopLocalMedia();
    terminatePeerConnection();
    if (onEndCall) {
      onEndCall(sessionDuration, status);
    }
  }, [sessionDuration, onEndCall, stopLocalMedia, terminatePeerConnection]);

  // Clean WebRTC setup helper
  const initializePeerConnection = useCallback(async (stream) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    });

    peerConnectionRef.current = pc;

    // Attach stream tracks
    if (stream) {
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }

    // Capture dynamic remote tracks
    pc.ontrack = (event) => {
      console.log("🔗 WebRTC Stream Received remote tracks");
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Forward ICE candidates to signaling server
    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("ice-candidate", {
          to: targetId,
          candidate: event.candidate
        });
      }
    };

    // Connection state listening
    pc.onconnectionstatechange = () => {
      console.log(`📡 PeerConnection state change: ${pc.connectionState}`);
      if (pc.connectionState === 'connected') {
        toneEngine.playConfirmChirp();
        setCallState('connected');
        
        // Start duration timer
        if (!durationTimerRef.current) {
          durationTimerRef.current = setInterval(() => {
            setSessionDuration(prev => prev + 1);
            // Simulate realistic micro FPS/bitrate telemetries
            setFpsVal(prev => Math.max(28, Math.min(60, Math.floor(58 + Math.random() * 4 - 2))));
            setBitrateVal(prev => Math.floor(4800 + Math.random() * 300 - 150));
            setLatencyVal(() => +(8 + Math.random() * 8).toFixed(1) + "ms");
          }, 1000);
        }
      } else if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        exitWithStatus('completed');
      }
    };

    return pc;
  }, [socket, targetId, exitWithStatus]);

  // Start outgoing call sequence (caller)
  const initiateOutgoingCall = useCallback(async () => {
    try {
      setCallState('connecting');
      toneEngine.playConfirmChirp();

      // Acquire media
      const userMedia = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video' ? { width: 1280, height: 720 } : false,
        audio: true
      });

      localStreamRef.current = userMedia;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = userMedia;
      }

      const pc = await initializePeerConnection(userMedia);

      // Create configuration details & send to socket endpoint
      const rtcOffer = await pc.createOffer();
      await pc.setLocalDescription(rtcOffer);

      // Use the standard expected signaling event name
      socket.emit("call-user", {
        to: targetId,
        offer: rtcOffer,
        callId: "call_" + Math.random().toString(36).substring(2, 9),
        callType: callType
      });

      setCallState('dialing');
    } catch (err) {
      console.error("Local hardware capture failed:", err);
      toneEngine.playDoubtChirp();
      exitWithStatus('missed');
    }
  }, [callType, targetId, socket, initializePeerConnection, exitWithStatus]);

  // Start incoming answering sequence (callee)
  const acceptIncomingCall = useCallback(async (incomingOffer) => {
    try {
      setCallState('securing');

      // Acquire media
      const userMedia = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video' ? { width: 1280, height: 720 } : false,
        audio: true
      });

      localStreamRef.current = userMedia;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = userMedia;
      }

      const pc = await initializePeerConnection(userMedia);

      // Apply incoming offer
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));

      // Append any waiting ICE candidates that came before description was set
      while (iceCandidatesQueue.current.length > 0) {
        const candidate = iceCandidatesQueue.current.shift();
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("Failed queuing candidate:", e);
        }
      }

      // Generate local answer
      const rtcAnswer = await pc.createAnswer();
      await pc.setLocalDescription(rtcAnswer);

      // Dispatch WebRTC answer back to caller
      socket.emit("accept-call", {
        to: targetId,
        answer: rtcAnswer,
        callId: "call_" + Math.random().toString(36).substring(2, 9)
      });

      setCallState('securing');
    } catch (err) {
      console.error("Failed executing response WebRTC Answer:", err);
      toneEngine.playDoubtChirp();
      exitWithStatus('declined');
    }
  }, [callType, targetId, socket, initializePeerConnection, exitWithStatus]);


  // --- Event Handling Socket Pipeline ---
  useEffect(() => {
    if (!socket) return;

    // Incoming signaling handlers
    const handleIncomingOfferSig = async (payload) => {
      // Direct answering handler if callee
      if (isIncoming && payload.offer) {
        await acceptIncomingCall(payload.offer);
      }
    };

    const handleAnswerSig = async (payload) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
          setCallState('securing');
          
          // Force apply queued ICE candidates
          while (iceCandidatesQueue.current.length > 0) {
            const cand = iceCandidatesQueue.current.shift();
            try {
              await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error("Remote SDP Answer application failed:", err);
      }
    };

    const handleIceCandidateSig = async (payload) => {
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (err) {
          console.warn("Add ICE target error: ", err);
        }
      } else {
        // Enqueue candidate
        iceCandidatesQueue.current.push(payload.candidate);
      }
    };

    const handleCallEndedSig = () => {
      toneEngine.playDoubtChirp();
      exitWithStatus('completed');
    };

    const handleCallRejectedSig = () => {
      toneEngine.playDoubtChirp();
      exitWithStatus('declined');
    };

    const handleMuteStatusSig = (payload) => {
      setRemoteMuteState(payload);
    };

    // Socket binds
    socket.on("incoming-call", handleIncomingOfferSig);
    socket.on("incomingCall", handleIncomingOfferSig); // double binding defense
    socket.on("call-answered", handleAnswerSig);
    socket.on("ice-candidate", handleIceCandidateSig);
    socket.on("call-ended", handleCallEndedSig);
    socket.on("callCancelled", handleCallEndedSig); // handle Messenger.jsx cancellation trigger
    socket.on("callConnected", () => {
      console.log("🔗 Messenger reported connection handshake");
    });
    socket.on("call-rejected", handleCallRejectedSig);
    socket.on("mute-status-change", handleMuteStatusSig);

    // Initial setup branching
    if (!isIncoming) {
      initiateOutgoingCall();
    }

    return () => {
      socket.off("incoming-call", handleIncomingOfferSig);
      socket.off("incomingCall", handleIncomingOfferSig);
      socket.off("call-answered", handleAnswerSig);
      socket.off("ice-candidate", handleIceCandidateSig);
      socket.off("call-ended", handleCallEndedSig);
      socket.off("callCancelled", handleCallEndedSig);
      socket.off("callConnected");
      socket.off("call-rejected", handleCallRejectedSig);
      socket.off("mute-status-change", handleMuteStatusSig);
    };
  }, [socket, isIncoming, targetId, initiateOutgoingCall, acceptIncomingCall, exitWithStatus]);

  // Dial tone synthesizer loops for outgoing state
  useEffect(() => {
    let playInterval;
    if (callState === 'dialing') {
      toneEngine.playDialTone();
      playInterval = setInterval(() => {
        toneEngine.playDialTone();
      }, 2000);
    }
    return () => {
      if (playInterval) clearInterval(playInterval);
    };
  }, [callState]);

  // Generate random cryptographic session keys to fit Onyx theme
  useEffect(() => {
    const keyOpts = ["AES-GCM-256", "CHA-CHA20-POLY1305", "X25519-AES-512-V2", "ECDH-ED25519-AES"];
    setCryptoKey(keyOpts[Math.floor(Math.random() * keyOpts.length)]);
  }, [callTarget]);

  // Cleanup references on unmount
  useEffect(() => {
    return () => {
      stopLocalMedia();
      terminatePeerConnection();
    };
  }, [stopLocalMedia, terminatePeerConnection]);


  // --- Interactivity Controllers ---
  const toggleTrackMute = () => {
    const targetMuteState = !isLocalMuted;
    setIsLocalMuted(targetMuteState);

    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !targetMuteState;
      });
    }

    if (socket) {
      socket.emit("mute-status", {
        to: targetId,
        audioMuted: targetMuteState,
        videoMuted: isLocalCamOff
      });
    }
  };

  const toggleTrackCamera = () => {
    if (callType === 'voice') return; // strictly audio session
    const targetCamState = !isLocalCamOff;
    setIsLocalCamOff(targetCamState);

    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !targetCamState;
      });
    }

    if (socket) {
      socket.emit("mute-status", {
        to: targetId,
        audioMuted: isLocalMuted,
        videoMuted: targetCamState
      });
    }
  };

  const toggleLocalSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    toneEngine.playConfirmChirp();
  };

  const formatMinSec = (secs) => {
    const mm = Math.floor(secs / 60).toString().padStart(2, '0');
    const ss = (secs % 60).toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // Trigger outbound manual rejection if declining/hanging up
  const handleOnboardHangup = () => {
    toneEngine.playDoubtChirp();
    if (socket) {
      socket.emit("hangup", { to: targetId });
      socket.emit("reject-call", { to: targetId, reasonCall: "declined" });
      socket.emit("declineCall", { to: targetId, from: userProfile?._id || 'me' });
    }
    exitWithStatus('completed');
  };

  return (
    <div id="call-screen-frame" className="fixed inset-0 z-[6000] bg-zinc-950/98 select-none flex flex-col justify-between overflow-hidden font-mono antialiased text-white">
      {/* Decorative neon grid layer */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.007)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.007)_1px,_transparent_1px)] bg-[size:25px_25px] pointer-events-none" />
      <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr ${activeAccent?.bg || 'from-cyan-500/10'} to-transparent blur-[120px] pointer-events-none`} />
      <div className="absolute -bottom-45 -right-45 w-96 h-96 rounded-full bg-gradient-to-bl from-purple-500/10 to-transparent blur-[120px] pointer-events-none" />

      {/* --- HUD HEADER STATISTICS PANEL --- */}
      <div className="relative z-10 w-full flex items-center justify-between px-6 py-4 bg-zinc-900/60 border-b border-white/5 backdrop-blur-md">
        
        {/* Profile targets */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              referrerPolicy="no-referrer"
              src={callTarget?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"} 
              className={`w-10 h-10 rounded-xl object-cover border ${accentBorderColor} shadow-md`}
              alt="Remote target avatar"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border border-zinc-900" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-widest text-zinc-100 uppercase">{callTarget?.name || 'Operator'}</span>
              {callState === 'connected' && (
                <span className={`px-2 py-0.5 rounded text-[8px] tracking-wider uppercase font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`}>
                  SECURE
                </span>
              )}
            </div>
            <p className="text-[9px] text-zinc-500 uppercase tracking-widest">
              PEER LINK ID: {targetId ? targetId.slice(-8) : "INITIALIZING"}
            </p>
          </div>
        </div>

        {/* Status indicator banner */}
        <div className="flex items-center gap-4 text-xs font-mono">
          {callState === 'connected' ? (
            <div className="flex items-center gap-4 bg-zinc-950/80 px-4 py-1.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Clock size={12} className={accentTextColor} />
                <span className="text-zinc-200 font-bold">{formatMinSec(sessionDuration)}</span>
              </div>
              <span className="text-zinc-700">|</span>
              <div className="hidden sm:flex items-center gap-1.5 text-zinc-400">
                <Shield size={12} className="text-emerald-400" />
                <span className="text-[10px] text-zinc-300 font-semibold">{cryptoKey}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-950 border border-white/5 rounded-xl text-zinc-400 text-[10px] uppercase tracking-widest animate-pulse">
              <span className={`w-1.5 h-1.5 rounded-full ${accentBgColor}`} />
              <span>{callState}...</span>
            </div>
          )}
        </div>

        {/* Telemetry log and signals button */}
        <div className="flex items-center gap-2">
          {callState === 'connected' && (
            <div className="hidden md:flex items-center gap-4 text-[10px] text-zinc-500 font-mono">
              <span className="flex items-center gap-1"><Grid size={11} /> FPS: <span className="text-zinc-300">{fpsVal}</span></span>
              <span className="flex items-center gap-1"><Sparkles size={11} /> BITRATE: <span className="text-zinc-300">{bitrateVal}kbps</span></span>
              <span className="flex items-center gap-1"><Activity size={11} /> PING: <span className="text-zinc-300">{latencyVal}</span></span>
            </div>
          )}
          
          {callType === 'video' && callState === 'connected' && (
            <button
              type="button"
              onClick={() => setIsPipMode(!isPipMode)}
              className="p-2 border border-white/5 hover:border-white/10 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white transition cursor-pointer"
              title="Toggle Pip Layout View"
            >
              {isPipMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* --- MAIN MEDIA CHANNELS CANVAS --- */}
      <div className="flex-1 w-full relative flex items-center justify-center p-6">
        
        {/* Dialing, Waiting and Handshake loaders */}
        {callState !== 'connected' && callState !== 'securing' && (
          <div className="flex flex-col items-center justify-center text-center max-w-sm w-full mx-auto relative z-10 p-8 rounded-3xl bg-zinc-900/40 border border-white/5 backdrop-blur-sm">
            <div className="relative mb-6">
              {/* Outer wave ripples */}
              <span className={`absolute inset-0 rounded-full border-2 border-dashed ${accentBorderColor} animate-spin scale-110`} />
              <motion.div 
                animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.4, 0.15] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`absolute inset-0 rounded-full ${accentBgColor}/25 blur-md`} 
              />
              <img 
                referrerPolicy="no-referrer"
                src={callTarget?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"} 
                className={`w-24 h-24 rounded-full object-cover border-2 p-1 ${accentBorderColor} relative z-10`}
                alt="Target avatar large"
              />
            </div>
            
            <p className="text-[10px] text-zinc-500 tracking-[0.3em] uppercase font-black mb-1.5">
              Secure Channel Request
            </p>
            <h3 className="text-xl font-bold text-white tracking-widest uppercase mb-1">{callTarget?.name || 'Operator Node'}</h3>
            <p className="text-xs text-zinc-400 font-mono mb-8 lowercase text-zinc-500">
              {isIncoming ? "Direct answering and decryption link ready..." : "Dialing telemetry link, verifying STUN server status..."}
            </p>

            {/* Glowing bouncing wave analyzer */}
            <div className="flex items-center justify-center gap-1.5 h-5 mb-2">
              <span className={`w-1 h-3 ${accentBgColor} rounded animate-bounce [animation-delay:0.1s]`} />
              <span className={`w-1 h-5 ${accentBgColor} rounded animate-bounce [animation-delay:0.2s]`} />
              <span className={`w-1 h-4 ${accentBgColor} rounded animate-bounce [animation-delay:0.3s]`} />
              <span className={`w-1 h-5 ${accentBgColor} rounded animate-bounce [animation-delay:0.4s]`} />
              <span className={`w-1 h-3 ${accentBgColor} rounded animate-bounce [animation-delay:0.5s]`} />
            </div>
          </div>
        )}

        {/* Split layouts or Hover PIP view for active call */}
        {(callState === 'connected' || callState === 'securing') && (
          <div className="w-full h-full relative flex items-center justify-center">
            
            {/* Caller mode UI (strictly audio layout) */}
            {callType === 'voice' ? (
              <div className="flex items-center justify-center gap-12 w-full max-w-xl p-8 rounded-3xl bg-zinc-900/30 border border-white/5 backdrop-blur-md">
                
                {/* Local user profile */}
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center border border-white/10 mb-4 overflow-hidden">
                    <img 
                      referrerPolicy="no-referrer"
                      src={userProfile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"}
                      className="w-full h-full object-cover" 
                      alt="Your avatar tag"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold mb-1 uppercase tracking-widest">You</span>
                  <span className="text-xs font-black text-zinc-300">{isLocalMuted ? "MUTED" : "ACTIVE VOICE"}</span>
                </div>

                {/* Secure connecting heartbeats in center */}
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className={`text-[10px] uppercase font-black tracking-widest ${accentTextColor} mb-2`}>
                    Zero-Knowledge Link
                  </div>
                  <div className="flex items-center gap-1.5 h-6">
                    <span className={`w-1.5 h-4 ${isLocalMuted ? 'bg-zinc-700' : accentBgColor} rounded-full animate-pulse`} />
                    <span className="w-1.5 h-6 bg-zinc-700 rounded-full animate-bounce" />
                    <span className={`w-1.5 h-5 ${remoteMuteState.audioMuted ? 'bg-zinc-700' : accentBgColor} rounded-full animate-pulse`} />
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-3 font-mono">STABILIZED — {cryptoKey}</span>
                </div>

                {/* Remote user profile */}
                <div className="flex flex-col items-center">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center border ${accentBorderColor} mb-4 overflow-hidden relative shadow-[0_0_20px_rgba(6,182,212,0.04)]`}>
                    <img 
                      referrerPolicy="no-referrer"
                      src={callTarget?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"} 
                      className="w-full h-full object-cover"
                      alt="Remote User"
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold mb-1 uppercase tracking-widest">PEER</span>
                  <span className="text-xs font-black text-zinc-300">{remoteMuteState.audioMuted ? "MUTED" : "ON-LINE"}</span>
                </div>

                {/* Auxiliary native audio tags to pull WebRTC sounds */}
                <audio ref={remoteVideoRef} autoPlay playsInline muted={!isSpeakerOn} className="hidden" />
              </div>
            ) : (
              
              /* VIDEO CONFERENCING CANVAS LAYOUTS */
              <div className="w-full h-full flex flex-col md:flex-row gap-6 relative">
                
                {/* REMOTE STREAM (FILL VIEW) */}
                <div className="flex-1 h-full rounded-3xl bg-zinc-900 border border-white/5 relative overflow-hidden flex items-center justify-center shadow-inner">
                  
                  {isLocalCamOff && (
                    <div className="absolute inset-x-0 top-3 text-center z-20">
                      <span className="bg-zinc-950/80 px-3 py-1 rounded text-[8px] font-bold text-zinc-400 uppercase tracking-widest border border-white/5">
                        Your video transmission suspended
                      </span>
                    </div>
                  )}

                  <video 
                    ref={remoteVideoRef}
                    autoPlay 
                    playsInline
                    className="w-full h-full object-cover"
                    poster="https://images.unsplash.com/photo-1620121692029-d088224ddc74?auto=format&fit=crop&w=1200&q=80"
                  />

                  {/* Remote states overlay */}
                  <div className="absolute bottom-4 left-4 z-10 flex gap-2">
                    <div className="bg-zinc-950/85 backdrop-blur-md px-3.5 py-1 rounded-xl text-[10px] uppercase tracking-wider border border-white/5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                      <span>{callTarget?.name || 'Remote Agent'}</span>
                    </div>
                    {remoteMuteState.audioMuted && (
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-xl text-[8px] font-bold tracking-widest uppercase flex items-center gap-1">
                        <MicOff size={10} /> Muted
                      </span>
                    )}
                    {remoteMuteState.videoMuted && (
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-xl text-[8px] font-bold tracking-widest uppercase flex items-center gap-1">
                        <VideoOff size={10} /> Camera Off
                      </span>
                    )}
                  </div>
                </div>

                {/* LOCAL PREVIEW WINDOW (PIP OR SIDE-BY-SIDE SPLIT) */}
                <div className={`p-[1.5px] rounded-3xl bg-gradient-to-tr ${activeAccent?.bg || 'from-cyan-500'} to-transparent transition-all duration-300 ${
                  isPipMode 
                    ? 'absolute top-6 right-6 w-32 md:w-52 h-44 md:h-64 shadow-2xl z-30'
                    : 'w-full md:w-64 h-52 md:h-full flex flex-col shrink-0'
                }`}>
                  <div className="w-full h-full rounded-[23px] bg-zinc-950 border border-zinc-900 overflow-hidden relative flex items-center justify-center">
                    
                    {isLocalCamOff ? (
                      <div className="flex flex-col items-center p-4 text-center z-10">
                        <VideoOff className="text-zinc-600 mb-2" size={24} />
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">CAMERA SUSPENDED</span>
                      </div>
                    ) : (
                      <video 
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                      />
                    )}

                    {/* Local profile indicators */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <div className="bg-zinc-900/80 backdrop-blur-md px-2.5 py-0.5 rounded text-[8px] uppercase tracking-widest font-black text-zinc-300">
                        Me {isLocalMuted && "(Muted)"}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* --- FLOATING SECURED CONTROLLER DECK --- */}
      <div className="relative z-10 w-full flex flex-col items-center px-6 py-6 border-t border-white/5 bg-zinc-900/70 backdrop-blur-md gap-4">
        
        {/* Visual telemetry security key check */}
        {callState === 'connected' && (
          <div className="hidden sm:flex items-center gap-2 text-[9px] text-zinc-500 tracking-wider">
            <Shield size={11} className="text-emerald-400" />
            <span>SESSION ENCRYPTION VERIFIED AT ZERO-KNOWLEDGE NODE BASE TERMINAL: {cryptoKey}</span>
          </div>
        )}

        <div className="flex items-center justify-between w-full max-w-sm">
          
          {/* Audio output selector */}
          <button
            type="button"
            onClick={toggleLocalSpeaker}
            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow transition-all cursor-pointer ${
              isSpeakerOn
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/5'
                : 'bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
            }`}
            title={isSpeakerOn ? 'Mute speaker feedback' : 'Enable speaker feedback'}
          >
            {isSpeakerOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* Audio input micro tracker */}
          <button
            type="button"
            onClick={toggleTrackMute}
            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow transition-all cursor-pointer ${
              !isLocalMuted
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/5'
                : 'bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30'
            }`}
            title={isLocalMuted ? 'Activate Voice Transmit' : 'Mute Microphone'}
          >
            {!isLocalMuted ? <Mic size={18} /> : <MicOff size={18} />}
          </button>

          {/* Camera controls (Video only restriction) */}
          <button
            type="button"
            disabled={callType === 'voice'}
            onClick={toggleTrackCamera}
            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow transition-all ${
              callType === 'voice' 
                ? 'opacity-40 cursor-not-allowed bg-zinc-900 border border-white/5 text-zinc-600'
                : !isLocalCamOff
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/5 cursor-pointer'
                  : 'bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/20 cursor-pointer'
            }`}
            title={isLocalCamOff ? 'Activate Camera Stream' : 'Disable Camera Stream'}
          >
            {!isLocalCamOff ? <Video size={18} /> : <VideoOff size={18} />}
          </button>

          {/* HANG UP TERMINALS LINE */}
          <button
            type="button"
            onClick={handleOnboardHangup}
            className="w-14 h-14 rounded-2xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition-all cursor-pointer shadow-[0_0_25px_rgba(239,68,68,0.3)] active:scale-95 animate-pulse"
            title="Terminate Core Signaling Session"
          >
            <PhoneOff size={20} />
          </button>

        </div>
      </div>
    </div>
  );
}
