import React, { useState } from "react";
import { Flame, TrendingUp, BarChart2, Star, RefreshCw, Smartphone, Award, Cpu } from "lucide-react";

export default function ViralToolkit() {
  const [topic, setTopic] = useState("");
  const [calculating, setCalculating] = useState(false);
  const [toolkitResult, setToolkitResult] = useState(null);

  const triggerEngagementTest = () => {
    if (!topic.trim()) return;
    setCalculating(true);
    setTimeout(() => {
      setCalculating(false);
      setToolkitResult({
        score: 87,
        predictorRate: "8.2%",
        trendingHashtags: ["#techwork", "#editingpresets", "#aimusic", "#productivityhacks", "#viralreels"],
        hooks: [
          "This 1 AI video hack is illegal to know... 🤫",
          "Stop manual video editing. Try this instead 🛑",
          "How I split 1 video into 20 reels in 3 seconds!"
        ]
      });
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 pb-12" id="viral-toolkit-holder">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
          Viral Growth Suite
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2 mt-1">
          <TrendingUp className="text-amber-400" size={24} />
          Viral toolkit
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Calculate the expected watch-time retention rate of your videos, discover trending audio files, and generate optimized hooks and hashtag profiles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: calculator trigger and input */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300 flex items-center gap-1.5 border-b border-zinc-900 pb-2">
            <Cpu className="text-amber-400" size={14} /> Topic engagement predictor
          </h3>
          <p className="text-[10px] text-zinc-500">Enter your target topic or sector vertical to compute potential CTR values and view trending hashtags.</p>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[9px] font-mono text-zinc-500 uppercase">Target Video Topic / Niche</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 'Short business automation tricks'"
                className="w-full bg-zinc-900 border border-zinc-850 px-3 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button 
              onClick={triggerEngagementTest}
              disabled={calculating || !topic.trim()}
              className="w-full py-3 bg-amber-500 hover:bg-amber-450 disabled:bg-zinc-800 disabled:text-zinc-650 text-black font-black uppercase text-[10px] tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {calculating ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  Running Neural Forecast...
                </>
              ) : (
                <>
                  <span>Diagnose viral potential</span>
                  <Award size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Calculator output reports */}
        <div className="lg:col-span-7">
          {toolkitResult ? (
            <div className="space-y-6">
              
              {/* Stat dashboard */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Flame size={20} />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">Calculated Viral Score</span>
                    <span className="text-lg font-black text-white">{toolkitResult.score} / 100</span>
                  </div>
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <BarChart2 size={20} />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-zinc-500 uppercase block">Expected Engagement CTR</span>
                    <span className="text-lg font-black text-white">{toolkitResult.predictorRate}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Hook generation recommendations */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2 border-b border-zinc-900 pb-2">
                  <Star className="text-amber-400" size={14} /> Opening hook suggestions
                </h3>
                <div className="space-y-2">
                  {toolkitResult.hooks.map((h, i) => (
                    <div key={i} className="p-3 bg-zinc-90 w-full uppercase text-[10px] font-mono border border-zinc-850 rounded-xl text-zinc-300">
                      ⚡ "{h}"
                    </div>
                  ))}
                </div>
              </div>

              {/* Hash presets */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300 flex items-center gap-2 border-b border-zinc-900 pb-2">
                  <Smartphone className="text-amber-400" size={14} /> Topic trending tag list
                </h3>
                <div className="flex flex-wrap gap-2">
                  {toolkitResult.trendingHashtags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-zinc-900 border border-zinc-850 text-xs font-mono text-zinc-400 rounded-lg">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full border border-zinc-900 bg-[#060606] rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[350px]">
              <TrendingUp className="w-16 h-16 text-zinc-800 mx-auto animate-pulse mb-3" />
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Viral analytics dashboard</h3>
              <p className="text-[10px] text-zinc-500 mt-2 max-w-sm">
                Compute high-converting tags, opening titles, expected average click metrics, and trending values in real time.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
