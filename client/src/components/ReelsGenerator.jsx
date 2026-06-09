import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, FileText, Image, PenTool, Flame, ArrowRight, 
  HelpCircle, CheckCircle2, RefreshCw, Cpu, Download, Loader2, Music, Type
} from "lucide-react";

export default function ReelsGenerator({ onScriptApply }) {
  const [idea, setIdea] = useState("");
  const [generating, setGenerating] = useState(false);
  const [createdScript, setCreatedScript] = useState(null);
  
  // Thumbnail generation states
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);
  const [customThumbPrompt, setCustomThumbPrompt] = useState("");
  const [generatedThumbnailUrl, setGeneratedThumbnailUrl] = useState("");

  const handleGenerateScript = async () => {
    if (!idea.trim()) return;
    setGenerating(true);
    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: idea, contentType: "reels" })
      });
      if (response.ok) {
        const data = await response.json();
        setCreatedScript(data);
        // seed thumbnail generation prompt
        setCustomThumbPrompt(data.thumbnailConcept || "Futuristic neon background art for a short video");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateThumbnail = async () => {
    setGeneratingThumbnail(true);
    try {
      const response = await fetch("/api/ai/thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: customThumbPrompt })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setGeneratedThumbnailUrl(data.imageUrl);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingThumbnail(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 pb-12" id="reels-generator-view">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
          Onyx Drift Autopilot
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2 mt-1">
          <Sparkles className="text-orange-400 animate-spin" size={24} />
          AI Reels Generator
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Turn your raw descriptions or concepts directly into high-retention structured campaigns. Write the script, choose templates, compile scene grids, and run our server-side image networks instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input prompt generation field */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-900 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
              <PenTool className="text-orange-400" size={14} /> Concept Injector
            </h3>

            <div className="space-y-2">
              <label className="text-[9px] font-mono text-zinc-500 uppercase">Describe your Reel concept</label>
              <textarea 
                rows={4}
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="e.g. 'A high-energy gaming reel showcasing the secret graphics setting that makes any game look photorealistic, with a dramatic hook at start...'"
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl px-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>

            <div className="flex gap-2">
              {["Tech Review", "Gaming Hook", "Fitness Vlog", "Business Hack"].map((suggestion) => (
                <button 
                  key={suggestion}
                  onClick={() => setIdea(`A high-retention viral short about: ${suggestion}. Write in strong catchy format with high conversion tags.`)}
                  className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 rounded-lg text-[9px] font-bold text-zinc-400 uppercase tracking-wider transition-all"
                >
                  💡 {suggestion}
                </button>
              ))}
            </div>

            <button 
              onClick={handleGenerateScript}
              disabled={generating || !idea.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-600 rounded-2xl text-black font-black uppercase tracking-wider text-[11px] hover:shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Writing script draft...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Generate Script & Description
                </>
              )}
            </button>
          </div>

          {createdScript && (
            <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-900 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                <Image className="text-orange-400" size={14} /> AI Thumbnail Builder (Imagen Integration)
              </h3>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Cover Visual prompt</label>
                <input 
                  type="text" 
                  value={customThumbPrompt}
                  onChange={(e) => setCustomThumbPrompt(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button 
                onClick={handleGenerateThumbnail}
                disabled={generatingThumbnail}
                className="w-full py-3 bg-zinc-900 font-black uppercase text-[10px] tracking-wider text-orange-400 border border-orange-500/20 rounded-xl hover:bg-orange-500/10 transition-colors flex items-center justify-center gap-2"
              >
                {generatingThumbnail ? (
                  <>
                    <Loader2 className="animate-spin" size={14} />
                    Generating high-res thumbnail...
                  </>
                ) : (
                  <>
                    <Image size={14} />
                    Run AI Thumbnail network
                  </>
                )}
              </button>

              {generatedThumbnailUrl && (
                <div className="rounded-xl overflow-hidden border border-zinc-800 bg-black aspect-video relative group">
                  <img src={generatedThumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-emerald-500 text-black text-[8px] font-mono font-black px-2 py-0.5 rounded uppercase">
                    GEN_SUCCESS
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a 
                      href={generatedThumbnailUrl} 
                      download="Onyx_Drift_Thumbnail.png"
                      className="p-2 bg-zinc-900 rounded-full text-white hover:text-orange-400"
                    >
                      <Download size={16} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Generated Script Presentation */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!createdScript ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full border border-zinc-900 bg-[#060606] rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[400px]"
              >
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 border border-zinc-800 mb-4 animate-pulse">
                  <FileText size={24} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Generated script assets</h3>
                <p className="text-[10px] text-zinc-500 mt-2 max-w-sm">
                  Write down your creative concept draft to generate social scripts, trending hashtag presets, copyable templates and background audio proposals.
                </p>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Script details card */}
                <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-5">
                  <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
                    <div>
                      <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Generated Target Hook</span>
                      <h2 className="text-sm font-black text-white uppercase">{createdScript.hook}</h2>
                    </div>
                    <button 
                      onClick={() => onScriptApply(createdScript)}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl text-black font-black uppercase text-[10px] tracking-wider hover:shadow-lg active:scale-95 transition-all"
                    >
                      Use inside Editor
                    </button>
                  </div>

                  {/* Script Timeline sections */}
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Audio Scene Split Workflow</h3>
                    {createdScript.script?.map((sec, i) => (
                      <div key={i} className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-2 hover:border-orange-500/20 transition-all">
                        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500 uppercase">
                          <span className="font-bold text-orange-400">Scene #{i+1} ({sec.duration || '5s'})</span>
                          <span>Tone Guideline: {sec.tone}</span>
                        </div>
                        <p className="text-xs text-zinc-200 leading-relaxed font-medium">{sec.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Caption descriptor for direct social copy */}
                  <div className="border-t border-zinc-900 pt-4 space-y-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center justify-between">
                      <span>Copy caption template (Instagram/TikTok description)</span>
                      <span className="text-[8px] font-mono text-zinc-400 uppercase bg-zinc-900 px-2 py-0.5 rounded">Ready to deploy</span>
                    </h3>
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-850 text-xs text-zinc-300 leading-relaxed font-mono">
                      {createdScript.captionTemplate}
                    </div>
                  </div>

                  {/* Suggest tags */}
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Suggested viral tags</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {createdScript.tags?.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-850 text-[10px] font-mono text-zinc-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Suggest BGM */}
                  {createdScript.suggestedBgm && (
                    <div className="p-3.5 bg-orange-500/5 rounded-2xl border border-orange-500/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Music className="text-orange-400" size={16} />
                        <div>
                          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">Recommended Audio Track</p>
                          <p className="text-xs text-zinc-200 font-bold">{createdScript.suggestedBgm}</p>
                        </div>
                      </div>
                      <span className="text-[8px] font-mono text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded uppercase">Synced</span>
                    </div>
                  )}

                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
