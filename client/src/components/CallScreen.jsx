import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, Shield, 
  Layers, Radio, Zap, Users, Monitor, MessageSquare, 
  Sparkles, Sliders, X, Send, Lock, Eye, Check, Edit2, 
  Plus, Download, HelpCircle, Laptop, Tablet, Smartphone, 
  Volume2, VolumeX, BarChart2, Share2,
  Minimize2, Maximize2, RefreshCw, Palette, Trash2, Award
} from 'lucide-react';

const InfoIcon = HelpCircle;
const QIcon = HelpCircle;
import { MOCK_TRANSCRIPTS } from '../data';

// Custom Translation matrices for live demonstration mapping
const TRANSLATIONS = {
  none: {},
  es: {
    "Integrating speech-to-text audio analyzer...": "Integrando el analizador de audio de voz a texto...",
    "Neural link sync complete. Scanning phonetic telemetry.": "Sincronización del enlace neural completada. Escaneando telemetría fonética.",
    "Frequency lock: 104.2MHz. High signal clarity.": "Bloqueo de frecuencia: 104.2MHz. Alta claridad de señal.",
    "Operator speech detected: 'Bypassing central firewall node...'": "Voz de operador detectada: 'Bypassando el cortafuegos central...'",
    "Transmission latency averages 0.08ms over secure fiber.": "La latencia de transmisión promedia 0.08ms en fibra segura.",
    "Vibrational analysis indicates confidence rating of 98.4%": "El análisis de vibración indica un índice de confianza del 98.4%",
    "Inbound link node speaking: 'We must compile the Applet before deployment.'": "Nodo entrante hablando: 'Debemos compilar el Applet antes de desplegar.'",
    "Voice pattern verified. Security handshake accepted.": "Patrón de voz verificado. Apretón de manos de seguridad aceptado."
  },
  ja: {
    "Integrating speech-to-text audio analyzer...": "音声翻訳システムを統合中...",
    "Neural link sync complete. Scanning phonetic telemetry.": "ニューラルリンク同期完了。音響テレメトリをスキャン中。",
    "Frequency lock: 104.2MHz. High signal clarity.": "周波数ロック：104.2MHz。信号鮮明度高。",
    "Operator speech detected: 'Bypassing central firewall node...'": "オペレーターの音声を検出：『中央ファイアウォールをバイパス中...』",
    "Transmission latency averages 0.08ms over secure fiber.": "安全な光回線経由での伝送遅延：平均0.08ms。",
    "Vibrational analysis indicates confidence rating of 98.4%": "振動分析による信頼度状況：98.4％。",
    "Inbound link node speaking: 'We must compile the Applet before deployment.'": "ノード発言：『デプロイ前にアプレットをビルドする必要があります。』",
    "Voice pattern verified. Security handshake accepted.": "音響パターン確認。暗号化ハンドシェイク承認。"
  },
  bn: {
    "Integrating speech-to-text audio analyzer...": "স্পিচ-টু-টেক্সট অডিও অ্যানালাইজার যুক্ত করা হচ্ছে...",
    "Neural link sync complete. Scanning phonetic telemetry.": "নিউরোলিংক সিঙ্ক সম্পন্ন। ফোনেটিক টেলিমেট্রি স্ক্যান করা হচ্ছে।",
    "Frequency lock: 104.2MHz. High signal clarity.": "ফ্রিকোয়েন্সি লক: ১০৪.২ মেগাহার্টজ। উচ্চ সিগন্যাল স্পষ্টতা।",
    "Operator speech detected: 'Bypassing central firewall node...'": "অপারেটর ভয়েস ট্র্যাকড: 'মূল ফায়ারওয়াল বাইপাস করা হচ্ছে...'",
    "Transmission latency averages 0.08ms over secure fiber.": "নিরাপদ ফাইবারের উপর গড়ে সংবহন ল্যাটেন্সি ০.০৮ মিলি সেকেন্ড।",
    "Vibrational analysis indicates confidence rating of 98.4%": "কম্পন বিশ্লেষণানুযায়ী সফলতার হার ৯৮.৪%",
    "Inbound link node speaking: 'We must compile the Applet before deployment.'": "ইনবাউন্ড নোড স্পিকার: 'স্থাপনের পূর্বে আমাদের অ্যাপ্লেট কম্পাইল করতে হবে।'",
    "Voice pattern verified. Security handshake accepted.": "কণ্ঠস্বর প্যাটার্ন যাচাই সম্পন্ন। নিরাপত্তা হ্যান্ডশেক সফল।"
  },
  de: {
    "Integrating speech-to-text audio analyzer...": "Integrire Sprache-zu-Text-Analysator...",
    "Neural link sync complete. Scanning phonetic telemetry.": "Neural-Synchronisation abgeschlossen. Scanne Phonetik-Telemetrie.",
    "Frequency lock: 104.2MHz. High signal clarity.": "Frequenzsperre: 104.2MHz. Hohe Signalqualität.",
    "Operator speech detected: 'Bypassing central firewall node...'": "Bediener-Sprachmuster erkannt: 'Umgehe Firewall-Hauptknoten...'",
    "Transmission latency averages 0.08ms over secure fiber.": "Übertragungslatenz liegt im Schnitt bei 0.08ms über Glasfaser.",
    "Vibrational analysis indicates confidence rating of 98.4%": "Vibrationsanalyse ergibt 98.4% Konfidenzklasse.",
    "Inbound link node speaking: 'We must compile the Applet before deployment.'": "Eingehender Teilnehmer spricht: 'Applet muss vor Deployment kompiliert werden.'",
    "Voice pattern verified. Security handshake accepted.": "Stimmabdruck verifiziert. Sicherheits-Handshake akzeptiert."
  }
};

const CallScreen = ({
  callTarget = { name: "Onyx Core Agent", avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80" },
  callType = "video",
  onEndCall,
  userProfile
}) => {
  // Device & browser detection indicators
  const [devicePlatform, setDevicePlatform] = useState("");
  useEffect(() => {
    const ua = navigator.userAgent;
    if (/Android/i.test(ua)) setDevicePlatform("Android Native Link");
    else if (/iPhone|iPad|iPod/i.test(ua)) setDevicePlatform("iOS Applet Shell");
    else if (/Windows/i.test(ua)) setDevicePlatform("Windows Desktop Node");
    else if (/Macintosh/i.test(ua)) setDevicePlatform("macOS App Core");
    else if (/Linux/i.test(ua)) setDevicePlatform("Linux Web Interface");
    else setDevicePlatform("Web-GL Host Shell");
  }, []);

  // Control Toggles
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [isE2EEncrypt, setIsE2EEncrypt] = useState(true);
  const [isMeetingLocked, setIsMeetingLocked] = useState(false);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("1080p_hd"); // 1080p, 720p, Adaptive, Low
  const [virtualBackground, setVirtualBackground] = useState("none"); // none, blur, matrix, space
  const [faceTracking, setFaceTracking] = useState(false);
  
  // UI Panels
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // chat, whiteboard, ai, settings
  const [isFeaturesModalOpen, setIsFeaturesModalOpen] = useState(false);
  const [isShareDeviceModalOpen, setIsShareDeviceModalOpen] = useState(false);

  // Core Telemetrics
  const [callActiveTime, setCallActiveTime] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("Establishing quantum uplink. Syncing biometric signals...");
  const [translateLang, setTranslateLang] = useState("none"); // none, es, ja, bn, de
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [noiseFilterLevel, setNoiseFilterLevel] = useState(99.42);
  const [fpsRate, setFpsRate] = useState(60);
  const [bitrateValue, setBitrateValue] = useState(5420); // kbps

  // WebRTC Live Stream References
  const localVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  // Group Members list
  const [addedMembers, setAddedMembers] = useState([]);
  const [waitingParticipant, setWaitingParticipant] = useState({
    name: "Drifter Oracle",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    role: "System Witness",
    active: true
  });

  // Reactions list (visual floating overlays)
  const [reactions, setReactions] = useState([]);

  // Chat/Notes context
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "System", text: "Secure Onyx Quantum Corridor established.", time: "Now" },
    { sender: callTarget.name, text: "Handshake completed. Link active.", time: "Now" }
  ]);
  const [pollVotes, setPollVotes] = useState({ choiceA: 14, choiceB: 21, userVoted: null });
  const [aiSummary, setAiSummary] = useState("");
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  // Canvas context refs
  const audioWaveCanvasRef = useRef(null);
  const whiteboardCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState("#00f0ff");
  const [drawWeight, setDrawWeight] = useState(4);
  const synthCtxRef = useRef(null);

  // Track faces visual matrix frames
  const [faceBbox, setFaceBbox] = useState({ x: 25, y: 20, w: 50, h: 50 });

  const [videoErrors, setVideoErrors] = useState({});

  const renderVideoFallback = (name, avatar, details = "Bypassing standard video stream") => (
    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-4 z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06)_0%,transparent_60%)] pointer-events-none" />
      <div className="relative flex flex-col items-center">
        <div className="absolute w-24 h-24 rounded-full border border-cyan-500/20 animate-ping opacity-20" />
        <div className="absolute w-16 h-16 rounded-full border border-purple-500/30 animate-pulse opacity-40 [animation-duration:2s]" />
        
        <div className="relative w-16 h-16 rounded-full bg-slate-900 border border-cyan-500/30 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.15)] flex items-center justify-center overflow-hidden">
          {avatar ? (
            <img 
              src={avatar} 
              alt={name} 
              className="w-full h-full object-cover rounded-full opacity-60 filter grayscale brightness-110 contrast-120" 
              referrerPolicy="no-referrer"
              onError={(e) => { e.target.src = ''; }}
            />
          ) : (
            <div className="text-xl font-bold text-cyan-400 select-none">{name ? name.slice(0, 2).toUpperCase() : 'OX'}</div>
          )}
        </div>

        <span className="text-[9px] text-cyan-400 font-bold tracking-[0.25em] uppercase mt-4 block flex items-center gap-1 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
          SECURE CHANNEL SYNAPSE
        </span>
        <span className="text-[8px] text-zinc-500 uppercase mt-1 font-mono">
          {details}
        </span>
      </div>
    </div>
  );

  // 1. Time ticker and telemetrics updater
  useEffect(() => {
    const timer = setInterval(() => {
      setCallActiveTime(prev => prev + 1);
      // Simulate changing rates
      setBitrateValue(prev => Math.floor(4800 + Math.random() * 950));
      setFpsRate(prev => Math.random() > 0.85 ? Math.floor(58 + Math.random() * 3) : 60);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Rolling Transcripts Loop
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentTranscript(MOCK_TRANSCRIPTS[index % MOCK_TRANSCRIPTS.length]);
      index++;
      setNoiseFilterLevel(+(98 + Math.random() * 1.8).toFixed(2));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // 3. Cryptographic simulation countdown progress
  useEffect(() => {
    const timer = setInterval(() => {
      setEncryptionProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 8;
      });
    }, 280);
    return () => clearInterval(timer);
  }, []);

  // 4. WebRTC Actual Camera Capture Link
  useEffect(() => {
    if (!isVideoOff) {
      navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: selectedQuality === '1080p_hd' ? 1920 : 1280, 
          height: selectedQuality === '1080p_hd' ? 1080 : 720,
          frameRate: 60
        }, 
        audio: true 
      })
      .then(stream => {
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        console.warn("No camera device accessible, using glowing matrix mock.", err);
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
  }, [isVideoOff, selectedQuality]);

  // 5. WebRTC Screen Sharing Service
  const startScreenShare = async () => {
    try {
      if (isScreenSharing) {
        stopScreenShare();
        return;
      }
      triggerBeepTone(800, 'sawtooth');
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      setScreenStream(stream);
      setIsScreenSharing(true);
      setTimeout(() => {
        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = stream;
        }
      }, 300);

      stream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };
    } catch (err) {
      console.warn("Screen display capture was cancelled by operator.", err);
    }
  };

  const stopScreenShare = () => {
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      setScreenStream(null);
    }
    setIsScreenSharing(false);
    triggerBeepTone(400, 'sine');
  };

  // 6. Dynamic Facial tracking coordinates simulator
  useEffect(() => {
    if (!faceTracking) return;
    const bboxTimer = setInterval(() => {
      setFaceBbox({
        x: Math.floor(20 + Math.random() * 10),
        y: Math.floor(15 + Math.random() * 10),
        w: Math.floor(45 + Math.random() * 10),
        h: Math.floor(45 + Math.random() * 10)
      });
    }, 1500);
    return () => clearInterval(bboxTimer);
  }, [faceTracking]);

  // 7. Ambient feedback tone generators
  const triggerBeepTone = (frequency = 440, type = 'sine') => {
    try {
      if (!synthCtxRef.current) {
        synthCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioCtx = synthCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      console.warn("Cyber Synthesizer output blocked by sandboxed browser policy.");
    }
  };

  // 8. Visual Reactions Burst
  const triggerReaction = (emoji) => {
    triggerBeepTone(600 + Math.random() * 300, 'triangle');
    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      left: Math.random() * 80 + 10,
    };
    setReactions(prev => [...prev, newReaction]);
    // Clear out
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2200);
  };

  // 9. Interactive in-call chat messenger submit
  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMsg = { sender: "Operator (Me)", text: chatInput, time: "Now" };
    setChatMessages(prev => [...prev, userMsg]);
    const originalInput = chatInput;
    setChatInput("");
    triggerBeepTone(500, 'sine');

    // Simulated Cyber AI/Node Interactive Answers
    setTimeout(() => {
      let replyText = `🤖 [ONYX COMPILER] Signal input acknowledged: "${originalInput}". All neural paths stabilized.`;
      if (originalInput.toLowerCase().includes("hello") || originalInput.toLowerCase().includes("hi")) {
        replyText = "👋 Connection response: Operator link matches normal grid parameters.";
      } else if (originalInput.toLowerCase().includes("clear") || originalInput.toLowerCase().includes("hd")) {
        replyText = "✨ Quality sync: 1080p Web-GL render pipeline synchronized at steady 60fps.";
      } else if (originalInput.toLowerCase().includes("screen") || originalInput.toLowerCase().includes("share")) {
        replyText = "🖥️ Presentation sync: Screen share streams are being broadcast over secure AES tunnel.";
      }
      setChatMessages(prev => [...prev, {
        sender: callTarget.name,
        text: replyText,
        time: "Now"
      }]);
      triggerBeepTone(750, 'triangle');
    }, 1500);
  };

  // 10. AI Meeting Notes and Summary Generator via API Fallback
  const generateMeetingSummary = async () => {
    setAiSummaryLoading(true);
    triggerBeepTone(700, 'sawtooth');
    
    // Simulate real high-tech generation matching current chat & translation context
    setTimeout(() => {
      const summaryText = `## 📊 ONYX CORE INTEGRATED MEETING REPORT\n` +
        `**Session Coordinates**: CYBER_STATION_${Date.now().toString().slice(-4)}\n` +
        `**Total Link Duration**: ${formattedCallTime()} minutes\n\n` +
        `### 🧬 CORE OUTCOMES:\n` +
        `1. **Secure Matrix Handshake**: ${isE2EEncrypt ? 'AES-512 End-to-End active' : 'Standard tunnel active'}.\n` +
        `2. **Video Stream standard**: ${selectedQuality.toUpperCase()} running at ${fpsRate}fps (${bitrateValue} kbps).\n` +
        `3. **Participating Nodes**: Operator, ${callTarget.name}${isGroupMode ? ', Sasha Glimmer, Kaelen Vex, Drifter Oracle' : ''}.\n` +
        `4. **Speech translation target**: ${translateLang === "none" ? 'No translation output' : translateLang.toUpperCase()}.\n\n` +
        `###  ACTION TIMELINES:\n` +
        `- Operator initiated network call session from **${devicePlatform}**.\n` +
        `- Whiteboard interactive shared presentation vector active.\n` +
        `- Quantum link integrity preserved with no packet drops!`;
      setAiSummary(summaryText);
      setAiSummaryLoading(false);
      triggerBeepTone(900, 'sine');
    }, 2000);
  };

  // 11. Whiteboard Canvas Draw Controls (Mouse & Touch compatible)
  const getCanvasCoords = (e) => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // Check if touch event
    if (e.touches && e.touches[0]) {
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    
    // Otherwise mouse event
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = drawColor;
    ctx.lineWidth = drawWeight;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawingContext = () => {
    setIsDrawing(false);
  };

  const clearWhiteboard = () => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    triggerBeepTone(250, 'sine');
  };

  // 12. Dynamic Waveform Visualizer simulation
  useEffect(() => {
    const canvas = audioWaveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const centerY = h / 2;
      const waveCount = 3;

      const colors = [
        `rgba(6, 182, 212, ${isMuted ? '0.05' : '0.45'})`,
        `rgba(168, 85, 247, ${isMuted ? '0.03' : '0.25'})`,
        `rgba(57, 255, 20, ${isMuted ? '0.02' : '0.15'})`
      ];

      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        ctx.lineWidth = 1.8 + i;
        ctx.strokeStyle = colors[i];

        const frequency = 0.02 + i * 0.007;
        const amplitude = isMuted ? 1.5 : (14 - i * 3) * (1 + Math.sin(phase * 0.4) * 0.35);

        for (let x = 0; x < w; x++) {
          const y = centerY + Math.sin(x * frequency + phase + (i * Math.PI / 4)) * amplitude;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      phase += isMuted ? 0.015 : 0.07;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isMuted]);

  // Handle formatted timer output
  const formattedCallTime = () => {
    const mins = Math.floor(callActiveTime / 60);
    const secs = callActiveTime % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Voting behavior
  const handleVote = (choice) => {
    if (pollVotes.userVoted) return;
    setPollVotes(prev => ({
      ...prev,
      userVoted: choice,
      [choice]: prev[choice] + 1
    }));
    triggerBeepTone(650, 'sine');
  };

  // Helper translated output getter
  const getTranslatedSubtitle = () => {
    if (translateLang === "none") return currentTranscript;
    const dictionary = TRANSLATIONS[translateLang] || {};
    return dictionary[currentTranscript] || currentTranscript;
  };

  return (
    <div id="meeting-canvas-portal" className="fixed inset-0 z-[6000] bg-slate-950 text-white flex flex-col overflow-hidden font-mono select-none">
      
      {/* Self-contained CSS Animations for floating reactions & scanner lines */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0.6); opacity: 0; }
          15% { opacity: 1; transform: translateY(-40px) scale(1.2); }
          100% { transform: translateY(-280px) scale(0.7); opacity: 0; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes cyber-pulse {
          0%, 100% { box-shadow: 0 0 10px rgba(6, 182, 212, 0.2); }
          50% { box-shadow: 0 0 25px rgba(6, 182, 212, 0.45); }
        }
        .animate-scanline {
          animation: scanline 4s linear infinite;
        }
      `}</style>

      {/* Decorative Cyber Grid backing */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/15 via-transparent to-purple-950/20 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:25px_25px] pointer-events-none" />

      {/* Floating Reactions */}
      {reactions.map(r => (
        <div 
          key={r.id} 
          className="absolute bottom-24 text-4xl pointer-events-none z-[100] font-sans"
          style={{ 
            left: `${r.left}%`,
            animation: 'floatUp 2.2s cubic-bezier(0.08, 0.82, 0.17, 1) forwards'
          }}
        >
          {r.emoji}
        </div>
      ))}

      {/* 🚀 Top Cyber Tech Banner */}
      <header className="shrink-0 bg-slate-900 border-b border-white/10 px-4 py-3 flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/80 rounded-xl border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)] flex items-center justify-center">
            <Shield size={16} className={`text-cyan-400 ${isE2EEncrypt ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wider uppercase text-[11px] flex items-center gap-1.5">
                Onyx Secure Tunnel
              </span>
              <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded uppercase font-black tracking-widest">
                AES-512 Link {encryptionProgress < 100 ? `${encryptionProgress}%` : 'SECURE'}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase mt-0.5 font-mono flex items-center gap-1.5">
              <span>{devicePlatform}</span> • <span>Quality: {selectedQuality.replace("_", " ").toUpperCase()}</span>
            </p>
          </div>
        </div>

        {/* Real-time statistics badge */}
        <div className="hidden lg:flex items-center gap-6 text-zinc-400 text-[10px] uppercase">
          <div>
            <span className="text-zinc-600 block">Fps Tracker</span>
            <span className="font-mono text-cyan-400 font-bold">{fpsRate} Frames/s</span>
          </div>
          <div>
            <span className="text-zinc-600 block">Bandwidth Bitrate</span>
            <span className="font-mono text-cyan-400 font-bold">{bitrateValue} kbps</span>
          </div>
          <div>
            <span className="text-zinc-600 block">Acoustic Suppressor</span>
            <span className={`font-mono font-bold ${noiseSuppression ? 'text-emerald-400' : 'text-zinc-500'}`}>
              {noiseSuppression ? 'DNL_ACTIVE' : 'DEACTIVATED'}
            </span>
          </div>
        </div>

        {/* Timer, Locks & Share button */}
        <div className="flex items-center gap-3.5">
          <button 
            onClick={() => setIsMeetingLocked(!isMeetingLocked)} 
            className={`px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 uppercase tracking-wider text-[10px] cursor-pointer ${
              isMeetingLocked 
                ? 'bg-rose-950 border-rose-500/30 text-rose-400' 
                : 'bg-slate-800 border-white/5 text-zinc-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Lock size={12} />
            <span>{isMeetingLocked ? 'CALL_LOCKED' : 'LOCK'}</span>
          </button>

          <button 
            onClick={() => setIsShareDeviceModalOpen(true)}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3 py-1.5 rounded-lg font-bold transition-all text-[11px] flex items-center gap-1.5 cursor-pointer uppercase shadow-[0_0_15px_rgba(6,182,212,0.25)]"
          >
            <Share2 size={12} />
            <span>Link Phone/Laptop</span>
          </button>

          <div className="bg-slate-850 border border-white/10 px-3.5 py-1.5 rounded-xl font-mono text-[11px] text-cyan-400 flex items-center gap-2 font-black shadow-[0_0_10px_rgba(6,182,212,0.1)]">
            <Radio size={12} className="text-cyan-400 animate-pulse" />
            <span>{formattedCallTime()}</span>
          </div>
        </div>
      </header>

      {/* 🤝 Drifter Entry Notification (Waiting Room banner) */}
      {waitingParticipant.active && (
        <div className="bg-amber-500/10 border-b border-amber-500/25 px-4 py-2.5 flex items-center justify-between text-xs z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="text-amber-400 font-bold uppercase tracking-wider">Waiting Room Request:</span>
            <span className="text-zinc-300 font-mono">
              <strong>{waitingParticipant.name}</strong> ({waitingParticipant.role}) is waiting to be linked.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                setWaitingParticipant({ ...waitingParticipant, active: false });
                triggerBeepTone(400, 'sine');
              }}
              className="text-zinc-400 hover:text-white px-2.5 py-1 rounded"
            >
              Declined
            </button>
            <button 
              onClick={() => {
                setAddedMembers([...addedMembers, {
                  id: "oracle",
                  name: "Oracle Web Stream",
                  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
                  role: "Operator"
                }]);
                setWaitingParticipant({ ...waitingParticipant, active: false });
                triggerBeepTone(900, 'sine');
              }}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded shadow-lg uppercase text-[10px]"
            >
              Approve Entry
            </button>
          </div>
        </div>
      )}

      {/* Middle Core Area: Split Screen & Shared Draw Board */}
      <div className="flex-1 flex overflow-hidden lg:flex-row flex-col relative">
        
        {/* Calling Videos/Display Streams Grid */}
        <div className="flex-1 p-2 sm:p-4 overflow-y-auto flex flex-col justify-center relative min-h-0">
          
          <div className={`grid gap-2 sm:gap-4 w-full h-full max-w-5xl mx-auto items-center ${
            isScreenSharing 
              ? 'grid-cols-1 lg:grid-cols-3' 
              : isGroupMode 
                ? 'grid-cols-2 lg:grid-cols-2' 
                : 'grid-cols-2 sm:grid-cols-2'
          }`}>

            {/* Screen Share Stream Container */}
            {isScreenSharing && (
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border-2 border-cyan-400/50 flex flex-col justify-between p-3 col-span-1 lg:col-span-2 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                <div className="absolute inset-0 bg-cyan-950/20" />
                <video 
                  ref={screenVideoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                <div className="relative z-10 flex justify-between items-start">
                  <span className="bg-cyan-500 text-slate-950 font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-widest shadow-md">
                    LIVE_PRESENTATION
                  </span>
                  <button 
                    onClick={stopScreenShare}
                    className="p-1.5 bg-red-600 rounded-lg text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
                <div className="relative z-10 mt-auto bg-slate-950/80 px-2 py-1 rounded text-[10px] text-cyan-400 w-fit">
                  🖥️ High Clarity Screen Sharing (Active)
                </div>
              </div>
            )}

            {/* Local Operator Video Stream */}
            <div className={`relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-slate-900 flex flex-col justify-between p-3 shadow-xl ${
              lowBandwidthMode ? 'brightness-75 contrast-125 grayscale' : ''
            }`}>
              
              {/* Scanline element */}
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.02] via-transparent to-cyan-500/[0.02] pointer-events-none" />
              <div className="absolute inset-x-0 h-0.5 bg-cyan-400/10 shadow-[0_0_10px_rgba(6,182,212,0.3)] animate-scanline pointer-events-none" />

              {/* Real Camera Video Output */}
              {!isVideoOff && (
                localStream ? (
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />
                ) : (
                  videoErrors.local ? (
                    renderVideoFallback("Operator", userProfile?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80", "Local Telemetry Feed Ready")
                  ) : (
                    <video 
                      src="https://assets.mixkit.co/videos/preview/mixkit-young-man-with-headphones-talking-40193-large.mp4"
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      referrerPolicy="no-referrer"
                      onError={() => setVideoErrors(prev => ({ ...prev, local: true }))}
                      className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-85 z-0"
                    />
                  )
                )
              )}

              {/* Dynamic Virtual background and Portrait Face Tracking Mock brackets */}
              {virtualBackground !== "none" && (
                <div className="absolute inset-0 pointer-events-none mix-blend-color-dodge">
                  {virtualBackground === "blur" && <div className="absolute inset-0 backdrop-blur-lg bg-teal-900/10" />}
                  {virtualBackground === "matrix" && <div className="absolute inset-0 bg-[radial-gradient(#0f0_1px,transparent_1px)] bg-[size:16px_16px] opacity-35" />}
                  {virtualBackground === "space" && <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 via-transparent to-cyan-900/40 opacity-40 animate-pulse" />}
                </div>
              )}

              {faceTracking && !isVideoOff && (
                <div 
                  className="absolute border border-dashed border-emerald-500 rounded-md pointer-events-none z-10 transition-all duration-300"
                  style={{
                    left: `${faceBbox.x}%`,
                    top: `${faceBbox.y}%`,
                    width: `${faceBbox.w}%`,
                    height: `${faceBbox.h}%`
                  }}
                >
                  <span className="absolute -top-4 -left-1 text-[8px] font-mono bg-emerald-950 px-1 py-0.5 rounded text-emerald-400 uppercase font-black">
                    TARGET: OPERATOR [LOCK]
                  </span>
                  <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-emerald-400" />
                </div>
              )}

              {/* Header UI elements */}
              <div className="relative z-10 flex justify-between">
                <span className="text-[9px] bg-black/60 border border-white/5 px-2 py-1 rounded text-cyan-400 font-bold uppercase tracking-widest animate-pulse">
                  {isScreenSharing ? 'PRESENTING' : 'CAMERA_FEED: LOCAL'}
                </span>
                <span className="text-zinc-500 font-mono text-[9px]">SYNCING_RGB</span>
              </div>

              {/* Fallback Camera Mock placeholder (showing if camera blocked) */}
              {isVideoOff && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 py-4">
                  <div className="w-14 h-14 rounded-full border border-dashed border-white/15 flex items-center justify-center text-zinc-500 mb-2">
                    <VideoOff size={20} />
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Biometric Shielded</span>
                </div>
              )}

              {/* Label Operator details */}
              <div className="relative z-10 flex items-center justify-between mt-auto bg-slate-950/80 p-2 rounded-lg gap-2 text-[10px]">
                <span className="font-bold flex items-center gap-1.5 uppercase text-white font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> Operator (Me)
                </span>
                <div className="flex gap-1.5">
                  {isMuted ? <MicOff size={11} className="text-rose-500" /> : <Mic size={11} className="text-cyan-400" />}
                </div>
              </div>
            </div>

            {/* Target Drifter Partner Video Frame */}
            <div className={`relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-slate-900 flex flex-col justify-between p-3 shadow-xl ${
              lowBandwidthMode ? 'brightness-75 contrast-125 grayscale' : ''
            }`}>
              <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.01] via-transparent to-cyan-500/[0.01] pointer-events-none" />
              
              {/* Loop video simulating live 1-to-1 video stream / remote face */}
              {videoErrors.partner ? (
                renderVideoFallback(callTarget.name, callTarget.avatar, "Inbound Telemetry Feed Safe")
              ) : (
                <video 
                  src="https://assets.mixkit.co/videos/preview/mixkit-young-woman-with-glasses-talking-to-camera-40156-large.mp4"
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  referrerPolicy="no-referrer"
                  onError={() => setVideoErrors(prev => ({ ...prev, partner: true }))}
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-80 z-0"
                />
              )}

              <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply" />
              <div className="absolute inset-0 border border-purple-500/10 pointer-events-none rounded-2xl" />

              <div className="relative z-10 flex justify-between">
                <span className="text-[9px] bg-black/60 border border-white/5 px-2 py-1 rounded text-purple-400 font-bold uppercase tracking-widest">
                  LINK FEED: INBOUND
                </span>
                <span className="text-zinc-400 font-mono text-[9px] bg-black/60 px-1.5 py-0.5 rounded border border-white/5 uppercase font-bold">Latency: {callTarget.latency || '0.12ms'}</span>
              </div>

              <div className="relative z-10 flex items-center justify-between mt-auto bg-slate-950/80 p-2 rounded-lg text-[10px]">
                <span className="font-bold flex items-center gap-1.5 uppercase text-white font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" /> {callTarget.name}
                </span>
                <span className="text-[8px] bg-cyan-950 border border-cyan-900 px-1.5 py-0.5 rounded text-cyan-400 font-black">ACTIVE</span>
              </div>
            </div>

            {/* Extra Simulated members for Group Video Call mode */}
            {isGroupMode && (
              <>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-slate-900 flex flex-col justify-between p-3 col-span-1 shadow-xl">
                  {/* Participant 3 loop video */}
                  {videoErrors.luna ? (
                    renderVideoFallback("Dr. Luna Vane", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", "Inbound Advisor Node Active")
                  ) : (
                    <video 
                      src="https://assets.mixkit.co/videos/preview/mixkit-woman-talking-on-video-call-40011-large.mp4"
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      referrerPolicy="no-referrer"
                      onError={() => setVideoErrors(prev => ({ ...prev, luna: true }))}
                      className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-85 z-0"
                    />
                  )}
                  <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply" />

                  <div className="relative z-10 flex justify-between">
                    <span className="text-[9px] bg-black/60 border border-white/5 px-2 py-1 rounded text-indigo-400 font-bold uppercase tracking-widest">
                      MEM_FEED: INBOUND
                    </span>
                    <span className="text-zinc-400 font-mono text-[9px] bg-black/60 px-1.5 py-0.5 rounded border border-white/5 uppercase font-bold">DR_VANE</span>
                  </div>

                  <div className="relative z-10 mt-auto bg-slate-950/80 p-1.5 rounded text-[10px] uppercase font-mono flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1">👤 Dr. Luna Vane</span>
                    <span className="text-[8px] uppercase text-emerald-400 font-bold">MUTED</span>
                  </div>
                </div>

                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-slate-900 flex flex-col justify-between p-3 col-span-1 shadow-xl">
                  {/* Participant 4 loop video */}
                  {videoErrors.kaelen ? (
                    renderVideoFallback("Kaelen Vex", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80", "Inbound Decker Node Active")
                  ) : (
                    <video 
                      src="https://assets.mixkit.co/videos/preview/mixkit-man-working-on-his-laptop-at-home-41585-large.mp4"
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      referrerPolicy="no-referrer"
                      onError={() => setVideoErrors(prev => ({ ...prev, kaelen: true }))}
                      className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-85 z-0"
                    />
                  )}
                  <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply" />

                  <div className="relative z-10 flex justify-between">
                    <span className="text-[9px] bg-black/60 border border-white/5 px-2 py-1 rounded text-purple-400 font-bold uppercase tracking-widest">
                      MEM_FEED: INBOUND
                    </span>
                    <span className="text-zinc-400 font-mono text-[9px] bg-black/60 px-1.5 py-0.5 rounded border border-white/5 uppercase font-bold">VEX_GRID</span>
                  </div>

                  <div className="relative z-10 mt-auto bg-slate-950/80 p-1.5 rounded text-[10px] uppercase font-mono flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1">👤 Kaelen Vex</span>
                    <span className="text-[8px] uppercase text-cyan-400 font-bold">TALKING</span>
                  </div>
                </div>
              </>
            )}

            {/* Approved extra nodes (from Waiting Room) */}
            {addedMembers.map(member => (
              <div key={member.id} className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-slate-900 flex flex-col justify-between p-3 col-span-1 shadow-xl">
                {/* Participant 5 loop video */}
                {videoErrors[member.id] ? (
                  renderVideoFallback(member.name, member.avatar, "Approved Node Feed Secure")
                ) : (
                  <video 
                    src="https://assets.mixkit.co/videos/preview/mixkit-business-professional-working-on-a-laptop-42352-large.mp4"
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    referrerPolicy="no-referrer"
                    onError={() => setVideoErrors(prev => ({ ...prev, [member.id]: true }))}
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none opacity-85 z-0"
                  />
                )}
                <div className="absolute inset-0 bg-slate-950/20 mix-blend-multiply" />

                <div className="relative z-10 flex justify-between">
                  <span className="text-[9px] bg-black/60 border border-white/5 px-2 py-1 rounded text-amber-400 font-bold uppercase tracking-widest animate-pulse">
                    NODE: APPROVED
                  </span>
                </div>

                <div className="relative z-10 mt-auto bg-slate-950/80 p-1.5 rounded text-[10px] uppercase font-mono flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1">👤 {member.name}</span>
                  <span className="text-[8px] uppercase text-emerald-400 font-bold">LINKED</span>
                </div>
              </div>
            ))}

          </div>

          {/* Subtitles & Captions Bar (Interactive Language Translation) */}
          <div className="mt-4 bg-slate-950/80 border border-white/5 p-3 rounded-2xl max-w-4xl mx-auto w-full flex items-start gap-3 shadow-lg select-text">
            <div className="bg-cyan-950/50 p-2.5 rounded-xl border border-cyan-800/30 text-cyan-400 shrink-0">
              <Layers size={15} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] text-cyan-500 font-black tracking-widest uppercase block">
                  🛡️ Live STT Caption Feed {translateLang !== 'none' ? `| Translated to: ${translateLang.toUpperCase()}` : ''}
                </span>
                
                {/* Translate Language selectors */}
                <div className="flex items-center gap-1 text-[9px]">
                  <span className="text-zinc-500">Translate:</span>
                  {['none', 'bn', 'ja', 'es', 'de'].map(lang => (
                    <button 
                      key={lang} 
                      onClick={() => {
                        setTranslateLang(lang);
                        triggerBeepTone(400 + lang.charCodeAt(0)*2, 'sine');
                      }}
                      className={`px-1.5 py-0.5 rounded uppercase cursor-pointer ${
                        translateLang === lang 
                          ? 'bg-cyan-500 text-slate-950 font-bold' 
                          : 'text-zinc-400 bg-slate-900 hover:text-white'
                      }`}
                    >
                      {lang === 'none' ? 'OFF' : lang}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-zinc-200 text-xs mt-1.5 leading-relaxed font-mono">
                "{getTranslatedSubtitle()}"
              </p>
            </div>
            <div className="text-right inline-block shrink-0">
              <span className="text-[9px] text-zinc-500 block">NOISE ENVELOPE</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{noiseFilterLevel} dB</span>
            </div>
          </div>

          {/* Real-time speech audio visualizer */}
          <div className="h-6 max-w-4xl mx-auto w-full mt-2 flex items-center gap-2 px-1">
            <span className="text-[8px] text-zinc-600 uppercase font-bold shrink-0">Frequency visual</span>
            <canvas ref={audioWaveCanvasRef} width={450} height={20} className="flex-1 h-3 block opacity-75" />
            <span className="text-[8px] text-emerald-400 font-bold shrink-0">99.2% Suppress</span>
          </div>

        </div>

        {/* 💬 Collaboration Drawer Sidebar (Chat, drawing Board, Notes) */}
        {isDrawerOpen && (
          <aside className="w-full lg:w-[410px] lg:static absolute right-0 top-[56px] bottom-[140px] lg:bottom-0 bg-slate-900/98 shadow-2xl flex flex-col border-t lg:border-t-0 lg:border-l border-white/10 overflow-hidden z-40 transition-all duration-300">
            
            {/* Drawer Tab Header buttons */}
            <div className="bg-slate-950 p-2 flex items-center justify-between border-b border-white/10 shrink-0">
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => { setActiveTab("chat"); triggerBeepTone(500, 'sine'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs uppercase flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'chat' 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <MessageSquare size={13} />
                  <span>Chat</span>
                </button>
                <button 
                  onClick={() => { setActiveTab("whiteboard"); triggerBeepTone(550, 'sine'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs uppercase flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'whiteboard' 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Palette size={13} />
                  <span>Presenter Board</span>
                </button>
                <button 
                  onClick={() => { setActiveTab("ai"); triggerBeepTone(600, 'sine'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs uppercase flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'ai' 
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sparkles size={13} />
                  <span>AI Summary</span>
                </button>
              </div>

              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-zinc-500 hover:text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* TAB CONTAINER 1: IN-CALL CHAT & COLLAB POLLS */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col overflow-hidden p-3.5 gap-4">
                
                {/* Chat items list scroll */}
                <div className="flex-1 overflow-y-auto space-y-3 p-1 select-text">
                  {chatMessages.map((m, idx) => (
                    <div key={idx} className={`p-2.5 rounded-xl border text-xs leading-relaxed ${
                      m.sender === 'System'
                        ? 'bg-slate-950/60 border-cyan-500/10 text-cyan-400 font-mono text-[10px]'
                        : m.sender === 'Operator (Me)'
                          ? 'bg-cyan-950/20 border-cyan-500/15 ml-4 text-cyan-100'
                          : 'bg-indigo-950/20 border-purple-500/10 mr-4 text-slate-200'
                    }`}>
                      <div className="flex justify-between items-center mb-0.5 opacity-90">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-cyan-400">{m.sender}</span>
                        <span className="text-[8px] text-zinc-500">{m.time}</span>
                      </div>
                      <p>{m.text}</p>
                    </div>
                  ))}
                </div>

                {/* Cyber Poll Column */}
                <div className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-2.5 shrink-0">
                  <header className="flex justify-between items-center text-[10px] font-black uppercase text-cyan-400">
                    <span className="flex items-center gap-1.5"><BarChart2 size={12} /> Live Collab Poll</span>
                    <span className="bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800 text-[8px]">In-call</span>
                  </header>
                  <p className="text-xs text-zinc-300">"Approval of Neural Node Entry Protocol v4.8?"</p>
                  
                  <div className="space-y-1.5 text-xs font-mono">
                    <button 
                      onClick={() => handleVote('choiceA')}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all relative overflow-hidden flex justify-between items-center cursor-pointer ${
                        pollVotes.userVoted === 'choiceA' 
                          ? 'border-cyan-400/30' 
                          : 'border-white/5 hover:border-white/10 bg-slate-900/60'
                      }`}
                    >
                      <div className="absolute inset-y-0 left-0 bg-cyan-500/10" style={{ width: `${Math.round((pollVotes.choiceA / (pollVotes.choiceA + pollVotes.choiceB)) * 100)}%` }} />
                      <span className="relative font-bold text-cyan-300">Node Option A: ACCEPT TERMINAL</span>
                      <span className="relative font-mono font-bold text-cyan-400">{pollVotes.choiceA} votes ({Math.round((pollVotes.choiceA / (pollVotes.choiceA + pollVotes.choiceB)) * 100)}%)</span>
                    </button>

                    <button 
                      onClick={() => handleVote('choiceB')}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all relative overflow-hidden flex justify-between items-center cursor-pointer ${
                        pollVotes.userVoted === 'choiceB' 
                          ? 'border-cyan-400/30' 
                          : 'border-white/5 hover:border-white/10 bg-slate-900/60'
                      }`}
                    >
                      <div className="absolute inset-y-0 left-0 bg-purple-500/10" style={{ width: `${Math.round((pollVotes.choiceB / (pollVotes.choiceA + pollVotes.choiceB)) * 100)}%` }} />
                      <span className="relative font-bold text-purple-300">Node Option B: DELAY ACCESS</span>
                      <span className="relative font-mono font-bold text-purple-400">{pollVotes.choiceB} votes ({Math.round((pollVotes.choiceB / (pollVotes.choiceA + pollVotes.choiceB)) * 100)}%)</span>
                    </button>
                  </div>
                </div>

                {/* Chat messenger input form */}
                <form onSubmit={sendChatMessage} className="flex gap-2 shrink-0">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type inside secure channel..." 
                    className="flex-1 bg-slate-950 text-xs px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-400 placeholder:text-zinc-600 text-white"
                  />
                  <button 
                    type="submit" 
                    className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)] cursor-pointer"
                  >
                    <Send size={15} />
                  </button>
                </form>

              </div>
            )}

            {/* TAB CONTAINER 2: INTERACTIVE HIGH-TECH WHITEBOARD */}
            {activeTab === 'whiteboard' && (
              <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
                <header className="flex justify-between items-center">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      🎨 Holographic Drawing Board
                    </h4>
                    <p className="text-[10px] text-zinc-500 uppercase mt-0.5 font-mono">Present ideas Vector-space coordinates</p>
                  </div>
                  <button 
                    onClick={clearWhiteboard}
                    className="p-1 px-2.5 bg-rose-950 text-rose-400 hover:text-white hover:bg-red-900 rounded border border-rose-800/40 font-mono text-[9px] uppercase transition-all cursor-pointer"
                  >
                    Clear Vector
                  </button>
                </header>

                {/* Color and thickness tool selectors */}
                <div className="flex items-center justify-between text-xs font-mono bg-slate-950 p-2.5 rounded-xl border border-white/5 shrink-0 gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500 text-[9px] mr-1 uppercase">Pen:</span>
                    {['#00f0ff', '#ff007f', '#39ff14', '#ffff00', '#ffffff'].map(col => (
                      <button 
                        key={col} 
                        onClick={() => setDrawColor(col)}
                        style={{ backgroundColor: col }}
                        className={`w-4 h-4 rounded-full transition-all cursor-pointer ${
                          drawColor === col ? 'scale-125 ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950' : 'opacity-85 hover:opacity-100'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-zinc-500 text-[9px] mr-1 uppercase">Size:</span>
                    {[2, 4, 8, 12].map(wt => (
                      <button 
                        key={wt} 
                        onClick={() => setDrawWeight(wt)}
                        className={`px-1.5 py-0.5 text-[10px] rounded cursor-pointer ${
                          drawWeight === wt ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-zinc-400 bg-slate-900 hover:text-white'
                        }`}
                      >
                        {wt}px
                      </button>
                    ))}
                  </div>
                </div>

                {/* Working Canvas drawing context body */}
                <div className="relative border border-cyan-500/20 rounded-2xl overflow-hidden bg-slate-950 h-64 shadow-inner">
                  <canvas 
                    ref={whiteboardCanvasRef}
                    width={380}
                    height={256}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawingContext}
                    onMouseLeave={stopDrawingContext}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawingContext}
                    className="w-full h-full block cursor-crosshair"
                  />
                  {!isDrawing && (
                    <div className="absolute inset-4 flex flex-col items-center justify-center pointer-events-none select-none text-center">
                      <p className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider">Drag to trace vector markers</p>
                      <span className="text-[8px] uppercase text-zinc-700 block mt-1">Both mobile touches and cursor mouse events fully linked</span>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-2">
                  <header className="text-[9px] font-bold text-zinc-500 uppercase flex items-center justify-between">
                    <span>Holographic canvas logs</span>
                    <span className="text-cyan-400">READY</span>
                  </header>
                  <p className="text-[10px] leading-relaxed text-zinc-400">
                    Presentation details will project into remote nodes instantaneously. Useful for network pathing during team ingress sessions.
                  </p>
                </div>
              </div>
            )}

            {/* TAB CONTAINER 3: AI INTELLIGENT MEETING NOTES & SUMMARIZATION */}
            {activeTab === 'ai' && (
              <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
                <header>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Sparkles size={13} className="text-purple-400" /> AI Intel Synthesizer
                  </h4>
                  <p className="text-[10px] text-zinc-500 uppercase mt-0.5 font-mono">Consolidating link speech transcripts</p>
                </header>

                <div className="space-y-3.5 flex-1">
                  
                  {/* Notes tracker */}
                  <div className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-2">
                    <header className="flex justify-between items-center text-[9px] text-purple-400 font-bold uppercase">
                      <span>Real-time Transcribing Notes</span>
                      <span className="text-emerald-400">CAPTURE ACTIVE</span>
                    </header>
                    <ul className="text-[10px] font-mono text-zinc-400 space-y-1.5 list-disc pl-3 leading-snug">
                      <li>Network coordinates initiated from Web App shell.</li>
                      <li>Secure tunnel initialized on port 3000 behind reverse proxy.</li>
                      <li>Noise cancellation suppresses ambient sound successfully.</li>
                      <li>Presenter whiteboard active. Link parameters validated by system.</li>
                    </ul>
                  </div>

                  {/* Summary trigger block */}
                  <div className="space-y-2">
                    <button 
                      onClick={generateMeetingSummary}
                      disabled={aiSummaryLoading}
                      className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-purple-950 disabled:text-zinc-500 text-slate-950 py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 uppercase shadow-[0_0_15px_rgba(168,85,247,0.25)] cursor-pointer"
                    >
                      {aiSummaryLoading ? (
                        <>
                          <RefreshCw size={13} className="animate-spin text-slate-950" />
                          <span>Generating Summary Report...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} className="text-slate-950" />
                          <span>Compile AI Meeting Summary</span>
                        </>
                      )}
                    </button>
                    <span className="text-[8px] text-zinc-600 block text-center uppercase">Consolidating transcription logs</span>
                  </div>

                  {/* Summary Output display */}
                  {aiSummary && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-purple-500/25 space-y-2 text-xs leading-relaxed select-text animate-fade-in shadow-lg">
                      <header className="flex justify-between items-center text-[10px] text-purple-400 font-bold uppercase border-b border-white/5 pb-1.5">
                        <span className="flex items-center gap-1.5"><Check size={12} /> Live Compilation Output</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(aiSummary);
                            triggerBeepTone(850, 'sine');
                          }}
                          className="text-[9px] underline hover:text-white cursor-pointer"
                        >
                          Copy Text
                        </button>
                      </header>
                      <div className="font-mono text-zinc-300 text-[10px] whitespace-pre-wrap leading-casual">
                        {aiSummary}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

          </aside>
        )}

      </div>

      {/* 🎮 Bottom Control Console - Meeting & Call Toggles */}
      <footer className="shrink-0 bg-slate-900 border-t border-white/10 p-3 flex flex-col md:flex-row items-center justify-between gap-4 z-10">
        
        {/* Collaboration widgets indicators: reaction pads */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-zinc-500 uppercase mr-1.5 hidden md:block select-none">Send Burst:</span>
          {['👍', '❤️', '🔥', '🎉', '🚀', '💡'].map(emoji => (
            <button 
              key={emoji} 
              onClick={() => triggerReaction(emoji)}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-lg transition-transform hover:scale-125 cursor-pointer active:scale-90"
              title={`Emit ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Core Media togglers center */}
        <div className="flex items-center gap-2.5">
          {/* Mute Audio */}
          <button
            onClick={() => {
              triggerBeepTone(isMuted ? 600 : 300, 'sine');
              setIsMuted(!isMuted);
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              isMuted 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
                : 'bg-slate-800 border-white/5 text-zinc-400 hover:text-white hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Video Toggle */}
          <button
            onClick={() => {
              triggerBeepTone(isVideoOff ? 700 : 350, 'sawtooth');
              setIsVideoOff(!isVideoOff);
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              isVideoOff 
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
                : 'bg-slate-800 border-white/5 text-zinc-400 hover:text-white hover:bg-slate-700'
            }`}
            title={isVideoOff ? 'Enable Camera' : 'Disable Camera'}
          >
            {isVideoOff ? <VideoOff size={18} /> : <Video size={18} />}
          </button>

          {/* Screen Share toggle */}
          <button
            onClick={startScreenShare}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              isScreenSharing 
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400 animate-pulse' 
                : 'bg-slate-800 border-white/5 text-zinc-400 hover:text-white hover:bg-slate-700'
            }`}
            title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
          >
            <Monitor size={18} />
          </button>

          {/* Collapsible Presenter Board / Whiteboard */}
          <button
            onClick={() => {
              triggerBeepTone(500, 'sine');
              setIsDrawerOpen(!isDrawerOpen);
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              isDrawerOpen 
                ? 'bg-cyan-500/10 border-cyan-400/20 text-cyan-400' 
                : 'bg-slate-800 border-white/5 text-zinc-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Toggle Right Collab Panel"
          >
            <MessageSquare size={18} />
          </button>

          {/* Floating Settings & Advanced Video Features Modal */}
          <button
            onClick={() => {
              triggerBeepTone(610, 'sine');
              setIsFeaturesModalOpen(true);
            }}
            className="p-3.5 bg-slate-800 border border-white/5 text-zinc-400 hover:text-white hover:bg-slate-700 rounded-2xl cursor-pointer"
            title="Meeting & Video Settings"
          >
            <Sliders size={18} />
          </button>

          {/* Separator */}
          <div className="w-px h-8 bg-zinc-800 self-center mx-1.5 hidden md:block" />

          {/* Group Calling toggle */}
          <button 
            onClick={() => {
              setIsGroupMode(!isGroupMode);
              triggerBeepTone(isGroupMode ? 300 : 700, 'sine');
            }}
            className={`px-3 py-3 rounded-2xl border transition-all flex items-center gap-2 cursor-pointer ${
              isGroupMode 
                ? 'bg-indigo-500/25 border-indigo-500/30 text-indigo-300' 
                : 'bg-slate-800 border-white/5 text-zinc-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Toggle Group Call simulation"
          >
            <Users size={18} />
            <span className="text-[10px] uppercase font-bold hidden md:inline">
              {isGroupMode ? 'GROUP: ON (4)' : '1-to-1 CALL'}
            </span>
          </button>

          {/* Severe End Call */}
          <button
            onClick={() => {
              triggerBeepTone(150, 'sawtooth');
              if (localStream) {
                localStream.getTracks().forEach(t => t.stop());
              }
              if (screenStream) {
                screenStream.getTracks().forEach(t => t.stop());
              }
              onEndCall();
            }}
            className="p-4 bg-rose-600 hover:bg-rose-500 rounded-2xl text-white font-bold transition-all transform active:scale-95 shadow-[0_0_20px_rgba(244,63,94,0.4)] cursor-pointer"
            title="Disconnect Connection Link"
          >
            <PhoneOff size={20} />
          </button>
        </div>

        {/* Platform identity signature */}
        <div className="text-[9px] text-zinc-500 font-mono hidden md:block select-none">
          ONYX MEETING NET_STATION // PORT 3000 STABLE
        </div>

      </footer>

      {/* ⚙️ POPUP MODAL: MEETING & AI CONGREGATION SETTINGS */}
      {isFeaturesModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[7000] p-4 transition-all">
          <div className="relative max-w-lg w-full bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative font-mono text-xs text-zinc-300 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            
            <header className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="text-cyan-400" size={16} />
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">Acoustic & Video settings</h3>
              </div>
              <button 
                onClick={() => setIsFeaturesModalOpen(false)}
                className="p-1.5 text-zinc-500 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                <X size={14} />
              </button>
            </header>

            {/* Video Features Grid */}
            <div className="space-y-4">
              
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">📹 Advanced Video Processing</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Virtual backgrounds */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1.5">
                    <span className="text-[9px] text-zinc-500 uppercase block">Virtual Background</span>
                    <select 
                      value={virtualBackground} 
                      onChange={(e) => setVirtualBackground(e.target.value)} 
                      className="w-full bg-slate-900 text-[11px] py-1.5 px-2 rounded focus:outline-none border border-white/10 text-white"
                    >
                      <option value="none">No Filter (Real Feed)</option>
                      <option value="blur">Soft Background Blur</option>
                      <option value="matrix">Neon Matrix Green Rain</option>
                      <option value="space">Cosmic Starfield overlay</option>
                    </select>
                  </div>

                  {/* Face tracking */}
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-emerald-400 uppercase block font-bold">Auto framing / tracking</span>
                      <span className="text-[8px] text-zinc-500">Overlay vector mesh</span>
                    </div>
                    <button 
                      onClick={() => setFaceTracking(!faceTracking)}
                      className={`px-3 py-1.5 rounded uppercase font-bold text-[9px] cursor-pointer ${
                        faceTracking ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-zinc-400'
                      }`}
                    >
                      {faceTracking ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* HD Standard Quality */}
                  <div className="bg-slate-950/60 p-2.5 rounded-xl border border-white/5 col-span-1 sm:col-span-2 space-y-2">
                    <span className="text-[9px] text-zinc-500 uppercase block">Video Resolution Mode</span>
                    <div className="flex gap-1.5">
                      {[
                        { k: '1080p_hd', l: 'HD 1080p' },
                        { k: '720p', l: 'Standard 720p' },
                        { k: 'adaptive', l: 'Adaptive (Auto)' },
                        { k: 'low', l: 'Low Bandwidth (Scanline)' }
                      ].map(ql => (
                        <button
                          key={ql.k}
                          onClick={() => {
                            setSelectedQuality(ql.k);
                            setLowBandwidthMode(ql.k === 'low');
                            triggerBeepTone(400, 'sine');
                          }}
                          className={`flex-1 text-[9px] py-2 rounded text-center transition-all uppercase font-bold cursor-pointer ${
                            selectedQuality === ql.k 
                              ? 'bg-cyan-500 text-slate-950' 
                              : 'bg-slate-900 hover:bg-slate-850 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {ql.l}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Audio Settings */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">🎤 Acoustic Suppressor Sync</span>
                <div className="space-y-2.5">
                  {[
                    { state: noiseSuppression, updater: setNoiseSuppression, label: "AI Noise Suppression (99.4% filter)", desc: "Deep brain background noise removal filter" },
                    { state: echoCancellation, updater: setEchoCancellation, label: "Echo Acoustic Cancellation", desc: "Bypasses acoustic feed loop loops" },
                    { state: autoGainControl, updater: setAutoGainControl, label: "Automatic Gain Control", desc: "Auto-calibrator for decibel inputs" }
                  ].map((aud, index) => (
                    <div key={index} className="bg-slate-950/60 p-3 rounded-xl border border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-300 block">{aud.label}</span>
                        <span className="text-[8px] text-zinc-500 block">{aud.desc}</span>
                      </div>
                      <button 
                        onClick={() => {
                          aud.updater(!aud.state);
                          triggerBeepTone(500, 'sine');
                        }}
                        className={`px-3 py-1.5 rounded uppercase font-bold text-[9px] cursor-pointer ${
                          aud.state ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-zinc-400'
                        }`}
                      >
                        {aud.state ? 'ACTIVE' : 'MUTED'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* End-to-End Handshake mode */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-dashed border-cyan-500/20 flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase block">Secure AES-512 Handshake</span>
                  <p className="text-[8px] text-zinc-500 mt-0.5">Encrypts audio/video packets from end to end</p>
                </div>
                <button 
                  onClick={() => {
                    setIsE2EEncrypt(!isE2EEncrypt);
                    triggerBeepTone(isE2EEncrypt ? 200 : 900, 'sawtooth');
                  }}
                  className={`px-3 py-1.5 rounded uppercase text-[9px] font-black cursor-pointer ${
                    isE2EEncrypt ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-zinc-400'
                  }`}
                >
                  {isE2EEncrypt ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>

            </div>

            <footer className="mt-2 text-right">
              <button 
                onClick={() => setIsFeaturesModalOpen(false)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] px-5 py-2.5 rounded-xl uppercase hover:scale-95 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer"
              >
                Apply Parameters
              </button>
            </footer>

          </div>
        </div>
      )}

      {/* 📱 UNIQUE POPUP MODAL: LAPTOP TO PHONE SYNC DRAWER */}
      {isShareDeviceModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[7000] p-4 transition-all">
          <div className="relative max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl relative font-mono text-xs text-zinc-300 flex flex-col gap-4">
            
            <header className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <Laptop className="text-cyan-400" size={16} />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">Device Synchronization Link</h3>
              </div>
              <button 
                onClick={() => setIsShareDeviceModalOpen(false)}
                className="p-1 text-zinc-500 hover:text-white bg-slate-800 rounded-lg cursor-pointer"
              >
                <X size={14} />
              </button>
            </header>

            <div className="space-y-3.5">
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                To link call sync between your <strong>Phone</strong> and your <strong>Laptop</strong> in real-time, share or open this live instance link:
              </p>

              {/* Link Box */}
              <div className="bg-slate-950 p-3 rounded-xl border border-white/5 flex items-center justify-between gap-3 font-mono">
                <span className="text-[10px] text-cyan-400 truncate flex-1 select-text">
                  {window.location.href}
                </span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    triggerBeepTone(800, 'sine');
                  }}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-2.5 py-1 rounded select-none text-[9px] uppercase cursor-pointer"
                >
                  Copy Link
                </button>
              </div>

              {/* Technical steps */}
              <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1.5 text-[11px]">
                <span className="text-[9px] text-zinc-500 uppercase block font-bold">Cross-Device Calling Instructions:</span>
                <ol className="list-decimal pl-4 text-zinc-400 space-y-1 font-sans">
                  <li>Copy this server web URL above.</li>
                  <li>Send or scan this link on your secondary device (phone or laptop).</li>
                  <li>Sign in as a different Drifter Node (e.g. <strong>Sasha</strong> or <strong>Kaelen</strong>) on the second device.</li>
                  <li>Search for your primary username and click <strong>Initiate Call</strong>.</li>
                  <li>Both systems will synchronize over the live Socket Synapse instantly!</li>
                </ol>
              </div>

              {/* Cross-device pairing mockup */}
              <div className="flex justify-around items-center bg-slate-950/60 p-4 rounded-xl border border-dashed border-cyan-500/10 text-center text-zinc-400">
                <div className="space-y-1">
                  <Laptop size={20} className="mx-auto text-cyan-400" />
                  <span className="text-[9px] uppercase block font-bold text-white">Laptop Web Node</span>
                </div>
                <div className="text-zinc-600 animate-pulse font-bold text-xs">➔ socket ➔</div>
                <div className="space-y-1">
                  <Smartphone size={20} className="mx-auto text-purple-400" />
                  <span className="text-[9px] uppercase block font-bold text-white">Mobile Web Node</span>
                </div>
              </div>

            </div>

            <footer className="text-right">
              <button 
                onClick={() => setIsShareDeviceModalOpen(false)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] px-4 py-2.5 rounded-xl uppercase transition-all cursor-pointer"
              >
                Close Link Info
              </button>
            </footer>

          </div>
        </div>
      )}

    </div>
  );
};

export default CallScreen;
