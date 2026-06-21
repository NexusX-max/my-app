import React, { useState } from 'react';
import { Search, Music, Volume2, Check, X, ShieldAlert } from 'lucide-react';
import { DEFAULT_SONGS } from '../data/templates';

export default function SongSelector({ currentSong, onSelectSong, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSongs = DEFAULT_SONGS.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="absolute inset-0 bg-neutral-950/98 text-white flex flex-col z-50 animate-in slide-in-from-bottom duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-900">
        <h3 className="text-base font-bold tracking-tight">Audio Tracks</h3>
        <button 
          onClick={onClose}
          className="p-1 rounded-full hover:bg-neutral-900 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Warning note */}
      <div className="mx-4 mt-3 p-2.5 bg-indigo-950/40 border border-indigo-900/50 rounded-xl flex gap-2">
        <Volume2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="text-[10px] text-indigo-200/90 leading-normal">
          Interactive Audio: Tapping a track generates synthesized audio loops directly in your browser using Web Audio! Playback starts automatically.
        </p>
      </div>

      {/* Search Input */}
      <div className="px-4 py-3">
        <div className="relative flex items-center bg-neutral-900 rounded-full px-3 py-2 text-sm">
          <Search className="w-4 h-4 text-neutral-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search music or artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-white outline-none w-full placeholder:text-neutral-600"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-neutral-500 hover:text-white text-xs">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Suggested Section Title */}
      <div className="px-4 pb-2">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Suggested for you</span>
      </div>

      {/* Audio List */}
      <div className="flex-1 overflow-y-auto px-2 pb-6 space-y-1">
        {filteredSongs.length > 0 ? (
          filteredSongs.map((song) => {
            const isSelected = currentSong?.id === song.id;
            return (
              <button
                key={song.id}
                onClick={() => onSelectSong(song)}
                className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all text-left ${
                  isSelected 
                    ? 'bg-neutral-900 border border-neutral-800' 
                    : 'hover:bg-neutral-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Song Cover */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md bg-neutral-900 shrink-0">
                    <img 
                      src={song.coverUrl} 
                      alt={song.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Music className="w-4 h-4 text-white/80" />
                    </div>
                  </div>

                  {/* Song Details */}
                  <div className="overflow-hidden">
                    <p className={`text-sm font-semibold truncate ${isSelected ? 'text-blue-400' : 'text-neutral-100'}`}>
                      {song.title}
                    </p>
                    <p className="text-xs text-neutral-500 truncate">{song.artist}</p>
                    <p className="text-[10px] text-neutral-600/90 mt-0.5">{song.duration} mins • Interactive Synth</p>
                  </div>
                </div>

                {/* Selected Indicator */}
                <div className="pr-2">
                  {isSelected ? (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center hover:border-neutral-700">
                      <PlusIcon className="w-4 h-4 text-neutral-400" />
                    </div>
                  )}
                </div>
              </button>
            );
          })
        ) : (
          <div className="py-12 text-center text-neutral-500 text-sm">
            No audio tracks match "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}

function PlusIcon(props) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth={2} 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}
