import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Shield, Users, MessageSquareCode, Zap, Volume2, 
  VolumeX, PhoneCall, Video, Settings, Ban, Trash2, Radio, Plus, Film, ChevronRight, ChevronLeft, X, Send, Eye, Network
} from 'lucide-react';

const GROUP_AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=300&q=80"
];

const Sidebar = ({
  chatList = [],
  groupList = [],
  activeTab,
  setActiveTab,
  selectedChatId,
  setSelectedChatId,
  searchQuery,
  setSearchQuery,
  onInitiateCall,
  onOpenSettings,
  onOpenSearchScreen,
  ambientSound,
  setAmbientSound,
  userProfile,
  latencySpeed,
  searchedNodes = [],
  onConnectUser,
  showSettingsView,
  showSearchScreen,
  onCreateGroup,
  onToggleMute,
  onToggleBlock,
  onDeleteChat,
  switchUser,
  stories = [],
  onAddStory = () => {},
  channelsList = [],
  onCreateChannel = () => {},
  onJoinChannel = () => {}
}) => {
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [selectedAvatarPreset, setSelectedAvatarPreset] = useState(GROUP_AVATAR_PRESETS[0]);
  const [selectedInvites, setSelectedInvites] = useState([]);

  // States and refs for 2-second hold-to-secure options
  const [holdingChatId, setHoldingChatId] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [activeOptionMenuChat, setActiveOptionMenuChat] = useState(null);

  const progressIntervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const hasTriggeredRef = useRef(false);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [selectedChannelAvatar, setSelectedChannelAvatar] = useState("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80");

  const handleStartHold = (e, chat) => {
    // Only target direct primary click or touch actions
    if (e.type === 'mousedown' && e.button !== 0) return;

    handleCancelHold();

    hasTriggeredRef.current = false;
    startTimeRef.current = Date.now();
    setHoldingChatId(chat.id);
    setHoldProgress(0);

    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }

    const duration = 2000; // 2 seconds
    const intervalTime = 40;
    let currentProgress = 0;

    progressIntervalRef.current = setInterval(() => {
      currentProgress += (intervalTime / duration) * 100;
      if (currentProgress >= 100) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
        setHoldProgress(100);
        hasTriggeredRef.current = true;

        if (window.navigator?.vibrate) {
          window.navigator.vibrate(40);
        }

        setActiveOptionMenuChat(chat);
        setHoldingChatId(null);
        setHoldProgress(0);
      } else {
        setHoldProgress(currentProgress);
      }
    }, intervalTime);
  };

  const handleCancelHold = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setHoldingChatId(null);
    setHoldProgress(0);
  };

  const handleTouchMove = (e) => {
    if (!holdingChatId) return;
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 15) {
        handleCancelHold();
      }
    }
  };

  const handleRelease = (e, chat) => {
    if (e.type === 'mouseup' && e.button !== 0) return;

    const elapsed = Date.now() - startTimeRef.current;
    handleCancelHold();

    // Standard single tap / click selection
    if (!hasTriggeredRef.current && elapsed < 2000) {
      setSelectedChatId(chat.id);
    }
  };

  // Filter list based on searchQuery
  const filteredChats = chatList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.lastMsg.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groupList.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    g.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="sidebar-container" className={`w-full md:w-[380px] h-full border-r border-[#222e35] bg-[#111b21] flex flex-col shrink-0 overflow-hidden relative font-sans ${
      (selectedChatId || showSettingsView || showSearchScreen) ? 'hidden md:flex' : 'flex'
    }`}>
      
      {/* Header Info Banner */}
      <header className="p-4 bg-[#202c33] flex flex-col gap-3.5 shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5 select-none">
              <span className="text-[#00a884] font-extrabold">WhatsApp</span>
              <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-[#111b21] border border-[#222e35] text-[#00a884] font-bold tracking-wider uppercase">
                Onyx Secure
              </span>
            </span>
          </div>
          
          {/* Quick Profile Link */}
          <div 
            onClick={onOpenSettings} 
            className="flex items-center gap-2 bg-[#111b21] hover:bg-[#111b21]/80 p-1.5 pr-3 rounded-xl border border-[#222e35] cursor-pointer active:scale-95 transition-transform group"
          >
            <img 
              src={userProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
              className="w-7 h-7 rounded-lg object-cover border border-[#222e35] group-hover:border-[#00a884] transition-all" 
              alt="Avatar" 
              referrerPolicy="no-referrer"
            />
            <span className="text-[10px] uppercase font-bold tracking-wide text-zinc-300 truncate max-w-[70px]">
              {userProfile.name?.split(' ')[0] || "Operator"}
            </span>
          </div>
        </div>

        {/* Identity Selector */}
        <div className="bg-[#111b21] border border-[#222e35] rounded-xl p-2.5 space-y-1.5 flex flex-col">
          <span className="text-[9px] font-bold text-[#00a884] uppercase tracking-wider block">
            🪐 Switch Profile Identity:
          </span>
          <div className="flex justify-between gap-1.5">
            {[
              { id: "me", short: "OP-ME", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" },
              { id: "user-kaelen", short: "KAELEN", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80" },
              { id: "user-sasha", short: "SASHA", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" }
            ].map(ident => (
              <button
                key={ident.id}
                onClick={() => {
                  try {
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.frequency.value = ident.id === 'me' ? 440 : ident.id === 'user-kaelen' ? 520 : 600;
                    osc.type = "sine";
                    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.2);
                  } catch (e) {}
                  switchUser(ident.id);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-[9px] font-bold tracking-wider cursor-pointer transition-all active:scale-95 ${
                  (userProfile._id === ident.id || (ident.id === 'me' && (!userProfile._id || userProfile._id === 'me')))
                    ? 'bg-[#202c33] border-[#00a884] text-[#00a884] shadow-md font-extrabold'
                    : 'bg-[#111b21] border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
                title={`Switch connection to identity ${ident.short}`}
              >
                <img src={ident.avatar} className="w-3.5 h-3.5 rounded-md object-cover border border-[#222e35]" alt="" referrerPolicy="no-referrer" />
                <span>{ident.short}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Neural search interface */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-450">
            <Search size={14} />
          </span>
          <input 
            type="text"
            placeholder="Search or start a new conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111b21] border border-[#222e35] text-[#e9edef] placeholder-zinc-550 rounded-xl py-2.5 pl-11 pr-4 text-xs focus:outline-none focus:border-[#00a884] transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-400 hover:text-white uppercase transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Primary Tab Toggles */}
      <div className="px-4 py-2 bg-[#111b21] border-b border-[#222e35] flex gap-1.5 scrollbar-none overflow-x-auto">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all border shrink-0 ${
            activeTab === 'chats' 
              ? `bg-[#202c33] border-[#00a884]/20 text-[#00a884] shadow-sm` 
              : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <MessageSquareCode size={13} />
          Chats
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all border shrink-0 ${
            activeTab === 'groups' 
              ? 'bg-[#202c33] border-[#00a884]/20 text-[#00a884] shadow-sm' 
              : 'bg-transparent border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Users size={13} />
          Groups
        </button>
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all border shrink-0 ${
            activeTab === 'channels' 
              ? 'bg-[#202c33] border-[#00a884]/20 text-[#00a884] shadow-sm' 
              : 'bg-transparent border-transparent text-zinc-400 hover:text-[#00a884]/80'
          }`}
        >
          <Radio size={13} />
          Channels
        </button>
      </div>

      {/* Main Connection Streams (Vertical lists) */}
      <main className="flex-1 overflow-y-auto px-5 pb-24 space-y-2 no-scrollbar">
        {/* Discovered server-side nodes display during search queries */}
        {searchQuery.length >= 2 && searchedNodes.length > 0 && (
          <div className="mb-4">
            <h4 className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest pl-1 mb-2">
              Discovered Grid Coordinates
            </h4>
            <div className="space-y-1">
              {searchedNodes.map((node) => (
                <div
                  key={node._id}
                  onClick={() => onConnectUser(node)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/10 hover:border-cyan-500/40 hover:bg-cyan-950/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={node.avatar} className="w-8 h-8 rounded-lg object-cover border border-white/5" alt="" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-200 group-hover:text-white truncate">
                        {node.firstName} {node.lastName}
                      </p>
                      <p className="text-[9px] font-mono text-cyan-500 truncate">@{node.username}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono bg-cyan-500/15 border border-cyan-400/20 text-cyan-400 px-2 py-1 rounded-lg uppercase font-bold cursor-pointer hover:bg-cyan-400 hover:text-black transition-colors">
                    ESTABLISH LINK +
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chats' ? (
          filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onMouseDown={(e) => handleStartHold(e, chat)}
                onMouseUp={(e) => handleRelease(e, chat)}
                onMouseLeave={handleCancelHold}
                onTouchStart={(e) => handleStartHold(e, chat)}
                onTouchEnd={(e) => handleRelease(e, chat)}
                onTouchMove={handleTouchMove}
                onTouchCancel={handleCancelHold}
                onContextMenu={(e) => e.preventDefault()}
                className={`flex items-center gap-3.5 p-3 rounded-xl cursor-pointer border transition-all relative group overflow-hidden ${
                  selectedChatId === chat.id 
                    ? 'bg-[#2a3942] border-transparent shadow-sm' 
                    : 'bg-transparent border-b border-[#222e35] hover:bg-[#202c33]/50'
                } ${chat.isBlocked ? 'opacity-55' : ''}`}
              >
                {/* Visual Holding Decrypt Progress Overlay */}
                {holdingChatId === chat.id && (
                  <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1px] pointer-events-none overflow-hidden rounded-xl z-30">
                    <div className="absolute bottom-0 left-0 top-0 bg-[#00a884]/35 transition-all duration-75" style={{ width: `${holdProgress}%` }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold text-[#00a884] uppercase tracking-wider animate-pulse whitespace-nowrap">
                      OPENING CHAT SECURELY... {Math.round(holdProgress)}%
                    </div>
                  </div>
                )}

                {/* Active selection accent indicator stripe */}
                {selectedChatId === chat.id && (
                  <div className="absolute left-0 top-2 bottom-2 w-[4px] rounded-r bg-[#00a884]" />
                )}

                {/* Avatar with Custom Badge indicators */}
                <div className="relative shrink-0">
                  <img 
                    src={chat.avatar} 
                    className="w-11 h-11 rounded-full object-cover border border-[#222e35]" 
                    alt={chat.name} 
                    referrerPolicy="no-referrer"
                  />
                  {chat.online ? (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#111b21] rounded-full shadow-md" />
                  ) : (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-zinc-550 border-2 border-[#111b21] rounded-full" />
                  )}
                </div>

                {/* Connection details metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-sm text-[#e9edef] truncate flex items-center gap-1.5 transition-colors">
                      {chat.name}
                      {chat.isBot && (
                        <span className="text-[7.5px] px-1 bg-[#111b21] border border-[#222e35] text-[#00a884] rounded uppercase font-black tracking-wider">
                          Bot
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {chat.isMuted && <VolumeX size={11} className="text-zinc-500" />}
                      {chat.isBlocked && <Ban size={11} className="text-red-500" />}
                      <span className={`text-[10px] font-medium shrink-0 ${chat.unread ? 'text-[#00a884] font-bold' : 'text-zinc-450'}`}>{chat.time}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[12px] text-zinc-400 truncate leading-relaxed max-w-[190px]">
                      {chat.isBlocked ? "[Blocked]" : chat.lastMsg}
                    </p>
                    {chat.unread && (
                      <span className="w-5 h-5 bg-[#00a884] text-[#111b21] rounded-full text-[10px] font-black flex items-center justify-center shrink-0">
                        1
                      </span>
                    )}
                  </div>
                </div>

                {/* Calling Action Elements */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInitiateCall(chat, 'audio');
                    }}
                    className="p-2 rounded-full bg-[#202c33] text-zinc-300 hover:text-[#00a884] transition-all active:scale-95"
                    title="Voice Call"
                  >
                    <PhoneCall size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInitiateCall(chat, 'video');
                    }}
                    className="p-2 rounded-full bg-[#202c33] text-zinc-300 hover:text-[#00a884] transition-all active:scale-95"
                    title="Video Call"
                  >
                    <Video size={12} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <Shield size={24} className="mx-auto text-zinc-650 mb-2 " />
              <p className="text-zinc-500 text-xs">No conversations found.</p>
            </div>
          )
        ) : activeTab === 'groups' ? (
          <>
            {/* GROUP CREATION PANEL */}
            <div className="mb-4">
              {!isCreatingGroup ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingGroup(true)}
                  className="w-full py-2.5 px-3.5 bg-purple-500/10 border border-purple-500/20 hover:border-purple-500/40 text-purple-400 hover:bg-purple-900/45 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer group"
                >
                  <Users size={12} className="group-hover:scale-110 transition-transform" />
                  <span>Initialize Secure Group Hub +</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)] space-y-3.5">
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Crypto Hub Uplink</span>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsCreatingGroup(false);
                        setNewGroupName("");
                        setNewGroupDesc("");
                        setSelectedInvites([]);
                      }} 
                      className="text-[9px] text-zinc-500 hover:text-zinc-300 uppercase font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <label className="text-[9px] text-zinc-500 uppercase block mb-1">Hub Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 🕸️ DARKNET DECKERS"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500/40"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-zinc-500 uppercase block mb-1">Grid Description</label>
                      <textarea 
                        placeholder="e.g. Tactical coordination coordinate channel"
                        value={newGroupDesc}
                        onChange={(e) => setNewGroupDesc(e.target.value)}
                        rows={2}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500/40 resize-none font-mono"
                      />
                    </div>
                    
                    {/* Avatar presets */}
                    <div>
                      <label className="text-[9px] text-zinc-500 block mb-1 uppercase">Aesthetic stamp</label>
                      <div className="grid grid-cols-4 gap-2">
                        {GROUP_AVATAR_PRESETS.map((p, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedAvatarPreset(p)}
                            className={`aspect-square rounded-lg overflow-hidden border transition-all ${
                              selectedAvatarPreset === p ? 'border-purple-400 scale-105 shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'border-white/5 opacity-55 hover:opacity-85'
                            }`}
                          >
                            <img src={p} className="w-full h-full object-cover" alt="" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Following Nodes to Invite Checklist */}
                    <div>
                      <label className="text-[9px] font-mono text-zinc-500 block mb-1 uppercase">Link Following peer nodes</label>
                      <div className="space-y-1.5 max-h-[145px] overflow-y-auto pr-1 border border-white/5 bg-zinc-950/50 p-2 rounded-xl no-scrollbar">
                        {chatList.map((contact) => {
                          const isChecked = selectedInvites.includes(contact.id);
                          return (
                            <div 
                              key={contact.id}
                              onClick={() => {
                                if (isChecked) {
                                  setSelectedInvites(prev => prev.filter(id => id !== contact.id));
                                } else {
                                  setSelectedInvites(prev => [...prev, contact.id]);
                                }
                              }}
                              className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors ${
                                isChecked ? 'bg-purple-950/20 border border-purple-500/20' : 'hover:bg-zinc-900 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <img src={contact.avatar} className="w-5 h-5 rounded-md object-cover border border-white/10" alt="" referrerPolicy="no-referrer" />
                                <span className="text-[10px] text-zinc-300 truncate font-semibold leading-none">{contact.name}</span>
                              </div>
                              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all shrink-0 ${
                                isChecked ? 'bg-purple-500 border-purple-400 text-black' : 'border-white/20'
                              }`}>
                                {isChecked && <span className="text-[8.5px] font-bold leading-none">✓</span>}
                              </div>
                            </div>
                          );
                        })}
                        {chatList.length === 0 && (
                          <p className="text-[10px] text-zinc-650 text-center py-2">No other operators identified.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newGroupName.trim()) return;
                      onCreateGroup({
                        name: newGroupName,
                        description: newGroupDesc || "Encrypted secure group hub",
                        avatar: selectedAvatarPreset,
                        invitedMemberIds: selectedInvites
                      });
                      setIsCreatingGroup(false);
                      setNewGroupName("");
                      setNewGroupDesc("");
                      setSelectedInvites([]);
                    }}
                    disabled={!newGroupName.trim()}
                    className="w-full py-2 bg-purple-500/20 border border-purple-400/40 text-purple-300 hover:bg-purple-500/40 hover:text-white transition-all rounded-xl text-[11px] font-bold uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Deploy Grid Connection
                  </button>
                </div>
              )}
            </div>

            {/* Hubs Listing */}
            {filteredGroups.length > 0 ? (
              filteredGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => setSelectedChatId(group.id)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl cursor-pointer border transition-all relative group ${
                    selectedChatId === group.id 
                      ? 'bg-zinc-900 border-purple-500/30' 
                      : 'bg-zinc-900/20 border-white/5 hover:border-zinc-800 hover:bg-zinc-900/30'
                  }`}
                >
                  {selectedChatId === group.id && (
                    <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,1)]" />
                  )}

                  <div className="relative shrink-0">
                    <img 
                      src={group.avatar} 
                      className={`w-11 h-11 rounded-xl object-cover border transition-all ${
                        selectedChatId === group.id ? 'border-purple-500/40' : 'border-white/10'
                      }`} 
                      alt={group.name} 
                    />
                    {group.unread && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-400 border-2 border-black rounded-full animate-ping" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-sm text-zinc-100 truncate group-hover:text-white transition-colors flex items-center gap-1.5">
                        {group.name}
                      </h3>
                      <span className="text-[9px] font-mono text-zinc-500 shrink-0">{group.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate leading-relaxed">
                      {group.lastMsg}
                    </p>
                  </div>

                  {/* Member Tag Overlay */}
                  <div className="shrink-0">
                    <span className="text-[9px] font-mono bg-purple-950/40 border border-purple-900/40 text-purple-400 px-1.5 py-0.5 rounded font-bold">
                      {group.membersCount}P
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <Users size={24} className="mx-auto text-zinc-500 mb-2" />
                <p className="text-zinc-550 font-mono text-xs">No active group hubs linked.</p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* CHANNELS PANEL */}
            <div className="mb-4">
              {!isCreatingChannel ? (
                <button
                  type="button"
                  onClick={() => setIsCreatingChannel(true)}
                  className="w-full py-2.5 px-3.5 bg-pink-500/10 border border-pink-500/20 hover:border-pink-500/40 text-pink-400 hover:bg-pink-900/45 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer group"
                >
                  <Radio size={12} className="group-hover:scale-110 transition-transform animate-pulse" />
                  <span>Initialize Broadcast Channel +</span>
                </button>
              ) : (
                <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-pink-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)] space-y-3.5">
                  <div className="flex justify-between items-center pb-1.5 border-b border-white/5">
                    <span className="text-[9px] font-bold text-pink-400 uppercase tracking-widest">Broadcast Core Uplink</span>
                    <button 
                      type="button"
                      onClick={() => {
                        setIsCreatingChannel(false);
                        setNewChannelName("");
                        setNewChannelDesc("");
                      }} 
                      className="text-[9px] text-zinc-500 hover:text-zinc-300 uppercase font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Channel Coordinate Name</label>
                    <input 
                      type="text"
                      className="w-full bg-black border border-white/5 text-zinc-200 placeholder-zinc-700 p-2 text-xs font-mono rounded-lg focus:outline-none focus:border-pink-500/50"
                      placeholder="e.g. CORE SECURE BULLETINS"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Mainframe coordinate details</label>
                    <input 
                      type="text"
                      className="w-full bg-black border border-white/5 text-zinc-200 placeholder-zinc-700 p-2 text-xs font-mono rounded-lg focus:outline-none focus:border-pink-500/50"
                      placeholder="e.g. Neural updates and reverse proxy payloads"
                      value={newChannelDesc}
                      onChange={(e) => setNewChannelDesc(e.target.value)}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newChannelName.trim()) return;
                      onCreateChannel({
                        name: `📢 ${newChannelName}`,
                        description: newChannelDesc || "Encrypted secure broadcast channel",
                        avatar: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=300&q=80"
                      });
                      setIsCreatingChannel(false);
                      setNewChannelName("");
                      setNewChannelDesc("");
                    }}
                    disabled={!newChannelName.trim()}
                    className="w-full py-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-400/40 text-pink-300 hover:text-white transition-all rounded-xl text-[11px] font-bold uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Deploy Broadcast Core
                  </button>
                </div>
              )}
            </div>

            {/* Broadcast lists */}
            {(() => {
              const query = (searchQuery || "").toLowerCase();
              const filteredList = channelsList.filter(ch => ch.name.toLowerCase().includes(query) || ch.description.toLowerCase().includes(query));

              if (filteredList.length === 0) {
                return (
                  <div className="text-center py-10">
                    <Radio size={24} className="mx-auto text-zinc-500 mb-2 animate-pulse" />
                    <p className="text-zinc-550 font-mono text-xs">No active broadcasts linked.</p>
                  </div>
                );
              }

              return filteredList.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => setSelectedChatId(channel.id)}
                  className={`flex items-center gap-3.5 p-3.5 rounded-2xl cursor-pointer border transition-all relative group ${
                    selectedChatId === channel.id 
                      ? 'bg-zinc-900 border-pink-500/30 shadow-[0_0_12px_rgba(244,63,94,0.1)]' 
                      : 'bg-zinc-900/20 border-white/5 hover:border-zinc-800 hover:bg-zinc-900/30'
                  }`}
                >
                  {selectedChatId === channel.id && (
                    <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r bg-pink-500 shadow-[0_0_8px_rgba(244,63,94,1)]" />
                  )}

                  <div className="relative shrink-0">
                    <img 
                      src={channel.avatar} 
                      className={`w-11 h-11 rounded-xl object-cover border transition-all ${
                        selectedChatId === channel.id ? 'border-pink-500/40' : 'border-white/10'
                      }`} 
                      alt="" 
                      onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=300&q=80" }}
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-bold text-sm text-zinc-100 truncate group-hover:text-white transition-colors flex items-center gap-1.5 font-mono">
                        {channel.name}
                      </h3>
                      <span className="text-[9px] font-mono text-zinc-500 shrink-0">{channel.time}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate leading-relaxed">
                      {channel.lastMsg}
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-1 font-mono">
                    <span className="text-[8px] uppercase font-bold text-pink-400 bg-pink-950/40 border border-pink-900/40 px-1 py-0.5 rounded shrink-0">
                      CORE
                    </span>
                    <span className="text-[7.5px] text-zinc-500 font-bold shrink-0">
                      {channel.membersCount || '1.3k'} SUBS
                    </span>
                  </div>
                </div>
              ));
            })()}
          </>
        )}
      </main>

      {/* Cyber Acoustic Ambiance & Quick Settings Controls */}
      <footer className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5 bg-zinc-950/95 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAmbientSound(prev => prev === 'mute' ? 'data-hum' : 'mute')}
            className={`p-2.5 rounded-xl border transition-all ${
              ambientSound !== 'mute' 
                ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 animate-pulse' 
                : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-white'
            }`}
            title="Acoustic Drone"
          >
            {ambientSound !== 'mute' ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
          <div className="flex flex-col text-[10px] font-mono">
            <span className="text-zinc-500 leading-none">AMBIENT HUM</span>
            <span className={ambientSound !== 'mute' ? 'text-cyan-400 font-bold' : 'text-zinc-650 font-bold'}>
              {ambientSound !== 'mute' ? 'SYNTH ON' : 'MUTED'}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider"
        >
          <Settings size={12} className="animate-spin-slow" />
          Config Node
        </button>
      </footer>

      {/* 2-Second Hold Context Menu Dialog / Bottom Sheet modal */}
      {activeOptionMenuChat && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden animate-zoom-in">
            {/* Top micro scan lines */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-transparent to-purple-500" />
            
            {/* Profile/Identity target header */}
            <div className="text-center mb-6">
              <div className="relative inline-block mb-3">
                <img 
                  src={activeOptionMenuChat.avatar} 
                  className="w-16 h-16 rounded-2xl object-cover mx-auto border-2 border-cyan-500/30" 
                  alt={activeOptionMenuChat.name} 
                />
                {activeOptionMenuChat.online && (
                  <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-emerald-500 border-2 border-black rounded-full" />
                )}
              </div>
              <h3 className="font-mono font-black text-white text-base tracking-tight uppercase">
                {activeOptionMenuChat.name}
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono italic truncate max-w-xs mx-auto mt-1">
                {activeOptionMenuChat.bio || "Zero-Knowledge Terminal Node"}
              </p>
            </div>

            {/* Grid Axis Options spacing */}
            <div className="space-y-3.5">
              {/* Toggle Mute option button */}
              <button
                type="button"
                onClick={() => {
                  onToggleMute(activeOptionMenuChat.id);
                  activeOptionMenuChat.isMuted = !activeOptionMenuChat.isMuted;
                  setActiveOptionMenuChat({ ...activeOptionMenuChat });
                }}
                className={`w-full py-3.5 px-4 rounded-xl border flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeOptionMenuChat.isMuted 
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-400' 
                    : 'bg-zinc-900/50 border-white/5 text-zinc-300 hover:border-amber-500/30 hover:text-amber-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {activeOptionMenuChat.isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                  <span>{activeOptionMenuChat.isMuted ? "UNMUTE SECURE LINK" : "MUTE SECURE LINK"}</span>
                </div>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-zinc-800">
                  {activeOptionMenuChat.isMuted ? "MUTED" : "ALERTS"}
                </span>
              </button>

              {/* Toggle Block option button */}
              <button
                type="button"
                onClick={() => {
                  onToggleBlock(activeOptionMenuChat.id);
                  activeOptionMenuChat.isBlocked = !activeOptionMenuChat.isBlocked;
                  setActiveOptionMenuChat({ ...activeOptionMenuChat });
                }}
                className={`w-full py-3.5 px-4 rounded-xl border flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeOptionMenuChat.isBlocked 
                    ? 'bg-red-950/30 border-red-500/40 text-red-400' 
                    : 'bg-zinc-900/50 border-white/5 text-zinc-300 hover:border-red-500/30 hover:text-red-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Ban size={14} />
                  <span>{activeOptionMenuChat.isBlocked ? "UNBLOCK PEER TRANSIT" : "BLOCK PEER TRANSIT"}</span>
                </div>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-zinc-800">
                  {activeOptionMenuChat.isBlocked ? "BLOCKED" : "ALLOWED"}
                </span>
              </button>

              {/* Delete button (dangerous crimson layout) */}
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Purge all decrypted logs and channel links with ${activeOptionMenuChat.name}? This action is permanent.`)) {
                    onDeleteChat(activeOptionMenuChat.id);
                    setActiveOptionMenuChat(null);
                  }
                }}
                className="w-full py-3.5 px-4 bg-red-950/20 hover:bg-red-950/40 border border-red-900/20 hover:border-red-500/40 text-red-400 rounded-xl flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Trash2 size={14} className="text-red-500" />
                <span>PURGE DATABASE LOGS (DELETE)</span>
              </button>
            </div>

            {/* Dismiss boundary element */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setActiveOptionMenuChat(null)}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white transition-all rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer text-center"
              >
                DISMISS INTERFACE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
