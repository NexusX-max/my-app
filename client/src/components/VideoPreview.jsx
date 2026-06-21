import React, { useRef, useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  Trash2, 
  RotateCw, 
  Plus, 
  Sparkles, 
  Video, 
  Settings,
  HelpCircle,
  Eye,
  Maximize2
} from "lucide-react";

export default function VideoPreview({
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
  setVideoVolume,
  videoUrl,
  setVideoUrl,
  videoName,
  setVideoName,
  showToast,
  mobileMode = false,
  selectedTrack
}) {
  const videoRef = useRef(null);
  const stageRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  
  const [isDraggingElement, setIsDraggingElement] = useState(false);
  const [dragOffset, setDragOffset] = useState({ startX: 0, startY: 0, origX: 50, origY: 50 });
  const [activeCaptionText, setActiveCaptionText] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [hasDragHover, setHasDragHover] = useState(false);

  // Default demo video
  const defaultVideoUrl = "https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-on-a-wet-track-40114-large.mp4";
  const activeVideoSrc = videoUrl || defaultVideoUrl;

  // Trigger local computer upload
  const handleUploadClick = (e) => {
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
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
      showToast(`⚡ Loaded video: ${file.name}`);
    }
  };

  // Drag and drop video upload handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setHasDragHover(true);
  };

  const handleDragLeave = () => {
    setHasDragHover(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setHasDragHover(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      const URLObj = window.URL || window.webkitURL;
      const objectUrl = URLObj.createObjectURL(file);
      setVideoUrl(objectUrl);
      setVideoName(file.name);
      setIsPlaying(false);
      setCurrentTime(0);
      showToast(`🔥 Dropped video loaded: ${file.name}`);
    } else {
      showToast("❌ Please drop a valid video file.");
    }
  };

  // Volume synchronization (Keep native video voice fully active alongside sound tracks!)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = videoVolume / 100;
      videoRef.current.muted = videoVolume === 0;
    }
    if (audioRef.current) {
      audioRef.current.volume = videoVolume / 100;
      audioRef.current.muted = videoVolume === 0;
    }
  }, [videoVolume]);

  // Auto-reload the native video element when the source URL changes
  useEffect(() => {
    if (videoRef.current) {
      try {
        videoRef.current.load();
        videoRef.current.currentTime = 0;
      } catch (err) {
        console.warn("Video load error: ", err);
      }
    }
  }, [activeVideoSrc]);

  // Synchronize playing states of video and synchronized soundtrack
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }

    if (audioRef.current) {
      if (selectedTrack && selectedTrack.audio_url) {
        if (audioRef.current.src !== selectedTrack.audio_url) {
          audioRef.current.src = selectedTrack.audio_url;
          audioRef.current.load();
        }
        if (isPlaying) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, setIsPlaying, activeVideoSrc, selectedTrack]);

  // Sync seek/time position changes from scrubbing
  useEffect(() => {
    if (videoRef.current && Math.abs(videoRef.current.currentTime - currentTime) > 0.3) {
      videoRef.current.currentTime = currentTime;
    }

    if (audioRef.current && selectedTrack) {
      const targetTime = (selectedTrack.trimStart || 0) + currentTime;
      if (Math.abs(audioRef.current.currentTime - targetTime) > 0.3) {
        audioRef.current.currentTime = targetTime;
      }
    }

    // Determine current timeline caption text
    const activeCap = captions.find((c) => currentTime >= c.start && currentTime <= c.end);
    setActiveCaptionText(activeCap ? activeCap.text : "");
  }, [currentTime, captions, selectedTrack]);

  // Handle local video element progress ticks
  const onTimeUpdate = () => {
    if (videoRef.current && isPlaying) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Elements positioning and dragging inside stage coordinate space (percentages)
  const handleElementStartDrag = (e, elId) => {
    e.stopPropagation();
    setSelectedElementId(elId);
    setIsDraggingElement(true);

    const el = elements.find((x) => x.id === elId);
    if (!el) return;

    const nativeEvent = e.touches ? e.touches[0] : e;
    setDragOffset({
      startX: nativeEvent.clientX,
      startY: nativeEvent.clientY,
      origX: el.x,
      origY: el.y
    });
  };

  const handleStageMove = (e) => {
    if (!isDraggingElement || !selectedElementId || !stageRef.current) return;

    const bounds = stageRef.current.getBoundingClientRect();
    const nativeEvent = e.touches ? e.touches[0] : e;
    
    // Percentage difference
    const diffX = ((nativeEvent.clientX - dragOffset.startX) / bounds.width) * 100;
    const diffY = ((nativeEvent.clientY - dragOffset.startY) / bounds.height) * 100;

    // Apply clamped offsets
    setElements(
      elements.map((item) => {
        if (item.id === selectedElementId) {
          return {
            ...item,
            x: Math.min(Math.max(dragOffset.origX + diffX, 3), 97),
            y: Math.min(Math.max(dragOffset.origY + diffY, 3), 97)
          };
        }
        return item;
      })
    );
  };

  const handleElementEndDrag = () => {
    setIsDraggingElement(false);
  };

  // Manipulations on active item
  const deleteElement = (id) => {
    setElements(elements.filter((el) => el.id !== id));
    if (selectedElementId === id) setSelectedElementId(null);
    showToast("Trash badge removed");
  };

  const rotateElement = (id) => {
    setElements(
      elements.map((el) => {
        if (el.id === id) {
          const nextRotation = ((el.rotate || 0) + 15) % 360;
          return { ...el, rotate: nextRotation };
        }
        return el;
      })
    );
  };

  const scaleElement = (id, direction) => {
    setElements(
      elements.map((el) => {
        if (el.id === id) {
          const step = 0.15 * direction;
          const targetScale = Math.min(Math.max((el.scale || 1) + step, 0.4), 2.5);
          return { ...el, scale: parseFloat(targetScale.toFixed(2)) };
        }
        return el;
      })
    );
  };

  // Helper selectors matching custom styles
  const zoomScale = (() => {
    if (!aiMarkers || !aiMarkers.zoomMarkers) return 1;
    const keyZoom = aiMarkers.zoomMarkers.find(
      (m) => currentTime >= m.time && currentTime < m.time + 0.45
    );
    return keyZoom ? keyZoom.scale : 1;
  })();

  const isStrobeActive = (() => {
    if (activeEffects.includes("strobe-flash")) return true;
    if (!aiMarkers || !aiMarkers.beatSyncMarkers) return false;
    return aiMarkers.beatSyncMarkers.some((tb) => currentTime >= tb && currentTime < tb + 0.18);
  })();

  const baseFilterClass = colorPreset ? colorPreset.cssClass : "";
  const motionBlurClass = activeEffects.includes("motion-blur") ? "blur-[1.2px] scale-[1.02]" : "";
  const camerShakeClass = activeEffects.includes("camera-shake") ? "animate-shake" : "";
  const speedRampStyle = activeEffects.includes("speed-ramp") ? "transition-all duration-350" : "";

  return (
    <div 
      id="video-preview-panel"
      className="flex flex-col items-center justify-center w-full max-w-full grow"
      style={mobileMode ? { minHeight: "410px", maxHeight: "510px" } : { minHeight: "380px" }}
    >
      {/* Dynamic Overlay Canvas & Movie Box */}
      <div
        ref={stageRef}
        onMouseMove={handleStageMove}
        onTouchMove={handleStageMove}
        onMouseUp={handleElementEndDrag}
        onTouchEnd={handleElementEndDrag}
        onMouseLeave={handleElementEndDrag}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => setSelectedElementId(null)}
        className={`relative w-full aspect-[9/16] bg-neutral-900 border border-neutral-850 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 select-none ${
          mobileMode ? "max-w-[260px] xs:max-w-[290px] h-[390px] xs:h-[440px]" : "max-w-[340px]"
        } ${
          hasDragHover ? "border-amber-500 scale-[1.01] shadow-amber-950/20" : "border-neutral-800"
        }`}
      >
        
        {/* Active Native Video Tag */}
        <div
          className={`w-full h-full relative transition-all duration-150 ${camerShakeClass}`}
          style={{ transform: `scale(${zoomScale})` }}
        >
          <video
            key={activeVideoSrc}
            ref={videoRef}
            src={activeVideoSrc}
            className={`w-full h-full object-cover select-none pointer-events-none ${baseFilterClass} ${motionBlurClass} ${speedRampStyle}`}
            loop
            muted={videoVolume === 0}
            playsInline
            onTimeUpdate={onTimeUpdate}
          />

          {/* Cinematic Aspect Curtains inside preview */}
          {activeEffects.includes("letterbox") && (
            <div className="absolute inset-x-0 inset-y-0 pointer-events-none z-10 flex flex-col justify-between">
              <div className="h-4 w-full bg-black/90 border-b border-neutral-950 shadow-md"></div>
              <div className="h-4 w-full bg-black/90 border-t border-neutral-950 shadow-md"></div>
            </div>
          )}

          {/* Strobe screen glow flash animation simulation */}
          {isStrobeActive && (
            <div className="absolute inset-0 bg-white/20 mix-blend-overlay z-15 pointer-events-none" />
          )}

          {/* Pulse red frame filter when speed or shake is in full motion */}
          {(activeEffects.includes("camera-shake") || activeEffects.includes("glow-burst")) && (
            <div className="absolute inset-0 bg-red-650/10 pointer-events-none z-10 animate-pulse border border-red-500/20" />
          )}
        </div>

        {/* Change Video Floating Trigger */}
        {videoUrl && (
          <div className="absolute top-2 right-2 z-35 flex items-center">
            <button
              onClick={handleUploadClick}
              className="bg-black/80 hover:bg-amber-500 hover:text-black py-1 px-2.5 rounded border border-neutral-800 hover:border-amber-400 transition-all font-mono text-[9px] font-bold text-zinc-350 flex items-center gap-1.5 cursor-pointer shadow-md select-none"
              title="Upload different video file"
            >
              <Video size={11} className="text-amber-500 flex-shrink-0" />
              <span>Change Video</span>
            </button>
          </div>
        )}

        {/* DRAG-AND-DROP NO VIDEO FALLBACK DIALOG */}
        {!videoUrl && (
          <div 
            onClick={handleUploadClick}
            className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-3 text-center cursor-pointer group hover:bg-black/75 transition-all duration-300 z-30 m-1.5 border border-dashed border-neutral-800 hover:border-amber-500/50 rounded-lg"
          >
            <div className={`rounded-full bg-neutral-900 border border-neutral-850 flex items-center justify-center text-zinc-400 group-hover:scale-110 group-hover:bg-amber-500/10 group-hover:text-amber-400 group-hover:border-amber-500 shadow-lg transition-all duration-300 ${
              mobileMode ? "w-7 h-7" : "w-12 h-12"
            }`}>
              <Plus size={mobileMode ? 14 : 20} />
            </div>
            <span className={`font-display font-black mt-2 tracking-wider uppercase group-hover:text-amber-405 transition-colors ${
              mobileMode ? "text-[8px]" : "text-[10px]"
            }`}>
              UPLOAD MP4 +
            </span>
            {!mobileMode && (
              <span className="text-[8px] text-zinc-500 font-mono mt-1 max-w-[180px] leading-relaxed">
                Drag or click to choose custom mobile video format.
              </span>
            )}
          </div>
        )}

        {/* DYNAMIC TIMELINE SUBTITLE OVERLAYS VIEW */}
        {activeCaptionText && (
          <div className="absolute bottom-6 left-2 right-2 text-center z-20 pointer-events-none">
            <span className="inline-block bg-black/90 backdrop-blur-sm border border-neutral-850 px-2.5 py-1 rounded text-[8px] sm:text-[9px] font-display font-black tracking-widest text-[#a855f7] drop-shadow-[0_0_10px_rgba(168,85,247,0.4)] animate-bounce uppercase">
              {activeCaptionText}
            </span>
          </div>
        )}

        {/* FLOATING DRAGGABLE OVERLAYS (STAMP LISTS & CUSTOM TEXT OVERLAYS) */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {elements.map((el) => {
            const isSelected = selectedElementId === el.id;
            return (
              <div
                key={el.id}
                onMouseDown={(e) => handleElementStartDrag(e, el.id)}
                onTouchStart={(e) => handleElementStartDrag(e, el.id)}
                className={`absolute cursor-grab select-none p-1.5 rounded transition-shadow pointer-events-auto ${
                  isSelected ? "ring-2 ring-amber-400 bg-neutral-950/90 shadow-2xl scale-[1.03] z-40" : "bg-transparent"
                }`}
                style={{
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  transform: `translate(-50%, -50%) rotate(${el.rotate || 0}deg) scale(${(el.scale || 1) * (mobileMode ? 0.85 : 1)})`,
                }}
              >
                {/* 3 type cases: text overlay style standard OR picture badges OR emojis */}
                {el.type === "image" ? (
                  <div className="w-[36px] h-[36px] rounded-lg overflow-hidden border border-amber-400 bg-neutral-900/90 shadow-lg flex items-center justify-center p-0.5">
                    <img
                      src={el.value}
                      alt="Drift Badge"
                      className="w-full h-full object-cover rounded pointer-events-none select-none"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : el.type === "sticker" ? (
                  <div className={`${el.styleClass || ""} text-[8px] truncate max-w-full font-mono whitespace-nowrap scale-85`}>
                    {el.value}
                  </div>
                ) : (
                  <div
                    className={`text-center font-extrabold text-[9px] sm:text-xs tracking-tight uppercase whitespace-nowrap drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.95)] ${
                      el.style === "Neon" ? "text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.85)] font-sans" : ""
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

                {/* Inline manipulation knobs for active element focus */}
                {isSelected && (
                  <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 bg-neutral-950 border border-neutral-800 rounded-md py-0.5 px-1.5 flex items-center gap-1 shadow-2xl pointer-events-auto z-45 shrink-0 scale-90">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        rotateElement(el.id);
                      }}
                      className="text-zinc-450 hover:text-white p-0.5 rounded hover:bg-neutral-900 active:scale-90 transition text-[9px]"
                      title="Rotate 15°"
                    >
                      <RotateCw size={9} />
                    </button>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        scaleElement(el.id, 1);
                      }}
                      className="text-zinc-450 hover:text-white font-black text-[9px] px-1 hover:bg-neutral-900 rounded"
                      title="Enlarge"
                    >
                      +
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        scaleElement(el.id, -1);
                      }}
                      className="text-zinc-450 hover:text-white font-black text-[9px] px-1 hover:bg-neutral-900 rounded"
                      title="Shrink"
                    >
                      -
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElement(el.id);
                      }}
                      className="text-red-500 hover:text-red-400 p-0.5 rounded hover:bg-red-500/10 transition"
                      title="Delete Element"
                    >
                      <Trash2 size={8} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SYSTEM OVERVIEW INFO FLOATING FLAG (top left) */}
        <div className="absolute top-2 left-2 z-20 flex flex-col gap-0.5 pointer-events-none font-mono text-[6.5px] bg-black/75 px-1.5 py-0.5 rounded border border-neutral-850">
          <span className="text-zinc-450 truncate max-w-[80px]">FILE: {videoName ? videoName.substring(0,12) + "..." : "Demo Loop"}</span>
          <span className="text-amber-405 font-semibold">LUT: {colorPreset ? colorPreset.name : "None"}</span>
        </div>

        {/* Hidden Input reference */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/*"
          className="hidden"
        />

        {/* Dynamic Sync Audio Component */}
        <audio ref={audioRef} loop />

      </div>

      {/* METICULOUS VIDEO TRANSPORT STATUS CONTROLLER BAR */}
      <div className={`w-full mt-3 bg-neutral-900 border border-neutral-800 rounded-xl px-3 sm:px-3.5 py-2 flex items-center justify-between gap-2.5 sm:gap-3 shadow-lg z-20 shrink-0 ${
        mobileMode ? "max-w-[260px] xs:max-w-[290px]" : "max-w-[340px]"
      }`}>
        
        {/* Play Pause Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
            isPlaying ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-red-650 hover:bg-red-550 text-white animate-pulse"
          }`}
        >
          {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" className="ml-0.5" />}
        </button>

        {/* Current Time Display Code */}
        <div className="flex-1 font-mono text-[9px] sm:text-[10px] text-zinc-400 text-center tracking-wider">
          <span className="text-white font-bold">{currentTime.toFixed(2)}s</span>
          <span className="text-zinc-650"> / 15.00s</span>
        </div>

        {/* Interactive sound block slider */}
        <div className="flex items-center gap-1 sm:gap-1.5 group">
          <Volume2 size={12} className="text-zinc-500 group-hover:text-amber-500 transition" />
          <input
            id="preview-volume-slider"
            type="range"
            min="0"
            max="100"
            value={videoVolume}
            onChange={(e) => setVideoVolume(parseInt(e.target.value))}
            className="w-10 sm:w-16 h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            title={`Video volume: ${videoVolume}%`}
          />
        </div>

      </div>

    </div>
  );
}
