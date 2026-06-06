import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, Phone, Mic, MicOff, Video, VideoOff, Shield, 
  Layers, Radio, Zap, Users, Monitor, MessageSquare, 
  Sparkles, Sliders, X, Send, Lock, Eye, Check, Edit2, 
  Plus, Download, HelpCircle, Laptop, Tablet, Smartphone, 
  Volume2, VolumeX, BarChart2, Share2,
  Minimize2, Maximize2, RefreshCw, Palette, Trash2, Award, Info
} from 'lucide-react';
import { MOCK_TRANSCRIPTS } from '../data';

// Define custom transcription mapping if not loaded
const EXTENDED_TRANSLATIONS = {
  none: {},
  bn: {
    "Integrating high-definition WebRTC voice codec...": "উচ্চ-মানের ওয়েবআরটিসি ভয়েস কোডেক যুক্ত করা হচ্ছে...",
    "Encrypting audio/video channels with dynamic keys.": "ডাইনামিক কি দিয়ে অডিও/ভিডিও চ্যানেল এনক্রিপ্ট করা হচ্ছে।",
    "Sound frequency stabilized. Double echo canceller active.": "সাউন্ড ফ্রিকোয়েন্সি স্থিতিশীল। একটিভ ডাবল ইকো ক্যানসেলার।",
    "Automatic acoustic gain adjusted carefully.": "অটোমেটিক একোস্টিক গেইন সূক্ষ্মভাবে সমন্বয় করা হয়েছে।",
    "Transmission latency stable: 0.05ms inside matrix.": "সংবহন ল্যাটেন্সি স্থিতিশীল: মেট্রিক্সে ০.০৫ মিলি সেকেন্ড।",
    "Voice pattern verified. Premium WhatsApp standard active.": "ভয়েস প্যাটার্ন যাচাই সম্পন্ন। প্রিমিয়াম হোয়াটসঅ্যাপ স্ট্যান্ডার্ড সক্রিয়।",
    "Connection crystal clear. Happy chatting!": "কানেকশন একদম পরিষ্কার। সুন্দর চ্যাটিং করুন!"
  },
  es: {
    "Integrating high-definition WebRTC voice codec...": "Integrando códec de voz WebRTC de alta definición...",
    "Encrypting audio/video channels with dynamic keys.": "Cifrando canales de audio y video con claves dinámicas.",
    "Sound frequency stabilized. Double echo canceller active.": "Frecuencia de sonido estabilizada. Cancelador de eco activo.",
    "Automatic acoustic gain adjusted carefully.": "Ganancia acústica automática ajustada con precisión.",
    "Transmission latency stable: 0.05ms inside matrix.": "Latencia de transmisión estable: 0.05ms en la matriz.",
    "Voice pattern verified. Premium WhatsApp standard active.": "Patrón de voz verificado. Estándar Premium de WhatsApp activo.",
    "Connection crystal clear. Happy chatting!": "Conexión cristalina. ¡Feliz conversación!"
  },
  ja: {
    "Integrating high-definition WebRTC voice codec...": "高解像度WebRTCボイスコーデックを統合中...",
    "Encrypting audio/video channels with dynamic keys.": "動的キーによるオーディオ/ビデオチャンネルの暗号化。",
    "Sound frequency stabilized. Double echo canceller active.": "音響周波数が安定。ダブルエコーキャンセラーが有効です。",
    "Automatic acoustic gain adjusted carefully.": "自動音響ゲインが慎重に調整されました。",
    "Transmission latency stable: 0.05ms inside matrix.": "送信遅延安定：マトリックス内 0.05ミリ秒。",
    "Voice pattern verified. Premium WhatsApp standard active.": "音声パターン確認。プレミアムWhatsApp規格が有効。",
    "Connection crystal clear. Happy chatting!": "接続は非常にクリアです。チャットをお楽しみください！"
  }
};

const HolographicFaceVisualizer = ({ name, avatar, isMe, active, isSpeaking }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    let animId;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const draw = () => {
      frame++;
      
      if (canvas.clientWidth !== canvas.width || canvas.clientHeight !== canvas.height) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw standard green/teal technical styling matching WhatsApp
      const themeColorAccent = isMe ? "rgba(37, 211, 102, 0.4)" : "rgba(9, 210, 219, 0.4)";
      const dotColor = isMe ? "#128C7E" : "#25D366";

      // 1. Grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // 2. Outer biometric circle
      const radius = Math.min(cx, cy) * 0.7;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = themeColorAccent;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing rings
      const pulseRadius = radius + Math.sin(frame * 0.06) * 12;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isMe ? "rgba(37, 211, 102, 0.15)" : "rgba(18, 140, 126, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rotating dashed ring
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(frame * 0.015);
      ctx.beginPath();
      ctx.arc(0, 0, radius - 8, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.setLineDash([6, 15]);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Standard Avatar Icon Drawing fallback if real image fails
      ctx.fillStyle = "rgba(42, 57, 66, 0.85)";
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = dotColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Simple voice reactive bar representing audio signals
      if (isSpeaking) {
        const barCount = 12;
        ctx.fillStyle = dotColor;
        for (let i = 0; i < barCount; i++) {
          const angle = (i / barCount) * Math.PI * 2;
          const barHeight = 8 + Math.abs(Math.sin(frame * 0.2 + i)) * 14;
          const startX = cx + Math.cos(angle) * (radius - 12);
          const startY = cy + Math.sin(angle) * (radius - 12);
          const endX = cx + Math.cos(angle) * (radius - 12 + barHeight);
          const endY = cy + Math.sin(angle) * (radius - 12 + barHeight);

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = dotColor;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [name, isMe, isSpeaking]);

  return (
    <div className="absolute inset-0 bg-[#0b141a] flex flex-col items-center justify-center p-4 z-0">
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-80 pointer-events-none" />
      {avatar && (
        <div className="absolute inset-0 overflow-hidden opacity-[0.12] pointer-events-none">
          <img src={avatar} alt="" className="w-full h-full object-cover scale-150 blur-2xl" referrerPolicy="no-referrer" />
        </div>
      )}
      <div className="relative w-56 h-56 flex items-center justify-center">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
        {avatar && (
          <img 
            src={avatar} 
            alt={name}
            className={`w-[110px] h-[110px] rounded-full object-cover border-4 border-[#128C7E] z-20 shadow-[0_0_25px_rgba(37,211,102,0.35)] transition-all duration-300 ${
              isSpeaking ? 'scale-105 border-[#25D366]' : ''
            }`}
            referrerPolicy="no-referrer"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"; }}
          />
        )}
      </div>
      <div className="absolute bottom-5 text-center font-sans z-30">
        <p className="text-sm font-semibold text-zinc-300">{name}</p>
        <span className="text-[10px] text-[#25D366] font-mono tracking-widest uppercase block mt-1">
          {isSpeaking ? "🗣️ SPEAKING ACTIVE" : "VOICE SECURE"}
        </span>
      </div>
    </div>
  );
};

const CallScreen = ({
  callTarget = { name: "Sultana Ahmed", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
  callType = "video", // "voice" | "video"
  isIncoming = false,
  onEndCall,
  userProfile = { name: "My Camera Feed", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" }
}) => {
  const [callStatus, setCallStatus] = useState(isIncoming ? "ringing" : "dialing"); // "dialing" | "ringing" | "connected"
  const [callActiveTime, setCallActiveTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "voice");
  const [isSpeakerBoost, setIsSpeakerBoost] = useState(false); // Default to false (muted initial) to permit browser autoplay in sandboxed frames
  const [translateLang, setTranslateLang] = useState("none"); // "none", "bn", "es", "ja"
  const [currentCaptionIndex, setCurrentCaptionIndex] = useState(0);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState("720p"); // "1080p", "720p", "low"
  const [videoFilter, setVideoFilter] = useState("none"); // "none", "sepia", "grayscale", "monochrome"
  const [showFilters, setShowFilters] = useState(false);
  const [partVideoError, setPartVideoError] = useState(false);
  const [partVideoErrorCount, setPartVideoErrorCount] = useState(0);
  const [feedStyle, setFeedStyle] = useState("video"); // "video" | "hologram"

  // Secure and highly-reliable public HTML5 video fallback streams
  const SECURE_FALLBACK_VIDEOS = [
    "https://www.w3schools.com/html/mov_bbb.mp4",
    "https://vjs.zencdn.net/v/oceans.mp4",
    "https://www.w3schools.com/html/movie.mp4"
  ];

  // Resolve source video URL with seamless robust fallbacks
  const getVideoSource = () => {
    if (partVideoErrorCount > 0) {
      const idx = (partVideoErrorCount - 1) % SECURE_FALLBACK_VIDEOS.length;
      return SECURE_FALLBACK_VIDEOS[idx];
    }
    return callTarget.videoUrl || SECURE_FALLBACK_VIDEOS[0];
  };

  // WebRTC streams refs
  const localVideoRef = useRef(null);
  const partnerVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [cameraPermissionError, setCameraPermissionError] = useState(false);
  const [isPartnerSpeaking, setIsPartnerSpeaking] = useState(false);

  // Audio nodes for generating high-fidelity WhatsApp telephone ringtones synthetically
  const audioCtxRef = useRef(null);
  const ringtoneIntervalRef = useRef(null);

  // Load captions safely
  const activeCaptions = MOCK_TRANSCRIPTS && MOCK_TRANSCRIPTS.length > 0 ? MOCK_TRANSCRIPTS : [
    "Integrating high-definition WebRTC voice codec...",
    "Encrypting audio/video channels with dynamic keys.",
    "Sound frequency stabilized. Double echo canceller active.",
    "Automatic acoustic gain adjusted carefully.",
    "Transmission latency stable: 0.05ms inside matrix.",
    "Voice pattern verified. Premium WhatsApp standard active.",
    "Connection crystal clear. Happy chatting!"
  ];

  // Initialize and run call timing
  useEffect(() => {
    let timer;
    if (callStatus === "connected") {
      timer = setInterval(() => {
        setCallActiveTime(prev => prev + 1);
        // Randomly simulate partner speaking activities for high-fidelity interactive feedback
        setIsPartnerSpeaking(Math.random() > 0.4);
      }, 1000);
    } else {
      setIsPartnerSpeaking(false);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  // Rolling WhatsApp subtitling indexing (voice reading disabled as requested)
  useEffect(() => {
    let subInterval;
    if (callStatus === "connected") {
      subInterval = setInterval(() => {
        setCurrentCaptionIndex(prev => {
          return (prev + 1) % activeCaptions.length;
        });
      }, 5000);
    }
    return () => {
      clearInterval(subInterval);
    };
  }, [callStatus]);

  // Handle dial tone generation or simulated ringing tones using Web Audio synthesis
  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playSynthesizedBeep = (freq1, freq2, duration) => {
    try {
      const ctx = initAudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(freq1, ctx.currentTime);
      osc2.frequency.setValueAtTime(freq2, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + duration);
      osc2.stop(ctx.currentTime + duration);
    } catch (err) {
      console.debug("Web Audio blocked.", err);
    }
  };

  // Dialing or Ringing audio synthesizer looping loop
  useEffect(() => {
    if (callStatus === "dialing" || callStatus === "ringing") {
      const playChime = () => {
        if (callStatus === "dialing") {
          // Play classic U.S. ring tone frequency pairing (440Hz + 480Hz) modulated in the background
          playSynthesizedBeep(440, 480, 1.8);
        } else if (callStatus === "ringing") {
          // Play classic European telephone ring chime sound (400Hz + 450Hz)
          playSynthesizedBeep(400, 450, 1.2);
          setTimeout(() => {
            playSynthesizedBeep(400, 450, 1.2);
          }, 300);
        }
      };

      // Play immediately
      playChime();
      
      // Setup interval
      ringtoneIntervalRef.current = setInterval(playChime, 3000);
    }

    return () => {
      if (ringtoneIntervalRef.current) {
        clearInterval(ringtoneIntervalRef.current);
      }
    };
  }, [callStatus]);

  // Hook up WebRTC camera capture for local video rendering
  useEffect(() => {
    if (!isVideoOff && callStatus === "connected") {
      navigator.mediaDevices.getUserMedia({
        video: {
          width: selectedQuality === "1080p" ? 1920 : selectedQuality === "720p" ? 1280 : 640,
          height: selectedQuality === "1080p" ? 1080 : selectedQuality === "720p" ? 720 : 480,
          facingMode: "user"
        },
        audio: true
      })
      .then(stream => {
        setLocalStream(stream);
        setCameraPermissionError(false);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.warn("Could not capture real camera device. Falling back to clean WhatsApp vector avatar.", err);
        setCameraPermissionError(true);
      });
    } else {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoOff, callStatus, selectedQuality]);

  // Automatically connect dialing call or keep connection
  useEffect(() => {
    if (callStatus === "dialing") {
      const connectionTimer = setTimeout(() => {
        setCallStatus("connected");
        playSynthesizedBeep(880, 880, 0.4); // connection prompt melody
      }, 5500);
      return () => clearTimeout(connectionTimer);
    }
  }, [callStatus]);

  // Sync partner video muted state with isSpeakerBoost and force playback
  useEffect(() => {
    if (partnerVideoRef.current) {
      partnerVideoRef.current.muted = !isSpeakerBoost;
      partnerVideoRef.current.play().catch(err => {
        console.debug("Partner video playback sync status:", err);
      });
    }
  }, [isSpeakerBoost, partVideoErrorCount]);

  // High-fidelity synthetic phonetic oscillator mimicking secure telephone human voice frequencies.
  // This generates realistic sound check signals in real-time when the caller is active.
  useEffect(() => {
    let playTimer;
    if (callStatus === "connected" && isSpeakerBoost && isPartnerSpeaking && !isMuted) {
      const playPhoneticHum = () => {
        try {
          const ctx = initAudioCtx();
          if (!ctx) return;
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const gainNode = ctx.createGain();

          osc.type = 'triangle'; // triangle waves produce optimal warm harmonics
          const vocalBaseClass = 130 + Math.random() * 70; // 130Hz - 200Hz human voice range
          osc.frequency.setValueAtTime(vocalBaseClass, ctx.currentTime);

          // Standard vocal formant filter
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(450, ctx.currentTime);
          filter.Q.setValueAtTime(1.2, ctx.currentTime);

          // Gentle comfortable envelope level
          gainNode.gain.setValueAtTime(0.012, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 0.15);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

          osc.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.42);
        } catch (e) {
          console.debug("Synthesised phonetic vocal tick failed:", e);
        }
      };

      playPhoneticHum();
      playTimer = setInterval(playPhoneticHum, 600);
    }
    return () => clearInterval(playTimer);
  }, [callStatus, isSpeakerBoost, isPartnerSpeaking, isMuted]);

  const handleUnmuteAll = () => {
    setIsSpeakerBoost(true);
    
    // Explicitly initialize/resume Web Audio Context
    initAudioCtx();
    
    // Explicitly unmute video reference
    if (partnerVideoRef.current) {
      partnerVideoRef.current.muted = false;
      partnerVideoRef.current.play().catch(e => {
        console.debug("Video playback failed during manual unmute:", e);
      });
    }
    
    playSynthesizedBeep(880, 880, 0.4);
  };

  const handleAcceptCall = () => {
    setCallStatus("connected");
    handleUnmuteAll();
  };

  const handleRejectCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    playSynthesizedBeep(220, 220, 0.6);
    onEndCall(0, "rejected");
  };

  const handleHangupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    playSynthesizedBeep(220, 220, 0.4);
    onEndCall(callActiveTime, "completed");
  };

  const formatTimerValue = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter styles
  const getFilterClass = () => {
    if (videoFilter === "sepia") return "sepia brightness-90 contrast-110";
    if (videoFilter === "grayscale") return "grayscale contrast-125";
    if (videoFilter === "monochrome") return "grayscale invert contrast-150";
    return "";
  };

  const currentCaption = activeCaptions[currentCaptionIndex];
  const translatedCaption = EXTENDED_TRANSLATIONS[translateLang]?.[currentCaption] || currentCaption;

  // Render RINGING OR DIALING Overlays (Classic WhatsApp caller interface)
  if (callStatus === "ringing" || callStatus === "dialing") {
    return (
      <div id="whatsapp-call-ringing" className="fixed inset-0 z-[6500] bg-[#0b141a] text-white flex flex-col items-center justify-between p-8 select-none font-sans">
        {/* Soft elegant background glows */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#128C7E]/10 to-transparent pointer-events-none" />

        {/* Outer Encryption Header */}
        <div className="mt-8 flex flex-col items-center text-center gap-1.5 z-10 w-full">
          <span className="text-[#25D366] text-[11px] font-bold tracking-[0.2em] uppercase flex items-center gap-2">
            <Shield size={13} className="text-[#25D366]" />
            End-to-End Encrypted
          </span>
          <span className="text-zinc-500 text-[10px] uppercase font-mono tracking-wide">
            WhatsApp Web VoIP Link Securing...
          </span>
        </div>

        {/* Central Display: Pulse Avatar */}
        <div className="flex flex-col items-center justify-center gap-6 z-10 my-auto">
          <div className="relative flex items-center justify-center">
            {/* Pulsing ring visual ripples */}
            <div className="absolute w-44 h-44 rounded-full bg-[#25D366]/5 animate-ping opacity-40" />
            <div className="absolute w-36 h-36 rounded-full border border-[#25D366]/10 animate-pulse [animation-duration:3s]" />
            
            <img 
              src={callTarget.avatar} 
              className="w-24 h-24 rounded-full object-cover border-4 border-[#128C7E] p-0.5 relative z-10 shadow-2xl" 
              referrerPolicy="no-referrer"
              alt={callTarget.name} 
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"; }}
            />
          </div>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 font-sans mb-1">
              {callTarget.name}
            </h2>
            <p className="text-zinc-400 text-xs tracking-wider animate-pulse font-mono uppercase bg-[#111b21] px-4 py-1.5 rounded-full border border-white/5 inline-block">
              {callStatus === "dialing" ? "📞 Dialing..." : "🔔 Incoming call..."}
            </p>
          </div>
        </div>

        {/* Underbody Control Actions */}
        <div className="mb-12 flex flex-col items-center gap-4 z-10 w-full max-w-xs text-center">
          {callStatus === "ringing" ? (
            <div className="flex items-center justify-center gap-12 w-full">
              {/* Decline Button (Red round tele) */}
              <button
                onClick={handleRejectCall}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center cursor-pointer transition-transform active:scale-90 shadow-[0_5px_15px_rgba(244,63,94,0.35)]"
                title="Decline Call"
                id="reject-btn"
              >
                <PhoneOff size={22} className="rotate-22.5" />
              </button>

              {/* Accept Button (Green round tele) */}
              <button
                onClick={handleAcceptCall}
                className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center cursor-pointer transition-transform active:scale-90 shadow-[0_5px_15px_rgba(16,185,129,0.35)] animate-bounce"
                title="Accept Call"
                id="accept-btn"
              >
                <Phone size={22} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleHangupCall}
              className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center cursor-pointer transition-transform active:scale-90 shadow-[0_5px_15px_rgba(244,63,94,0.35)]"
              title="Decline Outgoing Link"
              id="decline-dial-btn"
            >
              <PhoneOff size={22} />
            </button>
          )}
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-sans">
            {callType === "video" ? "VIDEO STREAM INITIATED" : "VOICE TUNNEL INITIATED"}
          </span>
        </div>
      </div>
    );
  }

  // Render Connected active call
  return (
    <div id="active-whatsapp-call" className="fixed inset-0 z-[6000] bg-[#0b141a] text-white flex flex-col justify-between overflow-hidden font-sans select-none">
      
      {/* Decorative WhatsApp styling */}
      <div className="absolute inset-0 bg-[#000000]/25 pointer-events-none z-[1]" />

      {/* Top Header Panel (WhatsApp design bar) */}
      <header className="relative z-[20] shrink-0 bg-[#121b22]/90 border-b border-zinc-800 px-5 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={callTarget.avatar} 
              alt={callTarget.name} 
              className="w-10 h-10 rounded-full object-cover border border-[#128C7E]" 
              referrerPolicy="no-referrer"
              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"; }}
            />
            {isPartnerSpeaking && (
              <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#25D366] ring-2 ring-[#0b141a]">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm leading-none text-zinc-100">{callTarget.name}</h2>
              <span className="text-[9px] font-bold text-[#25D366] bg-[#128C7E]/20 px-1.5 py-0.5 rounded uppercase">
                Secure
              </span>
            </div>
            {/* Real timer duration block */}
            <span className="text-[11px] text-[#25D366] font-mono leading-none mt-1 inline-block">
              {formatTimerValue(callActiveTime)}
            </span>
          </div>
        </div>

        {/* Dynamic call type details */}
        <div className="flex items-center gap-4 text-xs font-mono font-bold text-zinc-400">
          <div className="hidden sm:block text-right">
            <span className="text-[9px] text-zinc-500 uppercase block">Bandwidth</span>
            <span className="text-[#25D366]">768 kbps • {selectedQuality.toUpperCase()}</span>
          </div>
          <div className="bg-[#202c33] border border-white/5 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
            <Lock size={12} className="text-[#25D366]" />
            <span className="text-[10px] text-zinc-300 uppercase select-text tracking-wide">E2E ENCRYPTED</span>
          </div>
        </div>
      </header>

      {/* Main Core display: Voice or Video layout */}
      <div className="relative flex-1 flex flex-col justify-center items-center overflow-hidden min-h-0 bg-[#00080d]">
        
        {/* VIEW A: VOICE CALL STYLE */}
        {callType === "voice" ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 z-[2]">
            <HolographicFaceVisualizer 
              name={callTarget.name} 
              avatar={callTarget.avatar} 
              isMe={false} 
              active={callStatus === "connected"} 
              isSpeaking={isPartnerSpeaking} 
            />
          </div>
        ) : (
          /* VIEW B: VIDEO CALL STYLE WITH FLOATING PIC-IN-PIC */
          <div className="relative w-full h-full flex items-center justify-center z-[2]">
            
            {/* 1. Large Partner Feed block */}
            <div className="absolute inset-0 z-0 bg-[#0d171d] flex flex-col items-center justify-center">
              {feedStyle === "hologram" || partVideoError ? (
                <HolographicFaceVisualizer 
                  name={callTarget.name} 
                  avatar={callTarget.avatar} 
                  isMe={false} 
                  active={callStatus === "connected"} 
                  isSpeaking={isPartnerSpeaking} 
                />
              ) : (
                <>
                  {/* 1.1 Beautiful fallback background blur of contact's avatar face */}
                  <div className="absolute inset-0 z-0 overflow-hidden select-none pointer-events-none opacity-20 filter blur-3xl scale-125">
                    <img src={callTarget.avatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>

                  {/* 1.2 The central polished avatar display representing other partner's face */}
                  <div className="relative flex flex-col items-center justify-center gap-6 z-10 p-4">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-52 h-52 rounded-full bg-[#25D366]/5 animate-ping opacity-40" />
                      <div className="absolute w-44 h-44 rounded-full border-2 border-emerald-500/15 animate-pulse" />
                      <div className="absolute w-36 h-36 rounded-full border border-[#128C7E]/10 bg-slate-900/50" />
                      
                      <img 
                        src={callTarget.avatar} 
                        className="w-28 h-28 rounded-full object-cover border-4 border-[#128C7E] p-1 relative z-10 shadow-3xl" 
                        referrerPolicy="no-referrer"
                        alt={callTarget.name} 
                        onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"; }}
                      />
                    </div>
                    
                    <div className="text-center font-sans space-y-1">
                      <h3 className="text-xl font-bold text-zinc-100">{callTarget.name}</h3>
                      <span className="text-[10px] text-[#25D366] font-mono tracking-widest uppercase block animate-pulse">
                        {isPartnerSpeaking ? "🗣️ SPEAKING ACTIVE" : "🛡️ SECURE VIDEO SIGNAL"}
                      </span>
                    </div>
                  </div>

                  {/* 1.3 Companion camera loop video (mounted unless error, muted based on Speaker Boost state) */}
                  <video 
                    ref={partnerVideoRef}
                    src={getVideoSource()}
                    autoPlay 
                    loop 
                    muted={!isSpeakerBoost} // Dynamically control muted status based on Speaker Boost state
                    playsInline 
                    referrerPolicy="no-referrer"
                    className={`absolute inset-0 w-full h-full object-cover z-20 transition-opacity duration-500 ${getFilterClass()} brightness-[0.85] contrast-[1.05]`}
                    onError={() => {
                      if (partVideoErrorCount < SECURE_FALLBACK_VIDEOS.length) {
                        setPartVideoErrorCount(prev => prev + 1);
                      } else {
                        setPartVideoError(true);
                        setFeedStyle("hologram");
                      }
                    }}
                  />

                  {/* Floating tap-to-unmute overlay to meet browser autoplay interaction requirements */}
                  {!isSpeakerBoost && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 bg-[#121b22]/95 border border-[#25D366]/40 p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] max-w-[280px] text-center flex flex-col items-center gap-3 animate-pulse">
                      <div className="p-3 bg-[#25D366]/15 text-[#25D366] rounded-full">
                        <VolumeX size={24} className="animate-bounce" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-[#25D366] uppercase tracking-wider">Unmute Companion Voice</h4>
                        <p className="text-[10px] text-zinc-300 leading-normal">
                          Browser requirements block automatic sound autoplay. Click below to un-mute video and voice check audio.
                        </p>
                      </div>
                      <button
                        onClick={handleUnmuteAll}
                        className="bg-[#25D366] text-[#0b141a] font-mono text-[10px] font-black tracking-wider px-4 py-2 rounded-lg hover:bg-[#20bd5a] transition-all cursor-pointer w-full uppercase shadow-[#25D366]/20 shadow-md"
                      >
                        🔊 ACTIVATE AUDIO FEED
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 2. Drag-draggable/Floating Picture-in-picture local camera frame */}
            <div 
              className="absolute top-4 right-4 w-32 sm:w-40 aspect-[3/4] bg-zinc-950 rounded-2xl overflow-hidden border-2 border-[#128C7E] shadow-[0_4px_25px_rgba(0,0,0,0.5)] z-30 transition-transform hover:scale-105"
              id="pip-camera-feed"
            >
              {!isVideoOff ? (
                cameraPermissionError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-zinc-900">
                    <span className="text-[10px] font-bold uppercase text-[#25D366]">My Feed</span>
                    <span className="text-[8px] text-zinc-500 mt-1 uppercase">Avatar lock</span>
                  </div>
                ) : (
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover scale-x-[-1]" // mirror local camera feed
                  />
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 p-3">
                  <VideoOff size={16} className="text-rose-500 block" />
                  <span className="text-[9px] uppercase text-zinc-500 mt-1 block">Lens covered</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[8px] text-[#25D366] font-bold uppercase z-10">
                Me (Local)
              </div>
            </div>

          </div>
        )}

        {/* Floating live captions and language translator controller */}
        <div className="absolute bottom-4 left-4 right-4 z-[40] bg-[#121b22]/95 border border-zinc-800 p-4 rounded-2xl shadow-2xl max-w-2xl mx-auto flex flex-col md:flex-row gap-3 items-stretch select-text">
          <div className="flex-1">
            <span className="text-[9px] text-[#25D366] bg-[#128C7E]/20 px-2 py-1 rounded font-black tracking-widest uppercase inline-block">
              🗣️ LIVE COMPRESSED TRANSCRIPT {translateLang !== "none" ? `| ${translateLang.toUpperCase()}` : "| ORIGINAL"}
            </span>
            <p className="text-zinc-100 text-sm font-sans mt-2 leading-relaxed">
              "{translatedCaption}"
            </p>
          </div>

          <div className="shrink-0 flex flex-col justify-between items-end border-t md:border-t-0 md:border-l border-zinc-800 pt-2.5 md:pt-0 md:pl-4 self-stretch gap-2 min-w-[125px]">
            <div className="text-right w-full">
              <span className="text-[8px] text-zinc-500 uppercase block font-mono">Select Language</span>
              <div className="flex justify-end gap-1 mt-1 text-[9px] font-bold font-mono">
                {["none", "bn", "es", "ja"].map(lang => (
                  <button
                    key={lang}
                    onClick={() => setTranslateLang(lang)}
                    className={`px-1.5 py-0.5 rounded cursor-pointer uppercase ${
                      translateLang === lang 
                        ? 'bg-[#25D366] text-[#0b141a]' 
                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lang === "none" ? "ENG" : lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center w-full mt-auto">
              <span className="text-[9px] text-[#128C7E] uppercase font-bold">Filters:</span>
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className="text-[9px] text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded uppercase font-mono cursor-pointer flex items-center gap-1"
              >
                <span>{videoFilter === "none" ? "None" : videoFilter.toUpperCase()}</span>
                <span>▼</span>
              </button>
            </div>

            {callType === "video" && (
              <div className="flex justify-between items-center w-full mt-1.5 pt-1.5 border-t border-zinc-800/50">
                <span className="text-[9px] text-[#128C7E] uppercase font-bold">Lens Mode:</span>
                <button 
                  onClick={() => setFeedStyle(prev => prev === "video" ? "hologram" : "video")} 
                  className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-mono font-black tracking-wider cursor-pointer transition-all ${
                    feedStyle === "video" && !partVideoError
                      ? "bg-emerald-950/45 border border-emerald-500/30 text-[#25D366] hover:bg-emerald-900/40"
                      : "bg-[#25D366] text-[#0b141a] hover:bg-[#20bd5a]"
                  }`}
                  title="Switch between raw video loop and dynamic biometric interactive holographic matrix"
                >
                  {feedStyle === "video" && !partVideoError ? "🟢 CAMERA FEED" : "💎 HOLOGRAM SYNC"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Video Filter Selectors overlay bubble */}
        {showFilters && (
          <div className="absolute bottom-24 right-4 z-[50] bg-[#1f2c34] border border-zinc-700 p-2.5 rounded-xl text-xs space-y-1 shadow-2xl flex flex-col">
            <span className="text-[9px] text-zinc-400 font-bold uppercase mb-1 border-b border-zinc-800 pb-1">Video Filters</span>
            {["none", "sepia", "grayscale", "monochrome"].map(flt => (
              <button
                key={flt}
                onClick={() => {
                  setVideoFilter(flt);
                  setShowFilters(false);
                }}
                className={`text-left px-3 py-1.5 rounded uppercase font-mono text-[10px] ${
                  videoFilter === flt ? 'bg-[#128C7E] text-white' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {flt === "none" ? "Normal Feed" : flt}
              </button>
            ))}
          </div>
        )}

      </div>

      {/* WhatsApp standard rounded buttons control panel */}
      <footer className="relative z-[20] shrink-0 bg-[#121b22]/95 border-t border-zinc-800 py-5 px-6 flex items-center justify-center gap-4 shadow-[0_-5px_15px_rgba(0,0,0,0.2)]">
        
        {/* Mute Mic toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-3.5 rounded-full border transition-all cursor-pointer ${
            isMuted 
              ? 'bg-rose-600/15 border-rose-500/25 text-rose-400 hover:bg-rose-500/30' 
              : 'bg-[#202c33]/85 border-white/5 text-zinc-300 hover:text-white hover:bg-[#2e3b43]'
          }`}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          id="toggle-audio-btn"
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Camera Feed toggle */}
        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-3.5 rounded-full border transition-all cursor-pointer ${
            isVideoOff 
              ? 'bg-rose-600/15 border-rose-500/25 text-rose-400 hover:bg-rose-500/30' 
              : 'bg-[#202c33]/85 border-white/5 text-zinc-300 hover:text-white hover:bg-[#2e3b43]'
          }`}
          title={isVideoOff ? 'Enable Camera video' : 'Disable Camera video'}
          id="toggle-video-btn"
        >
          {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>

        {/* Speaker Booster Output */}
        <button
          onClick={isSpeakerBoost ? () => setIsSpeakerBoost(false) : handleUnmuteAll}
          className={`p-3.5 rounded-full border transition-all cursor-pointer ${
            !isSpeakerBoost 
              ? 'bg-[#202c33]/40 border-white/5 text-zinc-500 hover:bg-[#202c33]' 
              : 'bg-[#202c33]/85 border-[#128C7E]/40 text-[#25D366] hover:bg-[#2e3b43]'
          }`}
          title={isSpeakerBoost ? 'Disable Speaker Boost' : 'Enable Speaker Boost'}
          id="boost-sound-btn"
        >
          {isSpeakerBoost ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>

        {/* Severe End Call (Red circle) */}
        <button
          onClick={handleHangupCall}
          className="p-4 mx-2 bg-rose-600 hover:bg-rose-500 rounded-full text-white font-bold transition-all transform active:scale-90 hover:scale-105 shadow-[0_5px_20px_rgba(244,63,94,0.4)] cursor-pointer"
          title="End WhatsApp Call Session"
          id="hangup-call-btn"
        >
          <PhoneOff size={22} />
        </button>

        {/* Interactive sound filters options setting */}
        <button
          onClick={() => setNoiseSuppression(!noiseSuppression)}
          className={`hidden sm:flex px-4 py-2.5 rounded-xl border font-bold text-xs items-center gap-2 uppercase tracking-wide cursor-pointer transition-all ${
            noiseSuppression 
              ? 'bg-[#128C7E]/20 border-[#128C7E]/50 text-[#25D366]' 
              : 'bg-zinc-850 border-white/5 text-zinc-500 hover:text-white'
          }`}
          title="Toggle acoustic suppression algorithms"
          id="toggle-suppress-btn"
        >
          <Sliders size={14} />
          <span>{noiseSuppression ? 'AI CANCEL: ON' : 'AI CANCEL: OFF'}</span>
        </button>

      </footer>

    </div>
  );
};

export default CallScreen;
