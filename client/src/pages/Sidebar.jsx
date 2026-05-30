import React from 'react';
import { 
  Search, Shield, Users, MessageSquareCode, Radio, Zap, Volume2, 
  VolumeX, PhoneCall, Video, Settings, UserCheck, AppWindow 
} from 'lucide-react';

const Sidebar = ({
  chatList,
  groupList,
  activeTab,
  setActiveTab,
  selectedChatId,
  setSelectedChatId,
  showSearch,
  setShowSearch,
  searchQuery,
  setSearchQuery,
  onInitiateCall,
  activeAccent,
  onOpenSettings,
  ambientSound,
  setAmbientSound,
  userProfile,
  latencySpeed
}) => {
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
    <div id="sidebar-container" className="w-full md:w-[380px] h-full border-r border-white/5 bg-zinc-950/90 flex flex-col shrink-0 overflow-hidden relative">
      
      {/* Visual Terminal Static Blur Border */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
      
      {/* Header Info Banner */}
      <header className="p-5 pb-3 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
            <h1 className="text-xl font-black italic tracking-tighter uppercase font-mono text-white flex items-center gap-1.5">
              ONYX<span className="text-cyan-400 not-italic">CHAT</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold uppercase tracking-widest font-sans">
                v4.8
              </span>
            </h1>
          </div>
          
          {/* Quick Profile Link */}
          <div 
            onClick={onOpenSettings} 
            className="flex items-center gap-2 bg-zinc-900/40 hover:bg-zinc-900/70 p-1 pr-3 rounded-xl border border-white/5 cursor-pointer active:scale-95 transition-transform group"
          >
            <img 
              src={userProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
              className="w-7 h-7 rounded-lg object-cover border border-white/10 group-hover:border-cyan-500/40 transition-all" 
              alt="Avatar" 
            />
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold truncate max-w-[70px]">
              {userProfile.name.split(' ')[0]}
            </span>
          </div>
        </div>

        {/* Neural Network Status Stats Module */}
        <div className="bg-zinc-900/20 border border-white/5 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
          <div className="flex flex-col gap-0.5 border-r border-white/5">
            <span className="text-zinc-500 uppercase">SYS LINK</span>
            <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
              <Zap size={10} className="animate-bounce text-emerald-400" /> ACTIVE
            </span>
          </div>
          <div className="flex flex-col gap-0.5 border-r border-white/5">
            <span className="text-zinc-500 uppercase">LATENCY</span>
            <span className="text-cyan-400 font-bold">{latencySpeed}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-zinc-500 uppercase">NODES</span>
            <span className="text-purple-400 font-bold">12 / 128</span>
          </div>
        </div>

        {/* Neural search interface */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
            <Search size={14} />
          </span>
          <input 
            type="text"
            placeholder="Search core, channels, drifters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/40 border border-white/5 text-zinc-100 placeholder-zinc-500 rounded-xl py-3 pl-11 pr-4 text-xs font-mono focus:outline-none focus:border-cyan-500/40 focus:bg-zinc-900/70 transition-all focus:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-zinc-500 hover:text-white uppercase transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      {/* Primary Tab Toggles */}
      <div className="px-5 mb-2 flex gap-2">
        <button
          onClick={() => setActiveTab('chats')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all border ${
            activeTab === 'chats' 
              ? `bg-zinc-900 border-cyan-500/20 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.08)]` 
              : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <MessageSquareCode size={13} />
          Direct Links
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider transition-all border ${
            activeTab === 'groups' 
              ? 'bg-zinc-900 border-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.08)]' 
              : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users size={13} />
          Group Hubs
        </button>
      </div>

      {/* Main Connection Streams (Vertical lists) */}
      <main className="flex-1 overflow-y-auto px-5 pb-24 space-y-2 no-scrollbar">
        {activeTab === 'chats' ? (
          filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl cursor-pointer border transition-all relative group ${
                  selectedChatId === chat.id 
                    ? 'bg-zinc-900 border-cyan-500/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]' 
                    : 'bg-zinc-900/20 border-white/5 hover:border-zinc-800 hover:bg-zinc-900/30'
                }`}
              >
                {/* Active selection accent indicator stripe */}
                {selectedChatId === chat.id && (
                  <div className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,1)]" />
                )}

                {/* Avatar with Custom Badge indicators */}
                <div className="relative shrink-0">
                  <img 
                    src={chat.avatar} 
                    className={`w-11 h-11 rounded-xl object-cover border transition-all ${
                      selectedChatId === chat.id ? 'border-cyan-500/50' : 'border-white/10'
                    }`} 
                    alt={chat.name} 
                  />
                  {chat.online ? (
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-black rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  ) : (
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-zinc-600 border-2 border-black rounded-full" />
                  )}
                </div>

                {/* Connection details metadata */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-sm text-zinc-100 truncate flex items-center gap-1.5 group-hover:text-white transition-colors">
                      {chat.name}
                      {chat.isBot && (
                        <span className="text-[7.5px] px-1 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded uppercase font-black font-mono tracking-wider">
                          AI CORE
                        </span>
                      )}
                    </h3>
                    <span className="text-[9px] font-mono text-zinc-500 shrink-0">{chat.time}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 truncate leading-relaxed">
                    {chat.lastMsg}
                  </p>
                </div>

                {/* Cyber Calling Action Elements */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInitiateCall(chat, 'audio');
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-700 transition-all active:scale-95"
                    title="Audio Link"
                  >
                    <PhoneCall size={11} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onInitiateCall(chat, 'video');
                    }}
                    className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-purple-400 hover:bg-zinc-700 transition-all active:scale-95"
                    title="Video Link"
                  >
                    <Video size={11} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <Shield size={24} className="mx-auto text-zinc-600 mb-2 animate-pulse" />
              <p className="text-zinc-500 font-mono text-xs">No direct neural paths found.</p>
            </div>
          )
        ) : (
          filteredGroups.length > 0 ? (
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
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-black rounded-full animate-ping" />
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
              <Users size={24} className="mx-auto text-zinc-600 mb-2 animate-pulse" />
              <p className="text-zinc-500 font-mono text-xs">No active group hubs linked.</p>
            </div>
          )
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
            <span className={ambientSound !== 'mute' ? 'text-cyan-400 font-bold' : 'text-zinc-600 font-bold'}>
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
    </div>
  );
};

export default Sidebar;
