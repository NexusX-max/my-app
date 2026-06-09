import React, { useState } from "react";
import { Search, Flame, DollarSign, ArrowUpRight, Star, Cpu, Tag, Gift } from "lucide-react";

export default function TemplateMarket() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSellModal, setShowSellModal] = useState(false);
  const [sellPrice, setSellPrice] = useState("15");
  const [sellTitle, setSellTitle] = useState("");

  const templates = [
    { id: 1, title: "Alex Hormozi Yellow Punch", type: "reels", price: "Free", rating: 4.9, sales: "14.2k", category: "gaming" },
    { id: 2, title: "Neon Cyberpunk Visual Loop", type: "shorts", price: "$12", rating: 4.8, sales: "830", category: "gaming" },
    { id: 3, title: "Sleek Corporate Infographics", type: "business", price: "$29", rating: 4.7, sales: "2.4k", category: "business" },
    { id: 4, title: "Cinematic Travel Vlog Color", type: "shorts", price: "Free", rating: 4.9, sales: "32.1k", category: "vlog" },
    { id: 5, title: "Minimal Tech Review Splice", type: "reels", price: "$9", rating: 4.6, sales: "1.1k", category: "business" },
    { id: 6, title: "Gym Motivation Speed Ramp", type: "shorts", price: "$15", rating: 4.8, sales: "490", category: "vlog" }
  ];

  const filtered = templates.filter(t => {
    const matchCat = activeCategory === "all" || t.category === activeCategory;
    const matchSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 pb-12" id="template-market-workspace">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Global Creator Hub
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2 mt-1">
            <Gift className="text-purple-400" size={24} />
            Template Marketplace
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Browse highly professional layouts built for maximum retention on Reels, Shorts, and TikTok. Sell your own visual presets or download pre-made motion graphic packages.
          </p>
        </div>
        <button 
          onClick={() => setShowSellModal(true)}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-wider shadow-lg shadow-purple-600/10 active:scale-95 transition-all"
        >
          Sell Your Template 💰
        </button>
      </div>

      {/* Filter and search bars */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-zinc-950 border border-zinc-900 rounded-2xl px-3.5 py-2.5 flex items-center gap-2">
          <Search size={14} className="text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search files, overlays, presets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-xs text-white placeholder-zinc-500 w-full"
          />
        </div>
        
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
          {["all", "gaming", "business", "vlog"].map((cat) => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all ${activeCategory === cat ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div key={item.id} className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 hover:border-purple-500/30 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              {/* Fake visual preset mockup */}
              <div className="aspect-[16/10] bg-zinc-900 rounded-2xl border border-zinc-850 overflow-hidden relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 to-black/10 mix-blend-overlay" />
                <span className="font-mono text-[9px] text-purple-400 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full">
                  {item.type.toUpperCase()} PRESET LIVE
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{item.category} presets</span>
                  <div className="flex items-center gap-1 text-[9px] text-amber-400 font-mono">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    <span>{item.rating}</span>
                  </div>
                </div>
                <h4 className="text-sm font-black text-white uppercase truncate">{item.title}</h4>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-zinc-900 pt-4 mt-4">
              <div>
                <span className="text-[8px] font-mono text-zinc-500 block uppercase">License Cost</span>
                <span className={`text-sm font-black ${item.price === 'Free' ? 'text-emerald-400' : 'text-purple-400'}`}>{item.price}</span>
              </div>
              <button className="px-3.5 py-2 bg-zinc-900 hover:bg-purple-500 hover:text-white rounded-xl text-[9px] uppercase font-black text-zinc-300 border border-zinc-800 transition-all flex items-center gap-1.5">
                <span>Deploy Set</span>
                <ArrowUpRight size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Fake modal for selling preset */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-zinc-900 w-full max-w-md rounded-3xl p-6 space-y-4 relative">
            <h3 className="text-sm font-black uppercase text-purple-400 tracking-wider">Publish Preset into Onyx Marketplace</h3>
            <p className="text-[10px] text-zinc-400">Introduce your custom timeline cuts, color lookup assets, and customized subtitle timing schemes for creators worldwide to browse and purchase.</p>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-500 uppercase">Preset template Title</label>
                <input 
                  type="text" 
                  value={sellTitle}
                  onChange={(e) => setSellTitle(e.target.value)}
                  placeholder="e.g. 'Epic Neon Vlog Cuts'" 
                  className="w-full bg-zinc-900 border border-zinc-850 px-3 py-2 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-500 uppercase">License cost (USD)</label>
                <input 
                  type="number" 
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-850 px-3 py-2 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button 
                onClick={() => setShowSellModal(false)}
                className="flex-1 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-white"
              >
                Go Back
              </button>
              <button 
                onClick={() => {
                  setShowSellModal(false);
                  alert("Preset applied successfully! Waiting for director approval.");
                }}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-[10px] font-black uppercase tracking-wider text-white"
              >
                Submit Preset
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
