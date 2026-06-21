import React from "react";
import { 
  Undo2, 
  Redo2, 
  Share2, 
  Cpu, 
  RefreshCw, 
  Sparkles,
  Layers 
} from "lucide-react";

export default function EditorHeader({
  projectName,
  setProjectName,
  historyCount,
  redoCount,
  handleUndo,
  handleRedo,
  onExportClick,
  isAiGenerating,
  generateAiEditsFromPrompt,
  aiPrompt,
  setAiPrompt
}) {
  return (
    <header id="editor-header" className="w-full bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3 z-30 shrink-0">
      
      {/* Brand logo & Name */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white font-black shadow-lg shadow-red-900/30">
            <Cpu size={16} className="animate-pulse" />
          </div>
          <div>
            <span className="font-display font-black tracking-wider text-sm text-white uppercase block">
              ONYX DRIFT <span className="text-amber-500">PRO</span>
            </span>
            <span className="text-[9px] font-mono font-bold text-zinc-500 -mt-1 block uppercase tracking-widest">
              AI-Augmented Cinematic Suite
            </span>
          </div>
        </div>

        {/* Project editable input */}
        <div className="flex items-center gap-1 bg-neutral-950 border border-neutral-800 rounded px-2 py-1 ml-2">
          <input
            id="project-name-input"
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent border-none text-[11px] text-zinc-300 font-mono focus:outline-none w-28 md:w-36 font-semibold"
            placeholder="Unnamed Reel"
          />
        </div>
      </div>

      {/* AI Assistant Command Quick Bar (Desktop View Only) */}
      <div className="hidden lg:flex flex-1 max-w-lg mx-6 bg-neutral-950 border border-neutral-800 rounded-full p-1 items-center gap-2">
        <div className="flex items-center gap-1.5 pl-3">
          <Sparkles size={12} className="text-amber-400" />
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">AI-Assist:</span>
        </div>
        <input
          id="header-ai-input"
          type="text"
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          placeholder="type edits prompt (e.g. make this look highly cinematic with neon blues)..."
          className="bg-transparent border-none text-[11px] text-zinc-200 font-sans focus:outline-none flex-1 placeholder:text-zinc-600"
          onKeyDown={(e) => {
            if (e.key === "Enter") generateAiEditsFromPrompt();
          }}
        />
        <button
          onClick={generateAiEditsFromPrompt}
          disabled={isAiGenerating || !aiPrompt.trim()}
          className="bg-gradient-to-r from-red-600 to-amber-600 disabled:from-zinc-800 disabled:to-zinc-800 hover:from-red-500 hover:to-amber-500 text-white font-mono font-black uppercase text-[9px] px-3 py-1.5 rounded-full transition-all active:scale-95 disabled:pointer-events-none flex items-center gap-1 shrink-0"
        >
          {isAiGenerating ? (
            <>
              <RefreshCw size={9} className="animate-spin" />
              <span>Sinking...</span>
            </>
          ) : (
            <>
              <span>Compile AI</span>
            </>
          )}
        </button>
      </div>

      {/* History controls & Action Buttons */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* Undo / Redo group */}
        <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5 shadow-inner">
          <button
            id="undo-btn"
            onClick={handleUndo}
            disabled={historyCount === 0}
            className={`p-1.5 rounded hover:bg-neutral-900 transition disabled:opacity-30 disabled:pointer-events-none relative group`}
            title="Undo"
          >
            <Undo2 size={13} className="text-zinc-200" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-650 text-white font-mono text-[7px] w-3 h-3 rounded-full flex items-center justify-center font-bold">
                {historyCount}
              </span>
            )}
          </button>
          
          <div className="w-[1px] h-4 bg-neutral-800 mx-1" />

          <button
            id="redo-btn"
            onClick={handleRedo}
            disabled={redoCount === 0}
            className={`p-1.5 rounded hover:bg-neutral-900 transition disabled:opacity-30 disabled:pointer-events-none relative group`}
            title="Redo"
          >
            <Redo2 size={13} className="text-zinc-200" />
            {redoCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-black font-mono text-[7px] w-3 h-3 rounded-full flex items-center justify-center font-bold">
                {redoCount}
              </span>
            )}
          </button>
        </div>

        {/* Live sync indicators */}
        <div className="hidden sm:flex items-center gap-1 bg-neutral-950 border border-emerald-950 text-emerald-400 font-mono text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span>PILOT READY</span>
        </div>

        {/* Glowing Export Button */}
        <button
          id="export-trigger-btn"
          onClick={onExportClick}
          className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-mono font-black uppercase text-xs px-3.5 py-1.5 rounded-lg transition-all transform active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.35)] flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Share2 size={13} />
          <span>Export Reel</span>
        </button>
      </div>

    </header>
  );
}
