import React from "react";
import { 
  Zap, 
  Sparkles, 
  RotateCcw, 
  Sliders, 
  EyeOff, 
  Tv, 
  Gauge 
} from "lucide-react";

export default function EffectsPanel({
  activeEffects = [],
  toggleEffectType,
  EFFECTS = [],
  showToast
}) {
  const handleToggle = (item) => {
    toggleEffectType(item.effectValue);
  };

  return (
    <div id="effects-fx-panel" className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-4 font-sans select-none">
      
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2.5">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
          <Zap size={14} className="animate-pulse" />
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Camera Motion FX</h3>
          <p className="text-[10px] text-zinc-500 font-mono">Simulate high-velocity racing optics</p>
        </div>
      </div>

      {/* Grid selector */}
      <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto scrollbar-none">
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
          Toggle FX Layers:
        </span>

        <div className="grid grid-cols-1 gap-2">
          {EFFECTS.map((fx) => {
            const isActive = activeEffects.includes(fx.effectValue);
            return (
              <div
                key={fx.id}
                onClick={() => handleToggle(fx)}
                className={`p-3 rounded-xl border cursor-pointer transition text-left flex items-start gap-3 group relative ${
                  isActive
                    ? "bg-amber-950/20 border-amber-500"
                    : "bg-neutral-950 border-neutral-850 hover:bg-neutral-900"
                }`}
              >
                {/* Active Indicator Tag */}
                {isActive && (
                  <span className="absolute top-2.5 right-2.5 bg-amber-500 text-black text-[7px] font-mono font-black uppercase px-1.5 py-0.5 rounded tracking-wide animate-pulse">
                    ACTIVE
                  </span>
                )}

                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isActive ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "bg-neutral-900 text-zinc-400 group-hover:bg-neutral-800 group-hover:text-amber-400"
                }`}>
                  <Tv size={14} />
                </div>

                <div className="min-w-0 pr-10">
                  <h4 className="text-[11px] font-bold text-white tracking-wide uppercase font-mono group-hover:text-amber-400 transition-colors">
                    {fx.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-sans leading-relaxed mt-0.5">
                    {fx.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer advice */}
      <div className="p-3 bg-neutral-950/60 border border-neutral-850 rounded-xl flex gap-2">
        <Gauge size={13} className="text-amber-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-500 leading-normal font-sans">
          Turn on "Strobe Flash" or "Camera Shake" to force automatic downbeat simulation synced seamlessly with the audio waves track peaks!
        </p>
      </div>

    </div>
  );
}
