import React from "react";
import { 
  Type, 
  Smile, 
  Plus, 
  Sparkles, 
  PenTool, 
  Flame, 
  Tag, 
  Image 
} from "lucide-react";

export default function TextPanel({
  newTextValue,
  setNewTextValue,
  newTextStyle,
  setNewTextStyle,
  handleAddNewTextOverlay,
  STICKERS = [],
  addDriftSticker,
  showToast
}) {
  const stylesCatalog = [
    { id: "Neon", name: "Cyber Neon Pink", preview: "text-rose-400 font-sans tracking-wide drop-shadow-[0_0_5px_rgba(244,63,94,0.85)] font-bold mb-1" },
    { id: "Classic", name: "Serif Classic Low", preview: "font-serif text-white tracking-normal lowercase italic mb-1" },
    { id: "Bold", name: "Impact Speed Amber", preview: "font-black text-amber-500 font-mono tracking-tighter mb-1" },
    { id: "Cyber", name: "Electric Terminal Green", preview: "font-mono text-[#22c55e] border-b border-green-500 tracking-widest mb-1" },
    { id: "3D", name: "Stereo 3D Offset Purple", preview: "text-semibold text-violet-500 [text-shadow:_1px_1px_0_#fff,_2px_2px_0_#9333ea] mb-1" }
  ];

  const triggerAddText = () => {
    if (!newTextValue.trim()) {
      showToast("❌ Enter text content before insertion!");
      return;
    }
    handleAddNewTextOverlay();
  };

  return (
    <div id="text-layer-panel" className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col gap-4 font-sans select-none">
      
      {/* 1. TYPOGRAPHY PANEL LOGO */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2.5">
        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
          <Type size={14} />
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">Watermark & Graphics</h3>
          <p className="text-[10px] text-zinc-500 font-mono">Overlay customized labels inside video</p>
        </div>
      </div>

      {/* 2. DYNAMIC INPUT TOOL CONTAINER */}
      <div className="flex flex-col gap-2.5 bg-neutral-950 p-3 rounded-xl border border-neutral-850">
        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">
          Step A: Write Word Overlay
        </span>
        
        <div className="flex gap-1.5">
          <input
            id="overlay-word-input"
            type="text"
            value={newTextValue}
            onChange={(e) => setNewTextValue(e.target.value)}
            placeholder="e.g. DRIFT PRO 2026"
            className="flex-1 bg-neutral-900 text-xs text-white border border-neutral-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-purple-500 font-mono"
            maxLength={35}
            onKeyDown={(e) => {
              if (e.key === "Enter") triggerAddText();
            }}
          />
          <button
            onClick={triggerAddText}
            className="bg-purple-650 hover:bg-purple-500 text-white p-1.5 px-3 rounded text-xs font-mono font-black transition flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <Plus size={13} />
            <span>ADD</span>
          </button>
        </div>

        {/* Font Style Picker selector list */}
        <div className="mt-2 text-left">
          <span className="text-[8px] font-mono text-zinc-650 uppercase tracking-widest block mb-1.5 font-bold">
            Step B: Choose Style Factor
          </span>
          <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto scrollbar-none">
            {stylesCatalog.map((st) => (
              <label
                key={st.id}
                onClick={() => setNewTextStyle(st.id)}
                className={`p-2 rounded border flex items-center justify-between text-left cursor-pointer transition ${
                  newTextStyle === st.id
                    ? "bg-purple-950/25 border-purple-500/70"
                    : "bg-neutral-900/60 border-neutral-850 hover:bg-neutral-900"
                }`}
              >
                <div className="flex flex-col">
                  <span className={`${st.preview} text-xs tracking-wide`}>
                    {newTextValue || "ONYX TOKYO"}
                  </span>
                  <span className="text-[8px] font-mono text-zinc-500 -mt-0.5">{st.name}</span>
                </div>
                
                <input
                  id={`styled-preset-radio-${st.id}`}
                  type="radio"
                  name="text-preset-style"
                  checked={newTextStyle === st.id}
                  readOnly
                  className="accent-purple-500"
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 3. drift BADGES / STICKERS / PHOTO LABELS */}
      <div className="flex flex-col gap-2">
        <span className="text-[9px] font-mono text-pink-400 font-bold uppercase tracking-widest block mb-1">
          🏎️ Insert Pro Badges & Graphic Stamps:
        </span>

        {/* Grid group */}
        <div className="grid grid-cols-2 gap-1.5 max-h-[180px] overflow-y-auto scrollbar-none bg-neutral-950 p-2 rounded-xl border border-neutral-850">
          
          {/* Loop text, sticker icons, and picture badges */}
          {STICKERS.map((stk) => {
            const isImage = stk.type === "image";
            return (
              <button
                key={stk.id}
                onClick={() => {
                  if (stk.type === "image") {
                    addDriftSticker({
                      value: stk.id,
                      iconUrl: stk.value,
                      styleClass: "",
                      isImage: true
                    });
                  } else {
                    addDriftSticker({
                      value: stk.value,
                      styleClass: stk.style,
                      isImage: false
                    });
                  }
                }}
                className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-left transition flex items-center gap-2 group cursor-pointer"
              >
                {isImage ? (
                  <>
                    <div className="w-8 h-8 rounded overflow-hidden border border-neutral-700 bg-neutral-950/80 shrink-0">
                      <img 
                        src={stk.value} 
                        alt="Badge Preview" 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[8px] font-mono font-bold text-zinc-300 truncate tracking-tight">{stk.label}</span>
                  </>
                ) : (
                  <div className="truncate w-full text-center">
                    {stk.type === "emoji" ? (
                      <span className="text-xl inline-block group-hover:scale-125 transition duration-300 select-none">
                        {stk.value}
                      </span>
                    ) : (
                      <span className="bg-neutral-950 text-[8px] font-mono font-black text-rose-400 px-1 py-0.5 rounded border border-rose-500/25 tracking-tighter uppercase whitespace-nowrap block max-w-full truncate">
                        {stk.value}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}

        </div>
      </div>

    </div>
  );
}
