import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Video, 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  VideoOff, 
  Copy, 
  Check, 
  Users, 
  User, 
  Activity, 
  Clock, 
  LogOut, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Zap, 
  RefreshCw,
  Camera
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { io } from "socket.io-client";

// Avatar definitions for an extremely premium UI/UX theme
const AVATAR_PRESETS = [
  { id: "1", name: "Sunset Crimson", gradient: "from-amber-500 via-rose-500 to-pink-600", text: "SC" },
  { id: "2", name: "Cyber Violet", gradient: "from-purple-600 via-fuchsia-500 to-indigo-600", text: "CV" },
  { id: "3", name: "Emerald Mint", gradient: "from-emerald-400 via-teal-500 to-cyan-600", text: "EM" },
  { id: "4", name: "Neon Matrix", gradient: "from-yellow-400 via-amber-500 to-red-500", text: "NM" },
  { id: "5", name: "Quantum Blue", gradient: "from-sky-400 via-blue-500 to-indigo-700", text: "QB" },
  { id: "6", name: "Stardust Ash", gradient: "from-slate-500 via-zinc-600 to-neutral-800", text: "SA" }
];

// Pre-defined random names for an easy login experience
const ADJECTIVES = ["Quantum", "Vortex", "Cosmic", "Lunar", "Solar", "Zephyr", "Alpha", "Apex", "Prism", "Echo"];
const NOUNS = ["Pioneer", "Navigator", "Beacon", "Specter", "Voyager", "Rider", "Nomad", "Oracle", "Scribe", "Wave"];

// WebAudio tone synth engine inside browser (handles perfect local dial/ring sounds bypassing files)
class CallSoundSys {
  constructor() {
    this.ctx = null;
    this.intervalId = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playInternalRing() {
    this.init();
    this.stop();
    const soundTask = () => {
      if (!this.ctx) return;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(453, this.ctx.currentTime);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(440, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + 0.8);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.0);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 1.1);
      osc2.stop(this.ctx.currentTime + 1.1);
    };
    soundTask();
    this.intervalId = setInterval(soundTask, 2000);
  }

  playOutgoingChime() {
    this.init();
    this.stop();
    const playTick = () => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(425, this.ctx.currentTime);
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime + 0.35);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.45);
    };
    playTick();
    this.intervalId = setInterval(playTick, 1800);
  }

  playAlertTune() {
    this.init();
    this.stop();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0, this.ctx.currentTime + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.04, this.ctx.currentTime + idx * 0.08 + 0.04);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + idx * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.25);
    });
  }

  playDeclineBuzz() {
    this.init();
    this.stop();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.25);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

const sounds = new CallSoundSys();

export default function App() {
  const [userId] = useState(() => "usr_" + Math.random().toString(36).substring(2, 9));
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("1");
  const [isLogged, setIsLogged] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Users & Streams State
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [directDialId, setDirectDialId] = useState("");
  const [clientStatus, setClientStatus] = useState("Connected & Idle");

  // Call Mechanics State
  const [callState, setCallState] = useState("idle"); // idle | dialing | ringing | connected
  const [currentCall, setCurrentCall] = useState(null); // active call descriptor { remoteUser, callType, callId }
  const [callType, setCallType] = useState("video"); // voice | video
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [remoteMuteState, setRemoteMuteState] = useState({ audioMuted: false, videoMuted: false });
  const [callDuration, setCallDuration] = useState(0);

  // Log of previous activities
  const [logs, setLogs] = useState([]);

  // Hardware and network diagnostics
  const [webrtcState, setWebrtcState] = useState("offline"); // connection detail
  const [networkLatency, setNetworkLatency] = useState(null);

  // References
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const durationTimerRef = useRef(null);

  // Sound Engine Setup Helper with Browser Autoplay guard
  const playSoundSecure = (mode) => {
    try {
      if (mode === "ring") sounds.playInternalRing();
      else if (mode === "dial") sounds.playOutgoingChime();
      else if (mode === "chime") sounds.playAlertTune();
      else if (mode === "buzz") sounds.playDeclineBuzz();
      else sounds.stop();
    } catch (e) {
      console.warn("Autoplay audio blocked", e);
    }
  };

  // Setup logging helper
  const addLog = useCallback((text) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ text, time, id: Math.random() }, ...prev.slice(0, 14)]);
  }, []);

  // Generate randomized pro name
  const generateRandomIdentity = () => {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    setUsername(`${adj} ${noun}`);
    setSelectedAvatar(String(Math.floor(Math.random() * 6) + 1));
  };

  // Copy ID utility
  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Local device media track cleanup helper
  const stopLocalMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
  };

  // Close connection helper
  const cleanCallConnection = useCallback(() => {
    playSoundSecure("stop");
    
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setCallState("idle");
    setCurrentCall(null);
    setWebrtcState("idle");
    setCallDuration(0);
    setRemoteMuteState({ audioMuted: false, videoMuted: false });
    stopLocalMedia();
  }, []);

  // End dynamic call event
  const handleHangUp = useCallback((sendSig = true) => {
    if (sendSig && currentCall && socketRef.current) {
      socketRef.current.emit("hangup", { to: currentCall.remoteUser.id });
    }
    
    if (currentCall) {
      addLog(`Call completed with ${currentCall.remoteUser.name}`);
    }
    cleanCallConnection();
  }, [currentCall, addLog, cleanCallConnection]);

  // Decline call
  const handleDeclineCall = () => {
    if (!currentCall) return;
    if (socketRef.current) {
      socketRef.current.emit("reject-call", {
        to: currentCall.remoteUser.id,
        reasonCall: "declined"
      });
    }
    addLog(`Missed call from ${currentCall.remoteUser.name}`);
    cleanCallConnection();
  };

  // Mute togglers
  const toggleMute = () => {
    const isNowMuted = !isMuted;
    setIsMuted(isNowMuted);
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = !isNowMuted;
    }
    // Sync to remote host
    if (currentCall && socketRef.current) {
      socketRef.current.emit("mute-status", {
        to: currentCall.remoteUser.id,
        audioMuted: isNowMuted,
        videoMuted: isCamOff
      });
    }
  };

  const toggleCamera = () => {
    const isNowCamOff = !isCamOff;
    setIsCamOff(isNowCamOff);
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = !isNowCamOff;
    }
    // Sync to remote host
    if (currentCall && socketRef.current) {
      socketRef.current.emit("mute-status", {
        to: currentCall.remoteUser.id,
        audioMuted: isMuted,
        videoMuted: isNowCamOff
      });
    }
  };

  // Start Call logic
  const handleInitiateCall = async (targetUser, requestedType) => {
    if (!targetUser || targetUser.id === userId) return;
    if (targetUser.status === "busy") {
      alert("This user is currently busy on another live call.");
      return;
    }

    setCallType(requestedType);
    setCallState("dialing");
    playSoundSecure("dial");
    addLog(`Calling ${targetUser.name}...`);

    setCurrentCall({
      remoteUser: targetUser,
      callType: requestedType,
      callId: "call_" + Math.random().toString(36).substring(2, 9)
    });

    try {
      // Step A: Acquire local media
      const captureStream = await navigator.mediaDevices.getUserMedia({
        video: requestedType === "video" ? { width: 1280, height: 720 } : false,
        audio: true
      });
      
      localStreamRef.current = captureStream;
      if (localVideoRef.current && requestedType === "video") {
        localVideoRef.current.srcObject = captureStream;
      }

      // Step B: Build standard RTCPeerConnection with Google Free STUN/NAT traversal
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" }
        ]
      });

      peerConnectionRef.current = pc;
      setWebrtcState("initializing");

      // Attach track handlers
      captureStream.getTracks().forEach(track => pc.addTrack(track, captureStream));

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", {
            to: targetUser.id,
            candidate: event.candidate
          });
        }
      };

      pc.onconnectionstatechange = () => {
        setWebrtcState(pc.connectionState);
        if (pc.connectionState === "connected") {
          playSoundSecure("chime");
        }
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Create WebRTC Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Dispatch Offer downstream via Socket.io
      if (socketRef.current) {
        socketRef.current.emit("call-user", {
          to: targetUser.id,
          offer,
          callId: "call_" + Math.random().toString(36).substring(2, 9),
          callType: requestedType
        });
      }

    } catch (err) {
      console.error("Local hardware capture failed:", err);
      alert("Could not start call. Please check your camera/mic permissions.");
      cleanCallConnection();
    }
  };

  // Accept and answer an incoming WebRTC call offer
  const handleAcceptCall = async () => {
    if (!currentCall || !currentCall.offer) return;
    playSoundSecure("stop");
    setCallState("connected");
    setWebrtcState("connecting");
    addLog(`Connected with ${currentCall.remoteUser.name}`);

    // Track Call Duration
    durationTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    try {
      // Step A: Capture own media streams
      const captureStream = await navigator.mediaDevices.getUserMedia({
        video: currentCall.callType === "video" ? { width: 1280, height: 720 } : false,
        audio: true
      });

      localStreamRef.current = captureStream;
      if (localVideoRef.current && currentCall.callType === "video") {
        localVideoRef.current.srcObject = captureStream;
      }

      // Step B: Setup Peer connection
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" }
        ]
      });

      peerConnectionRef.current = pc;

      // Bind media tracks
      captureStream.getTracks().forEach(track => pc.addTrack(track, captureStream));

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", {
            to: currentCall.remoteUser.id,
            candidate: event.candidate
          });
        }
      };

      pc.onconnectionstatechange = () => {
        setWebrtcState(pc.connectionState);
      };

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Set Remote Description from incoming Offer
      await pc.setRemoteDescription(new RTCSessionDescription(currentCall.offer));

      // Create WebRTC Answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Dispatch Answer via Socket.io
      if (socketRef.current) {
        socketRef.current.emit("accept-call", {
          to: currentCall.remoteUser.id,
          answer,
          callId: currentCall.callId
        });
      }

    } catch (err) {
      console.error("Failed setting WebRTC Answer connection:", err);
      alert("WebRTC initialization failed on camera/mic lookup.");
      cleanCallConnection();
    }
  };

  // Setup Signalling Socket.io listener connection
  const connectToSignalingSocket = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setClientStatus("Handshaking...");
    
    // Connect to Socket.io signaling server
    const socket = io({
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setClientStatus("Online & Available");
      setWebrtcState("ready");
      addLog("Registered securely on live Socket.io signaling loop");
      
      // Register with server
      socket.emit("register", {
        clientId: userId,
        name: username,
        avatar: selectedAvatar
      });
    });

    socket.on("disconnect", () => {
      setClientStatus("Offline");
    });

    socket.on("connect_error", (err) => {
      console.error("Signaling socket connection error:", err);
      setClientStatus("Connection Error");
    });

    // Receive active users list
    socket.on("users-list", (list) => {
      const otherUsers = list.filter((user) => user.id !== userId);
      setOnlineUsers(otherUsers);
    });

    // Receive incoming call offer alert
    socket.on("incoming-call", (payload) => {
      playSoundSecure("ring");
      setCallType(payload.callType);
      setCallState("ringing");
      setCurrentCall({
        callId: payload.callId,
        callType: payload.callType,
        offer: payload.offer,
        remoteUser: {
          id: payload.from,
          name: payload.callerName,
          avatar: payload.callerAvatar
        }
      });
      addLog(`Incoming ${payload.callType} call from ${payload.callerName}`);
    });

    // Receive Call accepted / SDP Answer
    socket.on("call-answered", async (payload) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
          setCallState("connected");
          playSoundSecure("stop");
          addLog("Call established!");

          // Start active timer counter
          if (durationTimerRef.current) clearInterval(durationTimerRef.current);
          durationTimerRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
          }, 1000);
        }
      } catch (err) {
        console.error(err);
      }
    });

    // Connection rejected
    socket.on("call-rejected", (payload) => {
      playSoundSecure("buzz");
      addLog(`Call declined by user.`);
      cleanCallConnection();
    });

    // Call routing failure from server
    socket.on("call-error", (payload) => {
      playSoundSecure("buzz");
      alert(payload.error);
      cleanCallConnection();
    });

    // Incoming Ice candidate routing
    socket.on("ice-candidate", async (payload) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
        }
      } catch (err) {
        console.error("Ice setup error:", err);
      }
    });

    // Call End notice
    socket.on("call-ended", (payload) => {
      addLog("Call ended by counterpart.");
      cleanCallConnection();
    });

    // Sync Mute states
    socket.on("mute-status-change", (payload) => {
      setRemoteMuteState(payload);
    });

  }, [userId, username, selectedAvatar, addLog, cleanCallConnection]);

  // Clean elements on reload or unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
      cleanCallConnection();
    };
  }, [cleanCallConnection]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      alert("Please provide any username name!");
      return;
    }
    setIsLogged(true);
    addLog(`Signed in as ${username}`);
    // Register Socket immediately
    setTimeout(() => {
      connectToSignalingSocket();
    }, 100);
  };

  const handleLogout = () => {
    if (socketRef.current) socketRef.current.disconnect();
    cleanCallConnection();
    setIsLogged(false);
    addLog("Signed out.");
  };

  // Helper template for render avatar gradients
  const getAvatarGradient = (avatarId) => {
    const found = AVATAR_PRESETS.find(a => a.id === String(avatarId));
    return found ? found.gradient : "from-gray-500 to-gray-700";
  };

  const getAvatarText = (avatarId) => {
    const found = AVATAR_PRESETS.find(a => a.id === String(avatarId));
    return found ? found.text : "??";
  };

  // Translate call duration into visual text MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  // Setup sample test latency tracking interval
  useEffect(() => {
    if (isLogged) {
      const getLatency = setInterval(() => {
        const start = Date.now();
        fetch("/api/signaling/stream?clientId=" + userId, { method: "HEAD" })
          .then(() => setNetworkLatency(Date.now() - start))
          .catch(() => {});
      }, 12000);
      return () => clearInterval(getLatency);
    }
  }, [isLogged, userId]);


  // ================= MAIN RENDER =================
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-150 antialiased overflow-x-hidden selection:bg-rose-500/30">
      
      {/* Visual background ambient blurs to look modern and elegant */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-rose-900/10 via-purple-900/5 to-transparent pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[540px] h-[540px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      {/* --- LAYER 1: ENTRANCE SCREEN --- */}
      {!isLogged ? (
        <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md rounded-2xl border border-slate-800/80 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl"
            id="login-card"
          >
            <div className="mb-8 text-center flex flex-col items-center">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-500 mb-3 animate-pulse">
                <Video className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2 font-mono">
                P2P Live Call
              </h1>
              <p className="text-sm text-slate-400">
                Full-Stack WebRTC Video &amp; Voice Signaling Hub
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2 font-mono" htmlFor="username">
                  Choose Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="username"
                    required
                    maxLength={20}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter calling identity tag..."
                    className="w-full rounded-xl border border-slate-700 bg-slate-950/60 py-3 pl-4 pr-12 text-sm text-white placeholder-slate-500 shadow-inner focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={generateRandomIdentity}
                    className="absolute right-2 top-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-rose-400 font-mono py-1.5 px-2.5 transition active:scale-95 border border-slate-700"
                    title="Generate randomized pro username"
                  >
                    Quick Roll
                  </button>
                </div>
              </div>

              {/* Avatar Picker presets */}
              <div>
                <span className="block text-xs font-semibold text-slate-300 uppercase tracking-widest mb-2 font-mono">
                  Select Visual Avatar Profile
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {AVATAR_PRESETS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => setSelectedAvatar(av.id)}
                      className={`relative aspect-square rounded-xl bg-gradient-to-tr ${av.gradient} p-[2px] transition hover:scale-105 active:scale-95`}
                    >
                      <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-slate-950 text-xs font-bold text-white font-mono">
                        {selectedAvatar === av.id ? (
                          <Check className="w-4 h-4 text-rose-400" />
                        ) : (
                          av.text
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                id="btn-login-submit"
                className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 py-3.5 px-4 text-center text-sm font-semibold text-white shadow-lg shadow-rose-950/30 hover:from-rose-600 hover:to-amber-600 transition duration-150 active:scale-[0.98]"
              >
                Launch Digital Dashboard
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800 text-center flex items-center justify-center gap-2 text-slate-500 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Full cryptographic peer keys (DTLS / SRTP)</span>
            </div>
          </motion.div>
        </div>
      ) : (

        /* --- LAYER 2: DASHBOARD CONTROLS AND DIAL HUB --- */
        <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
          
          {/* Dashboard Header Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-md">
            
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${getAvatarGradient(selectedAvatar)} p-[2px]`}>
                <div className="h-full w-full rounded-[10px] bg-slate-900 flex items-center justify-center font-bold text-white text-sm font-mono">
                  {getAvatarText(selectedAvatar)}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white font-mono">{username}</h2>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span className="text-rose-400">Active NodeID:</span>
                  <span className="text-slate-200">{userId}</span>
                  <button 
                    onClick={handleCopyId}
                    className="p-1 hover:text-white hover:bg-slate-800 rounded transition text-slate-400"
                    title="Copy Unique Calling Link"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-wrap items-center gap-3">
              {/* Status Diagnostic Panel */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 font-mono text-xs border border-slate-800">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-slate-400">Signal:</span>
                <span className="text-amber-400 font-semibold">{clientStatus}</span>
              </div>

              {networkLatency !== null && (
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 font-mono text-xs text-slate-400 border border-slate-800">
                  <Activity className="w-3 h-3 text-indigo-400" />
                  <span>Ping: <span className="text-white">{networkLatency}ms</span></span>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition border border-slate-800 hover:border-rose-900/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Go Offline</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUMN 1: DIRECT DIAL HANDSHAKER & ACTIVE USERS */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Direct dial input box */}
              <div className="border border-slate-800/80 bg-slate-900/30 p-5 rounded-2xl backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 font-mono flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-500" />
                  <span>Duo WebRTC Quick Connect</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      id="direct-target-id"
                      placeholder="Paste user's calling NodeID directly..."
                      value={directDialId}
                      onChange={(e) => setDirectDialId(e.target.value.trim())}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        if (!directDialId) return alert("Write or paste a valid remote NodeID!");
                        handleInitiateCall({ id: directDialId, name: `Remote Node (${directDialId.slice(-4)})`, avatar: "2" }, "voice");
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700 active:scale-95 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Audio Call</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!directDialId) return alert("Write or paste a remote NodeID!");
                        handleInitiateCall({ id: directDialId, name: `Remote Node (${directDialId.slice(-4)})`, avatar: "2" }, "video");
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-medium text-white bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 rounded-lg transition active:scale-95 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Video Call</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Online Users List */}
              <div className="border border-slate-800/80 bg-slate-900/30 rounded-2xl p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Users className="w-4 h-4 text-rose-500" />
                    <span>Lobby Directory</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-mono font-bold">
                    {onlineUsers.length} online
                  </span>
                </div>

                {onlineUsers.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 font-mono space-y-2">
                    <p>No other users are currently online.</p>
                    <p className="text-[10px] text-slate-600 leading-relaxed">
                      Tip: Copy your NodeID, open a new browser incognito tab, and paste it to test a fully functional WebRTC video or voice call!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                    {onlineUsers.map((usr) => (
                      <div 
                        key={usr.id} 
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 transition duration-100"
                        id={`user-node-${usr.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-lg bg-gradient-to-tr ${getAvatarGradient(usr.avatar)} p-[1.5px]`}>
                            <div className="h-full w-full rounded-[7px] bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white font-mono">
                              {getAvatarText(usr.avatar)}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-100 font-mono">{usr.name}</span>
                              <span className={`h-1.5 w-1.5 rounded-full ${usr.status === 'busy' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono block">ID: {usr.id.slice(-6)}</span>
                          </div>
                        </div>

                        {/* Dial Operations */}
                        <div className="flex items-center gap-1.5">
                          {usr.status === "busy" ? (
                            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded font-mono font-medium">In-Call</span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleInitiateCall(usr, "voice")}
                                className="p-2 bg-slate-900 border border-slate-850 hover:bg-slate-800 rounded-lg text-slate-300 transition"
                                title="Start voice session"
                              >
                                <Phone className="w-3.5 h-3.5 text-rose-400" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleInitiateCall(usr, "video")}
                                className="p-2 bg-slate-900 border border-slate-850 hover:bg-rose-500/10 rounded-lg text-slate-300 hover:text-white transition"
                                title="Start high definition video call"
                              >
                                <Video className="w-3.5 h-3.5 text-amber-400" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* COLUMN 2 & 3: CALL CANVAS & MEMENTO LOGGER */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Core Call Interface Block */}
              <div className="border border-slate-800/80 bg-slate-900/40 rounded-2xl p-6 min-h-[460px] flex flex-col justify-between backdrop-blur-sm relative overflow-hidden" id="call-interface">
                
                {/* Visual Ringing pulsing ambient effect */}
                {callState !== "idle" && (
                  <div className="absolute inset-0 bg-radial from-slate-900/10 via-slate-950/80 to-slate-950 pointer-events-none" />
                )}

                {/* CALL STATE: IDLE GRAPHIC */}
                {callState === "idle" && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="p-4 bg-slate-950 rounded-full border border-slate-800/80 text-rose-500 mb-4 shadow-xl">
                      <Phone className="w-10 h-10 animate-bounce" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-200 font-mono mb-2">WebRTC Endpoint Standby</h3>
                    <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-6 font-sans">
                      Start dialing by pasting another user's unique NodeID from above, or choose an available peer in the lobby.
                    </p>
                    <div className="flex gap-4 items-center text-[11px] text-slate-500 font-mono px-4 py-2 border border-slate-850 bg-slate-900/55 rounded-xl">
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-emerald-500" /> STUN/NAT Active</span>
                      <span className="h-3 w-[1px] bg-slate-850" />
                      <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Secure DTLS</span>
                    </div>
                  </div>
                )}


                {/* CALL STATE: OUTGOING DIALING */}
                {callState === "dialing" && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-15">
                    <div className="relative mb-6">
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ repeat: Infinity, duration: 1.6 }}
                        className="absolute inset-0 bg-amber-500/20 rounded-full blur-md"
                      />
                      <div className={`h-24 w-24 rounded-full bg-gradient-to-tr ${getAvatarGradient(currentCall?.remoteUser?.avatar)} p-1 relative z-20 shadow-2xl`}>
                        <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-2xl font-bold text-white font-mono">
                          {getAvatarText(currentCall?.remoteUser?.avatar)}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono tracking-widest text-amber-400 font-semibold uppercase mb-1">
                      Signal Dialing
                    </span>
                    <h4 className="text-xl font-bold text-white font-mono mb-1">{currentCall?.remoteUser?.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mb-8 flex items-center justify-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                      <span>Ringing Peer Handset...</span>
                    </p>

                    <button
                      onClick={() => handleHangUp(true)}
                      className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white rounded-xl transition shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <PhoneOff className="w-4 h-4" />
                      <span>Cancel Signal</span>
                    </button>
                  </div>
                )}


                {/* CALL STATE: INCOMING RINGING */}
                {callState === "ringing" && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-15">
                    <span className="px-3 py-1 text-[10px] font-mono tracking-widest text-white bg-rose-600 rounded-full font-bold uppercase mb-4 animate-bounce">
                      Incoming Call Request
                    </span>
                    
                    <div className="relative mb-6">
                      <motion.div 
                        animate={{ scale: [1, 1.3, 1] }} 
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        className="absolute inset-0 bg-rose-500/20 rounded-full blur-lg"
                      />
                      <div className={`h-24 w-24 rounded-full bg-gradient-to-tr ${getAvatarGradient(currentCall?.remoteUser?.avatar)} p-1 relative z-20 shadow-2xl`}>
                        <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-bold text-white font-mono">
                          {getAvatarText(currentCall?.remoteUser?.avatar)}
                        </div>
                      </div>
                    </div>

                    <h4 className="text-xl font-bold text-white font-mono mb-1">{currentCall?.remoteUser?.name}</h4>
                    <p className="text-xs text-slate-400 font-mono mb-8">
                      Offering secure Peer-to-Peer {currentCall?.callType} call stream
                    </p>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleDeclineCall}
                        className="px-6 py-3 cursor-pointer bg-slate-850 hover:bg-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition active:scale-95 flex items-center gap-2 border border-slate-700"
                      >
                        <PhoneOff className="w-4 h-4 text-rose-500" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={handleAcceptCall}
                        className="px-8 py-3 cursor-pointer bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-xs font-semibold text-white rounded-xl transition shadow-lg active:scale-95 flex items-center gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Answer Call</span>
                      </button>
                    </div>
                  </div>
                )}


                {/* CALL STATE: CONNECTED CALL SCREEN */}
                {callState === "connected" && (
                  <div className="flex-1 flex flex-col justify-between z-15 min-h-[380px] relative">
                    
                    {/* Top Call Info Hud */}
                    <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-xl border border-slate-850 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full bg-gradient-to-tr ${getAvatarGradient(currentCall?.remoteUser?.avatar)} p-[1.5px]`}>
                          <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white font-mono">
                            {getAvatarText(currentCall?.remoteUser?.avatar)}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-semibold block text-white font-mono">{currentCall?.remoteUser?.name}</span>
                          <span className="text-[10.5px] text-slate-500 font-mono block">Status: <span className="text-emerald-500 font-semibold">Active WebRTC P2P</span></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 font-mono">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 text-rose-400 text-xs rounded border border-slate-800">
                          <Clock className="w-3.5 h-3.5 text-rose-500 animate-spin" />
                          <span>{formatTime(callDuration)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 px-2 py-1 bg-slate-900 rounded border border-slate-800 uppercase">
                          {webrtcState}
                        </div>
                      </div>
                    </div>

                    {/* CORE FEED VIDEO AND WAVEFORM WORKSPACE */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center relative min-h-[280px]">
                      
                      {/* Left: Remote Host View */}
                      <div className="relative aspect-video md:h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center group shadow-md">
                        {currentCall?.callType === "video" && !remoteMuteState.videoMuted ? (
                          <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-6 space-y-3 relative z-10 w-full flex flex-col items-center">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 p-[2px]">
                              <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center text-lg font-bold font-mono text-slate-400">
                                {getAvatarText(currentCall?.remoteUser?.avatar)}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                              {remoteMuteState.videoMuted ? "Remote webcam Disabled" : "High Quality Voice Calling"}
                            </span>
                          </div>
                        )}
                        {/* Remote details banner */}
                        <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-1 rounded text-[10px] font-mono text-slate-400 border border-slate-850 flex items-center gap-1.5">
                          <span>{currentCall?.remoteUser?.name}</span>
                          {remoteMuteState.audioMuted && (
                            <span className="text-rose-500 flex items-center gap-0.5 text-[9px] uppercase"><MicOff className="w-2.5 h-2.5" /> Muted</span>
                          )}
                        </div>
                      </div>

                      {/* Right: Local preview node */}
                      <div className="relative aspect-video md:h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center group shadow-md">
                        {currentCall?.callType === "video" && !isCamOff ? (
                          <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-6 space-y-3 relative z-10 w-full flex flex-col items-center">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-slate-800 to-slate-950 p-[2px]">
                              <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center text-lg font-bold font-mono text-slate-500">
                                Me
                              </div>
                            </div>
                            <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                              {isCamOff ? "Local camera Disabled" : "Microphone Audio Stream"}
                            </span>
                          </div>
                        )}
                        {/* Local tag */}
                        <div className="absolute bottom-2 left-2 bg-slate-950/80 px-2 py-1 rounded text-[10px] font-mono text-slate-400 border border-slate-850 flex items-center gap-1.5">
                          <span>Local Output</span>
                          {isMuted && (
                            <span className="text-rose-500 flex items-center gap-0.5 text-[9px] uppercase"><MicOff className="w-2.5 h-2.5" /> Self Muted</span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Bottom Dynamic control cluster bar */}
                    <div className="flex items-center justify-center gap-4 mt-6">
                      
                      <button
                        onClick={toggleMute}
                        className={`p-3.5 rounded-full border transition cursor-pointer ${
                          isMuted 
                            ? "bg-rose-500/10 border-rose-500 text-rose-500 hover:bg-rose-500/20" 
                            : "bg-slate-950 border-slate-800 text-slate-450 hover:bg-slate-800 hover:text-white"
                        }`}
                        title={isMuted ? "Unmute local microphone" : "Mute local microphone"}
                      >
                        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={() => handleHangUp(true)}
                        className="p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full transition shadow-lg shadow-rose-950/30 active:scale-[0.96] flex items-center justify-center cursor-pointer"
                        title="Disconnect current call session"
                      >
                        <PhoneOff className="w-6 h-6" />
                      </button>

                      {currentCall?.callType === "video" && (
                        <button
                          onClick={toggleCamera}
                          className={`p-3.5 rounded-full border transition cursor-pointer ${
                            isCamOff 
                              ? "bg-rose-500/10 border-rose-500 text-rose-500 hover:bg-rose-500/20" 
                              : "bg-slate-950 border-slate-800 text-slate-450 hover:bg-slate-800 hover:text-white"
                          }`}
                          title={isCamOff ? "Enable front video track" : "Disable front video track"}
                        >
                          {isCamOff ? <VideoOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                        </button>
                      )}

                    </div>

                  </div>
                )}

              </div>

              {/* Secure Call Logs Panel at the Bottom */}
              <div className="border border-slate-800/80 bg-slate-900/30 p-5 rounded-2xl backdrop-blur-sm shadow-xl">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 font-mono">
                  Telemetry logs &amp; Diagnostics
                </h4>
                {logs.length === 0 ? (
                  <div className="text-xs text-slate-500 font-mono py-2">
                    Lobby started. No caller activity yet.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {logs.map((log) => (
                      <div key={log.id} className="text-xs font-mono text-slate-400 flex items-center justify-between border-b border-slate-900/60 pb-1">
                        <span className="text-rose-400/90">{log.text}</span>
                        <span className="text-[10px] text-slate-500">{log.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}
    </div>
  );
}
