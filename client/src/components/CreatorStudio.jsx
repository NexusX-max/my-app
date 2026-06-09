import React, { useState } from "react";
import { Folder, Users, Shield, BookOpen, Layers, Check, Database, RefreshCw, Plus } from "lucide-react";

export default function CreatorStudio() {
  const [brandColors, setBrandColors] = useState(["#3b82f6", "#10b981", "#ef4444"]);
  const [activeWorkspace, setActiveWorkspace] = useState("Naeem's Studio");
  
  const drafts = [
    { name: "My_AI_Gaming_Highlight.reels", updated: "2 mins ago", size: "12 MB" },
    { name: "Cinematic_Fitness_Autopilot.shorts", updated: "3 hours ago", size: "4.5 MB" },
    { name: "Business_Tricks_WordCaptions.reels", updated: "Yesterday", size: "45.1 MB" }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 pb-12" id="creator-studio-container">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Enterprise Control Centre
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2 mt-1">
          <Database className="text-indigo-400" size={24} />
          Creator Studio
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage local draft backups, cloud workspace file sync status, brand-kit coloring, and invite team members to collaborate on editing boards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Drafts & Cloud synchronization */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                <Folder className="text-indigo-400" size={14} /> Team & Local Workspaces
              </h3>
              <button className="text-[10px] uppercase font-black tracking-wider text-indigo-400 flex items-center gap-1">
                <RefreshCw size={11} className="animate-spin" /> Cloud synced
              </button>
            </div>

            <div className="space-y-2.5">
              {drafts.map((draft) => (
                <div key={draft.name} className="p-3.5 bg-zinc-900/40 border border-zinc-855 rounded-2xl hover:border-zinc-800 transition-colors flex items-center justify-between">
                  <div>
                    <h4 className="text-xs text-zinc-250 font-bold">{draft.name}</h4>
                    <p className="text-[9px] font-mono text-zinc-500 tracking-wider">Storage Lock: Local Persistent IndexedDB | {draft.size}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono italic">{draft.updated}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2 border-b border-zinc-900 pb-2">
              <Users className="text-indigo-400" size={14} /> Collaboration Workspace
            </h3>
            <p className="text-[10px] text-zinc-500">Collaborators have real-time editing privileges on synchronized B-Roll scripts in this project space.</p>
            
            <div className="flex items-center gap-3 bg-zinc-900/50 p-3 rounded-2xl border border-zinc-850">
              <div className="w-8 h-8 rounded-full bg-cyan-500 text-black font-semibold text-xs flex items-center justify-center">N</div>
              <div>
                <p className="text-xs font-bold text-white">Naeem Hasan</p>
                <p className="text-[9px] font-mono text-zinc-500">Workspace Master Owner (naimusanando@gmail.com)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: brand Kit options */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2 border-b border-zinc-900 pb-2">
              <Layers className="text-indigo-400" size={14} /> Brand Kit Setup
            </h3>
            <p className="text-[10px] text-zinc-500">Configure signature colors and standard fonts to sync subtitle graphics automatically during caption generation.</p>

            <div className="space-y-3">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">Brand Color Palette</span>
              <div className="flex gap-2">
                {brandColors.map((col, idx) => (
                  <div key={idx} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 flex items-center gap-2 justify-between">
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: col }} />
                    <span className="text-[9px] font-mono text-zinc-400 uppercase select-all">{col}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-2">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block">Selected Standard Font Face</span>
                <div className="p-3 bg-zinc-900 border border-zinc-805 rounded-xl font-sans text-xs text-white font-bold uppercase">
                  ⚡ SPACE GROTESK DISPLAY BOLD
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0b0c10] border border-indigo-500/10 rounded-3xl p-5 flex gap-3.5">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 self-start">
              <Shield size={16} />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Multi-User Sync Security</h4>
              <p className="text-[10px] text-zinc-300 leading-relaxed mt-1">
                Your draft libraries are synchronized with end-to-end encryption. All custom video assets uploaded are stored locally in the secure sandboxed storage layer.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
