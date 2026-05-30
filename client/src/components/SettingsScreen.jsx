import React, { useState } from 'react';
import { 
  User, Palette, Volume2, ShieldAlert, Cpu, HardDrive, Shield, 
  Trash2, RefreshCw, Layers, Check, Clock, Globe, ArrowLeft, KeySquare 
} from 'lucide-react';
import { GLOW_PRESETS, AMBIENT_SOUNDSCAPES } from '../data';

const SettingsScreen = ({
  userProfile,
  setUserProfile,
  onClose,
  activeAccent,
  setActiveAccent,
  ambientSound,
  setAmbientSound,
  isBiometricLocked,
  setIsBiometricLocked,
  clearAllHistory,
  latencySpeed
}) => {
  const [profileName, setProfileName] = useState(userProfile.name);
  const [profileBio, setProfileBio] = useState(userProfile.bio);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cleaningActive, setCleaningActive] = useState(false);

  const saveProfile = (e) => {
    e.preventDefault();
    setUserProfile({
      ...userProfile,
      name: profileName,
      bio: profileBio
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const executeCacheCleaning = () => {
    setCleaningActive(true);
    setTimeout(() => {
      clearAllHistory();
      setCleaningActive(false);
    }, 1500);
  };

  return (
    <div id="settings-view-viewport" className="flex-1 h-full bg-black flex flex-col overflow-hidden relative">
      
      {/* Background neon dust overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/[0.015] via-transparent to-cyan-500/[0.015] pointer-events-none" />

      {/* Screen Header */}
      <header className="p-5 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md flex items-center gap-4 z-10 shrink-0">
        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-base font-black text-white uppercase tracking-wider">Node Grid Configuration</h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase">Operator Dashboard and Profile Sync</p>
        </div>
      </header>

      {/* Settings Scrollable Panel */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 no-scrollbar">
        
        {/* Profile bio credentials card */}
        <section className="p-4 md:p-6 rounded-3xl bg-zinc-900/40 border border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          <h3 className="text-xs font-black uppercase font-mono tracking-widest text-cyan-400 mb-4 flex items-center gap-2">
            <User size={13} /> Biometric Credentials
          </h3>

          <form onSubmit={saveProfile} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-center mb-2">
              <img 
                src={userProfile.avatar} 
                className="w-16 h-16 rounded-2xl object-cover border border-white/10" 
                alt="Me" 
              />
              <div className="flex-1 w-full space-y-1">
                <p className="text-[10px] font-mono text-zinc-500 uppercase block">NODE IDENTITY CARD</p>
                <p className="text-xs font-mono text-zinc-300 font-bold">SHA-256 Verified Operator Link</p>
                <span className="text-[9px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-400 px-1.5 py-0.5 rounded font-bold uppercase select-none">
                  INTEGRITY SECURE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase">Operator Fullname</label>
                <input 
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/40"
                  placeholder="Insert operator name"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase">Bio Credentials Status</label>
                <input 
                  type="text"
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/40"
                  placeholder="Insert operator status bio"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-cyan-500 border border-cyan-400 text-black font-sans text-xs font-black uppercase tracking-wider hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] active:translate-y-0 transition-all cursor-pointer flex items-center gap-2"
              >
                {saveSuccess ? (
                  <>
                    <Check size={13} className="animate-bounce" /> Credentials Synced
                  </>
                ) : (
                  "Sync Credentials"
                )}
              </button>
            </div>
          </form>
        </section>

        {/* Technical Accent / Glowing presets selection */}
        <section className="p-4 md:p-6 rounded-3xl bg-zinc-900/40 border border-white/5 shadow-xl">
          <h3 className="text-xs font-black uppercase font-mono tracking-widest text-purple-400 mb-4 flex items-center gap-2">
            <Palette size={13} /> Cybernetic Design Presets
          </h3>
          <p className="text-[11px] text-zinc-400 mb-4 font-mono leading-relaxed">
            Configure the visual telemetry wavelength of the Onyx Chat terminal. Changes propagate instantly to core dashboard outlines and glowing matrices.
          </p>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {GLOW_PRESETS.map((preset) => {
              const isSelected = activeAccent.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => setActiveAccent(preset)}
                  className={`p-3.5 rounded-2xl border cursor-pointer hover:bg-zinc-900/40 transition-all relative ${
                    isSelected 
                      ? `bg-zinc-900 ${preset.border} ${preset.glow}` 
                      : 'bg-zinc-950/40 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-3 h-3 rounded-full ${preset.bg}`} />
                    <span className="text-xs font-mono font-bold text-zinc-200">{preset.name}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-300">
                      <Check size={12} className={preset.text} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Ambient Acoustic Drone hum selector */}
        <section className="p-4 md:p-6 rounded-3xl bg-zinc-900/40 border border-white/5 shadow-xl">
          <h3 className="text-xs font-black uppercase font-mono tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
            <Volume2 size={13} /> Neural Soundscape Alignment
          </h3>
          <p className="text-[11px] text-zinc-400 mb-4 font-mono">
            Enable synthesized, atmospheric micro-beats inside the background layer of the messaging grid.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {AMBIENT_SOUNDSCAPES.map((sound) => {
              const isSelected = ambientSound === sound.id;
              return (
                <div
                  key={sound.id}
                  onClick={() => setAmbientSound(sound.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected 
                      ? 'bg-zinc-900 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.08)]' 
                      : 'bg-zinc-950/40 border-white/5 text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold font-mono text-zinc-200">{sound.name}</span>
                    <span className="text-[9px] font-mono text-zinc-500">
                      {sound.frequency ? `Oscillation Cycle: ${sound.frequency}Hz` : 'Silence node state'}
                    </span>
                  </div>
                  {isSelected && <Check size={13} className="text-emerald-400 shrink-0" />}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bio security biometric shield option */}
        <section className="p-4 md:p-6 rounded-3xl bg-zinc-900/40 border border-white/5 shadow-xl">
          <h3 className="text-xs font-black uppercase font-mono tracking-widest text-red-400 mb-3 flex items-center gap-2">
            <ShieldAlert size={13} /> Biosecurity Protocols
          </h3>
          <p className="text-[11px] text-zinc-400 mb-4 font-mono leading-relaxed">
            Shield your neural coordinates from casual intrusions. If Biometric mesh shield is active, Onyx Chat prompts a digital authentication matrix whenever the client refreshes.
          </p>

          <div className="flex items-center justify-between p-4 bg-zinc-950/40 border border-white/5 rounded-2xl">
            <div className="flex gap-3 items-center">
              <KeySquare size={16} className={isBiometricLocked ? 'text-red-400' : 'text-zinc-600'} />
              <div>
                <span className="text-xs font-mono font-bold text-zinc-200 block">Biometric Node Shield (Face Lock representation)</span>
                <span className="text-[10px] font-mono text-zinc-500">Enable simulated biometric face locks</span>
              </div>
            </div>
            
            <button
              onClick={() => setIsBiometricLocked(!isBiometricLocked)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all border ${
                isBiometricLocked 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.15)]' 
                  : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-400'
              }`}
            >
              {isBiometricLocked ? 'Mesh SHIELDED' : 'UNSHIELDED'}
            </button>
          </div>
        </section>

        {/* Live system telemetrics / reverse proxies verification */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-4 rounded-3xl bg-zinc-900/30 border border-white/5">
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1.5 mb-2">
              <Clock size={11} className="text-cyan-400" /> UTC Time Coordinates
            </h4>
            <p className="text-sm font-mono font-black text-zinc-200 leading-none">2026-05-27</p>
            <p className="text-[11px] font-mono text-zinc-400 mt-1 leading-none">03:00:00 UTC</p>
          </div>

          <div className="p-4 rounded-3xl bg-zinc-900/30 border border-white/5">
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1.5 mb-2">
              <Globe size={11} className="text-purple-400 animate-pulse" /> Local Ingress Proxy
            </h4>
            <p className="text-sm font-mono font-black text-zinc-200 leading-none">Port 3000</p>
            <p className="text-[11px] font-mono text-zinc-400 mt-1 leading-none">Status: EXTERN-ROUTE-OK</p>
          </div>

          <div className="p-4 rounded-3xl bg-zinc-900/30 border border-white/5">
            <h4 className="text-[10px] font-mono text-zinc-500 uppercase flex items-center gap-1.5 mb-2">
              <Cpu size={11} className="text-emerald-400" /> Client Latency Speed
            </h4>
            <p className="text-sm font-mono font-black text-zinc-200 leading-none">{latencySpeed}</p>
            <p className="text-[11px] font-mono text-zinc-400 mt-1 leading-none">Encryption: AES-512-NX</p>
          </div>

        </section>

        {/* Dynamic Wipe/Cache erase button */}
        <div className="flex justify-center pt-2">
          <button
            onClick={executeCacheCleaning}
            className="px-5 py-3 rounded-2xl bg-zinc-900 border border-red-500/20 text-red-400 font-mono text-xs uppercase tracking-wider hover:bg-red-500/10 hover:text-white hover:border-red-500/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Trash2 size={13} className={cleaningActive ? 'animate-bounce' : ''} />
            {cleaningActive ? 'Sifting cache files...' : 'Purge All Cached Signal Logs'}
          </button>
        </div>

      </main>
    </div>
  );
};

export default SettingsScreen;
