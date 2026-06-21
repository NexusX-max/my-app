import React from "react";
import { 
  Music, 
  Volume2, 
  Check, 
  Disc, 
  Compass, 
  Flame, 
  Heart 
} from "lucide-react";

export default function MusicPanel({
  selectedTrack,
  setSelectedTrack,
  TRACK_LIST = [],
  videoVolume,
  setVideoVolume,
  showToast
}) {
  const handleSelectTrack = (track) => {
    setSelectedTrack(track);
    showToast(`🎵 Synchronized audio overlay: "${track.title}"!`);
  };

  return (
    <div id="music-layer-panel" className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-4 font-sans select-none">
      
      {/* Panel header */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2.5">
        <div className="p-1 px-2 rounded-lg bg-pink-500/10 text-pink-500">
          <Music size={15} />
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Audiotrack Sync Layers</h3>
          <p className="text-[10px] text-zinc-500 font-mono">BPM-synchronized drift soundtracks</p>
        </div>
      </div>

      {/* soundtrack volume leveler */}
      <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-850">
        <div className="flex justify-between items-center text-[10px] font-mono mb-1.5 text-zinc-400">
          <span className="flex items-center gap-1">
            <Volume2 size={12} className="text-pink-400" />
            <span>Master Deck Volume:</span>
          </span>
          <span className="text-pink-400 font-bold">{videoVolume}%</span>
        </div>
        <input
          id="music-volume-input"
          type="range"
          min="0"
          max="100"
          value={videoVolume}
          onChange={(e) => setVideoVolume(parseInt(e.target.value))}
          className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
        />
        <div className="flex justify-between text-[8px] font-mono text-zinc-600 mt-1">
          <span>0% Muted</span>
          <span>100% Boosted DB</span>
        </div>
      </div>

      {/* Track catalog */}
      <div className="flex flex-col gap-2 max-h-[170px] overflow-y-auto scrollbar-none">
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mb-1">
          Select Soundtrack:
        </span>

        {TRACK_LIST.map((track) => {
          const isSelected = selectedTrack && selectedTrack.id === track.id;
          return (
            <div
              key={track.id}
              onClick={() => handleSelectTrack(track)}
              className={`p-2.5 rounded-lg border cursor-pointer transition flex items-center justify-between gap-3 text-left group ${
                isSelected
                  ? "bg-pink-950/15 border-pink-500/50"
                  : "bg-neutral-950 hover:bg-neutral-900 border-neutral-850"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isSelected ? "bg-pink-500 text-black font-black animate-spin" : "bg-neutral-900 text-zinc-500 group-hover:bg-neutral-850 group-hover:text-pink-400"
                }`}>
                  <Disc size={13} />
                </div>
                
                <div className="min-w-0">
                  <h4 className="text-[11px] font-bold text-white truncate font-sans tracking-wide">
                    {track.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 mt-0.5">
                    <span className="bg-neutral-900 px-1 py-0.2 rounded text-zinc-400 text-[8px] uppercase">
                      {track.genre}
                    </span>
                    <span>• {track.bpm} BPM</span>
                    <span>• {track.duration}</span>
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-pink-500/20 border border-pink-500 flex items-center justify-center text-pink-400">
                    <Check size={11} />
                  </div>
                ) : (
                  <span className="text-[9px] font-mono text-zinc-600 font-bold group-hover:text-zinc-500">
                    {track.fileSize}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-850 flex gap-2">
        <Compass size={14} className="text-pink-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-500 leading-normal font-sans">
          Each soundtrack automatically parses on downstream compilation, syncing cinematic transitions and video speed levels with the selected BPM rhythms.
        </p>
      </div>

    </div>
  );
}
