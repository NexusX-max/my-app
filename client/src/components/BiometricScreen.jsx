import React, { useState, useEffect } from 'react';
import { Fingerprint, Scan, ShieldCheck, Orbit, Zap, Clock } from 'lucide-react';

const BiometricScreen = ({ 
  onApproved, 
  activeAccent 
}) => {
  const [scanState, setScanState] = useState('idle');
  const [dotsChecked, setDotsChecked] = useState([]);
  const [scanProgress, setScanProgress] = useState(0);

  // Scan progress simulator
  useEffect(() => {
    if (scanState !== 'scanning') return;

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanState('completed');
          setTimeout(() => {
            onApproved();
          }, 800);
          return 100;
        }
        return prev + Math.floor(Math.random() * 12) + 4;
      });
    }, 120);

    return () => clearInterval(interval);
  }, [scanState, onApproved]);

  const handleTriggerScan = () => {
    setScanProgress(0);
    setScanState('scanning');
  };

  const toggleNodeMatrixDot = (dotId) => {
    if (dotsChecked.includes(dotId)) {
      setDotsChecked(prev => prev.filter(d => d !== dotId));
    } else {
      setDotsChecked(prev => [...prev, dotId]);
    }
  };

  // Pattern layout grid
  const renderDotsGrid = () => {
    const dots = Array.from({ length: 9 }, (_, i) => i + 1);
    return (
      <div className="grid grid-cols-3 gap-4 max-w-[180px] mx-auto mb-6">
        {dots.map(dot => {
          const isChecked = dotsChecked.includes(dot);
          return (
            <div
              key={dot}
              onClick={() => toggleNodeMatrixDot(dot)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer transition-all ${
                isChecked
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 scale-110 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-zinc-900/60 border-white/5 text-zinc-600 hover:border-zinc-700 hover:text-zinc-400'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${isChecked ? 'bg-cyan-400' : 'bg-zinc-700'}`} />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div id="biometric-terminal-portal" className="fixed inset-0 z-[8000] bg-zinc-950 flex flex-col items-center justify-center p-4 md:p-6 text-white text-center overflow-y-auto no-scrollbar">
      
      {/* Immersive technical scanning lights */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent pointer-events-none animate-pulse" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyan-500/30 animate-scanline pointer-events-none" />

      {/* Primary security locks content */}
      <div className="w-full max-w-sm bg-zinc-900/60 border border-white/10 rounded-3xl md:rounded-[45px] p-6 md:p-8 relative overflow-hidden backdrop-blur-3xl shadow-2xl my-auto">
        
        {/* Glowing top line based on active theme */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${activeAccent.bg} animate-pulse shadow-[0_0_10px_2px_rgba(6,182,212,0.4)]`} />

        <header className="mb-6">
          <div className="inline-flex p-3 bg-zinc-950 border border-white/10 rounded-2xl mb-3.5">
            <Orbit className="text-cyan-400 animate-spin-slow" size={24} />
          </div>
          <h2 className="text-lg font-mono font-black uppercase tracking-wider">Onyx Biometric Verification</h2>
          <p className="text-[10px] font-mono text-zinc-500 uppercase mt-0.5">Secure Link Guard Node Active</p>
        </header>

        {/* Central Scan Area */}
        <div className="relative w-44 h-44 mx-auto mb-8 rounded-full border border-white/5 flex items-center justify-center bg-zinc-950/40 select-none">
          
          {/* Dashboard scanning rings */}
          <div className="absolute inset-2 rounded-full border border-dashed border-cyan-500/10 animate-spin-slow" />
          <div className={`absolute inset-4 rounded-full border border-cyan-500/20 ${scanState === 'scanning' ? 'animate-pulse' : ''}`} />
          
          {scanState === 'idle' && (
            <div className="text-center relative z-10">
              <Fingerprint className="text-cyan-400/80 mx-auto mb-2 animate-pulse" size={48} />
              <p className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest leading-none">
                Mesh Standby
              </p>
            </div>
          )}

          {scanState === 'scanning' && (
            <div className="text-center relative z-10 w-full px-6">
              <Scan className="text-cyan-400 mx-auto mb-2 animate-ping" size={42} />
              <p className="text-xs font-mono font-bold text-cyan-400 tracking-wider mb-1 duration-200">
                {scanProgress}%
              </p>
              <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 rounded-full transition-all duration-100 shadow-[0_0_8px_rgba(6,182,212,1)]"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {scanState === 'completed' && (
            <div className="text-center relative z-10">
              <ShieldCheck className="text-emerald-400 mx-auto mb-2 animate-bounce" size={48} />
              <p className="text-[10px] font-mono text-emerald-400 font-black uppercase tracking-widest leading-none">
                UPLINK READY
              </p>
            </div>
          )}
        </div>

        {/* Node bypass coordinate pattern key input */}
        <div className="mb-4">
          <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mb-3">
            - Enter Decoupled Pattern Coordinates -
          </p>
          {renderDotsGrid()}
        </div>

        {/* Custom Actions */}
        <div className="space-y-3 relative z-10">
          <button
            onClick={handleTriggerScan}
            disabled={scanState === 'scanning'}
            className={`w-full py-3.5 rounded-2xl font-mono text-xs uppercase tracking-wider font-extrabold border transition-all cursor-pointer ${
              scanState === 'scanning'
                ? 'bg-zinc-950 border-white/5 text-zinc-600 cursor-not-allowed'
                : 'bg-cyan-500 border-cyan-400 text-black hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(6,182,212,0.45)]'
            }`}
          >
            {scanState === 'scanning' ? 'Scanning iris coordinates...' : 'SCAN FACE BIOMETRICS'}
          </button>

          <button
            onClick={onApproved}
            className="w-full py-2.5 rounded-xl bg-zinc-950 border border-white/5 text-[10px] font-mono text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition-colors"
          >
            Bypass Biometrics (Sandbox Guest Key)
          </button>
        </div>

        {/* Real-time system telemetry context clock */}
        <footer className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-zinc-600 uppercase">
          <div className="flex items-center gap-1">
            <Clock size={10} />
            <span>2026-05-27 UTC</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap size={10} className="text-emerald-500" />
            <span>ONYX-NODE UPLINK</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default BiometricScreen;
