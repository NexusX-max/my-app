import React, { useState, useRef, useEffect } from 'react';
import { 
  Music, Type, Image as ImageIcon, Sparkles, Sliders, Maximize2, 
  Plus, Play, Pause, Trash2, Check, RotateCcw, Volume2, VolumeX, PlusCircle
} from 'lucide-react';
import { FILTERS } from '../data/templates';
import SongSelector from './SongSelector';
import { startSynthSession, stopSynthSession, playCameraClick, ensureAudioContext } from '../utils/audio';

export default function ReelsEditor({ 
  media, 
  setMedia, 
  onNext, 
  selectedSong, 
  setSelectedSong, 
  textOverlays, 
  setTextOverlays, 
  stickers, 
  setStickers, 
  activeFilter, 
  setActiveFilter, 
  filterStrength, 
  setFilterStrength, 
  adjustments, 
  setAdjustments, 
  canvasRatio, 
  setCanvasRatio,
  allClips,
  setAllClips,
  activeClipIndex,
  setActiveClipIndex
}) {
  // Navigation lists and sub-editors
  const [activeTab, setActiveTab] = useState(null); // 'audio' | 'text' | 'overlay' | 'filter' | 'edit' | 'ratio'
  const [showSongSelector, setShowSongSelector] = useState(false);
  
  // Track synthesizer state
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentNoteInfo, setCurrentNoteInfo] = useState(null);
  
  // Track video custom un-mute state (defaults to false so unmuted!)
  const [editorVideoMuted, setEditorVideoMuted] = useState(false);

  // Text editor state
  const [editingTextId, setEditingTextId] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textBgColor, setTextBgColor] = useState('rgba(0, 0, 0, 0.6)');
  const [textFont, setTextFont] = useState('font-sans'); // 'font-sans' | 'font-mono' | 'font-serif' | 'font-display'
  const [textFontSize, setTextFontSize] = useState(20);

  // Dragging states
  const [dragItem, setDragItem] = useState(null); // { type: 'text' | 'sticker', id: string }
  const canvasRef = useRef(null);

  // Autoplay or restart music if selected
  useEffect(() => {
    if (selectedSong && isPlaying) {
      startSynthSession(selectedSong.id, (note) => {
        setCurrentNoteInfo(note);
      });
    } else {
      stopSynthSession();
    }
    return () => stopSynthSession();
  }, [selectedSong, isPlaying]);

  const handleTogglePlay = () => {
    ensureAudioContext();
    setIsPlaying(!isPlaying);
  };

  const selectSong = (song) => {
    ensureAudioContext();
    setSelectedSong(song);
    setIsPlaying(true);
    setShowSongSelector(false);
  };

  // Sticker/Overlay handler
  const addSticker = (emoji) => {
    const newSticker = {
      id: 'sticker_' + Date.now(),
      emoji: emoji,
      x: 40 + Math.random() * 20, // percentage
      y: 40 + Math.random() * 20,
      scale: 1.5,
    };
    setStickers([...stickers, newSticker]);
    playCameraClick();
  };

  // Text layer handler
  const handleAddOrSaveText = () => {
    if (!textInput.trim()) return;

    if (editingTextId) {
      // Update existing text with custom size
      setTextOverlays(textOverlays.map(t => 
        t.id === editingTextId 
          ? { ...t, text: textInput, color: textColor, bg: textBgColor, font: textFont, size: textFontSize }
          : t
      ));
      setEditingTextId(null);
    } else {
      // Create new text containing custom size
      const newText = {
        id: 'text_' + Date.now(),
        text: textInput,
        color: textColor,
        bg: textBgColor,
        font: textFont,
        size: textFontSize,
        x: 35 + Math.random() * 10,
        y: 45 + Math.random() * 10,
        rotation: 0
      };
      setTextOverlays([...textOverlays, newText]);
    }
    setTextInput('');
    setEditingTextId(null);
    setTextFontSize(20);
    setActiveTab(null);
    playCameraClick();
  };

  const removeText = (id) => {
    setTextOverlays(textOverlays.filter(t => t.id !== id));
    setEditingTextId(null);
    setTextInput('');
  };

  const removeSticker = (id) => {
    setStickers(stickers.filter(s => s.id !== id));
  };

  // Drag elements on canvas percentage coordinates supporting touch and mouse drag-and-drop
  const handleDragStart = (e, type, id) => {
    e.stopPropagation();
    setDragItem({ type, id });
  };

  const handleCanvasMouseMove = (e) => {
    if (!dragItem || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    
    // Calculate percentage relative to the canvas container
    const x = ((e.clientX - canvasRect.left) / canvasRect.width) * 100;
    const y = ((e.clientY - canvasRect.top) / canvasRect.height) * 100;

    // keep within boundaries
    const cleanX = Math.max(5, Math.min(x, 95));
    const cleanY = Math.max(5, Math.min(y, 95));

    if (dragItem.type === 'text') {
      setTextOverlays(textOverlays.map(t => t.id === dragItem.id ? { ...t, x: cleanX, y: cleanY } : t));
    } else if (dragItem.type === 'sticker') {
      setStickers(stickers.map(s => s.id === dragItem.id ? { ...s, x: cleanX, y: cleanY } : s));
    }
  };

  const handleCanvasTouchMove = (e) => {
    if (!dragItem || !canvasRef.current) return;
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    
    // Calculate percentage relative to the canvas container
    const x = ((touch.clientX - canvasRect.left) / canvasRect.width) * 100;
    const y = ((touch.clientY - canvasRect.top) / canvasRect.height) * 100;

    // keep within boundaries
    const cleanX = Math.max(5, Math.min(x, 95));
    const cleanY = Math.max(5, Math.min(y, 95));

    if (dragItem.type === 'text') {
      setTextOverlays(textOverlays.map(t => t.id === dragItem.id ? { ...t, x: cleanX, y: cleanY } : t));
    } else if (dragItem.type === 'sticker') {
      setStickers(stickers.map(s => s.id === dragItem.id ? { ...s, x: cleanX, y: cleanY } : s));
    }
  };

  const handleDragEnd = () => {
    setDragItem(null);
  };

  // Dynamic filter combination format helper
  const getCombinedFilterStyle = () => {
    const filterObj = FILTERS.find(f => f.id === activeFilter);
    const filterBase = filterObj ? filterObj.filterStyle : 'none';
    
    // Manual adjustments overlay
    const b = adjustments.brightness;
    const c = adjustments.contrast;
    const s = adjustments.saturation;
    const bl = adjustments.blur;
    
    const adjustmentString = `brightness(${b}%) contrast(${c}%) saturate(${s}%) blur(${bl}px)`;
    
    if (filterBase === 'none') return adjustmentString;
    
    // Blend filter code with adjustments
    return `${filterBase} ${adjustmentString}`;
  };

  // Handle uploaded template/image/video file
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type.startsWith('video/') ? 'video' : 'image';
      const fileURL = URL.createObjectURL(file);
      
      const newClip = {
        id: 'uploaded_' + Date.now(),
        name: file.name || (fileType === 'video' ? 'My Video' : 'My Photo'),
        type: fileType,
        aspectRatio: canvasRatio || '9:16',
        thumbnail: fileType === 'video' 
          ? 'https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?w=150&q=80' 
          : fileURL,
        url: fileURL
      };
      
      const updatedClips = [...allClips, newClip];
      setAllClips(updatedClips);
      setActiveClipIndex(updatedClips.length - 1);
      setMedia(newClip);
      playCameraClick();
    }
  };

  // Switch preset clip template
  const handleSelectClip = (index) => {
    setActiveClipIndex(index);
    setMedia(allClips[index]);
  };

  // Delete clip standard helper
  const handleDeleteClip = (index, e) => {
    e.stopPropagation();
    const updated = allClips.filter((_, i) => i !== index);
    setAllClips(updated);
    if (updated.length === 0) {
      setActiveClipIndex(-1);
      setMedia(null);
    } else {
      const nextIdx = Math.max(0, index - 1);
      setActiveClipIndex(nextIdx);
      setMedia(updated[nextIdx]);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-0 h-full overflow-hidden select-none relative">
      
      {/* Top Banner - Suggested Audio and Song Control */}
      {selectedSong ? (
        <div className="bg-neutral-900/90 border-b border-neutral-800/60 py-2.5 px-4 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[10px] text-zinc-500 block uppercase tracking-wider font-bold">Suggested Audio playing</span>
              <p className="text-xs font-semibold text-neutral-100 truncate flex items-center gap-1.5 marquee-text">
                <Music className="w-3 h-3 text-blue-400 shrink-0" />
                {selectedSong.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Visualizer Wave */}
            {isPlaying && (
              <div className="flex items-end gap-[2px] h-3.5 px-1 shrink-0">
                <div className="w-[2px] bg-blue-400 h-1.5 rounded-full animate-[pulse_0.4s_infinite_alternate]" />
                <div className="w-[2px] bg-blue-400 h-3 rounded-full animate-[pulse_0.6s_infinite_alternate_0.2s]" />
                <div className="w-[2px] bg-blue-400 h-2 rounded-full animate-[pulse_0.5s_infinite_alternate_0.1s]" />
                <div className="w-[2px] bg-blue-400 h-3.5 rounded-full animate-[pulse_0.7s_infinite_alternate_0.3s]" />
              </div>
            )}
            <button 
              onClick={handleTogglePlay}
              className="p-1.5 bg-neutral-800 rounded-full text-white hover:bg-neutral-700 transition-all focus:outline-none"
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
            <button 
              onClick={() => setShowSongSelector(true)}
              className="text-[11px] bg-blue-600 hover:bg-blue-500 text-white font-medium px-2.5 py-1 rounded-full transition-all shrink-0"
            >
              Change
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-neutral-900/90 border-b border-neutral-800/60 py-2.5 px-4 flex items-center justify-between">
          <p className="text-xs text-zinc-400 font-medium">✨ Add cool atmospheric sound loops!</p>
          <button 
            onClick={() => setShowSongSelector(true)}
            className="text-[11px] bg-neutral-800 border border-neutral-700 hover:bg-neutral-700 text-white font-medium px-3 py-1 rounded-full flex items-center gap-1 transition-all"
          >
            <Music className="w-3" /> Add Audio
          </button>
        </div>
      )}

      {/* Main Reels Editor Space Container Box */}
      <div className="flex-1 flex items-center justify-center bg-black relative p-3">
        
        {/* Safe Content Frame with Adjustable Ratio */}
        <div 
          ref={canvasRef}
          onClick={() => {
            if (activeTab === 'text') setActiveTab(null);
          }}
          onTouchMove={handleCanvasTouchMove}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchEnd={handleDragEnd}
          className="relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border border-neutral-900 bg-[#0c0c0e] flex items-center justify-center group"
          style={{
            width: '100%',
            height: '100%',
            aspectRatio: canvasRatio === '9:16' ? '9/16' : canvasRatio === '1:1' ? '1/1' : canvasRatio === '4:5' ? '4/5' : '16/9',
            maxHeight: '430px', 
            maxWidth: canvasRatio === '9:16' ? '242px' : canvasRatio === '1:1' ? '430px' : canvasRatio === '4:5' ? '344px' : '100%'
          }}
        >
          {!media ? (
            <div className="w-full h-full flex flex-col justify-center items-center p-4 text-center select-none bg-neutral-950/80 border-2 border-dashed border-neutral-800 rounded-3xl">
              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white/50 mb-3 animate-pulse">
                <PlusCircle className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-white font-extrabold text-sm tracking-wide">Voltagram Reels</h3>
              <p className="text-zinc-550 text-[10px] leading-relaxed mt-1 max-w-[190px]">
                Enter live studio mode! Upload your own photo or video to begin editing:
              </p>
              
              <label className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-505 hover:to-indigo-505 active:scale-95 text-white font-extrabold text-[11px] px-4 py-2.5 rounded-full transition-all cursor-pointer shadow-md shadow-blue-900/20 flex items-center gap-1.5 justify-center">
                <Plus className="w-4 h-4" />
                <span>Upload Photo / Video</span>
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  onChange={handleImageUpload} 
                  className="hidden" 
                />
              </label>
              
              <span className="text-[8px] text-zinc-600 mt-2 hover:text-zinc-550">Supports MP4, MOV, JPG, PNG, WEBP</span>
            </div>
          ) : (
            <>
              {/* Main Visual background element representing dynamic styles */}
              <div 
                className="w-full h-full flex flex-col justify-center items-center relative overflow-hidden transition-all"
                style={{ filter: getCombinedFilterStyle() }}
              >
                {media?.type === 'match_card' ? (
                  /* High-fidelity CSS Reconstruction of Post Screenshot FIFA Card */
                  <div className="w-full h-full bg-[#0d0e13] p-4 text-white flex flex-col justify-between">
                    
                    {/* Upper Details */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold tracking-tight text-neutral-100 flex items-center gap-1">
                          {media.data.league}
                          <span className="text-[10px] text-neutral-400 font-normal">➔</span>
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          {media.data.sub}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button className="text-white hover:opacity-80 p-1">
                          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
                            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                          </svg>
                        </button>
                        <button className="bg-blue-500 text-[10px] text-white font-semibold px-2.5 py-0.5 rounded-full hover:bg-blue-600 transition-colors">
                          Follow
                        </button>
                      </div>
                    </div>

                    {/* Main Score Centerpiece with Flags! */}
                    <div className="flex items-center justify-between px-2 py-4 flex-1">
                      {/* Brazil Flag Side */}
                      <div className="flex flex-col items-center justify-center gap-2 w-[35%]">
                        <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-4xl shadow-md select-none transform hover:scale-105 transition-transform duration-200">
                          {media.data.teamA.flag}
                        </div>
                        <span className="font-bold text-sm tracking-wide">{media.data.teamA.name}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${media.data.teamA.rankColor}`}>
                          {media.data.teamA.rank}
                        </span>
                      </div>

                      {/* Intermediary Score numbers (3 - 0) */}
                      <div className="flex items-center justify-center gap-3 w-[30%]">
                        <span className="text-4xl font-extrabold font-mono text-white tracking-widest">{media.data.teamA.score}</span>
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <span className="text-[9px] bg-neutral-800 text-neutral-300 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider text-center scale-90">Full-time</span>
                          <span className="text-[8px] text-neutral-500 font-bold">{media.data.time}</span>
                        </div>
                        <span className="text-4xl font-extrabold font-mono text-white/50 tracking-widest">{media.data.teamB.score}</span>
                      </div>

                      {/* Haiti Flag Side */}
                      <div className="flex flex-col items-center justify-center gap-2 w-[35%]">
                        <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-4xl shadow-md select-none transform hover:scale-105 transition-transform duration-200">
                          {media.data.teamB.flag}
                        </div>
                        <span className="font-bold text-sm tracking-wide text-neutral-300">{media.data.teamB.name}</span>
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${media.data.teamB.rankColor}`}>
                          {media.data.teamB.rank}
                        </span>
                      </div>
                    </div>

                    {/* Watermark branding */}
                    <div className="pb-1 border-t border-neutral-900 pt-2 flex items-center justify-between text-[10px] text-neutral-600 font-mono">
                      <span>⚽ FIBA VOLTAGRAM REELS LIVE</span>
                      <span className="bg-yellow-500/10 text-yellow-500/80 px-1.5 py-0.5 rounded text-[8px] font-bold">STADIUM PREVIEW</span>
                    </div>

                  </div>
                ) : media?.type === 'video' ? (
                  /* Custom video clips playing smoothly with optional live unmute */
                  <div className="w-full h-full relative">
                    <video 
                      src={media?.url} 
                      className="w-full h-full object-cover select-none animate-fade-in"
                      controls={false}
                      autoPlay 
                      loop 
                      muted={editorVideoMuted} 
                      playsInline
                    />
                    {/* Audio speaker activator overlay */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        ensureAudioContext();
                        setEditorVideoMuted(!editorVideoMuted);
                      }}
                      className="absolute top-2 right-2 bg-black/60 hover:bg-black p-1.5 rounded-full text-white z-40 transition-all border border-white/10"
                      title={editorVideoMuted ? 'Unmute video sound' : 'Mute video sound'}
                    >
                      {editorVideoMuted ? (
                        <VolumeX className="w-3.5 h-3.5 text-zinc-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                      )}
                    </button>
                    {/* Ambient vignette shading */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                  </div>
                ) : (
                  /* Custom dynamic cover template photo or uploaded image */
                  <div className="w-full h-full relative group">
                    <img 
                      src={media?.url || media?.thumbnail} 
                      alt="Voltagram media"
                      className="w-full h-full object-cover select-none pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Ambient vignette shading */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Draggable TEXT Layers OVERLAY */}
              {textOverlays.map((layer) => (
                <div
                  key={layer.id}
                  onTouchStart={(e) => handleDragStart(e, 'text', layer.id)}
                  onMouseDown={(e) => handleDragStart(e, 'text', layer.id)}
                  className={`absolute cursor-move select-none p-1.5 px-3 rounded-lg text-center font-bold break-all max-w-[85%] border border-transparent hover:border-white/40 active:scale-95 transition-all ${layer.font}`}
                  style={{
                    left: `${layer.x}%`,
                    top: `${layer.y}%`,
                    transform: 'translate(-50%, -50%)',
                    color: layer.color,
                    backgroundColor: layer.bg,
                    fontSize: `${layer.size || 20}px`,
                    zIndex: 30,
                  }}
                  onDoubleClick={() => {
                    setEditingTextId(layer.id);
                    setTextInput(layer.text);
                    setTextColor(layer.color);
                    setTextBgColor(layer.bg);
                    setTextFont(layer.font);
                    setTextFontSize(layer.size || 20);
                    setActiveTab('text');
                  }}
                >
                  {layer.text}
                  {/* Explicit close button for deleting overlay instantly */}
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeText(layer.id);
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 hover:bg-red-500 text-[10px] text-white rounded-full flex items-center justify-center border border-black/70 shadow-lg cursor-pointer pointer-events-auto"
                    title="Delete layer"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Draggable EMOJI/STICKER Layers OVERLAY */}
              {stickers.map((stk) => (
                <div
                  key={stk.id}
                  onTouchStart={(e) => handleDragStart(e, 'sticker', stk.id)}
                  onMouseDown={(e) => handleDragStart(e, 'sticker', stk.id)}
                  className="absolute text-4xl select-none cursor-move active:scale-[1.1] transition-transform p-2 hover:bg-white/20 rounded-md"
                  style={{
                    left: `${stk.x}%`,
                    top: `${stk.y}%`,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 29,
                  }}
                  onDoubleClick={() => removeSticker(stk.id)}
                >
                  {stk.emoji}
                  {/* Explicit close button for deleting sticker instantly */}
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSticker(stk.id);
                    }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 hover:bg-red-500 text-[8px] text-white rounded-full flex items-center justify-center border border-black/70 shadow-lg cursor-pointer pointer-events-auto"
                    title="Delete sticker"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Live Audio pulse circle indicator on canvas */}
              {isPlaying && currentNoteInfo && (
                <div className="absolute bottom-4 left-4 z-40 pointer-events-none flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  <span className="text-[10px] text-white/95 font-mono tracking-tight uppercase">
                    {currentNoteInfo.label} Synth Tone
                  </span>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Slide drawers based on editing tools selected */}
      <div className="bg-neutral-950 px-4 pt-1 pb-2">
        {activeTab === 'audio' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold text-neutral-250 flex items-center gap-1.5 uppercase tracking-wide">
                <Music className="w-3.5 h-3.5 text-blue-400" /> Synth Audio Controller
              </span>
              <button 
                onClick={() => setActiveTab(null)} 
                className="text-[10px] uppercase font-black px-2.5 py-1 rounded-md bg-neutral-950 text-blue-400 border border-blue-900/40 hover:bg-neutral-800 hover:text-white transition-all flex items-center gap-1"
              >
                ✕ Close
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1 text-[11px]"><Volume2 className="w-3.5" /> Soundtrack Master Gain</span>
                <span>Active Synth Loop</span>
              </div>
              <p className="text-[10px] text-zinc-500 leading-relaxed">
                Music selection is configured. Tap <strong className="text-blue-400">"Change"</strong> above to test other retro-classic synth frequencies or adjust parameters below.
              </p>
            </div>
          </div>
        )}

        {/* Text Input Drawer */}
        {activeTab === 'text' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold text-neutral-100 flex items-center gap-1.5 uppercase tracking-wider">
                <Type className="w-3.5 h-3.5 text-blue-400" /> {editingTextId ? 'Edit Text Layer' : 'Add Text Layer'}
              </span>
              <div className="flex items-center gap-2">
                {editingTextId && (
                  <button 
                    onClick={() => removeText(editingTextId)}
                    className="text-[10px] text-red-400 border border-red-950/50 bg-red-950/20 px-2.5 py-1 rounded-md font-bold hover:bg-red-950 transition-all text-xs"
                  >
                    Delete
                  </button>
                )}
                <button 
                  onClick={() => {
                    setTextInput('');
                    setEditingTextId(null);
                    setActiveTab(null);
                  }} 
                  className="text-[10px] uppercase font-black px-2.5 py-1 rounded-md bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white transition-all flex items-center gap-1"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {/* Type Input Box */}
              <input
                type="text"
                placeholder="Type dynamic text here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddOrSaveText();
                  }
                }}
                className="w-full bg-neutral-950 text-white rounded-xl px-3.5 py-2.5 text-sm ring-1 ring-neutral-800 outline-none focus:ring-blue-500/50 transition-all font-semibold"
                autoFocus
              />

              {/* Dynamic Font Sizing (oto boro kora jabe!) */}
              <div className="bg-neutral-950/40 p-2.5 rounded-xl border border-neutral-850">
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 mb-1.5">
                  <span className="flex items-center gap-1">Text Font Size / Scale:</span>
                  <span className="font-mono text-blue-400 text-xs">{textFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="64"
                  value={textFontSize}
                  onChange={(e) => setTextFontSize(parseInt(e.target.value))}
                  className="w-full h-1 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-blue-500 outline-none"
                />
              </div>

              {/* Fonts / Colors Controls row */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                {/* Font Preset Chips */}
                <div className="flex gap-1.5 shrink-0">
                  {[
                    { style: 'font-sans', label: 'Classic' },
                    { style: 'font-mono', label: 'Neon Mono' },
                    { style: 'font-serif', label: 'Elegant' },
                    { style: 'font-extrabold tracking-tight', label: 'Strong' }
                  ].map(f => (
                    <button
                      key={f.style}
                      onClick={() => setTextFont(f.style)}
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all ${
                        textFont === f.style ? 'bg-white text-black' : 'bg-neutral-850 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Color Buttons */}
                <div className="flex gap-2 shrink-0">
                  {[
                    { color: '#ffffff', bg: 'rgba(0,0,0,0.6)' },
                    { color: '#f39c12', bg: 'rgba(255,255,255,0.9)' },
                    { color: '#2ecc71', bg: 'rgba(0,0,0,0.7)' },
                    { color: '#e74c3c', bg: 'rgba(0,0,0,0.7)' },
                    { color: '#3498db', bg: 'rgba(255,255,255,0.95)' }
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setTextColor(preset.color);
                        setTextBgColor(preset.bg);
                      }}
                      className="w-5 h-5 rounded-full border border-neutral-700 hover:scale-110 active:scale-95 transition-all"
                      style={{ backgroundColor: preset.color }}
                    />
                  ))}
                </div>
              </div>

              {/* Submit Save Text */}
              <button
                onClick={handleAddOrSaveText}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1 shadow-md"
              >
                <Check className="w-4 h-4" /> Done / Save Text Layer
              </button>
            </div>
          </div>
        )}

        {/* Sticker Overlay Selector Drawer */}
        {activeTab === 'overlay' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold text-neutral-250 flex items-center gap-1.5 uppercase tracking-wide">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" /> Voltagram Emoji Stamps
              </span>
              <button 
                onClick={() => setActiveTab(null)} 
                className="text-[10px] uppercase font-black px-2.5 py-1 rounded-md bg-neutral-950 text-blue-400 border border-blue-900/40 hover:bg-neutral-800 hover:text-white transition-all flex items-center gap-1"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 mb-3">Tap an stamp to stamp it on the viewport. Double tap layers on canvas to delete them!</p>
            <div className="grid grid-cols-8 gap-2.5">
              {['🔥', '🏆', '👀', '🇧🇷', '🇭🇹', '⚽', '✨', '😂', '🙌', '💯', '🌈', '🚨', '🎵', '🍉', '🍕', '💻'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addSticker(emoji)}
                  className="bg-neutral-950 hover:bg-neutral-800 p-2.5 rounded-xl text-2xl text-center active:scale-90 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Filters Drawer (Screenshot 3 Matching!) */}
        {activeTab === 'filter' && (
          <div className="bg-neutral-905 border border-neutral-900/80 rounded-2xl p-3.5 mb-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold text-neutral-100 flex items-center gap-1.5 tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Choose Filter Preset
              </span>
              <button 
                onClick={() => setActiveTab(null)} 
                className="text-[10px] uppercase font-black px-2.5 py-1 rounded-md bg-blue-900/20 text-blue-400 border border-blue-900/50 hover:bg-blue-900 hover:text-white transition-all flex items-center gap-1"
              >
                ✓ Done
              </button>
            </div>

            {/* Strength Intensity Drag Slider */}
            <div className="mb-4">
              <div className="flex justify-between items-center text-[10px] text-neutral-400 mb-1">
                <span>Filter Intensity:</span>
                <span className="font-mono text-white/90">{filterStrength}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={filterStrength}
                onChange={(e) => setFilterStrength(parseInt(e.target.value))}
                className="w-full accent-blue-500 h-1 bg-neutral-800 rounded-lg appearance-none outline-none"
              />
            </div>

            {/* List horizontal slide scroll */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {FILTERS.map((f) => {
                const isSelected = activeFilter === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setActiveFilter(f.id);
                      playCameraClick();
                    }}
                    className={`flex flex-col items-center gap-1.5 shrink-0 focus:outline-none`}
                  >
                    {/* Visual filter box */}
                    <div 
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 relative bg-zinc-900 ${
                        isSelected ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/20' : 'border-neutral-800 hover:border-neutral-700'
                      }`}
                    >
                      <img 
                        src={media?.thumbnail} 
                        alt={f.name}
                        className="w-full h-full object-cover select-none pointer-events-none"
                        style={{ filter: f.filterStyle }}
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
                          <Check className="w-5 h-5 text-blue-500" />
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold ${isSelected ? 'text-blue-400' : 'text-neutral-500'}`}>
                      {f.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <span className="text-[8.5px] text-zinc-600 block text-center mt-1 uppercase tracking-wide">Double tap active thumbnail to adjust baseline settings</span>
          </div>
        )}

        {/* Adjust Drawer */}
        {activeTab === 'edit' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200 text-neutral-300">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold text-neutral-100 uppercase tracking-widest flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-400" /> Image Calibration
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setAdjustments({ brightness: 100, contrast: 100, saturation: 100, blur: 0 });
                  }}
                  className="text-[9px] text-yellow-600 font-extrabold tracking-tight hover:text-yellow-500 bg-yellow-950/20 border border-yellow-900/40 px-2 py-1 rounded-md flex items-center gap-1 transition-all"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> RESET
                </button>
                <button 
                  onClick={() => setActiveTab(null)} 
                  className="text-[10px] uppercase font-black px-2.5 py-1 rounded-md bg-neutral-950 text-blue-400 border border-blue-900/50 hover:bg-neutral-800 transition-all flex items-center gap-1"
                >
                  ✓ Done
                </button>
              </div>
            </div>

            {/* Brightness, Contrast, Saturation sliders */}
            <div className="space-y-3 pb-1">
              <div>
                <div className="flex justify-between text-[10px] mb-0.5 font-bold">
                  <span>Brightness:</span>
                  <span className="text-white font-mono">{adjustments.brightness}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="170"
                  value={adjustments.brightness}
                  onChange={(e) => setAdjustments({ ...adjustments, brightness: parseInt(e.target.value) })}
                  className="w-full accent-blue-500 h-1 bg-neutral-800 rounded-lg appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-0.5 font-bold">
                  <span>Contrast:</span>
                  <span className="text-white font-mono">{adjustments.contrast}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="160"
                  value={adjustments.contrast}
                  onChange={(e) => setAdjustments({ ...adjustments, contrast: parseInt(e.target.value) })}
                  className="w-full accent-blue-500 h-1 bg-neutral-800 rounded-lg appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-0.5 font-bold">
                  <span>Saturation:</span>
                  <span className="text-white font-mono">{adjustments.saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={adjustments.saturation}
                  onChange={(e) => setAdjustments({ ...adjustments, saturation: parseInt(e.target.value) })}
                  className="w-full accent-blue-500 h-1 bg-neutral-800 rounded-lg appearance-none"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] mb-0.5 font-bold">
                  <span>Dynamic Blur Layout:</span>
                  <span className="text-white font-mono">{adjustments.blur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={adjustments.blur}
                  onChange={(e) => setAdjustments({ ...adjustments, blur: parseInt(e.target.value) })}
                  className="w-full accent-blue-500 h-1 bg-neutral-800 rounded-lg appearance-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Ratio Selector Drawer */}
        {activeTab === 'ratio' && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold text-neutral-255 flex items-center gap-1.5 uppercase">
                <Maximize2 className="w-3.5 h-3.5 text-blue-400" /> Aspect Ratio
              </span>
              <button 
                onClick={() => setActiveTab(null)} 
                className="text-[10px] uppercase font-black px-2.5 py-1 rounded-md bg-neutral-950 text-blue-400 border border-blue-900/50 hover:bg-neutral-800 hover:text-white transition-all flex items-center gap-1"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {[
                { ratio: '9:16', label: '9:16 Reels', desc: 'Full Screen' },
                { ratio: '1:1', label: '1:1 Square', desc: 'Feed Post' },
                { ratio: '4:5', label: '4:5 Portrait', desc: 'Standard' },
                { ratio: '16:9', label: '16:9 Wide', desc: 'Landscape' }
              ].map((r) => {
                const isActive = canvasRatio === r.ratio;
                return (
                  <button
                    key={r.ratio}
                    onClick={() => {
                      setCanvasRatio(r.ratio);
                      playCameraClick();
                    }}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                      isActive 
                        ? 'border-blue-500 bg-blue-500/10 text-white' 
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-bold">{r.ratio}</span>
                    <span className="text-[9px] mt-0.5 opacity-80">{r.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER: Interactive Reels Edit Bar + Clip Row */}
      <div className="bg-neutral-950 border-t border-neutral-900/80 p-3 pt-2.5 pb-4 space-y-3.5 z-25 relative">
        
        {/* EDIT BAR BUTTONS (SAME TO SAME SCREENSHOT 1) */}
        <div className="grid grid-cols-6 gap-1">
          {[
            { id: 'audio', icon: Music, label: 'Audio' },
            { id: 'text', icon: Type, label: 'Text' },
            { id: 'overlay', icon: ImageIcon, label: 'Overlay' },
            { id: 'filter', icon: Sparkles, label: 'Filter' },
            { id: 'edit', icon: Sliders, label: 'Edit' },
            { id: 'ratio', icon: Maximize2, label: 'Ratio' }
          ].map((btn) => {
            const isActive = activeTab === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => {
                  setActiveTab(activeTab === btn.id ? null : btn.id);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all focus:outline-none ${
                  isActive 
                    ? 'bg-blue-600/20 text-blue-400 scale-105 border border-blue-900/60' 
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/50'
                }`}
              >
                <btn.icon className="w-5 h-5 mb-1 shrink-0" />
                <span className="text-[10px] font-semibold tracking-tight">{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* TIMELINE ROW (BOTTOM SCREENSHOT 1) */}
        <div className="flex items-center justify-between gap-3 pt-1 border-t border-neutral-900/40">
          
          {/* List of Clips */}
          <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-[70%]">
            {allClips.map((clip, idx) => {
              const isSelected = idx === activeClipIndex;
              return (
                <div 
                  key={clip.id}
                  onClick={() => handleSelectClip(idx)}
                  className={`relative w-12 h-14 rounded-xl cursor-pointer overflow-hidden transition-all shrink-0 ${
                    isSelected 
                      ? 'ring-2 ring-white scale-102 shadow-lg shadow-white/10' 
                      : 'opacity-60 hover:opacity-90 border border-neutral-800'
                  }`}
                >
                  {clip.type === 'video' ? (
                    <div className="w-full h-full bg-neutral-900 flex items-center justify-center relative">
                      <video src={clip.url} className="w-full h-full object-cover opacity-70" muted playsInline />
                      <div className="absolute inset-0 bg-blue-600/25 flex items-center justify-center">
                        <span className="w-4 h-4 bg-white rounded-full flex items-center justify-center text-[8px] pl-[1.5px] text-slate-900 font-extrabold shadow-sm">&#9658;</span>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={clip.thumbnail} 
                      alt={`clip ${idx}`} 
                      className="w-full h-full object-cover select-none pointer-events-none"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {allClips.length > 1 && (
                    <button 
                      onClick={(e) => handleDeleteClip(idx, e)}
                      className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-red-650 p-0.5 rounded-full text-white transition-all scale-75"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {/* Aspect tag info */}
                  <span className="absolute bottom-0 text-[7px] text-center w-full bg-black/50 text-white select-none scale-90">
                    {clip.aspectRatio}
                  </span>
                </div>
              );
            })}

            {/* Custom file upload action simulating adding clips */}
            <label className="relative w-12 h-14 rounded-xl border border-dashed border-neutral-700 flex flex-col items-center justify-center text-neutral-500 hover:text-white hover:border-neutral-500 cursor-pointer transition-all shrink-0 bg-neutral-900/30">
              <Plus className="w-4 h-4" />
              <span className="text-[8px] tracking-tight uppercase scale-90 mt-0.5 font-bold">Add</span>
              <input 
                type="file" 
                accept="image/*,video/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
            </label>
          </div>

          {/* NEXT TRIGGER BUTTON (BLUE IN SCREENSHOT 1) */}
          <button
            onClick={() => {
              if (!media) return;
              playCameraClick();
              onNext();
            }}
            disabled={!media}
            className={`text-xs font-bold px-7 py-2.5 rounded-full transition-all flex items-center gap-1 font-sans tracking-wide shrink-0 ${
              media 
                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-900/30' 
                : 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
            }`}
          >
            Next
          </button>
        </div>

      </div>

      {/* Floating Audio Selecting Modal */}
      {showSongSelector && (
        <SongSelector
          currentSong={selectedSong}
          onSelectSong={selectSong}
          onClose={() => setShowSongSelector(false)}
        />
      )}
    </div>
  );
}
