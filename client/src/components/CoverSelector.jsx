import React, { useState } from "react";
import { Image, Upload, Check, Sparkles } from "lucide-react";

export default function CoverSelector({
  videoUrl,
  duration,
  selectedCoverTime,
  setSelectedCoverTime,
  customCoverUrl,
  setCustomCoverUrl,
  onClose
}) {
  const [useCustomFile, setUseCustomFile] = useState(false);
  const [localPreview, setLocalPreview] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Set mock local URL
    const fileUrl = URL.createObjectURL(file);
    setLocalPreview(fileUrl);
    setCustomCoverUrl(fileUrl);
    setUseCustomFile(true);
  };

  const handleSelectPrebuilt = (url) => {
    setCustomCoverUrl(url);
    setUseCustomFile(true);
  };

  return (
    <div id="cover-selector-modal" className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#0d1222] border border-white/10 rounded-[28px] overflow-hidden p-5 space-y-4">
        {/* Title */}
        <div className="flex items-center gap-1.5 border-b border-white/5 pb-2.5">
          <Image className="w-5 h-5 text-orange-500" />
          <h2 className="text-sm font-extrabold text-white tracking-widest uppercase font-mono">
            Select Reel Cover Frame
          </h2>
        </div>

        {/* Dynamic Mock Frame Preview Box */}
        <div className="relative aspect-[9/16] w-[180px] mx-auto bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
          {useCustomFile ? (
            <img
              src={customCoverUrl}
              alt="Custom Cover"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="relative w-full h-full">
              {/* Vertical video reference container representing current selected cover time */}
              <img
                src="https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=420&auto=format&fit=crop&q=80"
                alt="Video frame picker representation"
                className="w-full h-full object-cover filter brightness-95"
              />
              <div className="absolute inset-0 bg-black/15" />
              <div className="absolute bottom-3 inset-x-2 text-center p-1 px-1.5 rounded bg-black/60 text-[9px] text-orange-400 font-mono">
                Frame at: {selectedCoverTime.toFixed(1)}s
              </div>
            </div>
          )}

          {/* Drifting watermarked badge preview on top of cover page */}
          <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/75 text-[8px] font-bold text-white font-mono uppercase tracking-wider scale-90 border border-white/5">
            <span>Onyx Drift</span>
          </div>
        </div>

        {/* SLIDER TO SCRUB FOR A VIDEO FRAME */}
        <div className="space-y-1 bg-black/30 p-3 rounded-2xl border border-white/5">
          <div className="flex items-center justify-between text-[10px] font-mono text-white/50 mb-1">
            <span>SCRUB FOOTAGE CLIPS:</span>
            <span className="text-orange-400 font-bold">{selectedCoverTime.toFixed(1)}s</span>
          </div>
          <input
            id="slider-cover-time"
            type="range"
            min="0"
            max={duration || 15}
            step="0.1"
            value={selectedCoverTime}
            onChange={(e) => {
              setSelectedCoverTime(parseFloat(e.target.value));
              setUseCustomFile(false);
            }}
            className="w-full h-1 accent-orange-500 bg-white/10 cursor-pointer"
          />
        </div>

        {/* ALTERNATIVE: UPLOAD OR MOCK CREATOR STYLES */}
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-white/50 block">ALTERNATIVE COVERS PRESETS:</span>

          <div className="flex items-center gap-2">
            <button
              id="preset-cover-tokyo"
              onClick={() => handleSelectPrebuilt("https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=150&auto=format&fit=crop&q=60")}
              className="w-10 h-10 rounded-lg overflow-hidden border border-white/5 hover:border-orange-500/50"
            >
              <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=80&auto=format&fit=crop&q=60" alt="Preset JDM cover" className="w-full h-full object-cover" />
            </button>
            <button
              id="preset-cover-night"
              onClick={() => handleSelectPrebuilt("https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=150&auto=format&fit=crop&q=60")}
              className="w-10 h-10 rounded-lg overflow-hidden border border-white/5 hover:border-orange-500/50"
            >
              <img src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=80&auto=format&fit=crop&q=60" alt="Preset night cover" className="w-full h-full object-cover" />
            </button>

            {/* Custom file uploader */}
            <label className="w-10 h-10 flex flex-col items-center justify-center rounded-lg border border-dashed border-white/20 hover:border-orange-500/50 bg-white/5 cursor-pointer text-white/60 hover:text-orange-400">
              <Upload className="w-4 h-4" />
              <input
                id="file-upload-cover"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 pt-2">
          <button
            id="btn-close-cover"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-bold bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            id="btn-confirm-cover"
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-1"
          >
            <Check className="w-4 h-4" />
            <span>Apply Cover</span>
          </button>
        </div>
      </div>
    </div>
  );
}
