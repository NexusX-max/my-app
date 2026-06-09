import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Pause, Scissors, Sparkles, Wand2, Type, Music, Settings, 
  Trash2, Plus, Volume2, Maximize, RotateCcw, Sliders, Gauge, SquareStack,
  Layers, Lock, Eye, EyeOff, Check, CheckCircle, ChevronDown, ChevronUp,
  Clapperboard, Compass, Smile, Grid, Tv, Search, Star, Languages, Activity,
  UserCheck, Flame, Zap, Film, CornerDownRight, HelpCircle
} from "lucide-react";

export default function SmartEditor({ 
  videoSrc, 
  setVideoSrc,
  loadedSegment,
  onPublish,
  timelineTracks,
  setTimelineTracks
}) {
  const videoRef = useRef(null);
  
  // Ribbon & Workspace Tabs
  const [activeRibbon, setActiveRibbon] = useState("ai-tools"); // 'media' | 'audio' | 'text' | 'stickers' | 'effects' | 'transitions' | 'filters' | 'overlays' | 'elements' | 'ai-tools' | 'templates'
  const [activeInspectorTab, setActiveInspectorTab] = useState("video"); // 'video' | 'audio' | 'speed' | 'animation'
  
  // Playback & Timing
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(8.25); // initialized at 00:08:15 as shown in reference
  const [duration, setDuration] = useState(30);
  const [playheadPercent, setPlayheadPercent] = useState(27.5);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  
  // Audio SFX Previews
  const sfxLibrary = [
    { name: "Whoosh transition", duration: "0.8s" },
    { name: "Glitch cyber noise", duration: "1.2s" },
    { name: "Cinematic high-tension drop", duration: "3.5s" },
    { name: "Sub-bass boom swoosh", duration: "2.1s" }
  ];

  // Live Free B-Roll Swapping Bank (Point 3: Video & B-Roll যোগ করবে)
  const bRollBank = [
    { 
      title: "Futuristic Cyberpunk Street walking", 
      url: "https://assets.mixkit.co/videos/preview/mixkit-futuristic-holographic-neon-city-visuals-41801-large.mp4",
      desc: "Vibrant pink & cyan neon light hues"
    },
    { 
      title: "Matrix Digital rain background", 
      url: "https://assets.mixkit.co/videos/preview/mixkit-matrix-style-green-digital-nodes-effect-41811-large.mp4",
      desc: "Retro terminal code stream overlay"
    },
    { 
      title: "Atmospheric Slow City Walk B-roll", 
      url: "https://assets.mixkit.co/videos/preview/mixkit-holographic-neon-sign-post-visual-41821-large.mp4",
      desc: "Handheld ambient low-light drone clip"
    },
    {
      title: "High Octane PC Gaming Loop",
      url: "https://assets.mixkit.co/videos/preview/mixkit-glowing-neon-computer-accessories-on-desk-41831-large.mp4",
      desc: "Intense gameplay graphics montage frame"
    }
  ];

  // Collapsible Inspector Accordions State
  const [accordions, setAccordions] = useState({
    transform: true,
    blend: true,
    stabilization: false,
    aiEnhance: false,
    colorGrading: false,
    mask: false,
    chromaKey: false
  });

  // Track values that actually manipulate the video elements CSS inline!
  const [transform, setTransform] = useState({
    scaleX: 100,
    scaleY: 100,
    posX: 0,
    posY: 0,
    rotate: 0
  });

  const [blend, setBlend] = useState({
    mode: "normal",
    opacity: 100
  });

  const [stabilization, setStabilization] = useState({
    enabled: false,
    strength: 50
  });

  const [aiEnhance, setAiEnhance] = useState({
    enabled: true,
    level: 75
  });

  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturate: 100,
    blur: 0,
    sepia: 0
  });

  const [mask, setMask] = useState({
    type: "none",
    position: 0
  });

  const [chromaKey, setChromaKey] = useState({
    enabled: false,
    color: "#00ff00",
    tolerance: 30
  });

  // Timeline speed state
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [speedCurve, setSpeedCurve] = useState("uniform"); // uniform | curve | bullet-time | montage

  // AI Active Switches
  const [aiToggles, setAiToggles] = useState({
    autoCut: false,
    silenceRemove: true,
    faceTracking: true, // Lock face on preview!
    autoZoom: false,
    beatSync: true,
    beautyRetouch: false,
    skyReplace: false,
    objectRemove: false
  });

  // Subtitle custom styles
  const [captionStyle, setCaptionStyle] = useState("hormozi"); // hormozi | neon | bounce | traditional
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // en | bn | es | fr
  const [emojiCaptions, setEmojiCaptions] = useState(true);
  const [newTextLayer, setNewTextLayer] = useState("");
  
  // Custom toast notification trigger
  const [toastText, setToastText] = useState("");
  const triggerLocalToast = (msg) => {
    setToastText(msg);
    setTimeout(() => setToastText(""), 3000);
  };

  // Sync loaded clip segment from auto-split or copilot
  useEffect(() => {
    if (loadedSegment) {
      if (loadedSegment.type === 'clip') {
        const { clip } = loadedSegment;
        if (videoRef.current) {
          videoRef.current.currentTime = clip.start;
          setCurrentTime(clip.start);
        }
        triggerLocalToast(`Loaded video slice "${clip.title}" at keyframe ${clip.start}s – ${clip.end}s!`);
      } else if (loadedSegment.type === 'hook') {
        if (videoRef.current) {
          videoRef.current.currentTime = 0;
          setCurrentTime(0);
        }
        triggerLocalToast(`Aesthetic introductory hook loaded: "${loadedSegment.text}"`);
      }
    }
  }, [loadedSegment]);

  // Video time tracking
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setCurrentTime(cur);
      const dur = videoRef.current.duration || 30;
      setDuration(dur);
      setPlayheadPercent((cur / dur) * 100);
    }
  };

  const handleTimelineSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const computedPercent = clickX / rect.width;
    const newTargetTime = computedPercent * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTargetTime;
    }
    setCurrentTime(newTargetTime);
    setPlayheadPercent(computedPercent * 100);
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(e => console.log("Play failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Live speed changer
  const handleSpeedChange = (val) => {
    setPlaybackSpeed(val);
    if (videoRef.current) {
      videoRef.current.playbackRate = val;
    }
    triggerLocalToast(`Workspace playback speed set to: ${val}x`);
  };

  // Auto split scissors clip cutter (Neural Multi-track)
  const executeCut = () => {
    const currentFormatted = currentTime.toFixed(2);
    setTimelineTracks(prev => {
      const activeVideo = prev.video[0] || { name: "Cyberpunk_City_Asset.mp4" };
      return {
        ...prev,
        video: [
          { id: `v-left-${Date.now()}`, name: `${activeVideo.name} (Part A)`, duration: Number(currentFormatted), start: 0, end: Number(currentFormatted) },
          { id: `v-right-${Date.now()}`, name: `${activeVideo.name} (Part B)`, duration: duration - Number(currentFormatted), start: Number(currentFormatted), end: duration }
        ]
      };
    });
    triggerLocalToast(`Executed seamless multi-track scissor cut at playhead: ${currentFormatted}s`);
  };

  // Inject manual subtitles
  const addTextTrack = () => {
    if (!newTextLayer.trim()) return;
    const entry = {
      id: "t-layer-" + Date.now(),
      content: emojiCaptions ? `${newTextLayer.toUpperCase()} 🔥` : newTextLayer.toUpperCase(),
      start: Math.max(0, currentTime - 1),
      end: Math.min(duration, currentTime + 3.5),
      style: captionStyle
    };
    setTimelineTracks(prev => ({
      ...prev,
      text: [entry, ...prev.text]
    }));
    setNewTextLayer("");
    triggerLocalToast(`Injected caption layer to active timeline!`);
  };

  // Caption translations simulation (Point 2: AI Translation, Multi-language Caption)
  const handleTranslateCaptions = (lang) => {
    setSelectedLanguage(lang);
    const translationMap = {
      es: {
        "WELCOME TO ONYX DRIFT! 🔥": "¡BIENVENIDO A ONYX DRIFT! 🔥",
        "THIS VIDEO IS OPERATING LIVE ⚡": "ESTE VIDEO OPERA EN VIVO ⚡",
        "ZERO SIMULATED PLAYBACK 🤫": "REPRODUCCIÓN CERO SIMULADA 🤫",
      },
      bn: {
        "WELCOME TO ONYX DRIFT! 🔥": "অনিক্স ড্রিফটে আপনাকে স্বাগতম! 🔥",
        "THIS VIDEO IS OPERATING LIVE ⚡": "এই ভিডিওটি লাইভ চলছে ⚡",
        "ZERO SIMULATED PLAYBACK 🤫": "কোন ফেক প্লেব্যাক নেই 🤫",
      },
      fr: {
        "WELCOME TO ONYX DRIFT! 🔥": "BIENVENUE SUR ONYX DRIFT! 🔥",
        "THIS VIDEO IS OPERATING LIVE ⚡": "CETTE VIDÉO FONCTIONNE EN DIRECT ⚡",
        "ZERO SIMULATED PLAYBACK 🤫": "LECTURE SANS SIMULATION 🤫",
      }
    };

    if (lang === "en") {
      // restore defaults
      setTimelineTracks(prev => ({
        ...prev,
        text: [
          { id: "t1", content: "WELCOME TO ONYX DRIFT! 🔥", start: 1, end: 5, style: "hormozi" },
          { id: "t2", content: "THIS VIDEO IS OPERATING LIVE ⚡", start: 6, end: 12, style: "neon" },
          { id: "t3", content: "ZERO SIMULATED PLAYBACK 🤫", start: 14, end: 20, style: "hormozi" }
        ]
      }));
      triggerLocalToast("Restored original English language timed subtitles.");
      return;
    }

    const dict = translationMap[lang];
    if (dict) {
      setTimelineTracks(prev => ({
        ...prev,
        text: prev.text.map(t => ({
          ...t,
          content: dict[t.content] || t.content
        }))
      }));
      triggerLocalToast(`AI Translation triggered. Timed captions converted to ${lang === 'bn' ? 'Bengali' : lang === 'es' ? 'Spanish' : 'French'}!`);
    }
  };

  // Render current subtitle based on player timestamp
  const getActiveCaption = () => {
    const match = timelineTracks.text.find(t => currentTime >= t.start && currentTime <= t.end);
    return match ? match.content : null;
  };

  const activeCaption = getActiveCaption();

  const toggleAccordion = (key) => {
    setAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col lg:flex-row bg-[#020204] border border-zinc-900 rounded-3xl overflow-hidden min-h-[720px] max-w-7xl mx-auto shadow-2xl relative">
      
      {/* -------------------- 1. FAR-LEFT SLENDER RIBBON BAR (PIXEL LOGO SYNC) -------------------- */}
      <aside className="w-16 shrink-0 bg-[#050508] border-r border-zinc-900 flex flex-col items-center py-4 justify-between select-none">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo element indicator */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-black font-black text-xs shadow-lg shadow-cyan-500/10 animate-pulse">
            Ω
          </div>

          <nav className="flex flex-col items-center gap-2 w-full px-1">
            {[
              { id: "media", label: "Media", icon: Clapperboard },
              { id: "audio", label: "Audio", icon: Music },
              { id: "text", label: "Text", icon: Type },
              { id: "stickers", label: "Stickers", icon: Smile },
              { id: "effects", label: "Effects", icon: Zap },
              { id: "transitions", label: "Transitions", icon: Layers },
              { id: "filters", label: "Filters", icon: Compass },
              { id: "overlays", label: "Overlays", icon: Grid },
              { id: "elements", label: "Elements", icon: Sparkles },
              { id: "ai-tools", label: "AI Tools", icon: Cpu },
              { id: "templates", label: "Templates", icon: Tv }
            ].map((ribbon) => {
              const Icon = ribbon.icon;
              const active = activeRibbon === ribbon.id;
              return (
                <button
                  key={ribbon.id}
                  onClick={() => setActiveRibbon(ribbon.id)}
                  title={ribbon.label}
                  className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all group ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50'}`}
                >
                  <Icon size={16} className={`transition-transform duration-300 group-hover:scale-105 ${active ? 'text-cyan-400' : 'text-zinc-500'}`} />
                  <span className="text-[7px] font-mono font-black uppercase tracking-widest scale-90">{ribbon.label.substring(0, 5)}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Small version stamp */}
        <span className="text-[7px] font-mono text-zinc-600 block tracking-widest select-none">ONYX.V3</span>
      </aside>

      {/* -------------------- 2. ACTIVE TOOL SUB-PANEL DRAWER (LEFT COLUMN) -------------------- */}
      <section className="w-full lg:w-72 shrink-0 bg-[#060609]/95 border-r border-zinc-900/80 p-5 flex flex-col overflow-y-auto scrollbar-thin select-none max-h-[720px] lg:max-h-none">
        
        {/* Dynamic Context Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4 shrink-0">
          <div>
            <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest block font-black">AI Multi-Task Suite</span>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              {activeRibbon === "ai-tools" && <Cpu size={14} className="text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />}
              {activeRibbon === "media" && <Clapperboard size={14} className="text-cyan-400" />}
              {activeRibbon === "audio" && <Music size={14} className="text-cyan-400" />}
              {activeRibbon === "text" && <Type size={14} className="text-cyan-400" />}
              {activeRibbon === "stickers" && <Smile size={14} className="text-cyan-400" />}
              {activeRibbon === "effects" && <Zap size={14} className="text-cyan-400" />}
              {activeRibbon === "transitions" && <Layers size={14} className="text-cyan-400" />}
              {activeRibbon === "filters" && <Compass size={14} className="text-cyan-400" />}
              {activeRibbon === "overlays" && <Grid size={14} className="text-cyan-400" />}
              {activeRibbon === "elements" && <Sparkles size={14} className="text-cyan-400" />}
              {activeRibbon === "templates" && <Tv size={14} className="text-cyan-400" />}
              <span>{activeRibbon.replace("-", " ")}</span>
            </h2>
          </div>
          <span className="text-[8px] font-mono text-zinc-500 uppercase">Interactive</span>
        </div>

        {/* -------------------- TOOL PANELS MATRIX -------------------- */}

        {/* Ribbon Tab: AI TOOLS (Matches exact laptop layout reference) */}
        {activeRibbon === "ai-tools" && (
          <div className="space-y-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#93c5fd]">AI Tools</span>
                <span className="text-[8px] font-mono text-zinc-500 cursor-pointer hover:text-white uppercase">View All</span>
              </div>

              {/* Precise 2-column grid from laptop mock layout */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { key: "autoCut", title: "AI Auto Cut", desc: "Automatically cut silences & bad takes", activeColor: "border-cyan-500/40 text-cyan-300 bg-cyan-500/10" },
                  { key: "captions", title: "AI Captions", desc: "Auto subtitle with multiple styles", activeColor: "border-orange-500/40 text-orange-300 bg-orange-500/10", presetStyle: true },
                  { key: "beatSync", title: "AI Highlight", desc: "Find viral moments automatically", activeColor: "border-green-500/40 text-green-300 bg-green-500/10" },
                  { key: "audioEnhance", title: "AI Voice Enhance", desc: "Remove noise & enhance voice", activeColor: "border-rose-500/40 text-rose-300 bg-rose-500/10", audioToggle: true },
                  { key: "skyReplace", title: "AI Background Remove", desc: "Remove background in one click", activeColor: "border-purple-500/40 text-purple-300 bg-purple-500/10" },
                  { key: "aiEnhanceToggle", title: "AI Video Enhance", desc: "Improve quality with AI", activeColor: "border-blue-500/40 text-blue-300 bg-blue-500/10", slider: true }
                ].map((tool) => (
                  <button
                    key={tool.title}
                    onClick={() => {
                      if (tool.presetStyle) {
                        setCaptionStyle(prev => prev === "hormozi" ? "neon" : "hormozi");
                        triggerLocalToast("Toggled interactive caption styles preset!");
                      } else if (tool.audioToggle) {
                        triggerLocalToast("AI Vocal Noise Dampener matrix calibrated -24dB voice presence lock.");
                      } else if (tool.slider) {
                        setAiEnhance(p => ({ ...p, enabled: !p.enabled }));
                        triggerLocalToast("Ultra enhancement video filter applied live.");
                      } else {
                        setAiToggles(prev => ({ ...prev, [tool.key]: !prev[tool.key] }));
                        triggerLocalToast(`Parameter ${tool.title} updated in real-time.`);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.01] active:scale-95 flex flex-col justify-between min-h-[105px] select-none ${aiToggles[tool.key] || (tool.presetStyle && captionStyle === "hormozi") || (tool.slider && aiEnhance.enabled) ? tool.activeColor : 'bg-zinc-900/60 border-zinc-850 text-zinc-400 hover:border-zinc-800'}`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider">{tool.title}</span>
                        {(aiToggles[tool.key] || tool.presetStyle || tool.slider) && <Sparkles size={8} className="animate-spin text-cyan-400" />}
                      </div>
                      <p className="text-[8px] text-zinc-500 mt-1 leading-tight">{tool.desc}</p>
                    </div>
                    <span className="text-[7px] font-mono uppercase bg-black/40 px-1 py-0.5 rounded w-max mt-2">Core V3</span>
                  </button>
                ))}
              </div>
            </div>

            {/* "Trending Templates" carousel from laptop mock layout */}
            <div className="border-t border-zinc-90 w-full pt-4 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                <span className="text-[10px] font-black uppercase text-[#93c5fd]">Trending Templates</span>
                <span className="text-[8px] text-zinc-500 cursor-pointer hover:text-white">View All</span>
              </div>

              {/* Styled portrait thumbnails */}
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-none">
                {[
                  { title: "DYNAMIC INTRO", tag: "Fast Paced Beat", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=120" },
                  { title: "GAMING HIGHLIGHT", tag: "HUD Overlay", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=120" },
                  { title: "FITNESS MOTIVATION", tag: "Ramp Speed Drop", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=120" }
                ].map((temp) => (
                  <div 
                    key={temp.title}
                    onClick={() => {
                      if (temp.title === "GAMING HIGHLIGHT") {
                        setFilters(p => ({ ...p, saturate: 180, contrast: 120 }));
                        setCaptionStyle("neon");
                        triggerLocalToast("Applied Retro Cyber Gaming Aesthetic Overlay!");
                      } else if (temp.title === "FITNESS MOTIVATION") {
                        handleSpeedChange(1.5);
                        setCaptionStyle("bounce");
                        setTimelineTracks(p => ({
                          ...p,
                          audio: [{ id: "a-fit", name: "Gym_Hardstyle_HighPeak_Beat.mp3", start: 0, end: 30, volume: 90 }]
                        }));
                        triggerLocalToast("Fitness Speed Ramp template deployed. Loaded 1.5x speed sync BGM!");
                      } else {
                        setCaptionStyle("hormozi");
                        triggerLocalToast("Alex Hormozi Dynamic subtitle intro configured successfully.");
                      }
                    }}
                    className="p-2 bg-zinc-900 border border-zinc-850 rounded-xl flex items-center gap-3 cursor-pointer hover:border-cyan-500/30 transition-all select-none group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-zinc-950 overflow-hidden relative border border-zinc-800 flex-shrink-0 group-hover:scale-95 transition-transform">
                      <img src={temp.img} alt={temp.title} className="w-full h-full object-cover opacity-80" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-white uppercase tracking-wider group-hover:text-cyan-400 transition-colors">{temp.title}</h4>
                      <p className="text-[8px] font-mono text-zinc-500 uppercase">{temp.tag}</p>
                    </div>
                    <span className="text-[8px] font-mono font-black text-cyan-400 bg-cyan-400/10 px-1 py-0.5 rounded ml-auto">USE</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Ribbon Tab: MEDIA (Uploads, B-Roll, and background video loops) */}
        {activeRibbon === "media" && (
          <div className="space-y-4">
            <p className="text-[9px] font-mono text-zinc-500 uppercase">B-Roll Footage Library (Click to swap video preview loop)</p>
            
            <div className="space-y-2">
              {bRollBank.map((b) => (
                <div 
                  key={b.title}
                  onClick={() => {
                    setVideoSrc(b.url);
                    triggerLocalToast(`Swapped video source live to B-Roll: "${b.title}"`);
                  }}
                  className={`p-3 rounded-2xl border cursor-pointer select-none transition-all hover:border-cyan-500/40 relative overflow-hidden group ${videoSrc === b.url ? 'bg-cyan-500/5 border-cyan-400/35' : 'bg-zinc-900/40 border-zinc-900/90'}`}
                >
                  <p className="text-[10px] font-black text-white uppercase tracking-wider truncate group-hover:text-cyan-300 transition-colors">{b.title}</p>
                  <p className="text-[8px] text-zinc-400 mt-1">{b.desc}</p>
                  <span className="absolute bottom-2 right-2 scale-75 opacity-0 group-hover:opacity-100 text-[8px] font-mono text-cyan-400 bg-cyan-500/15 border border-cyan-500/20 px-1.5 rounded uppercase font-black">
                    Load Clip
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-900 pt-4 space-y-3">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Input custom external url</span>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Paste direct .mp4 video link..."
                  className="flex-1 bg-zinc-900 border border-zinc-850 px-2 py-1.5 text-[10px] text-white rounded-lg focus:outline-none focus:border-cyan-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      setVideoSrc(e.target.value);
                      triggerLocalToast("Loaded custom external URL target!");
                    }
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Ribbon Tab: AUDIO (Professional Audio Studio metrics, Voice Clone, Noise filter) */}
        {activeRibbon === "audio" && (
          <div className="space-y-4">
            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Audio Studio controls</span>
            
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-850 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-white">
                <span>Noise Cancellation</span>
                <span className="text-[8px] text-green-400 font-mono">DAMP_ACTIVE</span>
              </div>
              <p className="text-[8px] text-zinc-500 leading-tight">Removes acoustic background hiss hum from microphone records.</p>
            </div>

            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-855 space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-white">
                <span>Vocal Enhancer</span>
                <input 
                  type="checkbox" 
                  checked={aiToggles.beautyRetouch}
                  onChange={() => {
                    setAiToggles(prev => ({ ...prev, beautyRetouch: !prev.beautyRetouch }));
                    triggerLocalToast("Configured intelligent vocal enhancement compression!");
                  }}
                  className="accent-cyan-500"
                />
              </div>
              <p className="text-[8px] text-zinc-500">Auto frequency equalization boosts key talking presentational vocals.</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Interactive SFX Library (Click to play/insert)</span>
              <div className="grid grid-cols-1 gap-2">
                {sfxLibrary.map((s) => (
                  <button 
                    key={s.name}
                    onClick={() => {
                      setTimelineTracks(prev => ({
                        ...prev,
                        audio: [...prev.audio, { id: `sfx-${Date.now()}`, name: `${s.name}.wav`, start: currentTime, end: currentTime+2, volume: 85 }]
                      }));
                      triggerLocalToast(`Injected SFX wave "${s.name}" at location ${currentTime.toFixed(1)}s!`);
                    }}
                    className="p-2.5 bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 rounded-xl text-left text-[10px] text-zinc-300 font-mono flex items-center justify-between"
                  >
                    <span>📣 {s.name}</span>
                    <span className="text-[8px] text-zinc-500 font-mono">{s.duration}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ribbon Tab: TEXT (Caption presets, Translation, Speaker detection) */}
        {activeRibbon === "text" && (
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#93c5fd]">Smart Caption Options</span>
            
            <div className="space-y-1.5 pt-1">
              <label className="text-[9px] font-mono text-zinc-500 uppercase">Caption Template (Style Presets)</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "hormozi", label: "Alex Hormozi 🔥" },
                  { id: "neon", label: "Neon Cyber Glow 🌌" },
                  { id: "bounce", label: "Dynamic Bounce ⚡" },
                  { id: "traditional", label: "Plain Subtitle 💬" }
                ].map((p) => (
                  <button 
                    key={p.id}
                    onClick={() => {
                      setCaptionStyle(p.id);
                      triggerLocalToast(`Aesthetic Subtitle style set to: ${p.label}`);
                    }}
                    className={`p-2 rounded-xl text-[9px] border font-bold text-left uppercase transition-all ${captionStyle === p.id ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-300' : 'bg-zinc-900 border-zinc-850 text-zinc-500'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-zinc-900">
              <label className="text-[9px] font-mono text-zinc-500 uppercase block">Speech Translation & Multi-language</label>
              <select 
                value={selectedLanguage}
                onChange={(e) => handleTranslateCaptions(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-850 text-xs text-white rounded-xl px-2.5 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="en">English (Default original)</option>
                <option value="bn">Translate to Bengali (বাংলা)</option>
                <option value="es">Translate to Spanish (Español)</option>
                <option value="fr">Translate to French (Français)</option>
              </select>
            </div>

            <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-1 mt-2">
              <p className="text-[9px] font-mono text-zinc-500 uppercase">Automatic Speaker Detection</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-[9px] text-zinc-300 font-bold uppercase tracking-wider">Speaker 1: Host Vocal (Selected)</span>
              </div>
              <p className="text-[8px] text-zinc-500">Audio frequency filters detect talking shifts to separate caption layers beautifully.</p>
            </div>
          </div>
        )}

        {/* Ribbon Tab: STICKERS, TRANSITIONS, FILTERS & AI EFFECTS */}
        {["stickers", "effects", "transitions", "filters", "overlays", "elements", "templates"].includes(activeRibbon) && (
          <div className="space-y-4">
            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Aesthetic visual overlays matrix</span>
            
            <div className="space-y-2">
              {[
                { name: "Urban Glow Filter", desc: "Adds futuristic glow levels with pink and purple hues", act: () => setFilters(p => ({ ...p, saturate: 160, contrast: 110 })) },
                { name: "AI Background Remove", desc: "Isolate primary speaking avatar characters on screen", act: () => { setAiToggles(p => ({ ...p, bgRemove: !p.bgRemove })); triggerLocalToast("Segmented avatar outline with 99.8% precision."); } },
                { name: "Film Grain Noise", desc: "Vintage 16mm classic movie texture style", act: () => setFilters(p => ({ ...p, sepia: 40, contrast: 90 })) },
                { name: "HUD Decal elements", desc: "Futuristic digital overlay lines and scopes", act: () => triggerLocalToast("Embedded cyberpunk camera HUD assets on active preview.") }
              ].map((fx) => (
                <div 
                  key={fx.name}
                  onClick={fx.act}
                  className="p-3 bg-zinc-900 hover:bg-zinc-900/80 border border-zinc-850 hover:border-zinc-800 rounded-2xl cursor-pointer transition-all select-none group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-white group-hover:text-cyan-400 transition-colors">{fx.name}</span>
                    <Plus size={10} className="text-zinc-500 group-hover:text-white" />
                  </div>
                  <p className="text-[8px] text-zinc-500 mt-1 leading-snug">{fx.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-3.5 bg-cyan-500/5 rounded-2xl border border-cyan-500/10 space-y-1.5 mt-2">
              <span className="text-[8px] font-mono text-cyan-400 uppercase font-black tracking-widest block bg-cyan-500/10 px-1.5 py-0.5 rounded w-max">Template market link</span>
              <p className="text-[10px] text-zinc-300 font-bold">Deploy and customized presets immediately!</p>
              <p className="text-[8px] text-zinc-500">Every preset includes timeline tracks layers parameters, auto synced captions, BGM beats and speed curve configurations.</p>
            </div>
          </div>
        )}

      </section>

      {/* -------------------- 3. MIDDLE STREAM PREVIEW STAGE + TIMELINE BLOCK (CENTER) -------------------- */}
      <main className="flex-1 bg-[#040406] p-5 flex flex-col justify-between overflow-x-hidden min-h-[640px]">
        
        {/* Dynamic player subheader */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Viewport Stage</span>
            <select 
              value={aspectRatio}
              onChange={(e) => {
                setAspectRatio(e.target.value);
                triggerLocalToast(`Viewport aspect set to: ${e.target.value}`);
              }}
              className="bg-zinc-900 border border-zinc-850 rounded px-2 py-0.5 font-mono text-[9px] text-zinc-300 focus:outline-none"
            >
              <option value="9:16">Portrait 9:16 (Reels/TikTok)</option>
              <option value="16:9">Landscape 16:9 (YouTube)</option>
              <option value="1:1">Square 1:1 (Feed Post)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[8px] font-mono text-zinc-500 uppercase">
              Full Quality (Deep Color)
            </span>
          </div>
        </div>

        {/* Dynamic HTML video canvas frame */}
        <div className="flex-1 flex items-center justify-center py-2 shrink-0">
          <div 
            className={`relative bg-black rounded-3xl border border-zinc-900 overflow-hidden shadow-2xl transition-all duration-300 flex items-center justify-center group ${aspectRatio === '9:16' ? 'aspect-[9/16] h-[360px]' : aspectRatio === '1:1' ? 'aspect-square h-[320px]' : 'aspect-video w-full max-w-[500px]'}`}
            id="viewport-canvas-mesh"
          >
            {videoSrc ? (
              <video
                ref={videoRef}
                src={videoSrc}
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-cover transition-all"
                loop
                playsInline
                style={{
                  filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturate}%) blur(${filters.blur}px) sepia(${filters.sepia}%)`,
                  transform: `scale(${transform.scaleX / 100}, ${transform.scaleY / 100}) rotate(${transform.rotate}deg) translate(${transform.posX}px, ${transform.posY}px)`,
                  opacity: blend.opacity / 100
                }}
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <Film className="w-12 h-12 text-zinc-800 mx-auto animate-pulse" />
                <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Video source void</p>
                <button 
                  onClick={() => setVideoSrc("https://assets.mixkit.co/videos/preview/mixkit-futuristic-holographic-neon-city-visuals-41801-large.mp4")}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-cyan-500 hover:text-black rounded-lg border border-zinc-800 text-[9px] uppercase tracking-wider font-bold text-zinc-400 transition-all"
                >
                  Seed Cyberpunk B-Roll Loop
                </button>
              </div>
            )}

            {/* AI Face Tracking Overlaid box */}
            {aiToggles.faceTracking && videoSrc && (
              <div className="absolute top-[26%] left-[34%] w-[33%] h-[39%] border-2 border-dashed border-cyan-400 rounded-full animate-pulse pointer-events-none flex flex-col justify-end items-center">
                <span className="bg-cyan-500 text-black font-mono text-[7px] font-black px-1 rounded -bottom-5 relative tracking-widest uppercase">
                  FACE: TRACK_LOCK (99%)
                </span>
              </div>
            )}

            {/* Dynamic timed word subtitles renderer with templates styles */}
            {activeCaption && videoSrc && (
              <div className="absolute bottom-[14%] left-1/2 -translate-x-1/2 w-[90%] text-center pointer-events-none select-none z-30" id="caption-preview-overlay">
                {captionStyle === "hormozi" && (
                  <span className="bg-black/95 border-2 border-yellow-400 px-4 py-1.5 rounded-2xl text-yellow-300 font-extrabold text-[13px] tracking-tight uppercase inline-block drop-shadow-2xl animate-bounce shadow-2xl">
                    {activeCaption}
                  </span>
                )}
                {captionStyle === "neon" && (
                  <span className="text-cyan-300 text-sm font-black tracking-widest uppercase drop-shadow-[0_0_8px_#06b6d4] inline-block animate-pulse">
                    {activeCaption}
                  </span>
                )}
                {captionStyle === "bounce" && (
                  <span className="bg-purple-900/90 border border-purple-500 px-3 py-1 rounded text-white text-[11px] font-bold tracking-wide inline-block transform scale-110">
                    {activeCaption}
                  </span>
                )}
                {captionStyle === "traditional" && (
                  <span className="text-zinc-200 text-[11px] font-medium tracking-normal inline-block bg-black/75 px-3 py-1 rounded-md">
                    {activeCaption}
                  </span>
                )}
              </div>
            )}

            {/* Quick telemetry parameters label */}
            <div className="absolute top-3 left-3 flex flex-col gap-1 pointer-events-none">
              <span className="px-1.5 py-0.5 rounded bg-black/80 font-mono text-[7px] font-bold text-cyan-400 border border-zinc-800">
                ZOOM_FOCAL: {transform.scaleX}%
              </span>
              <span className="px-1.5 py-0.5 rounded bg-black/80 font-mono text-[7px] font-bold text-zinc-400 border border-zinc-800">
                TRANS_OFFSET: {transform.posX}px / {transform.posY}px
              </span>
            </div>

            {/* Play/Pause state mask on hover */}
            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
              <div className="p-3 rounded-full bg-black/60 border border-zinc-800 text-white pointer-events-auto cursor-pointer" onClick={togglePlayback}>
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </div>
            </div>

          </div>
        </div>

        {/* Input captions helper panel wrapper */}
        <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-90 w-full mt-3 flex items-center gap-3 shrink-0">
          <Type size={14} className="text-cyan-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Add timed word subtitles caption text..."
            value={newTextLayer}
            onChange={(e) => setNewTextLayer(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTextTrack()}
            className="flex-1 bg-transparent border-none outline-none text-[11px] text-white focus:ring-0 placeholder-zinc-500"
          />
          <button 
            onClick={addTextTrack}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase text-[9px] tracking-wider rounded-xl transition-all shrink-0"
          >
            Insert Word-by-Word
          </button>
        </div>

        {/* -------------------- 4. PROFESSIONAL MULTI-TRACK TIMELINE ENGINE -------------------- */}
        <div className="bg-[#040407] border border-zinc-900 rounded-2xl p-4 mt-4 space-y-3 shrink-0 select-none">
          
          {/* Controllers layer */}
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase pb-2 border-b border-zinc-900/60">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-red-500 font-bold">
                <Activity size={12} className="animate-pulse" />
                <span>Live Feed Sync Panel</span>
              </span>
              <span className="text-zinc-650">|</span>
              <span className="text-[9px] text-zinc-400">FPS Rate: 60 FPS Lossless</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={executeCut}
                className="px-2.5 py-1 bg-zinc-900/80 hover:bg-zinc-800 rounded-lg text-red-400 text-[9px] uppercase font-black tracking-widest flex items-center gap-1.5 border border-zinc-800"
                title="Split clip"
              >
                <Scissors size={10} />
                <span>Split Playhead</span>
              </button>
              
              <button 
                onClick={() => {
                  setTimelineTracks({
                    video: [{ id: "v1", name: "Cyberpunk_City_Asset.mp4", duration: 32, start: 0, end: 32 }],
                    audio: [{ id: "a1", name: "Autopilot_Futuristic_Loop.mp3", start: 0, end: 30, volume: 80 }],
                    text: [{ id: "t1", content: "WELCOME TO ONYX DRIFT! 🔥", start: 1, end: 5, style: "hormozi" }]
                  });
                  triggerLocalToast("Subtitles and Audio rails reset completed.");
                }}
                className="p-1 text-zinc-500 hover:text-white"
                title="Clear track layout"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          </div>

          {/* Timeline Multi-Tracks body container */}
          <div className="relative border border-zinc-900 rounded-2xl p-3 bg-[#07070a]/90 space-y-2 overflow-hidden">
            
            {/* Timeline timed rulers header */}
            <div className="flex justify-between text-[8px] font-mono text-zinc-600 px-1 border-b border-zinc-900 pb-1 shrink-0">
              <span>00:00</span>
              <span>00:06</span>
              <span>00:10</span>
              <span>00:12</span>
              <span>00:18</span>
              <span>00:26</span>
              <span>00:29</span>
              <span>00:30</span>
            </div>

            {/* Playhead red vertical line */}
            <div 
              className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-50 pointer-events-none"
              style={{ left: `${playheadPercent}%` }}
            >
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full -translate-x-[40%] -translate-y-1 shadow shadow-red-500/20" />
            </div>

            {/* Clickable Seek slider transparent overlay */}
            <div 
              className="absolute inset-y-0 left-0 right-0 cursor-pointer opacity-0 hover:opacity-[0.02] bg-white z-40 transition-opacity"
              onClick={handleTimelineSeek}
            />

            {/* Track Row 1: VIDEO CHANNEL (Teal styled clips split) */}
            <div className="flex items-center gap-3">
              <div className="w-14 text-[8px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1 shrink-0">
                <Lock size={9} /> <Eye size={9} /> VIDEO
              </div>
              <div className="flex-1 bg-zinc-900/60 rounded-xl p-1.5 border border-zinc-850/60 relative select-none overflow-hidden flex items-center gap-2">
                <div className="bg-cyan-500/10 border border-cyan-400/20 px-2 py-1 rounded text-cyan-400 font-mono text-[9px] uppercase font-bold max-w-[190px] truncate">
                  🎬 {timelineTracks.video[0]?.name || "Footage_Primary.mp4"}
                </div>
                {timelineTracks.video[1] && (
                  <div className="bg-teal-500/10 border border-teal-400/20 px-2 py-1 rounded text-teal-400 font-mono text-[9px] uppercase max-w-[190px] truncate">
                    🎬 {timelineTracks.video[1].name}
                  </div>
                )}
                <span className="text-zinc-600 text-[8px] ml-auto font-mono">Length: {duration.toFixed(1)}s</span>
              </div>
            </div>

            {/* Track Row 2: TEXT/CAPTIONS (Purple styled timing strips) */}
            <div className="flex items-center gap-3">
              <div className="w-14 text-[8px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1 shrink-0">
                <Lock size={9} /> <Eye size={9} /> TEXT_T1
              </div>
              <div className="flex-1 bg-zinc-900/60 rounded-xl p-1.5 border border-zinc-850/60 relative select-none overflow-x-auto scrollbar-none flex gap-1.5 min-h-[36px]">
                {timelineTracks.text.map((caption) => (
                  <div 
                    key={caption.id}
                    title={caption.content}
                    onClick={() => {
                      setNewTextLayer(caption.content);
                      triggerLocalToast(`Active clip: "${caption.content}" selected!`);
                    }}
                    className="shrink-0 bg-yellow-500/10 border border-yellow-400/20 px-2 py-0.5 rounded text-[8px] font-mono text-yellow-300 flex items-center gap-2 cursor-pointer hover:border-yellow-400/50"
                  >
                    <span>"{caption.content}"</span>
                    <span className="text-[7px] text-zinc-500">{caption.start}s - {caption.end}s</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setTimelineTracks(prev => ({ ...prev, text: prev.text.filter(t => t.id !== caption.id) }));
                        triggerLocalToast("Caption segment removed.");
                      }}
                      className="p-0.5 text-zinc-500 hover:text-red-400 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Track Row 3: EFFECT BLOCK CHANNEL E1 */}
            <div className="flex items-center gap-3">
              <div className="w-14 text-[8px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1 shrink-0">
                <Lock size={9} /> <Eye size={9} /> EFFECT_E1
              </div>
              <div className="flex-1 bg-zinc-900/60 rounded-xl p-1.5 border border-zinc-850/60 relative select-none flex gap-2 overflow-hidden text-[8px] font-mono">
                <div className="bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded text-purple-400">
                  ⚡ URBAN GLOW OVERLAY
                </div>
                {aiEnhance.enabled && (
                  <div className="bg-indigo-500/10 border border-indigo-400/20 px-2 py-0.5 rounded text-indigo-400">
                    🔬 AI VIDEO ENHANCEMENT
                  </div>
                )}
                {aiToggles.faceTracking && (
                  <div className="bg-cyan-500/10 border border-cyan-400/20 px-2 py-0.5 rounded text-cyan-400">
                    🎯 FACE LOCK ALIGNED
                  </div>
                )}
              </div>
            </div>

            {/* Track Row 4: AUDIO CHANNEL (Wave beat loops) */}
            <div className="flex items-center gap-3">
              <div className="w-14 text-[8px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-1 shrink-0">
                <Lock size={9} /> <Eye size={9} /> AUDIO_A1
              </div>
              <div className="flex-1 bg-zinc-900/60 rounded-xl p-2 border border-zinc-850/60 relative select-none flex items-center text-emerald-400 font-mono text-[9px] uppercase font-bold overflow-hidden">
                <div className="flex items-center gap-2">
                  <span>🎵 {timelineTracks.audio[0]?.name || "Autopilot_Futuristic_Loop.mp3"}</span>
                  <span className="text-[7px] text-zinc-600">Volume: {timelineTracks.audio[0]?.volume || 80}%</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* -------------------- 5. INSPECTOR / CONTROL SIDEBAR (RIGHT COLUMN) -------------------- */}
      <section className="w-full lg:w-72 shrink-0 bg-[#050508]/98 border-l border-zinc-900 p-5 flex flex-col overflow-y-auto scrollbar-thin max-h-[720px] lg:max-h-none select-none">
        
        {/* Tab links for Inspector tabs */}
        <div className="grid grid-cols-4 gap-1.5 border-b border-zinc-900 pb-3 mb-4 shrink-0">
          {[
            { id: "video", label: "Video", icon: Sliders },
            { id: "audio", label: "Audio", icon: Volume2 },
            { id: "speed", label: "Speed", icon: Gauge },
            { id: "animation", label: "Motion", icon: SquareStack }
          ].map((tab) => {
            const active = activeInspectorTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveInspectorTab(tab.id)}
                className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex flex-col items-center justify-center gap-0.5 transition-all ${active ? 'bg-zinc-90 text-cyan-400 border border-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <tab.icon size={12} className={active ? 'text-cyan-400' : 'text-zinc-500'} />
                <span className="scale-90">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ------------------ ACTIVE INSPECTOR CONTENT ------------------ */}
        
        {/* Tab Content: VIDEO */}
        {activeInspectorTab === "video" && (
          <div className="space-y-4">
            
            {/* Accordion 1: Transform (Interactive Matrix bindings) */}
            <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950/40">
              <button 
                onClick={() => toggleAccordion("transform")} 
                className="w-full px-3.5 py-3 flex justify-between items-center bg-zinc-950 hover:bg-zinc-900/60 text-[10px] font-black uppercase tracking-wider text-white"
              >
                <span className="flex items-center gap-1.5">📐 Transform</span>
                <ChevronDown size={12} className={`transition-transform duration-300 ${accordions.transform ? 'rotate-180' : ''}`} />
              </button>
              
              {accordions.transform && (
                <div className="p-3.5 space-y-4 border-t border-zinc-900 text-left">
                  {/* Scale slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                      <span>Scale Width</span>
                      <span className="text-cyan-400">{transform.scaleX}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="50" 
                      max="250" 
                      value={transform.scaleX}
                      onChange={(e) => setTransform(p => ({ ...p, scaleX: Number(e.target.value), scaleY: Number(e.target.value) }))}
                      className="w-full h-1 bg-zinc-900 accent-cyan-500 rounded appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Horizontal displacement */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                      <span>Translate Pos X</span>
                      <span className="text-cyan-400">{transform.posX}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="-150" 
                      max="150" 
                      value={transform.posX}
                      onChange={(e) => setTransform(p => ({ ...p, posX: Number(e.target.value) }))}
                      className="w-full h-1 bg-zinc-900 accent-cyan-500 rounded appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Vertical displacement */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                      <span>Translate Pos Y</span>
                      <span className="text-cyan-400">{transform.posY}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="-150" 
                      max="150" 
                      value={transform.posY}
                      onChange={(e) => setTransform(p => ({ ...p, posY: Number(e.target.value) }))}
                      className="w-full h-1 bg-zinc-900 accent-cyan-500 rounded appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Rotation dial */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                      <span>Rotate Angle</span>
                      <span className="text-cyan-400">{transform.rotate}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="-180" 
                      max="180" 
                      value={transform.rotate}
                      onChange={(e) => setTransform(p => ({ ...p, rotate: Number(e.target.value) }))}
                      className="w-full h-1 bg-zinc-900 accent-cyan-500 rounded appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Blend mode options */}
            <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950/40">
              <button 
                onClick={() => toggleAccordion("blend")} 
                className="w-full px-3.5 py-3 flex justify-between items-center bg-zinc-950 hover:bg-zinc-900 text-[10px] font-black uppercase tracking-wider text-white"
              >
                <span>🎭 Blend & overlay Mode</span>
                <ChevronDown size={12} className={`transition-transform duration-300 ${accordions.blend ? 'rotate-180' : ''}`} />
              </button>
              
              {accordions.blend && (
                <div className="p-3.5 space-y-4 border-t border-zinc-900 text-left">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">Mix preset</span>
                    <select 
                      value={blend.mode}
                      onChange={(e) => {
                        setBlend(p => ({ ...p, mode: e.target.value }));
                        triggerLocalToast(`Blend mode set to: ${e.target.value}`);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="normal">Normal</option>
                      <option value="color-dodge">Color Dodge (Neon glow)</option>
                      <option value="screen">Screen (Transparency)</option>
                      <option value="multiply">Multiply (Dark elements)</option>
                      <option value="difference">Difference</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-mono text-[#94a3b8] uppercase">
                      <span>Opacity Filter</span>
                      <span className="text-cyan-400">{blend.opacity}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={blend.opacity}
                      onChange={(e) => setBlend(p => ({ ...p, opacity: Number(e.target.value) }))}
                      className="w-full h-1 bg-zinc-900 accent-cyan-500 rounded appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Stabilization */}
            <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950/40">
              <button 
                onClick={() => toggleAccordion("stabilization")} 
                className="w-full px-3.5 py-3 flex justify-between items-center bg-zinc-950 hover:bg-[#101015] text-[10px] font-black uppercase tracking-wider text-white"
              >
                <span>🛰️ Camera Stabilization</span>
                <ChevronDown size={12} className={`transition-transform duration-300 ${accordions.stabilization ? 'rotate-180' : ''}`} />
              </button>
              {accordions.stabilization && (
                <div className="p-3.5 space-y-3 border-t border-zinc-900 text-[10px] text-zinc-400 text-left">
                  <div className="flex justify-between items-center">
                    <span>Smooth Motion Tracking</span>
                    <input 
                      type="checkbox" 
                      checked={stabilization.enabled}
                      onChange={() => setStabilization(p => ({ ...p, enabled: !p.enabled }))}
                      className="accent-cyan-500 text-black font-mono"
                    />
                  </div>
                  <p className="text-[8px] text-zinc-500">Intelligent camera shift offsets eliminate physical shake from phone record tapes.</p>
                </div>
              )}
            </div>

            {/* Accordion 4: Chroma Key (Green screen isolation) */}
            <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950/40">
              <button 
                onClick={() => toggleAccordion("chromaKey")} 
                className="w-full px-3.5 py-3 flex justify-between items-center bg-zinc-950 hover:bg-zinc-900 text-[10px] font-black uppercase tracking-wider text-white"
              >
                <span>🧪 Chrome Key & Matte</span>
                <ChevronDown size={12} className={`transition-transform duration-300 ${accordions.chromaKey ? 'rotate-180' : ''}`} />
              </button>
              {accordions.chromaKey && (
                <div className="p-3.5 space-y-3 border-t border-zinc-900 text-[10px] text-zinc-400 text-left">
                  <div className="flex justify-between items-center">
                    <span>Backdrop Chroma Active</span>
                    <input 
                      type="checkbox" 
                      checked={chromaKey.enabled}
                      onChange={() => setChromaKey(p => ({ ...p, enabled: !p.enabled }))}
                      className="accent-cyan-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono whitespace-nowrap text-zinc-500">Key Target:</span>
                    <div className="w-5 h-5 bg-green-500 border border-zinc-800 rounded" />
                    <span className="text-[9px] text-zinc-400 font-mono">#00FF00 Green screen</span>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 5: Color Grading and Sliders mapping */}
            <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950/40">
              <button 
                onClick={() => toggleAccordion("colorGrading")} 
                className="w-full px-3.5 py-3 flex justify-between items-center bg-zinc-950 hover:bg-zinc-900 text-[10px] font-black uppercase tracking-wider text-white"
              >
                <span>🎨 Deep Color Grading</span>
                <ChevronDown size={12} className={`transition-transform duration-300 ${accordions.colorGrading ? 'rotate-180' : ''}`} />
              </button>
              {accordions.colorGrading && (
                <div className="p-3.5 space-y-3.5 border-t border-zinc-900 text-left">
                  {[
                    { key: "brightness", label: "Brightness Intensity", max: 200 },
                    { key: "contrast", label: "Edge Contrast ratio", max: 200 },
                    { key: "saturate", label: "Saturate spectrum", max: 200 },
                    { key: "blur", label: "Gaussian Backdrop Blur", max: 20 }
                  ].map((attr) => (
                    <div key={attr.key} className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                        <span>{attr.label}</span>
                        <span className="text-cyan-400">{filters[attr.key]}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max={attr.max} 
                        value={filters[attr.key]}
                        onChange={(e) => setFilters(prev => ({ ...prev, [attr.key]: Number(e.target.value) }))}
                        className="w-full h-1 bg-zinc-900 accent-cyan-500 rounded appearance-none cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab Content: AUDIO settings */}
        {activeInspectorTab === "audio" && (
          <div className="space-y-4 text-left">
            <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl space-y-3">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Vocal Master volume</span>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span>Track Level</span>
                  <span className="text-cyan-400">80% Volume</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  defaultValue="80" 
                  className="w-full h-1 bg-zinc-900 accent-cyan-500 rounded cursor-pointer" 
                />
              </div>
            </div>

            <div className="p-3.5 bg-[#0b0c10] border border-cyan-500/10 rounded-2xl space-y-1.5">
              <span className="text-[8px] font-mono text-amber-500 uppercase font-black bg-amber-500/10 px-1 py-0.5 rounded w-max">Active Profile</span>
              <p className="text-[10px] text-zinc-300 font-bold">Auto Music beat loop match</p>
              <p className="text-[8px] text-zinc-500">Analyzes video tempo and automatically blends cross-fades on cut points.</p>
            </div>
          </div>
        )}

        {/* Tab Content: SPEED (Ramp, Curves and Slow-Mo Speed change) */}
        {activeInspectorTab === "speed" && (
          <div className="space-y-4 text-left">
            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Speed Multiplier (Playback scale)</span>
            
            <div className="grid grid-cols-4 gap-1">
              {[0.5, 1.0, 1.5, 2.0].map((spd) => (
                <button 
                  key={spd}
                  onClick={() => handleSpeedChange(spd)}
                  className={`py-2 rounded-xl text-[10px] font-black uppercase font-mono border ${playbackSpeed === spd ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' : 'bg-zinc-900 border-zinc-850 text-zinc-400'}`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-900">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Speed ramp curve template</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "uniform", label: "Uniform speed" },
                  { value: "bullet", label: "Bullet peak (0.2x ➔ 3.0x)" },
                  { value: "montage", label: "Vlog Peak ramp" },
                  { value: "hero", label: "Cinematic Slow-mo" }
                ].map((curve) => (
                  <button 
                    key={curve.value}
                    onClick={() => {
                      setSpeedCurve(curve.value);
                      triggerLocalToast(`Applied speed ramp profile: ${curve.label}`);
                    }}
                    className={`p-3 rounded-xl block text-left text-[9px] font-black uppercase border transition-all ${speedCurve === curve.value ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' : 'bg-zinc-900 border-zinc-850 text-zinc-500'}`}
                  >
                    📈 {curve.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: ANIMATION Motion templates */}
        {activeInspectorTab === "animation" && (
          <div className="space-y-4 text-left">
            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Active Motion decals presets</span>
            
            <div className="space-y-2">
              {[
                { name: "Neon Callout Deco", desc: "Embed floating neon digital outlines around speakers" },
                { name: "Aesthetic Lower Thirds", desc: "Display speaker credentials with smooth sliding text" },
                { name: "Scale Wave transition", desc: "Zoom video view smoothly on beat kickoffs" }
              ].map((anim) => (
                <div 
                  key={anim.name}
                  onClick={() => triggerLocalToast(`Applied motion animation segment: "${anim.name}"`)}
                  className="p-3 bg-zinc-900 hover:border-cyan-500/40 border border-zinc-850 rounded-2xl cursor-pointer transition-all select-none group"
                >
                  <p className="text-[9px] font-black uppercase text-white group-hover:text-cyan-300 transition-all">{anim.name}</p>
                  <p className="text-[8px] text-zinc-500 leading-tight mt-0.5">{anim.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </section>

      {/* Floating local custom workspace notifications toast alert inside frame */}
      <AnimatePresence>
        {toastText && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="absolute bottom-4 left-4 z-[99] px-4 py-2.5 bg-[#050508] border border-cyan-500/30 rounded-2xl shadow-xl flex items-center gap-2 max-w-xs text-[10px] text-zinc-350"
          >
            <Sparkles className="text-cyan-400 shrink-0" size={13} />
            <span>{toastText}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
