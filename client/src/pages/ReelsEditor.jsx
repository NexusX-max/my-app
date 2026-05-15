import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Plus, Play, Sparkles, Send, Wand2, 
  Layers, Scissors, X, Upload, MoreVertical, Type, Music, Trash2, Pause
} from "lucide-react";
import toast from 'react-hot-toast';

import Sidebar from "../components/Editor/Sidebar";
import Timeline from "../components/Editor/Timeline";

const API_URL = "https://api.onyx-drift.com";

const TikTokEditor = () => {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const [videoSrc, setVideoSrc] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRendering, setIsRendering] = useState(false); 
  const [activeMenu, setActiveMenu] = useState(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const [aiPrompt, setAiPrompt] = useState("");
  const [clips, setClips] = useState([]); 
  
  // Neural Tracks State (Text, Audio, Video Layers)
  const [tracks, setTracks] = useState({ 
    video: [], 
    audio: [], 
    text: [] 
  });

  const [editData, setEditData] = useState({
    filters: { brightness: 100, contrast: 100, saturate: 100, blur: 0 },
    isFlipped: false,
    aspectRatio: "9:16",
    layers: []
  });

  useEffect(() => {
    if (videoSrc && videoRef.current) {
      videoRef.current.load();
    }
  }, [videoSrc]);

  // --- 1. UPLOAD LOGIC ---
  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newClips = files.map(file => ({
        id: Date.now() + Math.random(),
        file: file,
        src: URL.createObjectURL(file)
      }));
      setClips(prev => [...prev, ...newClips]);
      setVideoFile(files[0]); 
      setVideoSrc(newClips[0].src);
      toast.success("Source Injected!");
    }
  };

  // --- 2. CUT / SPLIT LOGIC ---
  const handleCut = () => {
    if (!videoSrc) return toast.error("No source to cut!");
    const splitTime = currentTime.toFixed(2);
    toast.success(`Neural Cut at ${splitTime}s`, {
      icon: <Scissors className="text-cyan-500" size={16}/>,
      style: { background: '#000', color: '#fff', border: '1px solid #222' }
    });
  };

  // --- 3. TEXT LAYER INJECTION ---
  const addTextLayer = () => {
    const newText = {
      id: Date.now(),
      content: "OnyxDrift Text",
      x: 50, y: 50,
      style: { color: "#ffffff", fontSize: "24px" },
      start: currentTime,
      end: currentTime + 5
    };
    setTracks(prev => ({ ...prev, text: [...prev.text, newText] }));
    toast.success("Text Layer Synced");
  };

  // --- 4. AUDIO SYNC ---
  const addAudioTrack = (type = "BGM") => {
    const newAudio = {
      id: Date.now(),
      name: `Neural_${type}_${Math.floor(Math.random()*100)}.mp3`,
      volume: 0.8,
      start: currentTime
    };
    setTracks(prev => ({ ...prev, audio: [...prev.audio, newAudio] }));
    toast.success(`${type} Track Added!`);
  };

  // --- 5. AI SYNC COMMAND ENGINE ---
  const executeAiCommand = () => {
    if (!aiPrompt) return;
    const prompt = aiPrompt.toLowerCase();
    toast.loading("Onyx AI Processing...", { id: "ai-sync" });

    setTimeout(() => {
      if (prompt.includes("bright")) updateFilter('brightness', 150);
      if (prompt.includes("dark") || prompt.includes("cinematic")) updateFilter('brightness', 70);
      if (prompt.includes("blur")) updateFilter('blur', 10);
      if (prompt.includes("saturate")) updateFilter('saturate', 180);
      
      setAiPrompt("");
      toast.success("AI Sync Complete!", { id: "ai-sync" });
    }, 1500);
  };

  const updateFilter = (filterName, value) => {
    setEditData(prev => ({
      ...prev,
      filters: { ...prev.filters, [filterName]: value }
    }));
  };

  // --- 6. EXPORT & PUBLISH TO FEED ---
  const handleExportAndPublish = async () => {
    if (!videoFile) return toast.error("No video source found!");
    
    setIsRendering(true);
    const tid = toast.loading("Finalizing & Publishing to Feed...");

    try {
      // এখানে সাধারণত ভিডিও প্রসেসিং শেষে সার্ভারে পাঠানো হয়
      const formData = new FormData();
      formData.append("video", videoFile);
      formData.append("userId", user?.id);
      formData.append("editConfig", JSON.stringify({ tracks, editData }));

      // API Call to publish
      const response = await axios.post(`${API_URL}/api/reels/publish`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setRenderProgress(percent);
        }
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Live on Feed!", { id: tid });
        // পাবলিশ হয়ে গেলে সরাসরি রিলস বা ফিড পেজে চলে যাবে
        navigate("/reels"); 
      }
    } catch (error) {
      console.error("Publishing error:", error);
      toast.error("Failed to publish to feed.", { id: tid });
    } finally {
      setIsRendering(false);
      setRenderProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020202] text-white flex flex-col overflow-hidden select-none font-sans">
      
      {/* TOP HEADER */}
      <header className="h-16 flex items-center justify-between px-4 z-[60] bg-black/60 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-xl text-zinc-400 active:scale-90 transition-all">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black tracking-widest text-cyan-500 uppercase">Neural Editor</span>
            <span className="text-[8px] text-zinc-500 uppercase tracking-tighter">OnyxDrift Engine V3</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportAndPublish}
            disabled={isRendering}
            className={`px-6 py-2 rounded-full font-black text-[10px] uppercase transition-all shadow-lg ${isRendering ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-cyan-500 text-black shadow-cyan-500/20 active:scale-95'}`}
          >
            {isRendering ? `Publishing ${renderProgress}%` : "Export to Feed"}
          </button>
        </div>
      </header>

      <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden">
        
        {/* Desktop Sidebar */}
        <div className="hidden md:block border-r border-white/5">
          <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} editData={editData} setEditData={setEditData} />
        </div>

        <main className="flex-1 relative flex flex-col items-center justify-center p-4 bg-[#050505]">
          
          {/* AI Command Bar (AI Sync) */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#0f0f0f]/90 backdrop-blur-3xl border border-white/10 rounded-[22px] p-1.5 flex items-center gap-3 shadow-2xl">
              <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-500"><Sparkles size={16} /></div>
              <input 
                value={aiPrompt} 
                onChange={(e) => setAiPrompt(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && executeAiCommand()}
                placeholder="Command AI: 'Add cinematic lighting'..." 
                className="bg-transparent border-none outline-none text-xs flex-1 text-zinc-200" 
              />
              <button onClick={executeAiCommand} className="p-2.5 bg-cyan-500 text-black rounded-xl"><Send size={16} /></button>
            </motion.div>
          </div>

          {/* Video Preview */}
          <div className="relative group">
            {videoSrc ? (
              <motion.div 
                layoutId="video-main"
                className="relative shadow-2xl rounded-[2.5rem] overflow-hidden border border-white/10 bg-black"
                style={{ 
                  aspectRatio: "9/16", 
                  height: "55vh", 
                  transform: `scaleX(${editData.isFlipped ? -1 : 1})` 
                }}
              >
                <video
                  ref={videoRef} src={videoSrc} loop playsInline autoPlay
                  className="w-full h-full object-cover transition-all duration-300"
                  style={{ 
                    filter: `brightness(${editData.filters.brightness}%) contrast(${editData.filters.contrast}%) saturate(${editData.filters.saturate}%) blur(${editData.filters.blur}px)` 
                  }}
                  onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime)}
                  onLoadedMetadata={() => setDuration(videoRef.current?.duration)}
                />

                {/* --- RENDER TEXT LAYERS --- */}
                {tracks.text.map(text => (
                  <motion.div 
                    key={text.id} drag dragMomentum={false}
                    className="absolute text-white font-bold cursor-move drop-shadow-lg"
                    style={{ top: `${text.y}%`, left: `${text.x}%`, ...text.style }}
                  >
                    {text.content}
                  </motion.div>
                ))}

                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => { isPlaying ? videoRef.current.pause() : videoRef.current.play(); setIsPlaying(!isPlaying); }}>
                  {!isPlaying ? <Play size={50} className="text-white/80 fill-white/20" /> : <Pause size={50} className="text-white/80" />}
                </div>
              </motion.div>
            ) : (
              <div onClick={() => fileInputRef.current.click()} className="flex flex-col items-center gap-6 cursor-pointer">
                <div className="w-24 h-24 bg-zinc-900 rounded-[40px] flex items-center justify-center border-2 border-dashed border-white/5">
                  <Upload size={32} className="text-zinc-600 animate-pulse" />
                </div>
                <p className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.4em]">Inject Neural Source</p>
              </div>
            )}
          </div>

          {/* Mobile Bottom Quick Actions */}
          <div className="md:hidden absolute bottom-6 w-full max-w-sm px-4 z-50">
             <div className="bg-black/80 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex justify-around items-center shadow-2xl">
                <button onClick={() => setActiveMenu('filters')} className="p-3 text-zinc-500 hover:text-cyan-400 flex flex-col items-center">
                  <Wand2 size={20} /><span className="text-[7px] font-black uppercase mt-1">Filters</span>
                </button>
                <button onClick={() => setActiveMenu('text')} className="p-3 text-zinc-500 hover:text-cyan-400 flex flex-col items-center">
                  <Type size={20} /><span className="text-[7px] font-black uppercase mt-1">Text</span>
                </button>

                {/* CUT ACTION */}
                <button onClick={handleCut} className="p-4 bg-cyan-500 text-black rounded-full shadow-lg -translate-y-4 border-4 border-[#050505] active:scale-90 transition-all">
                  <Scissors size={22} />
                </button>

                <button onClick={() => setActiveMenu('audio')} className="p-3 text-zinc-500 hover:text-cyan-400 flex flex-col items-center">
                  <Music size={20} /><span className="text-[7px] font-black uppercase mt-1">Audio</span>
                </button>
                <button onClick={() => setActiveMenu('ai')} className="p-3 text-cyan-500 flex flex-col items-center">
                  <Sparkles size={20} /><span className="text-[7px] font-black uppercase mt-1">AI Sync</span>
                </button>
             </div>
          </div>
        </main>
      </div>

      <footer className="h-[25vh] bg-[#020202] border-t border-white/5 relative z-40 overflow-hidden">
        <Timeline currentTime={currentTime} duration={duration} videoRef={videoRef} isPlaying={isPlaying} setEditData={setEditData} setVideoSrc={setVideoSrc} clips={clips} tracks={tracks} />
      </footer>

      <input ref={fileInputRef} type="file" hidden accept="video/*" multiple onChange={handleUpload} />
      
      {/* DRAWER SYSTEM */}
      <AnimatePresence>
        {activeMenu && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveMenu(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed inset-x-0 bottom-0 z-[120] bg-[#0a0a0a] rounded-t-[40px] p-8 border-t border-white/10 min-h-[40vh]">
              <div className="w-12 h-1 bg-white/10 mx-auto rounded-full mb-8" onClick={() => setActiveMenu(null)} />
              
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black uppercase tracking-widest text-cyan-500">{activeMenu} Settings</h3>
                <button onClick={() => setActiveMenu(null)} className="p-2 bg-white/5 rounded-full text-zinc-500"><X size={18} /></button>
              </div>

              {activeMenu === 'filters' && (
                <div className="space-y-8 pb-10">
                  {Object.keys(editData.filters).map((filter) => (
                    <div key={filter} className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500">
                        <span>{filter}</span>
                        <span className="text-cyan-500">{editData.filters[filter]}{filter === 'blur' ? 'px' : '%'}</span>
                      </div>
                      <input type="range" min="0" max={filter === 'blur' ? "20" : "200"} value={editData.filters[filter]} onChange={(e) => updateFilter(filter, e.target.value)} className="w-full accent-cyan-500 bg-white/5 h-1 rounded-full appearance-none cursor-pointer" />
                    </div>
                  ))}
                </div>
              )}

              {activeMenu === 'text' && (
                <div className="space-y-4">
                  <button onClick={addTextLayer} className="w-full py-4 bg-white/5 rounded-2xl flex items-center justify-center gap-3 font-bold uppercase text-[10px] border border-white/5 hover:border-cyan-500/50">
                    <Plus size={16}/> Inject New Text Layer
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    {tracks.text.map(t => (
                      <div key={t.id} className="p-3 bg-white/5 rounded-xl flex justify-between items-center border border-white/5">
                        <span className="text-[10px] truncate">{t.content}</span>
                        <Trash2 size={14} className="text-red-500 cursor-pointer" onClick={() => setTracks(p => ({...p, text: p.text.filter(x => x.id !== t.id)}))} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === 'audio' && (
                <div className="space-y-4">
                  <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                    {['Pop', 'Cinematic', 'Lo-fi', 'Action'].map(genre => (
                      <button key={genre} onClick={() => addAudioTrack(genre)} className="px-6 py-3 bg-white/5 rounded-xl whitespace-nowrap text-[10px] font-bold border border-white/10 hover:border-cyan-500 transition-all">Add {genre} Track</button>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === 'ai' && (
                <div className="h-40 flex items-center justify-center border border-dashed border-white/5 rounded-3xl text-zinc-700 text-[10px] font-bold uppercase text-center px-10">
                  Use the Neural Command Bar at the top to sync AI effects instantly.
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TikTokEditor;