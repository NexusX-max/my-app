import React, { useState } from 'react';
import { Search, Sparkles, X } from 'lucide-react';

export default function AISearchBar({ onSearchExecute }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchExecute(query);
    }
  };

  const handleClear = () => {
    setQuery("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full group">
      {/* Search Pulse Glow Backing */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-md opacity-25 group-focus-within:opacity-40 transition-all duration-300" />
      
      <div className="relative flex items-center bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden px-4 py-1.5 focus-within:border-cyan-500/40 transition-all">
        <span className="text-cyan-500 mr-2 shrink-0 animate-pulse">
          <Sparkles size={14} />
        </span>
        
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter quantum signature or node name..."
          className="w-full bg-transparent text-white placeholder-zinc-550 text-xs font-mono py-2 focus:outline-none"
        />

        {query && (
          <button 
            type="button"
            onClick={handleClear}
            className="text-zinc-500 hover:text-white mr-2 p-1 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X size={12} />
          </button>
        )}

        <button 
          type="submit"
          className="px-3 py-1.5 bg-cyan-500 text-black font-semibold rounded-xl text-[10px] uppercase font-mono tracking-widest cursor-pointer hover:bg-cyan-400 active:scale-95 transition-all flex items-center gap-1 shrink-0"
        >
          <Search size={10} /> Scan
        </button>
      </div>

      {/* Cybernetic laser line styling under the search bar */}
      <div className="absolute bottom-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none" />
    </form>
  );
}
