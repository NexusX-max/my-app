import React, { useState } from "react";
import { Sparkles, User, AudioLines, Volume2, ShieldCheck, Play, HelpCircle, Eye, EyeOff, CheckCircle } from "lucide-react";

export default function EffectsStudio() {
  const [avatarScript, setAvatarScript] = useState("");
  const [activeAvatar, setActiveAvatar] = useState("Jane - Modern Tech Host");
  const [cloningStatus, setCloningStatus] = useState("inactive"); // 'inactive' | 'processing' | 'ready'
  const [vocalPath, setVocalPath] = useState("");
  const [simulatingVideo, setSimulatingVideo] = useState(false);

  const avatars = [
    { name: "Jane - Modern Tech Host", gender: "Female", lang: "Multi-lang English & Banglish" },
    { name: "Zayn - Conversational Vlog Host", gender: "Male", lang: "Bengali Native" },
    { name: "Naim - Professional Tech Presenter", gender: "Male", lang: "Bilingual English/Bengali" }
  ];

  const triggerAvatarGen = () => {
    if (!avatarScript.trim()) return;
    setSimulatingVideo(true);
    setTimeout(() => {
      setSimulatingVideo(false);
      alert("AI Talking Avatar successfully compiled into your draft assets ledger!");
    }, 2500);
  };

  const handleVoiceUpload = () => {
    setCloningStatus("processing");
    setTimeout(() => {
      setCloningStatus("ready");
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 pb-12" id="effects-audio-studio-view">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
          Professional FX Lab
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2 mt-1">
          <AudioLines className="text-rose-400 animate-pulse" size={24} />
          AI Effects & Audio Studio
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Generate photorealistic talking presenter avatars, copy human voices with AI clones, clean up audio noise, or remove video backdrops completely.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Talking Avatar */}
        <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
            <User className="text-rose-400" size={14} /> AI Avatar Studio (Talking Presenters)
          </h3>
          <p className="text-[10px] text-zinc-500">Pick a speaking model, enter your transcript, and Onyx Drift will render a high-fidelity lip-synced talking presenter video.</p>

          <div className="space-y-3">
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">1. Select AI presenter host</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {avatars.map((av) => (
                  <button 
                    key={av.name}
                    onClick={() => setActiveAvatar(av.name)}
                    className={`p-3 text-left border rounded-xl transition-all ${activeAvatar === av.name ? 'bg-rose-500/10 border-rose-500/40 text-rose-300' : 'bg-zinc-90 w-full border-zinc-850 text-zinc-400 hover:border-zinc-800'}`}
                  >
                    <p className="text-[10px] font-black uppercase truncate">{av.name.split(" - ")[0]}</p>
                    <p className="text-[8px] text-zinc-500 mt-0.5">{av.lang}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <span className="text-[9px] font-mono text-zinc-500 uppercase block">2. Presenter Statement script</span>
              <textarea 
                rows={4}
                value={avatarScript}
                onChange={(e) => setAvatarScript(e.target.value)}
                placeholder="Write sentence speech for presenter..."
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl px-3 py-2.5 text-xs text-white resize-none focus:outline-none focus:border-rose-500"
              />
            </div>

            <button 
              onClick={triggerAvatarGen}
              disabled={simulatingVideo || !avatarScript.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-amber-600 rounded-2xl text-black font-black uppercase tracking-wider text-[11px] hover:shadow-rose-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {simulatingVideo ? "Compiling presentational lipsync mesh..." : "Render Presenter Video 🚀"}
            </button>
          </div>
        </div>

        {/* Right Column: AI Audio Cloner */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
            <Volume2 className="text-rose-400" size={14} /> AI Voice Clone Studio
          </h3>
          <p className="text-[10px] text-zinc-500">Duplicate any human sound by uploading a small voice example clip. Our audio matrix reproduces the dialect parameters.</p>

          <div className="p-5 border-2 border-dashed border-zinc-800 rounded-2xl text-center bg-zinc-900/10 space-y-3">
            {cloningStatus === "inactive" && (
              <>
                <Volume2 className="text-zinc-600 mx-auto animate-pulse" size={24} />
                <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Inject Voice Sample</p>
                <button 
                  onClick={handleVoiceUpload}
                  className="px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[9px] font-black uppercase text-zinc-350 tracking-wider hover:text-white hover:border-zinc-700"
                >
                  Upload 10s audio clip
                </button>
              </>
            )}

            {cloningStatus === "processing" && (
              <p className="text-xs font-bold text-rose-400 animate-pulse uppercase tracking-wider">
                Analyzing phonemes & speech pitch spectrum...
              </p>
            )}

            {cloningStatus === "ready" && (
              <div className="space-y-2">
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                  <CheckCircle size={14} /> Voice Model Compiled
                </p>
                <p className="text-[9px] text-zinc-500 leading-relaxed font-mono">
                  Your clone voice signature has been designated as: VOX_CLONE_SECURE_V392
                </p>
                <button 
                  onClick={() => setCloningStatus("inactive")}
                  className="text-[9px] font-mono text-zinc-500 uppercase hover:text-white"
                >
                  Reset Voice
                </button>
              </div>
            )}
          </div>

          {/* Quick Vocal enhancements */}
          <div className="border-t border-zinc-900 pt-4 space-y-2.5">
            <span className="text-[9px] font-mono text-zinc-500 uppercase block">Vocal FX Master filters</span>
            <div className="space-y-1.5">
              {[
                { name: "Dynamic Noise Cancellation", desc: "Dampen acoustic background and hiss noise" },
                { name: "Voice Presence Boost", desc: "Increase low mid warmth of voiceover models" }
              ].map((fx) => (
                <div key={fx.name} className="p-3 bg-zinc-900/60 border border-zinc-850 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-300">{fx.name}</h4>
                    <p className="text-[8px] text-zinc-500 mt-0.5">{fx.desc}</p>
                  </div>
                  <span className="text-[8px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase font-black">
                    Enabled
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
