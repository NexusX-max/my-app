import React, { useEffect, useState } from "react";
import { Download, CheckCircle, RefreshCw, X, ShieldCheck } from "lucide-react";

export default function ExportModal({
  exportData,
  onClose
}) {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  // Smoothly increment compile progress to mimic real remote rendering cycles
  useEffect(() => {
    if (progress >= 100) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8 + 5);
        return next >= 100 ? 100 : next;
      });
    }, 250);

    return () => clearInterval(timer);
  }, [progress]);

  // Stagger render log lines
  useEffect(() => {
    if (logIndex >= (exportData?.logs?.length || 0)) return;

    const timer = setInterval(() => {
      setLogIndex((prev) => prev + 1);
    }, 450);

    return () => clearInterval(timer);
  }, [logIndex, exportData]);

  const activeLogs = exportData?.logs?.slice(0, logIndex + 1) || [];

  return (
    <div id="export-modal-root" className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#0e1424] border border-white/10 rounded-[30px] p-6 space-y-5 select-none relative shadow-2xl">
        <button
          id="btn-close-export-x"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {progress < 100 ? (
          /* LOADING RENDER CYCLE */
          <div className="space-y-4 text-center py-6">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-amber-500 animate-spin" />
              <span className="text-xs font-bold font-mono text-orange-400">{progress}%</span>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono">
                Compiling Onyx Drift Frame buffers...
              </h3>
              <p className="text-[10px] text-white/40">
                Splicing audio waves, decals, and custom camera shakers
              </p>
            </div>

            {/* STAGGERED LOG CONSOLE */}
            <div className="w-full h-[100px] text-left p-3 rounded-xl bg-black/60 border border-white/5 font-mono text-[9px] text-emerald-400 overflow-y-auto space-y-1 scrollbar-thin">
              {activeLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-1">
                  <span className="text-amber-500/80 shrink-0">▸</span>
                  <span className="leading-normal">{log}</span>
                </div>
              ))}
              <div className="w-1.5 h-3 bg-emerald-400 animate-pulse inline-block" />
            </div>
          </div>
        ) : (
          /* COMPILATION COMPLETED */
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono">
                RENDER COMPLETE!
              </h3>
              <p className="text-[10px] text-emerald-400 font-mono font-semibold">
                Export ID: {exportData.exportId || "REEL-9132"}
              </p>
            </div>

            {/* Success specifications card */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-left text-xs text-white/70 space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-white font-bold">{(exportData?.duration || 15.4).toFixed(1)}s</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Size:</span>
                <span className="text-white font-bold">{exportData?.fileSizeMb || "13.2"} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Codec Profile:</span>
                <span className="text-emerald-400 font-bold">AAC / High H.264</span>
              </div>
            </div>

            {/* Download and Done Actions */}
            <div className="space-y-2 pt-2">
              <a
                id="btn-download-export"
                href={exportData?.url || "#"}
                download="Onyx_Drift_Reel.mp4"
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Reel File (MP4)</span>
              </a>

              <button
                id="btn-done-export"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white font-bold text-[11px] font-mono uppercase tracking-wider transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
