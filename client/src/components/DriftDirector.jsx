import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Upload, Video, Play, FastForward, Award, 
  Flame, HelpCircle, Scissors, Share2, Layers, Cpu, Check, AlertCircle, Loader2, ArrowRight
} from "lucide-react";

export default function DriftDirector({ 
  onSelectHighlight,
  videoFile,
  setVideoFile,
  videoUrl,
  setVideoUrl
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [duration, setDuration] = useState("45");
  const [styleMode, setStyleMode] = useState("Modern Cinematic");
  const [errorMsg, setErrorMsg] = useState("");

  const handleDragOver = (e) => e.preventDefault();
  
  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleVideoSelect(files[0]);
    }
  };

  const handleVideoSelect = (file) => {
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
  };

  const startAnalysis = async () => {
    setAnalyzing(true);
    setErrorMsg("");
    try {
      const response = await fetch("/api/ai/director", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoName: videoFile ? videoFile.name : "Simulated_HighImpact_Footage.mp4",
          duration: parseFloat(duration),
          videoStyle: styleMode
        })
      });
      if (!response.ok) {
        throw new Error("Server responded with error running Drift analysis");
      }
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to the Drift AI Server. Please ensure the dev server is active.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 pb-12" id="drift-director-container">
      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              World-Class Proprietary Feature
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
            <Cpu className="text-cyan-400 animate-pulse" size={24} />
            Drift AI Director
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Upload a single video. Our zero-delay model scans for viral hooks, outputs high-retention cuts, adds synchronized captions, and splits it into multiple tailored reels instantly.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
          <Flame size={14} className="text-orange-500 animate-bounce" />
          <span>Multiplier: 1 Video → 10 Reels / 20 Shorts</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl flex items-center gap-2 text-xs text-red-400">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Upload and Parameters */}
        <div className="lg:col-span-5 space-y-4">
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="group relative border-2 border-dashed border-zinc-800 rounded-3xl bg-[#080808] p-8 text-center transition-all hover:border-cyan-500/40 hover:bg-zinc-900/20 cursor-pointer"
            id="drag-drop-area"
          >
            {videoUrl ? (
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-zinc-800 relative bg-black">
                  <video src={videoUrl} controls className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md text-[9px] font-mono px-2 py-0.5 rounded border border-zinc-700 uppercase">
                    Ready for analysis
                  </div>
                </div>
                <div className="flex items-center justify-between text-left text-xs bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                  <div className="truncate pr-4">
                    <p className="text-zinc-300 font-bold truncate">{videoFile?.name || "Uploaded_Clip.mp4"}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">{(videoFile?.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button 
                    onClick={() => { setVideoFile(null); setVideoUrl(""); }}
                    className="p-1 px-2.5 rounded bg-zinc-800 text-[10px] uppercase font-black tracking-wider text-red-400 border border-red-500/10 hover:bg-red-500/10"
                  >
                    Clear File
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                <div className="mx-auto w-14 h-14 bg-zinc-900 group-hover:scale-105 rounded-full flex items-center justify-center border border-zinc-800 transition-all">
                  <Upload size={22} className="text-zinc-500 group-hover:text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-300 font-black uppercase tracking-wider">Drag and drop original footage</p>
                  <p className="text-[10px] text-zinc-500 mt-1">Accepts MP4, MOV, FLV files up to 200MB</p>
                </div>
                <div>
                  <button 
                    onClick={() => document.getElementById("director-file-selector")?.click()}
                    className="px-4 py-2 bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 text-[10px] font-black uppercase tracking-wider hover:border-zinc-700 hover:text-white"
                  >
                    Choose file manually
                  </button>
                  <input 
                    id="director-file-selector"
                    type="file" 
                    accept="video/*" 
                    className="hidden" 
                    onChange={(e) => e.target.files && handleVideoSelect(e.target.files[0])} 
                  />
                </div>
              </div>
            )}
          </div>

          <div className="bg-zinc-950 p-5 rounded-3xl border border-zinc-900 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
              <Cpu className="text-cyan-400" size={14} /> Optimization Profile
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Estimated length</label>
                <input 
                  type="number" 
                  value={duration} 
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="Duration (sec)"
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500" 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Aesthetic style</label>
                <select 
                  value={styleMode} 
                  onChange={(e) => setStyleMode(e.target.value)}
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Modern Cinematic">Modern Cinematic</option>
                  <option value="Gaming / Loud">Gaming / Loud Accent</option>
                  <option value="Alex Hormozi Style">Hormozi Highlighter</option>
                  <option value="Tech Minimalist">Tech Deep Minimalist</option>
                </select>
              </div>
            </div>

            <button 
              onClick={startAnalysis}
              disabled={analyzing}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-black font-black uppercase tracking-wider text-[11px] shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Analyzing Multi-Track Moments...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Initiate Multi-Reel Split
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Analysis, Hooks & Splits */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {!analysisResult ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full border border-zinc-900 bg-[#060606] rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[450px]"
              >
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center text-zinc-500 border border-zinc-800/60 mb-4 animate-pulse">
                  <Video size={24} />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Analysis dashboard</h3>
                <p className="text-[10px] text-zinc-500 mt-2 max-w-sm">
                  Run the Drift AI Director split setup to extract auto-captions, compute viral metrics, and access the multi-split timeline structure.
                </p>
                
                {/* Visualizer layout */}
                <div className="grid grid-cols-4 gap-2 w-full max-w-md mt-8 opacity-20">
                  <div className="h-2 bg-gradient-to-r from-zinc-700 to-zinc-900 rounded-full" />
                  <div className="h-2 bg-gradient-to-r from-zinc-700 to-zinc-900 rounded-full" />
                  <div className="h-2 bg-gradient-to-r from-zinc-700 to-zinc-900 rounded-full" />
                  <div className="h-2 bg-gradient-to-r from-zinc-700 to-zinc-900 rounded-full" />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Viral Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-400">
                      <Flame size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Viral Score</span>
                      <span className="text-xl font-black text-white">{analysisResult.viralScore}/100</span>
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400">
                      <Award size={20} />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">Reels Split</span>
                      <span className="text-xl font-black text-white">{analysisResult.clips?.length || 4} Versions</span>
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400">
                      <FastForward size={20} />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block">BGM Rhythm</span>
                      <span className="text-xs font-bold text-white truncate max-w-[140px] block">Detected Beat Sync</span>
                    </div>
                  </div>
                </div>

                {/* Viral Predictions Commentary */}
                <div className="bg-[#0c0c0e] border border-cyan-500/10 rounded-2xl p-4 flex gap-3">
                  <div className="p-2.5 bg-cyan-500/10 rounded-lg text-cyan-400 self-start">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">AI Director Analysis</h4>
                    <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{analysisResult.predictions}</p>
                    {analysisResult.suggestedAudio && (
                      <div className="mt-2 text-[10px] font-mono text-amber-400 bg-amber-500/5 px-2 py-1 rounded inline-block border border-amber-500/10">
                        🎵 Recommended Audio: {analysisResult.suggestedAudio}
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumb-Stopping Hooks */}
                <div className="bg-zinc-950 rounded-2xl border border-zinc-900 p-5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                    <Flame className="text-orange-400" size={14} /> High-Conversion Opening Hooks
                  </h3>
                  <div className="space-y-2.5">
                    {analysisResult.hooks?.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-zinc-900/40 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 bg-zinc-800 border border-zinc-700 rounded text-[10px] font-mono flex items-center justify-center text-zinc-400 mt-0.5">
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-xs text-zinc-200 font-medium">{h.text}</p>
                            <span className="text-[9px] font-mono text-zinc-500 uppercase">{h.lang || 'English'} Profile</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => onSelectHighlight({ type: 'hook', text: h.text })}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-cyan-500 hover:text-black rounded text-[9px] uppercase font-black tracking-wider text-zinc-300 transition-colors"
                        >
                          Use Hook
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dynamic Clips Split */}
                <div className="bg-zinc-950 rounded-2xl border border-zinc-900 p-5">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                    <Scissors className="text-cyan-400" size={14} /> Viral Split Clips (Timeline Modules)
                  </h3>
                  <div className="space-y-3">
                    {analysisResult.clips?.map((clip, i) => (
                      <div key={i} className="group relative bg-[#09090b] border border-zinc-850 rounded-2xl p-4 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 font-black font-mono text-sm self-start group-hover:bg-cyan-500/10 transition-colors">
                            #{i+1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs text-white font-bold">{clip.title}</h4>
                              <span className="px-1.5 py-0.5 text-[8px] font-mono rounded bg-emerald-500/10 text-emerald-400 uppercase">
                                Score: {clip.score}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500 mt-1">
                              Cut Point: <span className="text-zinc-300 font-mono">{clip.start}s – {clip.end}s</span> | Visual Cue: <span className="text-zinc-400">{clip.visualCue || 'Center focused'}</span>
                            </p>
                          </div>
                        </div>
                        <button 
                          onClick={() => onSelectHighlight({ type: 'clip', clip })}
                          className="w-full sm:w-auto px-4 py-2 bg-zinc-900 hover:bg-cyan-400 hover:text-black rounded-xl text-[10px] uppercase font-black tracking-wider text-white border border-zinc-800 hover:border-cyan-400 transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Load segment</span>
                          <ArrowRight size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subtitle Words Sync Details */}
                {analysisResult.subtitles && (
                  <div className="bg-zinc-950 rounded-2xl border border-zinc-900 p-5">
                    <div className="flex items-center justify-between mb-3 border-b border-zinc-900 pb-2">
                      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                        <Layers className="text-emerald-400" size={14} /> Smart Captions Synchronized
                      </h3>
                      <span className="text-[9px] font-mono text-zinc-500">{analysisResult.subtitles.length} Sync Points</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 p-3 bg-zinc-905 rounded-xl border border-zinc-800">
                      {analysisResult.subtitles.map((sub, i) => (
                        <div 
                          key={i} 
                          className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-1 ${sub.highlight ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 font-bold' : 'bg-zinc-900/50 border-zinc-800 text-zinc-400'}`}
                        >
                          <span>{sub.text}</span>
                          {sub.emoji && <span className="text-xs">{sub.emoji}</span>}
                          <span className="text-[8px] font-mono text-zinc-500 block">{(sub.startMs / 1000).toFixed(1)}s</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
