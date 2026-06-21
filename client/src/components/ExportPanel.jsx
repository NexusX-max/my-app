import React, { useState } from "react";
import { 
  X, 
  Download, 
  CheckCircle, 
  Info, 
  Settings, 
  Video, 
  Sparkles, 
  TrendingUp, 
  Gauge 
} from "lucide-react";

export default function ExportPanel({
  isOpen,
  onClose,
  colorPreset,
  activeEffects = [],
  selectedTrack,
  elements = [],
  showToast
}) {
  const [exportProgress, setExportProgress] = useState(0);
  const [isCompiling, setIsCompiling] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  
  const [exportConfig, setExportConfig] = useState({
    resolution: "1080x1920",
    fps: "60 FPS",
    quality: "Ultra"
  });

  if (!isOpen) return null;

  // Simulate server-side high-velocity rendering
  const handleStartSimulatedExport = () => {
    setIsCompiling(true);
    setExportProgress(0);
    setExportComplete(false);

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setExportComplete(true);
          setIsCompiling(false);
          showToast("🎉 MP4 Reel rendered successfully!");
          return 100;
        }
        return prev + 10;
      });
    }, 280);
  };

  const getLogMessage = () => {
    if (exportProgress < 20) return "Analyzing video raw telemetry bounds...";
    if (exportProgress < 40) return `Baking Color preset "${colorPreset?.name || "None"}" LUT layers...`;
    if (exportProgress < 60) return `Blending audio beat drops matching "${selectedTrack?.title || "No track"}"...`;
    if (exportProgress < 85) return `Compressing dynamic elements stamp overlays (${elements.length} active)...`;
    return "Optimizing container streams for Reels cache...";
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div 
        id="export-panel-modal"
        className="bg-neutral-900 border-2 border-neutral-800 rounded-2xl w-full max-w-md p-6 overflow-hidden relative shadow-2xl font-mono text-left"
      >
        
        {/* Top absolute manual close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer hover:bg-neutral-800 p-1.5 rounded-lg transition"
          title="Dismiss dialog"
        >
          <X size={16} />
        </button>

        {/* Panel Header */}
        <div className="flex items-center gap-3 mb-4 select-none">
          <div className="bg-gradient-to-r from-red-650 to-amber-500 p-2 rounded-xl text-white shadow-lg shadow-red-950/25">
            <Download size={18} />
          </div>
          <div>
            <h3 className="text-base font-black tracking-wide uppercase font-mono text-white">REEL OUTPUT COMPILER</h3>
            <p className="text-[10px] text-zinc-400 font-mono -mt-0.5">Prepare optimized clips for TikTok & Shorts</p>
          </div>
        </div>

        <hr className="border-neutral-800 mb-4" />

        {/* Dynamic Display state */}
        {!isCompiling && !exportComplete ? (
          <div className="flex flex-col gap-4">
            
            {/* Setting resolution */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Aspect Ratio Resolution:</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "1080x1920", label: "1080p Reels" },
                  { value: "2K", label: "QHD Cinema" },
                  { value: "4K", label: "UHD Ultra" }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setExportConfig({ ...exportConfig, resolution: item.value })}
                    className={`py-2 px-1 text-center rounded border font-sans font-bold text-[10px] sm:text-xs transition cursor-pointer ${
                      exportConfig.resolution === item.value
                        ? "bg-amber-650/20 text-amber-400 border-amber-500"
                        : "bg-neutral-950 border-neutral-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame pacing speed */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Frame Pacing Frequency:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "30 FPS", label: "30 FPS Standard" },
                  { value: "60 FPS", label: "60 FPS Drift Flow" }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setExportConfig({ ...exportConfig, fps: item.value })}
                    className={`py-2 px-1 text-center rounded border font-sans font-bold text-[10px] sm:text-xs transition cursor-pointer ${
                      exportConfig.fps === item.value
                        ? "bg-amber-650/20 text-amber-400 border-amber-500"
                        : "bg-neutral-950 border-neutral-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Compressor Quality profile */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Compression bitrate quality:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "High", label: "High Bitrate (8mb)" },
                  { value: "Ultra", label: "Raw Ultra ( lossless)" }
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setExportConfig({ ...exportConfig, quality: item.value })}
                    className={`py-2 px-1 text-center rounded border font-sans font-bold text-[10px] sm:text-xs transition cursor-pointer ${
                      exportConfig.quality === item.value
                        ? "bg-amber-650/20 text-amber-400 border-amber-500"
                        : "bg-neutral-950 border-neutral-800 text-zinc-500 hover:border-zinc-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Explanatory Warning info bar */}
            <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-850 flex gap-2">
              <Info size={14} className="text-amber-500 shrink-0 mt-0.5 animate-pulse" />
              <p className="text-[10px] text-zinc-400 leading-normal font-sans">
                Compilation merges chosen shaders, aspect crops, audio tracks, and coordinates. This runs off hardware GPU acceleration inside local cache structures.
              </p>
            </div>

            {/* Compile Actions Button trigger */}
            <button
              onClick={handleStartSimulatedExport}
              className="w-full bg-gradient-to-r from-red-650 via-rose-600 to-amber-500 text-white font-mono font-black uppercase text-xs tracking-wider py-3 rounded-xl transition hover:scale-[1.01] active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.25)] cursor-pointer text-center select-none"
            >
              Merge & Export MP4 Video file
            </button>

          </div>
        ) : isCompiling ? (
          
          /* Compilation loading bars state */
          <div className="flex flex-col gap-4 font-mono py-4 select-none">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-200">
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin inline-block"></span>
                <span className="text-white">Active Renderer Busy...</span>
              </span>
              <span className="text-amber-400 font-black">{exportProgress}%</span>
            </div>

            <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800/60 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-red-650 via-rose-500 to-amber-400 rounded-full transition-all duration-300"
                style={{ width: `${exportProgress}%` }}
              />
            </div>

            {/* Active logs update line feedback for high realism */}
            <div className="bg-neutral-950 border border-neutral-850 p-2.5 rounded-lg text-center">
              <span className="text-[9px] text-amber-500 font-bold block animate-pulse uppercase tracking-wider">
                Current Status Log:
              </span>
              <span className="text-[9px] text-zinc-400 font-sans mt-0.5 block italic leading-normal">
                {getLogMessage()}
              </span>
            </div>
            
            <p className="text-[9px] text-zinc-500 text-center uppercase tracking-widest font-black leading-tight">
              Merging: {activeEffects.length} active motion layers • 60 FPS target
            </p>
          </div>

        ) : (
          
          /* Success rendered screen */
          <div className="flex flex-col items-center gap-4 text-center py-4 font-mono select-none">
            <div className="w-14 h-14 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center animate-bounce shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle className="text-emerald-400" size={28} />
            </div>

            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider font-mono">REEL EXPORT COMPLETE!</h4>
              <p className="text-[10px] text-zinc-400 font-sans tracking-wide mt-0.5">Compiled successfully in local browser cache.</p>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-850 w-full text-xs text-left text-zinc-300 flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 uppercase">Target Ratio:</span>
                <span className="font-bold text-white">{exportConfig.resolution} MP4</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 uppercase">Selected LUT:</span>
                <span className="font-bold text-teal-400">{colorPreset ? colorPreset.name : "None style"}</span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 uppercase">Audio Sync:</span>
                <span className="font-bold text-pink-400 truncate max-w-[150px]">
                  {selectedTrack ? selectedTrack.title : "drift_phonk_bass.mp3"}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-zinc-500 uppercase">Telemetry Size:</span>
                <span className="font-black text-amber-500 bg-neutral-900 border border-neutral-850 px-1.5 py-0.5 rounded">~ 8.12 MB</span>
              </div>
            </div>

            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => {
                  onClose();
                  showToast("📥 Exported item successfully downloaded to local cache!");
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black py-2 rounded-lg text-xs uppercase cursor-pointer text-center select-none"
              >
                Download MP4 file
              </button>
              <button
                onClick={() => {
                  setExportComplete(false);
                  setExportProgress(0);
                }}
                className="px-3 py-2 bg-neutral-950 hover:bg-neutral-900 border border-neutral-850 rounded-lg text-[10px] text-zinc-400 font-bold uppercase cursor-pointer"
              >
                Re-adjust
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
