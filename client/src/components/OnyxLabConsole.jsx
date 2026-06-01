import React, { useState } from 'react';
import { X, Shield, Cpu, Mic, GitBranch, RefreshCw } from 'lucide-react';
import VoiceCommander from './VoiceCommander';
import GazeTrackerSimulator from './GazeTrackerSimulator';
import NeuralAutomatonLedger from './NeuralAutomatonLedger';
import WebRTCStatusDeck from './WebRTCStatusDeck';

export default function OnyxLabConsole({ 
  onClose,
  activeAccent,
  userProfile,
  messages,
  systemLatency,
  selfDestructDuration,
  setSelfDestructDuration,
  handleRotateActiveKey,
  handleExecuteVoiceCommand,
  isInternetOffline,
  onToggleInternetOffline,
  activeChat
}) {
  const [activeTab, setActiveTab] = useState("cipher"); // cipher, automation, bio-speech, mesh

  return (
    <div className="w-full md:w-[350px] lg:w-[380px] h-full border-l border-white/5 bg-zinc-950 flex flex-col z-40 shrink-0 font-mono relative">
      {/* Laser horizontal header line */}
      <div className={`absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-purple-500 to-transparent`} />

      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-zinc-900/10 flex justify-between items-center bg-black/35 shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="text-purple-400 animate-spin" size={14} style={{ animationDuration: '4s' }} />
          <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-100">
            Onyx Cyber Labs
          </h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1 px-2.5 bg-zinc-900 text-[10px] uppercase font-bold text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors rounded-lg cursor-pointer"
        >
          Close [ESC]
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-white/5 bg-zinc-950 text-[9px] uppercase font-bold text-center shrink-0">
        <button
          onClick={() => setActiveTab("cipher")}
          className={`flex-1 py-3 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'cipher' ? 'border-purple-500 text-purple-400 font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          🔒 Cipher
        </button>
        <button
          onClick={() => setActiveTab("automation")}
          className={`flex-1 py-3 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'automation' ? 'border-purple-500 text-purple-400 font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          🤖 Twin AI
        </button>
        <button
          onClick={() => setActiveTab("bio-speech")}
          className={`flex-1 py-3 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'bio-speech' ? 'border-purple-500 text-purple-400 font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          🗣️ Bio-gaze
        </button>
        <button
          onClick={() => setActiveTab("mesh")}
          className={`flex-1 py-3 transition-colors border-b-2 cursor-pointer ${
            activeTab === 'mesh' ? 'border-purple-500 text-purple-400 font-black' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          🕸️ Mesh
        </button>
      </div>

      {/* Scrollable Viewport workspace */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-black/10 select-none">
        
        {/* Tab 1: Cipher & Zero-Knowledge Rotation */}
        {activeTab === 'cipher' && (
          <div className="space-y-4">
            
            {/* Architectural Statement */}
            <div className="bg-zinc-900/30 border border-white/5 p-3.5 rounded-2xl">
              <span className="text-[10px] text-zinc-300 font-bold block mb-1 flex items-center gap-1.5 uppercase">
                <Shield size={12} className="text-purple-400 shrink-0" /> Zero-Knowledge Protocol
              </span>
              <p className="text-[11px] text-zinc-550 leading-relaxed font-mono">
                Decryption keys remain strictly state-isolated on this browser instance. Session metadata is salted and hashed locally prior to outbound transits.
              </p>
            </div>

            {/* Key rotation panel */}
            <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-2xl space-y-3.5">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold block uppercase font-mono tracking-wider">Dynamic Key Reframer</span>
                  <span className="text-[9px] text-zinc-500 leading-none block font-mono">Rotates current thread cipher caskets</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900 px-1.5 py-0.5 rounded uppercase leading-none font-mono tracking-tighter">
                  Active
                </span>
              </div>

              {/* Show active key value */}
              <div className="bg-black/50 border border-white/5 p-2.5 rounded-xl font-mono text-[10px] text-zinc-400 relative">
                <span className="text-[8px] text-zinc-650 block uppercase mb-1">Active Cryptological Token ID</span>
                <span className="text-white font-bold block select-all break-all">{activeChat?.encryptionKey || 'SHA-256-AES-GCM-NULL'}</span>
              </div>

              <button 
                type="button"
                onClick={handleRotateActiveKey}
                className="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 font-bold rounded-xl text-xs hover:-translate-y-0.5 transition-all uppercase tracking-wider cursor-pointer font-mono"
              >
                Rotate Cryptographic Keys
              </button>
            </div>

            {/* Self destruct slider */}
            <div className="p-4 bg-zinc-900/60 border border-white/5 rounded-2xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-zinc-400 font-bold uppercase block">Self-Destruction Timer</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                  selfDestructDuration > 0 
                  ? 'bg-red-950 text-red-400 border border-red-900 animate-pulse' 
                  : 'bg-zinc-950 text-zinc-500 border border-white/5'
                }`}>
                  {selfDestructDuration > 0 ? `${selfDestructDuration}s Active` : 'Muted (Off)'}
                </span>
              </div>

              <p className="text-[10.5px] text-zinc-500 leading-snug">
                Sent messages are automatically scrubbed from reactive state memories and peer devices when the countdown lapses.
              </p>

              <div className="flex gap-2">
                {[0, 5, 10, 30].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSelfDestructDuration(t)}
                    className={`flex-1 py-1.5 text-[9px] uppercase font-bold border rounded-lg cursor-pointer transition-all ${
                      selfDestructDuration === t 
                        ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-black' 
                        : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {t === 0 ? "Off" : `${t}s`}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Neural Autonomous Scheduler Ledger */}
        {activeTab === 'automation' && (
          <NeuralAutomatonLedger 
            userProfile={userProfile} 
            activeAccent={activeAccent} 
            messages={messages} 
          />
        )}

        {/* Tab 3: Bio Gaze Eye-Gesture and Web Speech API Voice Commander */}
        {activeTab === 'bio-speech' && (
          <div className="space-y-6">
            
            {/* Web Speech API Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Mic className="text-purple-400 shrink-0" size={13} />
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest block">Neural Speech Commander</span>
              </div>
              <VoiceCommander 
                onExecuteVoiceCommand={handleExecuteVoiceCommand} 
                activeAccent={activeAccent} 
                systemLatency={systemLatency} 
              />
            </div>

            <div className="h-[1px] bg-white/5" />

            {/* Eye Gaze Gaze Section */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="text-purple-400 shrink-0" size={13} />
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest block">MediaPipe Eye-Gaze mesh</span>
              </div>
              <GazeTrackerSimulator 
                onGazeAction={(action) => handleExecuteVoiceCommand(action)} 
                activeAccent={activeAccent} 
                systemLatency={systemLatency} 
              />
            </div>

          </div>
        )}

        {/* Tab 4: WebRTC decentralized mesh signalling logs/offline caching */}
        {activeTab === 'mesh' && (
          <WebRTCStatusDeck 
            userProfile={userProfile} 
            activeAccent={activeAccent} 
            isInternetOffline={isInternetOffline}
            onToggleInternetOffline={onToggleInternetOffline}
            systemLatency={systemLatency} 
          />
        )}

      </div>

      {/* Footer System specs indicator */}
      <footer className="p-3 bg-zinc-950 border-t border-white/5 text-center text-[8px] text-zinc-600 tracking-wider flex justify-between uppercase shrink-0">
        <span>GRID LATENCY: {systemLatency}</span>
        <span>ONYX CONSOLE VER: 4.8.2-PRE</span>
      </footer>
    </div>
  );
}
