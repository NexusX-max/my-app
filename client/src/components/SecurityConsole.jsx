/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  ShieldCheck, Smartphone, KeyRound, Clock, EyeOff, AlertTriangle, 
  RefreshCw, X, Radio
} from 'lucide-react';

interface Device {
  id: string;
  name: string;
  location: string;
  ip: string;
  active: boolean;
  type: 'mobile' | 'desktop';
}

interface SecurityConsoleProps {
  currentChatName: string;
  isSecretChatActive: boolean;
  onToggleSecretChat: () => void;
  selfDestructIn: number;
  onSetSelfDestruct: (sec: number) => void;
  onClose: () => void;
}

export default function SecurityConsole({
  currentChatName,
  isSecretChatActive,
  onToggleSecretChat,
  selfDestructIn,
  onSetSelfDestruct,
  onClose
}: SecurityConsoleProps) {
  const [devices, setDevices] = useState<Device[]>([
    { id: '1', name: 'Google Pixel 9 Pro', location: 'Dhaka, Bangladesh', ip: '103.45.210.12', active: true, type: 'mobile' },
    { id: '2', name: 'MacBook Pro 16" M3', location: 'Dhaka, Bangladesh', ip: '103.45.210.15', active: false, type: 'desktop' },
    { id: '3', name: 'iPad Pro 11"', location: 'Singapore', ip: '46.12.98.2', active: false, type: 'mobile' },
  ]);

  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [fingerprintKey, setFingerprintKey] = useState('E9:F5:8D:1A:4C:E2:B0:99:A5:6B:37:F1:C7:D4:E8:22');

  const handleTerminate = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  const regenerateKey = () => {
    const chars = '0123456789ABCDEF';
    let key = '';
    for (let i = 0; i < 16; i++) {
      key += chars[Math.floor(Math.random() * 16)] + chars[Math.floor(Math.random() * 16)];
      if (i < 15) key += ':';
    }
    setFingerprintKey(key);
  };

  return (
    <div id="security-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#090909]/95 rounded-2xl overflow-hidden shadow-2xl border border-white/10 text-[#E0E0E0] flex flex-col max-h-[90vh]">
        
        {/* Header bar */}
        <div className="p-6 bg-black/40 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm tracking-widest uppercase font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Security Control Hub</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body with glass cards */}
        <div className="p-8 overflow-y-auto flex flex-col gap-6 scrollbar-thin">
          
          {/* Section 1: E2E Cryptographic Fingerprint */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold text-xs text-blue-400 uppercase tracking-widest font-mono">End-to-End Hash</h4>
                <p className="text-slate-400 text-xs mt-1">Verification hash tunnel secure between you & {currentChatName}.</p>
              </div>
              <button 
                onClick={regenerateKey}
                className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 text-blue-400 rounded-xl border border-white/10 active:scale-95 transition-all cursor-pointer"
                title="Regenerate keys"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black/40 font-mono text-xs p-4 rounded-xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <span className="text-emerald-400 font-bold tracking-widest text-[11px] select-all">
                {fingerprintKey}
              </span>
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded text-[9px] font-bold tracking-widest">
                VERIFIED
              </span>
            </div>
          </div>

          {/* Section 2: Secret Chat & Ephemeral (Self-Destruct) Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Anti-screenshot Secret Chat config */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <EyeOff className="w-4 h-4 text-rose-400 animate-pulse" />
                  <h4 className="font-bold text-xs uppercase tracking-widest font-mono text-slate-200">Screen Guard</h4>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Enforces strict protection, preventing client display scraping and remote screenshots.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-300 font-medium font-mono uppercase tracking-wider">STATE</span>
                <button
                  onClick={onToggleSecretChat}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    isSecretChatActive ? 'bg-blue-600' : 'bg-white/10'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isSecretChatActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Self destruct timeout duration config */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                  <h4 className="font-bold text-xs uppercase tracking-widest font-mono text-slate-200">Self-Destruct</h4>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Ephemeral messaging timers trigger automatic pixel destruction upon viewing.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-300 font-medium font-mono uppercase tracking-wider">TIMER</span>
                <select
                  value={selfDestructIn}
                  onChange={(e) => onSetSelfDestruct(Number(e.target.value))}
                  className="bg-[#050505] border border-white/10 text-slate-200 py-1 px-3 rounded-lg text-xs font-semibold focus:outline-none hover:border-gray-700 cursor-pointer font-mono"
                >
                  <option value={0}>Disabled</option>
                  <option value={5}>5 S</option>
                  <option value={10}>10 S</option>
                  <option value={30}>30 S</option>
                  <option value={60}>1 M</option>
                </select>
              </div>
            </div>

          </div>

          {/* Connected Sessions */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h4 className="font-bold text-xs uppercase tracking-widest font-mono text-slate-200 mb-4 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>TERMINAL SESSIONS</span>
            </h4>

            <div className="flex flex-col gap-2.5">
              {devices.map((dev) => (
                <div 
                  key={dev.id} 
                  className="bg-black/30 p-4 rounded-xl border border-white/5 flex items-center justify-between text-xs transition-colors hover:border-white/10"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{dev.name}</span>
                      {dev.active ? (
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                          CURRENT
                        </span>
                      ) : (
                        <span className="bg-white/5 border border-white/5 text-slate-400 text-[9px] px-1.5 py-0.2 rounded font-mono">
                          STANDBY
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 mt-1 font-sans text-[11px]">{dev.location} • <span className="font-mono text-gray-500">{dev.ip}</span></p>
                  </div>

                  {!dev.active && (
                    <button
                      onClick={() => handleTerminate(dev.id)}
                      className="text-rose-400 hover:text-white hover:bg-rose-950/40 border border-rose-900/30 px-3 py-1 rounded-lg transition-all font-mono text-[10px] cursor-pointer"
                    >
                      TERMINATE
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* TFA Code Authentication */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h4 className="font-bold text-xs uppercase tracking-widest font-mono text-slate-200 mb-2 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>TWO-FACTOR GATEWAY</span>
            </h4>
            <p className="text-gray-400 text-xs mb-4 leading-relaxed">
              Requiring dynamic confirmation tokens logs before authorizing secondary clients.
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="toggle-tfa"
                  checked={tfaEnabled}
                  onChange={(e) => setTfaEnabled(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#050505] border-white/10 text-[#2563EB] focus:ring-blue-500/50 accent-blue-500 cursor-pointer"
                />
                <label htmlFor="toggle-tfa" className="text-xs font-semibold text-slate-300 font-mono uppercase tracking-wider cursor-pointer">
                  MFA STATUS
                </label>
              </div>

              {tfaEnabled && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-emerald-400 font-mono font-bold animate-pulse">
                    INTEGRATED
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Screenshot Block Notice */}
          {isSecretChatActive && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs flex gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400 animate-bounce" />
              <div className="leading-relaxed">
                <span className="font-bold font-mono text-rose-400 uppercase tracking-widest">GUARD SHIELD ACTIVE:</span> All direct display capturing systems are actively blocked. Remote diagnostics tools will experience a complete black space representation.
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-6 bg-black/40 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 hover:bg-blue-500 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all cursor-pointer font-sans"
          >
            Acknowledge Session
          </button>
        </div>

      </div>
    </div>
  );
}
