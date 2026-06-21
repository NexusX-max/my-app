import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Music, 
  Sparkles, 
  ToggleLeft, 
  ToggleRight, 
  ChevronRight, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Check, 
  Plus, 
  BarChart2, 
  MessageSquare,
  Play,
  Pause
} from 'lucide-react';
import {  DEFAULT_SONGS, FILTERS } from '../data/DataTemplates';
import { ensureAudioContext, startSynthSession, stopSynthSession } from '../utils/audio';

export default function NewPostScreen({
  media,
  canvasRatio,
  activeFilter,
  adjustments,
  textOverlays,
  stickers,
  selectedSong,
  setSelectedSong,
  onBack,
  onShare
}) {
  // Post Details State
  const [caption, setCaption] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(['@voltagram_creator']);
  const [showTagInput, setShowTagInput] = useState(false);
  
  const [locationInput, setLocationInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Dhaka, Bangladesh');
  const [showLocationSelect, setShowLocationSelect] = useState(false);

  // Video playback sound and state
  const [videoMuted, setVideoMuted] = useState(false);
  const [isMediaPlaying, setIsMediaPlaying] = useState(true);

  // Poll state
  const [showPollBuilder, setShowPollBuilder] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('Who will win the match?');
  const [pollOptions, setPollOptions] = useState(['Brazil 🇧🇷', 'Haiti 🇭🇹']);
  const [pollActive, setPollActive] = useState(true);

  // Prompt state
  const [showPromptBuilder, setShowPromptBuilder] = useState(false);
  const [promptText, setPromptText] = useState('Ask me anything about this post');
  const [promptActive, setPromptActive] = useState(false);

  // AI Label state
  const [aiLabelOn, setAiLabelOn] = useState(false);

  // Audio playing synth state
  useEffect(() => {
    if (selectedSong && isMediaPlaying) {
      ensureAudioContext();
      startSynthSession(selectedSong.id);
    } else {
      stopSynthSession();
    }
    return () => stopSynthSession();
  }, [selectedSong, isMediaPlaying]);

  const handleToggleSound = (e) => {
    e.stopPropagation();
    ensureAudioContext();
    setVideoMuted(!videoMuted);
  };

  const handleTogglePlayMedia = () => {
    ensureAudioContext();
    setIsMediaPlaying(!isMediaPlaying);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    const formatted = tagInput.trim().startsWith('@') ? tagInput.trim() : `@${tagInput.trim()}`;
    if (!tags.includes(formatted)) {
      setTags([...tags, formatted]);
    }
    setTagInput('');
    setShowTagInput(false);
  };

  const handleSongSelect = (song) => {
    ensureAudioContext();
    setSelectedSong(song);
    setIsMediaPlaying(true);
  };

  // Common locations matching user vibe
  const locationsMock = [
    'Dhaka, Bangladesh',
    'Chittagong, Bangladesh',
    'Cox\'s Bazar, Bangladesh',
    'Barcelona, Spain',
    'London, UK',
    'New York, USA',
    'Miami, FL',
    'Paris, France'
  ];

  return (
    <div className="flex-1 flex flex-col bg-black text-white h-full relative overflow-y-auto pb-4">
      {/* Top Header Row matching photo */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-900 bg-neutral-950 sticky top-0 z-50">
        <button 
          onClick={onBack}
          className="text-neutral-300 hover:text-white p-1 rounded-full transition-colors flex items-center gap-1"
          id="btn-newpost-back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-base font-bold tracking-tight text-white">New post</span>
        <button 
          onClick={onShare}
          className="text-sm font-black text-blue-500 hover:text-blue-400 px-1 py-0.5"
          id="btn-newpost-top-share"
        >
          Share
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4">
        
        {/* Caption and Preview Row - MATCHING SCREENSHOT EXACTLY */}
        <div className="flex gap-4 items-start bg-neutral-950/40 p-1 rounded-xl">
          {/* Caption text entry area */}
          <div className="flex-1 min-w-0">
            <textarea
              className="w-full bg-transparent text-sm text-neutral-200 placeholder:text-neutral-500 border-none outline-none resize-none h-24 pt-1 font-semibold leading-relaxed"
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={2200}
            />
          </div>

          {/* High-Fidelity Mini Media Preview Container */}
          <div className="shrink-0 relative">
            <div 
              onClick={handleTogglePlayMedia}
              className="relative w-[85px] h-[115px] bg-[#0c0c0e] rounded-xl overflow-hidden border border-neutral-800 shadow-lg cursor-pointer group flex items-center justify-center select-none"
            >
              {/* Media element with correct fit & filters */}
              <div 
                className="w-full h-full relative"
                style={{
                  filter: (() => {
                    const filterObj = FILTERS.find(f => f.id === activeFilter);
                    const filterBase = filterObj ? filterObj.filterStyle : 'none';
                    const b = adjustments.brightness;
                    const c = adjustments.contrast;
                    const s = adjustments.saturation;
                    const bl = adjustments.blur;
                    const adj = `brightness(${b}%) contrast(${c}%) saturate(${s}%) blur(${bl}px)`;
                    return filterBase === 'none' ? adj : `${filterBase} ${adj}`;
                  })()
                }}
              >
                {media?.type === 'video' ? (
                  <video 
                    src={media?.url} 
                    className="w-full h-full object-cover" 
                    controls={false}
                    autoPlay 
                    loop 
                    muted={videoMuted} 
                    playsInline
                  />
                ) : (
                  <img 
                    src={media?.url || media?.thumbnail} 
                    className="w-full h-full object-cover" 
                    alt="Reel content" 
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
              </div>

              {/* Text Overlays scaled down */}
              {textOverlays.map((layer) => (
                <div
                  key={layer.id}
                  className={`absolute select-none rounded p-[2px] text-center font-bold break-all leading-none ${layer.font}`}
                  style={{
                    left: `${layer.x}%`,
                    top: `${layer.y}%`,
                    transform: 'translate(-50%, -50%) scale(0.4)',
                    color: layer.color,
                    backgroundColor: layer.bg,
                    fontSize: `${layer.size || 20}px`,
                    zIndex: 30,
                    maxWidth: '180%'
                  }}
                >
                  {layer.text}
                </div>
              ))}

              {/* Stickers scaled down */}
              {stickers.map((stk) => (
                <div
                  key={stk.id}
                  className="absolute text-xl select-none"
                  style={{
                    left: `${stk.x}%`,
                    top: `${stk.y}%`,
                    transform: 'translate(-50%, -50%) scale(0.6)',
                    zIndex: 29,
                  }}
                >
                  {stk.emoji}
                </div>
              ))}

              {/* Active Audio symbol */}
              {selectedSong && (
                <div className="absolute bottom-1 left-1.5 z-40 bg-black/70 px-1 py-[2px] rounded-full border border-white/10 flex items-center gap-0.5">
                  <span className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                  <span className="text-[6px] font-bold text-white uppercase truncate max-w-[40px]">
                    {selectedSong.title}
                  </span>
                </div>
              )}

              {/* Play/Pause overlay feedback */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                {!isMediaPlaying ? (
                  <Play className="w-4 h-4 text-white drop-shadow" />
                ) : (
                  <Pause className="w-4 h-4 text-white drop-shadow" />
                )}
              </div>

              {/* Audio mute / unmute click tag for video */}
              {media?.type === 'video' && (
                <button
                  onClick={handleToggleSound}
                  className="absolute top-1 right-1 bg-black/60 hover:bg-black p-1 rounded-full text-white z-40"
                  title={videoMuted ? 'Unmute preview sound' : 'Mute preview sound'}
                >
                  {videoMuted ? (
                    <VolumeX className="w-2.5 h-2.5 text-zinc-400" />
                  ) : (
                    <Volume2 className="w-2.5 h-2.5 text-blue-400" />
                  )}
                </button>
              )}
            </div>
            
            {/* Aspect size label */}
            <span className="text-[8px] font-mono font-extrabold text-zinc-500 block text-center mt-1 uppercase">
              REEL {canvasRatio}
            </span>
          </div>
        </div>

        {/* Quick Interaction Chips (Poll, Prompt) - MATCHING PICTURE */}
        <div className="flex items-center gap-2 pb-2">
          <button
            onClick={() => {
              setShowPollBuilder(!showPollBuilder);
              setShowPromptBuilder(false);
              setPollActive(true);
            }}
            className={`px-3 py-1.5 rounded-full border text-[11px] font-bold flex items-center gap-1 transition-all ${
              pollActive && showPollBuilder 
                ? 'bg-blue-600/25 border-blue-500 text-blue-400' 
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-850'
            }`}
            id="post-btn-poll"
          >
            <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Poll</span>
          </button>

          <button
            onClick={() => {
              setShowPromptBuilder(!showPromptBuilder);
              setShowPollBuilder(false);
              setPromptActive(true);
            }}
            className={`px-3 py-1.5 rounded-full border text-[11px] font-bold flex items-center gap-1 transition-all ${
              promptActive && showPromptBuilder 
                ? 'bg-purple-600/25 border-purple-500 text-purple-400' 
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:bg-neutral-850'
            }`}
            id="post-btn-prompt"
          >
            <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
            <span>Prompt</span>
          </button>
        </div>

        {/* Dynamic configuration drawers for Poll/Prompt */}
        {showPollBuilder && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase font-black text-blue-400 tracking-wider">Configure Interactive Poll</span>
              <button 
                onClick={() => setPollActive(!pollActive)}
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${pollActive ? 'bg-emerald-950 border border-emerald-900 text-emerald-400' : 'bg-red-950 border border-red-900 text-red-400'}`}
              >
                {pollActive ? '✓ Attached' : '✕ Detached'}
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                className="w-full bg-neutral-950 text-xs text-white rounded-lg p-2.5 border border-neutral-850 outline-none focus:border-blue-500"
                placeholder="Ask something..."
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  className="bg-neutral-950 text-xs text-neutral-300 rounded-lg p-2 border border-neutral-850 outline-none"
                  placeholder="Option 1"
                  value={pollOptions[0]}
                  onChange={(e) => setPollOptions([e.target.value, pollOptions[1]])}
                />
                <input
                  type="text"
                  className="bg-neutral-950 text-xs text-neutral-300 rounded-lg p-2 border border-neutral-850 outline-none"
                  placeholder="Option 2"
                  value={pollOptions[1]}
                  onChange={(e) => setPollOptions([pollOptions[0], e.target.value])}
                />
              </div>
            </div>
          </div>
        )}

        {showPromptBuilder && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] uppercase font-black text-purple-400 tracking-wider">Configure Q&A Prompt Card</span>
              <button 
                onClick={() => setPromptActive(!promptActive)}
                className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${promptActive ? 'bg-emerald-950 border border-emerald-900 text-emerald-400' : 'bg-red-950 border border-red-900 text-red-0.5'}`}
              >
                {promptActive ? '✓ Attached' : '✕ Detached'}
              </button>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                className="w-full bg-neutral-950 text-xs text-white rounded-lg p-2.5 border border-neutral-850 outline-none focus:border-purple-500"
                placeholder="Ask me a question..."
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
              />
              <p className="text-[9px] text-zinc-500 font-medium">Viewing citizens can send responses directory on your story deck.</p>
            </div>
          </div>
        )}

        {/* List of Settings matching picture exactly */}
        <div className="divide-y divide-neutral-900 border-y border-neutral-900 bg-neutral-950/20 rounded-xl overflow-hidden">
          
          {/* Row 1: Add Audio with classic arrow indicator and list */}
          <div className="p-3.5 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Music className="w-5 h-5 text-neutral-400 shrink-0" />
                <span className="text-sm font-semibold text-neutral-100">Add audio</span>
              </div>
              <div className="flex items-center gap-1.5">
                {selectedSong ? (
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-950/25 border border-blue-900/40 px-2 py-0.5 rounded-full">
                    ♬ {selectedSong.title}
                  </span>
                ) : (
                  <span className="text-xs text-neutral-500">None selected</span>
                )}
                <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0" />
              </div>
            </div>

            {/* Song Chips layout like original image preview */}
            <div className="flex gap-2 overflow-x-auto pb-1 pt-1.5">
              {DEFAULT_SONGS.map((song) => {
                const isSelected = selectedSong?.id === song.id;
                return (
                  <button
                    key={song.id}
                    onClick={() => handleSongSelect(song)}
                    className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-400 text-white shadow-md' 
                        : 'bg-neutral-900 border-neutral-850 text-neutral-400 hover:text-white hover:bg-neutral-850'
                    }`}
                  >
                    <span className="truncate max-w-[80px]">{song.artist}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="truncate max-w-[100px]">{song.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Tag people with interactive tagging */}
          <div className="p-3.5">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowTagInput(!showTagInput)}>
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-neutral-400 shrink-0" />
                <span className="text-sm font-semibold text-neutral-100">Tag people</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-1 overflow-x-auto max-w-[150px]">
                  {tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-mono bg-neutral-900 text-zinc-400 px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0" />
              </div>
            </div>

            {showTagInput && (
              <form onSubmit={handleAddTag} className="flex gap-2 mt-2 pt-1 animate-in slide-in-from-bottom duration-150">
                <input
                  type="text"
                  className="flex-1 bg-neutral-900 text-xs rounded-lg p-2 border border-neutral-800 outline-none focus:border-blue-500"
                  placeholder="e.g. @cr7, @messi, @voltagram_creator"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                />
                <button type="submit" className="bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-400 border border-neutral-700">
                  Add +
                </button>
              </form>
            )}
          </div>

          {/* Row 3: Add location with live prediction list */}
          <div className="p-3.5">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowLocationSelect(!showLocationSelect)}>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-neutral-400 shrink-0" />
                <span className="text-sm font-semibold text-neutral-100">Add location</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-blue-400">{selectedLocation || 'None'}</span>
                <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0" />
              </div>
            </div>

            {showLocationSelect && (
              <div className="mt-2 space-y-2 border-t border-neutral-900/50 pt-2 animate-in slide-in-from-bottom-2 duration-150">
                <input
                  type="text"
                  className="w-full bg-neutral-900 text-xs rounded-lg p-2 border border-neutral-850 outline-none focus:border-blue-500 placeholder:text-neutral-600"
                  placeholder="Search local or global cities..."
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                />
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {locationsMock.filter(loc => loc.toLowerCase().includes(locationInput.toLowerCase())).map((loc, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setShowLocationSelect(false);
                      }}
                      className="text-[10px] font-bold bg-neutral-900 hover:bg-neutral-850 text-zinc-300 px-2.5 py-1 rounded-full border border-neutral-800"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Row 4: Policy note matching picture description */}
          <div className="bg-black py-2.5 px-3.5">
            <p className="text-[10px] text-zinc-500 leading-normal font-medium max-w-sm">
              People you share this content with can see the location you tag and view this content on the map.
            </p>
          </div>

          {/* Row 5: Add AI label toggle */}
          <div className="p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-neutral-400 shrink-0" />
                <div>
                  <span className="text-sm font-semibold text-neutral-100 block">Add AI label</span>
                </div>
              </div>
              <button 
                onClick={() => setAiLabelOn(!aiLabelOn)}
                className="text-neutral-400 hover:text-white transition-all scale-110"
              >
                {aiLabelOn ? (
                  <ToggleRight className="w-9 h-9 text-blue-500" />
                ) : (
                  <ToggleLeft className="w-9 h-9 text-neutral-600" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 leading-normal font-medium max-w-xs pl-8">
              We require you to label certain realistic content that's made with AI. <strong className="text-blue-500/80 font-bold underline cursor-pointer">Learn more</strong>
            </p>
          </div>

        </div>

        {/* Big Blue Share Button - MATCHING PICTURE SCREENSHOT */}
        <div className="pt-2">
          <button
            onClick={onShare}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-extrabold text-xs tracking-widest rounded-xl transition-all shadow-xl uppercase cursor-pointer"
            id="post-btn-primary-share"
          >
            Share
          </button>
        </div>

      </div>

      {/* Embedded device base indicators matching physical layout */}
      <div className="w-full flex justify-center gap-1.5 py-3 border-t border-neutral-900 mt-auto bg-neutral-950/10">
        <div className="w-20 h-1.5 rounded-full bg-neutral-800" />
      </div>
    </div>
  );
}
