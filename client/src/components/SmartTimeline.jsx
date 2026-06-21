import React, { useRef } from "react";
import { Film, Type, Music, Zap, Sliders } from "lucide-react";

export default function SmartTimeline({
  currentTime,
  setCurrentTime,
  setIsPlaying,
  colorPreset,
  activeEffects,
  selectedTrack,
  captions,
  elements,
  aiMarkers,
  tab,
  setTab
}) {
  const timelineRef = useRef(null);
  const totalDuration = 15.0; // Fixed 15-second loop

  // Clicking on timeline to scrub the playhead
  const handleTimelineClick = (e) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.min(Math.max(clickX / rect.width, 0), 1);
    const newTime = percentage * totalDuration;
    setCurrentTime(newTime);
  };

  const handleTimelineScrub = (e) => {
    if (e.buttons !== 1) return; // Only scrub if mouse held down
    handleTimelineClick(e);
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 w-full flex flex-col gap-3 font-sans shadow-lg select-none">
      {/* Wave timeline headers */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
        <span className="flex items-center gap-1.5 text-zinc-300 font-bold">
          <Sliders size={12} className="text-amber-500" />
          <span>SMART MULTI-LAYER TIMELINE</span>
        </span>
        <div className="flex gap-2">
          <span className="bg-zinc-800 px-2 py-0.5 rounded text-white text-[10px]">
            {currentTime.toFixed(2)}s
          </span>
          <span className="text-zinc-500 text-[10px]">/ 15s Max Reel</span>
        </div>
      </div>

      {/* Visual Timeline Channels Grid */}
      <div className="relative flex flex-col gap-2 bg-neutral-950 p-2.5 rounded-lg border border-neutral-800/80">
        
        {/* Playhead Marker Overlay Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-rose-500 border-l border-white shadow-[0_0_8px_rgba(239,68,68,0.8)] z-30 pointer-events-none transition-all duration-75"
          style={{ left: `${(currentTime / totalDuration) * 100}%` }}
        >
          <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-rose-500 rotate-45 border border-white rounded shadow-sm flex items-center justify-center">
            <span className="block w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        </div>

        {/* Dynamic Scrubbing overlay surface */}
        <div
          ref={timelineRef}
          onClick={handleTimelineClick}
          onMouseMove={handleTimelineScrub}
          className="absolute inset-0 bg-transparent z-25 cursor-ew-resize"
        />

        {/* 1. VIDEO LAYER LANE */}
        <div 
          onClick={() => setTab("trim")}
          className={`flex items-center h-11 rounded bg-neutral-900/60 transition hover:bg-neutral-900 overflow-hidden relative border ${
            tab === "trim" ? "border-amber-500/50" : "border-transparent"
          }`}
        >
          <div className="w-[85px] shrink-0 border-r border-neutral-800/80 px-2.5 flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 select-none z-10 bg-neutral-900/90 h-full">
            <Film size={10} className="text-blue-500" />
            <span className="font-bold text-white">VIDEO</span>
          </div>

          {/* Sliced clips thumbnails visualization inside timeline */}
          <div className="flex-1 h-full flex relative">
            <div className="absolute inset-y-0.5 left-[5%] w-[30%] bg-zinc-800/80 border border-zinc-700/60 rounded flex items-center px-2 text-[9px] text-zinc-400">
              🏎️ Intro startup loop
            </div>
            <div className="absolute inset-y-0.5 left-[38%] w-[25%] bg-zinc-800/80 border border-zinc-700/60 rounded flex items-center px-2 text-[9px] text-zinc-400">
              🔥 Speed shift
            </div>
            <div className="absolute inset-y-0.5 left-[65%] w-[32%] bg-rose-950/20 border border-rose-500/30 rounded flex items-center px-2 text-[9px] text-zinc-300">
              ⚡ Tires-smoke skid drift
            </div>

            {/* AI Beat Cuts Visual Marker lines */}
            {aiMarkers && aiMarkers.beatSyncMarkers && aiMarkers.beatSyncMarkers.map((marker, idx) => (
              <div
                key={`beat-cut-${idx}`}
                className="absolute inset-y-0 w-0.5 bg-blue-500/80 z-10 border-l border-blue-400/50"
                style={{ left: `${(marker / totalDuration) * 100}%` }}
                title="AI Synced Beat Cut"
              />
            ))}
          </div>
        </div>

        {/* 2. TEXT/CAPTIONS LAYER LANE */}
        <div 
          onClick={() => setTab("text")}
          className={`flex items-center h-10 rounded bg-neutral-900/60 transition hover:bg-neutral-900 overflow-hidden relative border ${
            tab === "text" ? "border-amber-500/50" : "border-transparent"
          }`}
        >
          <div className="w-[85px] shrink-0 border-r border-neutral-800/80 px-2.5 flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 select-none z-10 bg-neutral-900/90 h-full">
            <Type size={11} className="text-green-500" />
            <span className="font-bold text-white">TEXT</span>
          </div>

          {/* Interactive display of active caption slices */}
          <div className="flex-1 h-full flex relative">
            {captions.map((cap) => {
              const startPct = (cap.start / totalDuration) * 100;
              const endPct = (cap.end / totalDuration) * 100;
              const widthPct = endPct - startPct;
              return (
                <div
                  key={cap.id}
                  className="absolute inset-y-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 rounded px-1.5 flex items-center justify-between text-[8px] font-mono text-green-300 overflow-hidden"
                  style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                >
                  <span className="truncate">{cap.text}</span>
                </div>
              );
            })}

            {elements.filter(e => e.type === "text").map((item, idx) => (
              <div
                key={`overlay-text-${idx}`}
                className="absolute w-[4px] h-full bg-amber-400"
                style={{ left: `${item.x}%` }}
                title={`Draggable Text Overlay: "${item.value}"`}
              />
            ))}
          </div>
        </div>

        {/* 3. MUSIC/AUDIO WAVE LAYER LANE */}
        <div 
          onClick={() => setTab("music")}
          className={`flex items-center h-11 rounded bg-neutral-900/60 transition hover:bg-neutral-900 overflow-hidden relative border ${
            tab === "music" ? "border-amber-500/50" : "border-transparent"
          }`}
        >
          <div className="w-[85px] shrink-0 border-r border-neutral-800/80 px-2.5 flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 select-none z-10 bg-neutral-900/90 h-full">
            <Music size={11} className="text-pink-500" />
            <span className="font-bold text-white">MUSIC</span>
          </div>

          {/* Sync high-fidelity audio waveform */}
          <div className="flex-1 h-full relative flex items-center bg-zinc-950/40 px-2 overflow-hidden">
            <div className="w-full flex items-end gap-0.5 h-6 opacity-60">
              {(selectedTrack ? selectedTrack.waveformPoints : [20, 40, 10, 60, 80, 50, 20, 70, 90, 40, 60, 20]).map((h, i) => (
                <div
                  key={`wf-point-${i}`}
                  className="bg-pink-500 rounded-sm"
                  style={{
                    height: `${Math.min(h, 100)}%`,
                    width: "4px"
                  }}
                />
              ))}
            </div>

            {/* active segment background highlight */}
            <div className="absolute inset-y-0.5 left-0 right-12 bg-pink-500/15 border border-pink-500/30 rounded flex items-center justify-between px-3 text-[9px] font-mono text-pink-400">
              <span>🎧 {selectedTrack ? selectedTrack.title : "drift_phonk_bass.mp3"}</span>
              <span className="text-[8px] opacity-80">{selectedTrack ? selectedTrack.bpm : 140} BPM</span>
            </div>
          </div>
        </div>

        {/* 4. FX/FILTERS LAYER LANE */}
        <div 
          onClick={() => setTab("fx")}
          className={`flex items-center h-10 rounded bg-neutral-900/60 transition hover:bg-neutral-900 overflow-hidden relative border ${
            tab === "fx" ? "border-amber-500/50" : "border-transparent"
          }`}
        >
          <div className="w-[85px] shrink-0 border-r border-neutral-800/80 px-2.5 flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 select-none z-10 bg-neutral-900/90 h-full">
            <Zap size={11} className="text-amber-500 animate-pulse" />
            <span className="font-bold text-white">FX</span>
          </div>

          {/* Graphic marker bars for active live effects (Camera shake, Blurs, Night LUTs) */}
          <div className="flex-1 h-full relative">
            {activeEffects.map((fx, idx) => {
              // Distribute FX visuals elegantly across timeline lanes
              const verticalOffset = idx * 6;
              return (
                <div
                  key={`tx-fx-${idx}`}
                  className="absolute inset-y-1 bg-amber-500/30 hover:bg-amber-500/40 border border-amber-500/40 rounded px-1.5 flex items-center text-[8px] font-mono text-amber-200"
                  style={{
                    left: `${idx * 15}%`,
                    width: `${40 + (idx * 15)}%`,
                    top: `${verticalOffset + 2}px`,
                    height: "12px"
                  }}
                >
                  ✨ {fx.replace("effect-", "")} preset
                </div>
              );
            })}

            {/* If AI zoom triggers exist, render mini zoom markers */}
            {aiMarkers && aiMarkers.zoomMarkers && aiMarkers.zoomMarkers.map((m, idx) => (
              <div
                key={`zoom-flag-${idx}`}
                className="absolute inset-y-1.5 w-2 h-2 rounded-full bg-violet-500 animate-pulse border border-white/20"
                style={{ left: `${(m.time / totalDuration) * 100}%` }}
                title={`AI Zoom Factor: ${m.scale}x`}
              />
            ))}
          </div>
        </div>

      </div>

      {/* Axis Marker Ruler Indicators (0s, 3s, 6s, 9s, 12s, 15s) */}
      <div className="flex justify-between px-[90px] text-[9px] font-mono text-zinc-500 select-none">
        <span>0.00s</span>
        <span>3.00s</span>
        <span>6.00s</span>
        <span>9.00s</span>
        <span>12.00s</span>
        <span>15.00s</span>
      </div>
    </div>
  );
}
