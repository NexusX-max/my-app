import React from "react";
import { 
  Palette, 
  Check, 
  Sliders, 
  HelpCircle,
  Sparkles 
} from "lucide-react";

export default function FilterPanel({
  colorPreset,
  setColorPreset,
  COLOR_PRESETS = [],
  showToast
}) {
  const handleSelectPreset = (preset) => {
    setColorPreset(preset);
    showToast(`🎨 Color profile switched: "${preset.name}"!`);
  };

  return (
    <div id="filters-color-panel" className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-4 font-sans select-none">
      
      {/* Panel header */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2.5">
        <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
          <Palette size={14} />
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">LUT Color Grading Profiles</h3>
          <p className="text-[10px] text-zinc-500 font-mono">Select raw hardware-rendered LUT lookups</p>
        </div>
      </div>

      {/* Grid of presets */}
      <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto scrollbar-none">
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold mb-1">
          Cinematic Color Filters ({COLOR_PRESETS.length}):
        </span>

        <div className="grid grid-cols-2 gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = colorPreset && colorPreset.id === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-2 rounded-xl border cursor-pointer transition text-left flex flex-col gap-2 group relative overflow-hidden ${
                  isSelected
                    ? "bg-teal-950/20 border-teal-500 shadow-lg shadow-teal-950/10"
                    : "bg-neutral-950 border-neutral-850 hover:bg-neutral-900"
                }`}
              >
                {/* Visual Thumbnail Preview demonstrating the filter class */}
                <div className="relative w-full h-16 rounded-lg overflow-hidden bg-zinc-900 border border-white/5">
                  <img 
                    src="https://images.unsplash.com/photo-1611245801319-467475143301?w=260&auto=format&fit=crop&q=80" 
                    className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${preset.cssClass}`}
                    alt={preset.name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-1.5">
                    <span className="text-[9px] font-bold text-white tracking-wide uppercase font-mono truncate w-full">
                      {preset.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-teal-500 text-black flex items-center justify-center font-bold shadow z-10">
                      <Check size={9} strokeWidth={3.5} />
                    </div>
                  )}
                </div>

                {/* Filter description text */}
                <p className="text-[9px] text-zinc-400 font-sans leading-tight line-clamp-2 px-1">
                  {preset.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advice tip footer */}
      <div className="p-3 bg-neutral-950/60 border border-neutral-850 rounded-xl flex gap-2">
        <Sparkles size={13} className="text-teal-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-500 leading-normal font-sans">
          Color grading affects the active display matrix elements. Changing color profiles retains all active overlay watermarks with zero decay.
        </p>
      </div>

    </div>
  );
}
