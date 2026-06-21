import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Pause, RotateCw, Sparkles, Type, Smile, Trash2, 
  Undo2, Redo2, Music, Mic, Sliders, Palette, Zap, 
  ArrowLeft, ArrowRight, Plus, Volume2, FileText, ChevronLeft
} from "lucide-react";

export default function LivePreview({
  isPlaying,
  setIsPlaying,
  currentTime,
  setCurrentTime,
  colorPreset,
  activeEffects,
  captions,
  elements,
  setElements,
  selectedElementId,
  setSelectedElementId,
  aiMarkers,
  videoVolume,
  // Coordinated callbacks and properties passed from parent for full smartphone autonomy
  tab,
  setTab,
  history = [],
  redoStack = [],
  handleUndo,
  handleRedo,
  COLOR_PRESETS = [],
  TRACK_LIST = [],
  selectedTrack,
  setSelectedTrack,
  STICKERS = [],
  addDriftSticker,
  EFFECTS = [],
  toggleEffectType,
  setColorPreset,
  aiPrompt,
  setAiPrompt,
  isAiGenerating,
  generateAiEditsFromPrompt,
  newTextValue,
  setNewTextValue,
  newTextStyle,
  setNewTextStyle,
  handleAddNewTextOverlay,
  handleUpdateCaptionText,
  showToast,
  videoUrl,
  setVideoUrl,
  videoName,
  setVideoName,
  setIsExporting
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const trackContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeCaption, setActiveCaption] = useState("");

  const handleTriggerUploadClick = (e) => {
    if (e) e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const URLObj = window.URL || window.webkitURL;
      const objectUrl = URLObj.createObjectURL(file);
      setVideoUrl(objectUrl);
      setVideoName(file.name);
      setIsPlaying(false);
      setCurrentTime(0);
      showToast(`Uploaded video: ${file.name}`);
    }
  };

  // Sync video audio volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = videoVolume / 100;
      videoRef.current.muted = videoVolume === 0;
    }
  }, [videoVolume]);

  // Sync video playback with parent isPlaying state
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Ignore autoplayer policy blocks
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Check playhead zoom marker from AI
  const getZoomScale = () => {
    if (!aiMarkers || !aiMarkers.zoomMarkers) return 1;
    const activeZoom = aiMarkers.zoomMarkers.find(
      (m) => currentTime >= m.time && currentTime < m.time + 0.4
    );
    return activeZoom ? activeZoom.scale : 1;
  };

  const getBeatFlash = () => {
    if (!aiMarkers || !aiMarkers.beatSyncMarkers) return false;
    return aiMarkers.beatSyncMarkers.some(
      (t) => currentTime >= t && currentTime < t + 0.15
    );
  };

  // Synchronize video time with parent playhead
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.3) {
      videoRef.current.currentTime = currentTime;
    }

    const matchingCaption = captions.find(
      (c) => currentTime >= c.start && currentTime <= c.end
    );
    setActiveCaption(matchingCaption ? matchingCaption.text : "");
  }, [currentTime, captions]);

  // Handle video element playhead ticks
  const handleTimeUpdate = () => {
    if (videoRef.current && isPlaying) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Drag handlers for overlays inside the video frame boundaries
  const handleElementMouseDown = (e, elId) => {
    e.stopPropagation();
    setSelectedElementId(elId);
    setIsDragging(true);

    const el = elements.find((x) => x.id === elId);
    if (!el) return;

    // Get event coordinates supporting both mouse and touch if needed
    const clientX = e.clientX;
    const clientY = e.clientY;

    setDragStart({
      startX: clientX,
      startY: clientY,
      origX: el.x,
      origY: el.y
    });
  };

  const handleContainerMouseMove = (e) => {
    if (!isDragging || !selectedElementId || !containerRef.current) return;

    const el = elements.find((x) => x.id === selectedElementId);
    if (!el) return;

    const bounds = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - dragStart.startX) / bounds.width) * 100;
    const deltaY = ((e.clientY - dragStart.startY) / bounds.height) * 100;

    setElements(
      elements.map((item) => {
        if (item.id === selectedElementId) {
          return {
            ...item,
            x: Math.min(Math.max(dragStart.origX + deltaX, 5), 95),
            y: Math.min(Math.max(dragStart.origY + deltaY, 5), 95)
          };
        }
        return item;
      })
    );
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const deleteElement = (id) => {
    setElements(elements.filter((el) => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  const rotateElement = (id) => {
    setElements(
      elements.map((el) => {
        if (el.id === id) {
          return { ...el, rotate: (el.rotate + 15) % 360 };
        }
        return el;
      })
    );
  };

  // Interactive timeline scrubbing inside the smartphone frame
  const handleTimelineScrub = (e) => {
    if (!trackContainerRef.current) return;
    const rect = trackContainerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.min(Math.max(clickX / rect.width, 0), 1);
    setCurrentTime(percentage * 15.0);
  };

  const handleTimelineMouseHold = (e) => {
    if (e.buttons !== 1) return;
    handleTimelineScrub(e);
  };

  const currentZoom = getZoomScale();
  const isBeatSyncedNow = getBeatFlash();
  const presetFilterClass = colorPreset ? colorPreset.cssClass : "";
  const filterStyles = `w-full h-full object-cover transition-all duration-300 ${presetFilterClass}`;

  return (
    <div className="flex flex-col items-center justify-center p-1 w-full max-w-md mx-auto">
      
      {/* 1. MOCK SMARTPHONE CASING (CAPCUT INTERFACE ENVIRONMENT) */}
      <div
        id="capcut-smartphone-frame"
        className="relative w-[370px] h-[760px] bg-black text-white rounded-[3rem] border-[6px] border-[#1d1d1f] shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col justify-between selection:bg-rose-500 select-none pb-2"
        style={{ contentVisibility: "auto" }}
      >
        
        {/* TOP STATUS BAR ACCENTS (Cellular, Wifi, Battery 62% matching image) */}
        <div className="h-10 w-full bg-black shrink-0 px-6 pt-3 flex items-center justify-between text-xs font-mono font-bold tracking-tight text-zinc-300 z-30">
          <span>6:05</span>
          {/* Dynamic Island Notch */}
          <div className="w-[110px] h-[18px] bg-black rounded-full border border-zinc-900 absolute left-1/2 -translate-x-1/2 top-2 shadow-inner" />
          <div className="flex items-center gap-1.5 text-[10px]">
            <span>LTE</span>
            <span>📶</span>
            <span>📶</span>
            <span>🔋 62%</span>
          </div>
        </div>

        {/* SMARTPHONE APP MAIN BAR (CapCut Navigation Head - Back Menu Arrow, Next Button) */}
        <div className="px-4 py-1 flex items-center justify-between z-20 shrink-0">
          <button 
            onClick={() => showToast("📁 Exiting live workspace back to project list.")}
            className="w-9 h-9 rounded-full bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-zinc-300 active:scale-95 transition"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="flex items-center gap-1 font-mono text-[10px] bg-zinc-950 px-2 py-1 rounded border border-zinc-900">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-zinc-400">REC: onyx_render_v3</span>
          </div>

          {/* Indigo Right Arrow Action Button matching screenshot */}
          <button 
            onClick={() => setIsExporting(true)}
            className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold active:scale-95 shadow-lg shadow-blue-950/40 transition hover:scale-105"
            title="Export Reel Video"
          >
            <ArrowRight size={18} className="animate-pulse" />
          </button>
        </div>

        {/* 2. LIVE 16:9 VIDEO VIEWER PREVIEW STAGE (Top area of smartphone) */}
        <div 
          id="smartphone-video-viewer-box"
          ref={containerRef}
          onMouseMove={handleContainerMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="relative w-full h-[225px] bg-zinc-950 border-y border-zinc-900 flex items-center justify-center overflow-hidden shrink-0"
        >
          {/* Video renderer */}
          <div
            className="relative w-full h-full overflow-hidden transition-transform duration-100 ease-out flex items-center justify-center"
            style={{
              transform: `scale(${currentZoom * (activeEffects.includes("motion-blur") ? 1.05 : 1)})`,
              filter: activeEffects.includes("glow-burst")
                ? "drop-shadow(0 0 12px rgba(244,63,94,0.7)) contrast(1.15)"
                : ""
            }}
          >
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className={filterStyles}
                loop
                muted={videoVolume === 0}
                playsInline
                onTimeUpdate={handleTimeUpdate}
              />
            ) : (
              <div 
                onClick={handleTriggerUploadClick}
                className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center cursor-pointer group hover:bg-neutral-900/50 transition-all duration-300 z-40 p-4 border-2 border-dashed border-zinc-800 hover:border-amber-500/50 rounded-xl m-2"
              >
                <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:scale-110 group-hover:bg-amber-500/10 group-hover:text-amber-450 group-hover:border-amber-500 shadow-lg shadow-black/80 transition-all duration-300">
                  <Plus size={32} />
                </div>
                <span className="text-[11px] text-zinc-300 font-mono font-black mt-3 tracking-widest uppercase group-hover:text-amber-450 transition-colors">
                  Upload Video +
                </span>
                <span className="text-[8px] text-zinc-500 font-mono mt-0.5">
                  Tap to start editing your video
                </span>
              </div>
            )}

            {/* Hidden Input field ALWAYS available inside the container */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
            />

            {/* Cinematic Letterbox Mask */}
            {activeEffects.includes("letterbox") && (
              <div className="absolute inset-x-0 inset-y-0 pointer-events-none z-10 flex flex-col justify-between">
                <div className="h-6 w-full bg-black border-b border-zinc-900/60 shadow-lg"></div>
                <div className="h-6 w-full bg-black border-t border-zinc-900/60 shadow-lg"></div>
              </div>
            )}

            {/* High-frequency strobe light */}
            {(isBeatSyncedNow || activeEffects.includes("strobe-flash")) && (
              <div className="absolute inset-0 bg-white/20 z-10 pointer-events-none" />
            )}

            {/* Red alert overlay during heavy camera shake */}
            {(activeEffects.includes("camera-shake") || isBeatSyncedNow) && (
              <div className="absolute inset-0 bg-rose-500/10 pointer-events-none z-10 animate-pulse border-2 border-rose-500/20" />
            )}
          </div>

          {/* Floating draggable custom badges/text inside the video player frame */}
          <div className="absolute inset-0 z-20 pointer-events-auto">
            {elements.map((el) => {
              const isSelected = selectedElementId === el.id;
              return (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleElementMouseDown(e, el.id)}
                  className={`absolute cursor-grab select-none p-1.5 rounded transition-all ${
                    isSelected ? "ring-2 ring-amber-400 bg-black/80 shadow-2xl scale-105 z-30" : "bg-transparent"
                  }`}
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    transform: `translate(-50%, -50%) rotate(${el.rotate || 0}deg) scale(${el.scale || 1})`,
                  }}
                >
                  {el.type === "sticker" ? (
                    <div className={`${el.styleClass || ""} text-xs truncate max-w-full`}>
                      {el.value}
                    </div>
                  ) : el.type === "image" ? (
                    <div className="w-[60px] h-[60px] rounded-lg overflow-hidden border border-amber-400 bg-neutral-900/90 shadow-lg flex items-center justify-center p-0.5">
                      <img
                        src={el.value}
                        alt="Drift Badge"
                        className="w-full h-full object-cover rounded pointer-events-none select-none"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div
                      className={`text-center font-extrabold text-base tracking-tight uppercase drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] ${
                        el.style === "Neon" ? "text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.85)] font-sans" : ""
                      } ${
                        el.style === "Classic" ? "font-serif tracking-normal lowercase text-zinc-100" : ""
                      } ${
                        el.style === "Bold" ? "font-black tracking-tighter text-amber-500 font-mono" : ""
                      } ${
                        el.style === "Cyber" ? "font-mono tracking-widest text-[#22c55e] font-black border-b border-green-500" : ""
                      } ${
                        el.style === "3D" ? "text-violet-500 font-extrabold [text-shadow:_1px_1px_0_#fff,_2px_2px_0_#9333ea]" : ""
                      }`}
                    >
                      {el.value}
                    </div>
                  )}

                  {/* Individual adjustment widget */}
                  {isSelected && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black border border-white/25 rounded-md py-0.5 px-1 flex items-center gap-1.5 shadow-xl pointer-events-auto z-30">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          rotateElement(el.id);
                        }}
                        className="text-zinc-300 hover:text-white p-0.5 active:scale-90"
                        title="Rotate"
                      >
                        <RotateCw size={11} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setElements(elements.map((x) => x.id === el.id ? { ...x, scale: Math.min((x.scale || 1) + 0.15, 2.5) } : x));
                        }}
                        className="text-zinc-300 hover:text-white font-black text-[10px] px-1"
                      >
                        +
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setElements(elements.map((x) => x.id === el.id ? { ...x, scale: Math.max((x.scale || 1) - 0.15, 0.4) } : x));
                        }}
                        className="text-zinc-300 hover:text-white font-black text-[10px] px-1"
                      >
                        -
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteElement(el.id);
                        }}
                        className="text-red-400 hover:text-red-300 p-0.5"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive playhead overlay on top of video */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying(!isPlaying);
            }}
            className="absolute inset-0 bg-transparent flex items-center justify-center group z-0 cursor-pointer"
          >
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-sm p-3.5 rounded-full border border-zinc-700/50">
              {isPlaying ? <Pause size={24} className="text-white fill-white" /> : <Play size={24} className="text-white fill-white ml-0.5" />}
            </div>
          </div>

          {/* Real-time Subtitle Caption overlay matching CapCut aesthetic */}
          <div className="absolute inset-x-2 bottom-4 pointer-events-none flex justify-center z-25">
            <AnimatePresence mode="wait">
              {activeCaption && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.1 }}
                  className="bg-black/80 border border-zinc-800 text-rose-400 font-extrabold text-xs px-3 py-1.5 rounded-xl text-center shadow-[0_0_15px_rgba(244,63,94,0.4)] tracking-wide font-mono flex items-center justify-center gap-1.5"
                >
                  <Sparkles size={11} className="text-pink-400 animate-spin" />
                  <span>{activeCaption}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 3. PLAYHEAD INDICATOR BAR (Time stats, Play/Pause, Undo/Redo matching image) */}
        <div className="px-4 py-2 flex items-center justify-between bg-zinc-950 border-b border-zinc-900 shrink-0 z-20">
          {/* Play/Pause Button */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-white active:scale-90 cursor-pointer"
          >
            {isPlaying ? <Pause size={14} className="fill-white" /> : <Play size={14} className="fill-white ml-0.5" />}
          </button>

          {/* Current time / Total duration label - exactly formatted like picture */}
          <span className="text-[11px] font-mono font-bold tracking-widest text-zinc-300">
            0:{currentTime.toFixed(0).padStart(2, "0")} / 0:15
          </span>

          {/* Action History Controls matching the curved buttons on screenshot */}
          <div className="flex bg-zinc-900 rounded-lg p-0.5 border border-zinc-800">
            <button
              onClick={handleUndo}
              disabled={history.length === 0}
              className={`p-1 text-xs rounded transition-colors ${
                history.length > 0 ? "text-amber-500 hover:bg-zinc-850" : "text-zinc-650 cursor-not-allowed"
              }`}
              title="Undo"
            >
              <Undo2 size={13} />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className={`p-1 text-xs rounded transition-colors ${
                redoStack.length > 0 ? "text-amber-500 hover:bg-zinc-850" : "text-zinc-650 cursor-not-allowed"
              }`}
              title="Redo"
            >
              <Redo2 size={13} />
            </button>
          </div>
        </div>

        {/* 4. VISUAL TIMELINE TRACKS (CAPCUT MULTI-LANE STAGE matching screenshot perfectly) */}
        <div 
          id="smartphone-timeline"
          className="relative flex-1 bg-neutral-950 p-2.5 flex flex-col justify-between overflow-hidden z-20"
        >
          {/* Time scale headers matching screenshot */}
          <div className="flex justify-between text-[8px] font-mono text-zinc-500 px-1 border-b border-zinc-900/40 pb-1.5 mb-1 bg-neutral-950 select-none">
            <span>0s</span>
            <span>2s</span>
            <span>4s</span>
            <span>6s</span>
            <span>8s</span>
            <span>10s</span>
            <span>12s</span>
            <span>14s</span>
          </div>

          <div 
            ref={trackContainerRef}
            onClick={handleTimelineScrub}
            onMouseMove={handleTimelineMouseHold}
            className="flex-1 flex flex-col gap-1.5 relative py-1 cursor-ew-resize overflow-y-auto"
          >
            {/* White playback alignment pin needle line cutting straight down the middle */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] z-20 pointer-events-none flex flex-col justify-start items-center"
              style={{ left: `${(currentTime / 15.0) * 100}%` }}
            >
              <div className="w-1.5 h-1.5 bg-white rotate-45 border border-zinc-950 shadow-sm" />
            </div>

            {/* Lane 1: Video Strip Frame Channel */}
            <div 
              onClick={(e) => { e.stopPropagation(); setTab("trim"); }}
              className={`h-9 bg-zinc-900/80 rounded border transition relative flex items-center overflow-hidden ${
                tab === "trim" ? "border-amber-500/50" : "border-zinc-850"
              }`}
            >
              {/* Blue car thumbnail block sequence mimicking picture */}
              <div className="absolute inset-y-0.5 left-0 right-10 bg-gradient-to-r from-blue-950/40 via-blue-900/30 to-zinc-900/60 rounded flex items-center justify-between px-2 text-[8px] font-mono text-zinc-300">
                <span className="truncate font-bold">🏎️ {videoName || "Upload a video..."}</span>
                <span className="text-zinc-500 font-mono">15.0s</span>
              </div>
              <div 
                onClick={handleTriggerUploadClick}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-zinc-800 flex items-center justify-center text-xs hover:bg-zinc-700 cursor-pointer"
                title="Upload/Replace Video"
              >
                <Plus size={10} className="text-white" />
              </div>
            </div>

            {/* Lane 2: Music/Audio Sync Channel */}
            <div 
              onClick={(e) => { e.stopPropagation(); setTab("music"); }}
              className={`h-8 bg-zinc-900/85 rounded border transition relative flex items-center overflow-hidden ${
                tab === "music" ? "border-amber-500/50" : "border-zinc-850"
              }`}
            >
              {selectedTrack ? (
                <div className="absolute inset-y-0.5 left-[5%] right-[15%] bg-pink-950/20 border border-pink-500/20 rounded flex items-center justify-between px-2 text-[8px] font-mono text-pink-400">
                  <span className="truncate font-semibold flex items-center gap-1">
                    <Music size={8} /> {selectedTrack.title}
                  </span>
                  <span>{selectedTrack.bpm} BPM</span>
                </div>
              ) : (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[8px] font-mono text-zinc-500 hover:text-pink-400 cursor-pointer">
                  <Plus size={10} className="border border-zinc-700 rounded-sm p-0.2" />
                  <span className="font-bold">Add audio</span>
                </div>
              )}
            </div>

            {/* Lane 3: Text Text Channel */}
            <div 
              onClick={(e) => { e.stopPropagation(); setTab("text"); }}
              className={`h-8 bg-zinc-900/85 rounded border transition relative flex items-center overflow-hidden ${
                tab === "text" ? "border-amber-500/50" : "border-zinc-850"
              }`}
            >
              {captions.length > 0 ? (
                <div className="absolute inset-y-0.5 left-[15%] w-[60%] bg-emerald-950/20 border border-emerald-500/20 rounded flex items-center justify-between px-2 text-[8px] font-mono text-emerald-400">
                  <span className="truncate flex items-center gap-1">
                    <Type size={8} /> {captions[0]?.text || "Subtitle Caption List"}
                  </span>
                </div>
              ) : (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[8px] font-mono text-zinc-500 hover:text-emerald-400 cursor-pointer">
                  <Plus size={10} className="border border-zinc-700 rounded-sm p-0.2" />
                  <span className="font-bold">Add text</span>
                </div>
              )}
            </div>
          </div>

          {/* Helper caption exactly matching screenshot */}
          <p className="text-[10px] text-zinc-400/80 font-mono tracking-wide text-center mt-2 font-medium">
            Tap on a track to trim. Pinch to zoom.
          </p>
        </div>

        {/* 5. INTERACTIVE ON-DEVICE CONTEXT PANEL SHELF (Sliding drawer inside phone matching tab selection) */}
        <div 
          id="smartphone-drawer-shelf"
          className="bg-black border-t border-zinc-900/80 shrink-0 max-h-[140px] overflow-y-auto px-4 py-2 z-20"
        >
          {/* MUSIC TAB POPULATE */}
          {tab === "music" && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono font-bold text-pink-400 uppercase tracking-widest block">Select Drift Soundtrack Track:</span>
              <div className="flex gap-2 overflow-x-auto pb-1 block whitespace-nowrap scrollbar-none">
                {TRACK_LIST.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTrack(t); showToast(`Soundtrack Synced: ${t.title}`); }}
                    className={`inline-block py-1.5 px-2.5 rounded text-[9px] font-mono font-bold border transition shrink-0 cursor-pointer ${
                      selectedTrack?.id === t.id ? "bg-pink-600/20 border-pink-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    🚀 {t.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TEXT OVERLAY ADD POPULATE */}
          {tab === "text" && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">Insert Custom Screen Overlay text:</span>
              <div className="flex gap-1">
                <input
                  type="text"
                  placeholder="e.g. SLIDE OVER"
                  value={newTextValue}
                  onChange={(e) => setNewTextValue(e.target.value)}
                  className="flex-1 text-[9px] bg-zinc-900 text-white rounded p-1.5 border border-zinc-800 font-mono focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={newTextStyle}
                  onChange={(e) => setNewTextStyle(e.target.value)}
                  className="text-[9px] bg-zinc-900 border border-zinc-800 rounded px-1 font-mono text-zinc-300"
                >
                  <option value="Neon">Neon Pink</option>
                  <option value="Cyber">Toxic Green</option>
                  <option value="Bold">Gold Mono</option>
                </select>
                <button
                  onClick={handleAddNewTextOverlay}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[9px] font-bold px-2 py-1.5 rounded"
                >
                  Insert +
                </button>
              </div>
            </div>
          )}

          {/* SPECTACULAR AI COMMAND GENERATOR IN DOCK */}
          {tab === "ai" && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono font-bold text-violet-400 uppercase tracking-widest block flex items-center gap-1">
                <Sparkles size={10} className="animate-pulse" /> <span>Command Gemini 3.5 Assistant:</span>
              </span>
              <div className="flex gap-1.5">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 text-[9px] bg-zinc-900 text-white border border-zinc-800 rounded p-1 font-mono resize-none focus:outline-none focus:border-violet-500"
                  rows={2}
                  placeholder="Type a stylistic filter concept..."
                />
                <button
                  onClick={generateAiEditsFromPrompt}
                  disabled={isAiGenerating}
                  className="bg-gradient-to-r from-violet-600 to-rose-600 text-white font-bold text-[9px] px-2 py-1.5 rounded shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {isAiGenerating ? "Compiling..." : "Generate +"}
                </button>
              </div>
            </div>
          )}

          {/* JDM STICKERS & IMAGE OVERLAYS */}
          {tab === "sticker" && (
            <div className="flex flex-col gap-2">
              <div>
                <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-widest block mb-1">
                  1. Spawn Picture Overlays (Images):
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 whitespace-nowrap scrollbar-none">
                  {STICKERS.filter(item => item.type === "image").map((stk) => (
                    <button
                      key={stk.id}
                      onClick={() => addDriftSticker(stk)}
                      className="inline-flex items-center gap-1.5 py-1 px-2 bg-neutral-950 hover:bg-zinc-900 border border-amber-500/40 rounded text-[9.5px] font-mono transition text-white shrink-0 cursor-pointer"
                    >
                      <img src={stk.value} className="w-5 h-5 rounded object-cover" referrerPolicy="no-referrer" />
                      <span>{stk.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[9px] font-mono font-bold text-rose-400 uppercase tracking-widest block mb-1">
                  2. Text Stamps & Emojis:
                </span>
                <div className="flex gap-2 overflow-x-auto pb-1 whitespace-nowrap scrollbar-none font-mono text-[9px]">
                  {STICKERS.filter(item => item.type !== "image").map((stk) => (
                    <button
                      key={stk.id}
                      onClick={() => addDriftSticker(stk)}
                      className="inline-block py-1 px-2.5 bg-zinc-900 rounded border border-zinc-800 hover:bg-zinc-800 transition text-white shrink-0 cursor-pointer"
                    >
                      {stk.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FILTERS LUT PRESETS */}
          {tab === "color" && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono font-bold text-sky-400 uppercase tracking-widest block">Choose Color Presets (LUT):</span>
              <div className="flex gap-2 overflow-x-auto pb-1 whitespace-nowrap scrollbar-none">
                {COLOR_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setColorPreset(p); showToast(`LUT grade color changed: ${p.name}`); }}
                    className={`inline-block py-1 px-2.5 rounded text-[9px] font-mono border transition ${
                      colorPreset?.id === p.id ? "bg-sky-600/20 border-sky-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-400"
                    }`}
                  >
                    🎨 {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* EFFECTS & SHUTTER TRIGGERS */}
          {tab === "fx" && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-mono font-bold text-orange-500 uppercase tracking-widest block">Cinematic FX overlay controls:</span>
              <div className="flex gap-2 overflow-x-auto pb-1 whitespace-nowrap scrollbar-none">
                {EFFECTS.map((fx) => {
                  const isActive = activeEffects.includes(fx.effectValue);
                  return (
                    <button
                      key={fx.id}
                      onClick={() => toggleEffectType(fx.effectValue)}
                      className={`inline-block py-1 px-2.5 rounded text-[9px] font-mono border transition ${
                        isActive ? "bg-orange-600/20 border-orange-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-450"
                      }`}
                    >
                      ✨ {fx.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TRIM SPEED MANUAL CAPTION DATA */}
          {tab === "trim" && (
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-mono font-bold text-teal-400 uppercase block">Manual Clip Trim (Loop 15.0s Strict max):</span>
              <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto">
                {captions.map((cap) => (
                  <div key={cap.id} className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded border border-zinc-800">
                    <span className="text-[7px] font-mono text-zinc-500">{cap.start}-{cap.end}s</span>
                    <input
                      type="text"
                      value={cap.text}
                      onChange={(e) => handleUpdateCaptionText(cap.id, e.target.value)}
                      className="flex-1 bg-transparent text-[9px] font-mono text-white focus:outline-none border-b border-zinc-700 focus:border-teal-400 px-1"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 6. BOTTOM TOOLBAR MENU TABS (CAPCUT DOCKED ACTION BAR matching screenshot layout) */}
        <div 
          id="smartphone-dock-bar" 
          className="h-[60px] w-full bg-zinc-950 border-t border-zinc-900 shrink-0 flex items-center justify-around z-30"
        >
          {/* AUDIO Tab */}
          <button
            onClick={() => setTab("music")}
            className={`flex flex-col items-center gap-1 select-none active:scale-95 transition cursor-pointer ${
              tab === "music" ? "text-pink-400" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Music size={16} />
            <span className="text-[9px] font-mono font-black uppercase">Audio</span>
          </button>

          {/* TEXT Tab */}
          <button
            onClick={() => setTab("text")}
            className={`flex flex-col items-center gap-1 select-none active:scale-95 transition cursor-pointer ${
              tab === "text" ? "text-emerald-400" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Type size={16} />
            <span className="text-[9px] font-mono font-black uppercase">Text</span>
          </button>

          {/* VOICE / AI Tab */}
          <button
            onClick={() => setTab("ai")}
            className={`flex flex-col items-center gap-1 select-none active:scale-95 transition cursor-pointer ${
              tab === "ai" ? "text-violet-400" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles size={16} className={tab === "ai" ? "animate-spin" : ""} />
            <span className="text-[9px] font-mono font-black uppercase">Voice</span>
          </button>

          {/* CAPTIONS Tab */}
          <button
            onClick={() => setTab("trim")}
            className={`flex flex-col items-center gap-1 select-none active:scale-95 transition cursor-pointer ${
              tab === "trim" ? "text-teal-400" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sliders size={16} />
            <span className="text-[9px] font-mono font-black uppercase">Captions</span>
          </button>

          {/* STICKERS Tab */}
          <button
            onClick={() => setTab("sticker")}
            className={`flex flex-col items-center gap-1 select-none active:scale-95 transition cursor-pointer ${
              tab === "sticker" ? "text-amber-500" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Smile size={16} />
            <span className="text-[9px] font-mono font-black uppercase">Stickers</span>
          </button>

          {/* FILTERS Tab */}
          <button
            onClick={() => setTab("color")}
            className={`flex flex-col items-center gap-1 select-none active:scale-95 transition cursor-pointer ${
              tab === "color" || tab === "fx" ? "text-sky-400" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Palette size={16} />
            <span className="text-[9px] font-mono font-black uppercase">Filters</span>
          </button>
        </div>

      </div>

    </div>
  );
}
