import React, { useRef, useState } from "react";
import { 
  Film, 
  Type, 
  Music, 
  Zap, 
  Scissors, 
  Clock, 
  PlayCircle,
  Edit2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export default function Timeline({
  currentTime,
  setCurrentTime,
  setIsPlaying,
  selectedTrack,
  captions,
  elements,
  aiMarkers,
  tab,
  setTab,
  // Trim states passed from parent
  trimStart,
  setTrimStart,
  trimEnd,
  setTrimEnd,
  handleUpdateCaptionText,
  handleAddNewCaption,
  handleDeleteCaption,
  showToast,
  mobileMode = false
}) {
  const timelineRef = useRef(null);
  const totalDuration = 15.0; // Fixed max 15.0 seconds
  const [editingCaptionId, setEditingCaptionId] = useState(null);
  const [editingText, setEditingText] = useState("");

  // Start scrubbing playhead
  const handleTimelineScrubClick = (e) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.min(Math.max(clickX / rect.width, 0), 1);
    const destinationTime = percentage * totalDuration;
    
    // Clamp inside active trim window or allow full scrub
    setCurrentTime(parseFloat(destinationTime.toFixed(2)));
  };

  const handleTimelineScrubHold = (e) => {
    if (e.buttons !== 1) return; // Only if mouse is down
    handleTimelineScrubClick(e);
  };

  // Jump exact playhead to beat point markers
  const handleJumpToBeat = (beatTime) => {
    setCurrentTime(beatTime);
    showToast(`🎯 Snapped to tempo marker: ${beatTime.toFixed(2)}s`);
  };

  const startEditingCaptionText = (cap) => {
    setEditingCaptionId(cap.id);
    setEditingText(cap.text);
  };

  const saveEditedCaption = (id) => {
    if (editingText.trim()) {
      handleUpdateCaptionText(id, editingText);
      setEditingCaptionId(null);
      showToast("📝 Subtitle updated on timeline.");
    }
  };

  return (
    <div 
      id="multi-layer-timeline" 
      className={`bg-neutral-900 border border-neutral-800 ${
        mobileMode ? "p-1.5 rounded-lg flex flex-col gap-1 shadow-md" : "p-4 rounded-xl flex flex-col gap-3 shadow-xl"
      } w-full font-sans select-none`}
    >
      
      {/* 1. Header with Trim Indicators */}
      {!mobileMode ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-2 text-zinc-200 font-bold uppercase tracking-wider font-display">
            <Scissors size={14} className="text-red-500" />
            <span>Multi-Layer Editor Track & Speed Trim</span>
          </span>
          <div className="flex items-center gap-2 flex-wrap text-[10px]">
            <span className="bg-neutral-950 px-2 py-1 rounded border border-neutral-850 font-bold text-amber-500">
              Playhead: {currentTime.toFixed(2)}s
            </span>
            <span className="bg-neutral-950 px-2 py-1 rounded border border-neutral-850 text-zinc-400">
              Trim Zone: {trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s ({parseFloat((trimEnd - trimStart).toFixed(1))}s duration)
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-1 text-[8px] font-mono text-zinc-500">
          <span className="font-bold tracking-tight uppercase text-zinc-400 flex items-center gap-1">
            <Scissors size={9} className="text-red-500 shrink-0" /> Tracks
          </span>
          <span>
            Trim: <span className="text-white">{trimStart.toFixed(0)} - {trimEnd.toFixed(0)}s</span>
          </span>
        </div>
      )}

      {/* 2. Visual Timeline Rail Grid */}
      <div className={`relative flex flex-col ${mobileMode ? "gap-1 p-1" : "gap-2 p-2 sm:p-3"} bg-neutral-950 rounded-xl border border-neutral-850/80`}>
        
        {/* Playhead Overlay Red Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 border-l border-white shadow-[0_0_10px_rgba(255,0,0,0.8)] z-30 pointer-events-none transition-all duration-75"
          style={{ left: `${(currentTime / totalDuration) * 100}%` }}
        >
          <div className={`absolute -left-1 bg-red-600 rotate-45 border border-white rounded shadow flex items-center justify-center ${
            mobileMode ? "-top-1 w-2 h-2" : "-top-1.5 w-3.5 h-3.5"
          }`}>
            <div className={`bg-white rounded-full ${mobileMode ? "w-0.5 h-0.5" : "w-1.5 h-1.5"}`}></div>
          </div>
        </div>

        {/* Trim Start Marker Shade Zone */}
        <div 
          className="absolute top-0 bottom-0 left-0 bg-red-950/20 backdrop-blur-[0.5px] border-r-2 border-dashed border-red-500/50 z-20 pointer-events-none"
          style={{ width: `${(trimStart / totalDuration) * 100}%` }}
        />

        {/* Trim End Marker Shade Zone */}
        <div 
          className="absolute top-0 bottom-0 right-0 bg-red-950/20 backdrop-blur-[0.5px] border-l-2 border-dashed border-red-500/50 z-20 pointer-events-none"
          style={{ left: `${(trimEnd / totalDuration) * 100}%`, right: 0 }}
        />

        {/* Invisible Click Surface to scrub playhead */}
        <div
          ref={timelineRef}
          onClick={handleTimelineScrubClick}
          onMouseMove={handleTimelineScrubHold}
          className="absolute inset-x-0 top-0 bottom-0 bg-transparent z-25 cursor-ew-resize"
        />

        {/* --- LANE A: VIDEO TRACK --- */}
        <div 
          onClick={() => setTab("trim")}
          className={`flex items-center rounded-lg bg-neutral-900/40 hover:bg-neutral-900/70 transition overflow-hidden relative border ${
            mobileMode ? "h-6 text-[8px]" : "h-11"
          } ${
            tab === "trim" ? "border-amber-500/35" : "border-transparent"
          }`}
        >
          <div className={`shrink-0 border-r border-neutral-850 px-2 flex items-center gap-1.5 font-mono font-bold text-zinc-300 z-10 bg-neutral-900/90 h-full ${
            mobileMode ? "w-14 text-[7px]" : "w-20 text-[10px]"
          }`}>
            <Film size={mobileMode ? 9 : 11} className="text-blue-400" />
            <span>VIDEO</span>
          </div>

          <div className="flex-1 h-full relative flex">
            {/* Visual scenes blocks */}
            <div className={`absolute left-[0%] w-[33%] bg-neutral-850/80 border border-neutral-700/40 rounded px-1.5 flex items-center font-mono text-zinc-400 truncate ${
              mobileMode ? "inset-y-0.5 text-[6.5px]" : "inset-y-1 text-[8px]"
            }`}>
              🎬 {mobileMode ? "0.0s Shift" : "0.0s Shift Block"}
            </div>
            <div className={`absolute left-[35%] w-[30%] bg-neutral-850/80 border border-neutral-700/40 rounded px-1.5 flex items-center font-mono text-zinc-400 truncate ${
              mobileMode ? "inset-y-0.5 text-[6.5px]" : "inset-y-1 text-[8px]"
            }`}>
              ⚡ {mobileMode ? "5.2s Speed" : "5.2s Speed Curve"}
            </div>
            <div className={`absolute left-[67%] w-[33%] bg-neutral-850/80 border border-neutral-700/40 rounded px-1.5 flex items-center font-mono text-zinc-350 truncate ${
              mobileMode ? "inset-y-0.5 text-[6.5px]" : "inset-y-1 text-[8px]"
            }`}>
              🔥 {mobileMode ? "10s Skid" : "10s Skid-Tires Spark"}
            </div>

            {/* AI Action Beats points markers inside video track */}
            {aiMarkers?.beatSyncMarkers?.map((bm, index) => (
              <button
                key={`beat-tick-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleJumpToBeat(bm);
                }}
                className="absolute inset-y-0 w-0.5 bg-amber-500 z-30 border-l border-amber-300/60 hover:w-1 hover:bg-amber-400 cursor-pointer"
                style={{ left: `${(bm / totalDuration) * 100}%` }}
                title={`AI Beat drop: Click to sync playhead to ${bm.toFixed(1)}s`}
              />
            ))}
          </div>
        </div>

        {/* --- LANE B: SUBTITLE CAPTION LAYERS --- */}
        <div 
          onClick={() => setTab("text")}
          className={`flex items-center rounded-lg bg-neutral-900/40 hover:bg-neutral-900/70 transition overflow-hidden relative border ${
            mobileMode ? "h-6 text-[8px]" : "h-10"
          } ${
            tab === "text" ? "border-amber-500/35" : "border-transparent"
          }`}
        >
          <div className={`shrink-0 border-r border-neutral-850 px-2 flex items-center gap-1.5 font-mono font-bold text-zinc-300 z-10 bg-neutral-900/90 h-full ${
            mobileMode ? "w-14 text-[7px]" : "w-20 text-[10px]"
          }`}>
            <Type size={mobileMode ? 9 : 11} className="text-purple-400" />
            <span>SUB</span>
          </div>

          <div className="flex-1 h-full relative">
            {captions.map((cap) => {
              const startPct = (cap.start / totalDuration) * 100;
              const widthPct = ((cap.end - cap.start) / totalDuration) * 100;
              return (
                <div
                  key={cap.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditingCaptionText(cap);
                    setTab("text");
                  }}
                  className={`absolute bg-purple-500/15 hover:bg-purple-500/30 border border-purple-500/30 rounded px-1.5 flex items-center font-mono text-purple-300 cursor-pointer truncate max-w-full ${
                    mobileMode ? "inset-y-0.5 text-[6px]" : "inset-y-1 text-[8px]"
                  }`}
                  style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                  title="Click below or double tap to edit text content"
                >
                  <span className="truncate">{cap.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- LANE C: AUDIO WAVE LAYER PATH --- */}
        <div 
          onClick={() => setTab("music")}
          className={`flex items-center rounded-lg bg-neutral-900/40 hover:bg-neutral-900/70 transition overflow-hidden relative border ${
            mobileMode ? "h-6 text-[8px]" : "h-11"
          } ${
            tab === "music" ? "border-amber-500/35" : "border-transparent"
          }`}
        >
          <div className={`shrink-0 border-r border-neutral-850 px-2 flex items-center gap-1.5 font-mono font-bold text-zinc-300 z-10 bg-neutral-900/90 h-full ${
            mobileMode ? "w-14 text-[7px]" : "w-20 text-[10px]"
          }`}>
            <Music size={mobileMode ? 9 : 11} className="text-pink-400" />
            <span>MUSIC</span>
          </div>

          <div className="flex-1 h-full relative bg-neutral-950/60 px-2 flex items-center overflow-hidden">
            {/* Live custom audio visualizer peaks waves */}
            <div className={`w-full flex items-end gap-0.5 opacity-35 ${mobileMode ? "h-4" : "h-6"}`}>
              {(selectedTrack?.waveformPoints || [20, 60, 30, 80, 95, 30, 15, 60, 80, 20, 40, 90, 80, 65, 30, 10, 5, 20]).map((pt, i) => (
                <div
                  key={`wf-pt-${i}`}
                  className="bg-pink-500 rounded"
                  style={{
                    height: `${pt}%`,
                    width: mobileMode ? "2px" : "4px"
                  }}
                />
              ))}
            </div>

            {/* Selected soundtrack element badge overlay */}
            <div className={`absolute left-0.5 right-12 bg-pink-650/20 border border-pink-500/40 rounded px-1.5 flex items-center justify-between font-mono text-pink-300 select-none ${
              mobileMode ? "inset-y-0.5 text-[6px]" : "inset-y-1.5 text-[9px]"
            }`}>
              <span className="font-bold truncate">🎵 {selectedTrack ? selectedTrack.title : "Phonk Beat"}</span>
              {!mobileMode && (
                <span className="shrink-0 text-[8px] text-pink-400 font-mono font-normal">
                  BPM: {selectedTrack ? selectedTrack.bpm : 140}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* --- LANE D: MOUNTED MOVIE EFFECTS AND LUT --- */}
        <div 
          onClick={() => setTab("fx")}
          className={`flex items-center rounded-lg bg-neutral-900/40 hover:bg-neutral-900/70 transition overflow-hidden relative border ${
            mobileMode ? "h-6 text-[8px]" : "h-10"
          } ${
            tab === "fx" ? "border-amber-500/35" : "border-transparent"
          }`}
        >
          <div className={`shrink-0 border-r border-neutral-850 px-2 flex items-center gap-1.5 font-mono font-bold text-zinc-300 z-10 bg-neutral-900/90 h-full ${
            mobileMode ? "w-14 text-[7px]" : "w-20 text-[10px]"
          }`}>
            <Zap size={mobileMode ? 9 : 11} className="text-amber-400 animate-pulse" />
            <span>EFFECTS</span>
          </div>

          <div className="flex-1 h-full relative flex items-center gap-1">
            {elements.filter(e => e.type === "sticker").map((stk, idx) => {
              const markerX = stk.x;
              return (
                <div
                  key={`stk-tag-${idx}`}
                  className="absolute w-2 h-2 rounded-full bg-amber-400 shadow z-25 border border-white"
                  style={{ left: `${markerX}%` }}
                  title={`Sticker stamp position: ${stk.value}`}
                />
              );
            })}

            {aiMarkers?.zoomMarkers?.map((zm, idx) => (
              <div
                key={`zoom-marker-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentTime(zm.time);
                }}
                className="absolute w-2 h-2 rounded bg-violet-500 border border-white/50 z-25 cursor-pointer hover:bg-violet-400"
                style={{ left: `${(zm.time / totalDuration) * 100}%` }}
                title={`AI Camera Zoom node details: ${zm.scale}x`}
              />
            ))}

            <div className={`absolute left-[15%] w-[70%] bg-amber-500/10 border border-dashed border-amber-500/30 rounded flex items-center px-2 font-mono text-amber-305 select-none ${
              mobileMode ? "inset-y-0.5 text-[6px]" : "inset-y-1.5 text-[8px]"
            }`}>
              LUT Presets
            </div>
          </div>
        </div>

      </div>

      {/* Axis ruler labels */}
      <div className={`flex justify-between text-[8px] font-mono text-zinc-500 select-none ${
        mobileMode ? "px-6 -mt-1" : "px-20"
      }`}>
        <span>0s</span>
        <span>2.5s</span>
        <span>5.0s</span>
        <span>7.5s</span>
        <span>10s</span>
        <span>12.5s</span>
        <span>15s</span>
      </div>

      {/* 3. TIME TRIM CONTROLS ZONE ADJUSTMENT INPUTS */}
      {!mobileMode && (
        <div className="bg-neutral-950 border border-neutral-850 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-mono select-none">
          <div className="flex items-center gap-2 text-zinc-400">
            <Clock size={13} className="text-amber-500" />
            <span>DRAG SLIDERS RANGE OVERRIDE:</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Start Trim Input slider */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">In:</span>
              <input
                id="trim-start-slider"
                type="range"
                min="0"
                max="7"
                step="0.1"
                value={trimStart}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val < trimEnd) {
                    setTrimStart(val);
                  }
                }}
                className="w-20 md:w-24 h-1 bg-neutral-800 roundedaccent-amber-500"
              />
              <span className="text-white font-bold">{trimStart.toFixed(1)}s</span>
            </div>

            {/* End Trim Input slider */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">Out:</span>
              <input
                id="trim-end-slider"
                type="range"
                min="8"
                max="15"
                step="0.1"
                value={trimEnd}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (val > trimStart) {
                    setTrimEnd(val);
                  }
                }}
                className="w-20 md:w-24 h-1 bg-neutral-800 roundedaccent-amber-500"
              />
              <span className="text-white font-bold">{trimEnd.toFixed(1)}s</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. ACTIVE SUBTITLE LIST WITH DIRECT INLINE EDITING */}
      {!mobileMode && (
        <div className="mt-1 bg-neutral-950/70 border border-neutral-850 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase block font-black">
              TIMELINE SCREENPLAY / EDIT CAPTIONS:
            </span>
            <button
              id="btn-add-subtitle"
              onClick={handleAddNewCaption}
              className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 transition text-[9px] font-mono font-bold text-white flex items-center gap-1 cursor-pointer shadow"
            >
              <span>+ Add Subtitle</span>
            </button>
          </div>
          
          {captions.length === 0 ? (
            <div className="text-[10px] text-zinc-500 font-mono text-center py-4 bg-neutral-900/40 rounded-lg border border-neutral-850 border-dashed">
              No subtitle tracks yet. Click <span className="text-purple-400 font-bold">+ Add Subtitle</span> upper right to start keyframing captions!
            </div>
          ) : (
            <div id="timeline-screenplay-list" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {captions.map((cap) => {
                const isEditing = editingCaptionId === cap.id;
                return (
                  <div 
                    key={cap.id} 
                    className={`p-2 rounded-lg border flex flex-col justify-between gap-1 transition ${
                      currentTime >= cap.start && currentTime <= cap.end 
                        ? "bg-purple-950/10 border-purple-500/40 shadow shadow-purple-950/20" 
                        : "bg-neutral-900/60 border-neutral-800"
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[9px] text-zinc-500">
                      <span className="font-bold text-zinc-400">Timestamp: {cap.start.toFixed(1)}s - {cap.end.toFixed(1)}s</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            if (isEditing) {
                              saveEditedCaption(cap.id);
                            } else {
                              startEditingCaptionText(cap);
                            }
                          }}
                          className={`text-[9px] font-bold uppercase transition flex items-center gap-0.5 cursor-pointer ${
                            isEditing ? "text-emerald-400 hover:text-emerald-300" : "text-amber-500 hover:text-amber-400"
                          }`}
                        >
                          {isEditing ? (
                            <>
                              <CheckCircle2 size={10} />
                              <span>Save</span>
                            </>
                          ) : (
                            <>
                              <Edit2 size={9} />
                              <span>Edit</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteCaption(cap.id)}
                          className="text-[10px] font-bold text-rose-500 hover:text-rose-450 transition px-1.5 cursor-pointer"
                          title="Delete subtitle block"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="flex gap-2.5 mt-1">
                        <input
                          id={`edit-sub-input-${cap.id}`}
                          type="text"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value.toUpperCase())}
                          className="bg-neutral-950 border border-neutral-800 text-xs text-purple-300 font-sans tracking-wide py-1 px-2.5 rounded flex-1 focus:outline-none focus:border-purple-500"
                          placeholder="SUBTITLE CAPTION TEXT"
                          maxLength={60}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEditedCaption(cap.id);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 mt-1">
                        <span 
                          onClick={() => setCurrentTime(cap.start)}
                          className="cursor-pointer text-[10px] text-zinc-300 hover:text-purple-400 transition hover:underline font-medium break-all text-left"
                        >
                          "{cap.text}"
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
