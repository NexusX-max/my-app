import React, { useState, useEffect, useRef } from 'react';
import { 
  PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Shield, 
  Eye, EyeOff, Radio, Lock, Zap, RefreshCw, Layers 
} from 'lucide-react';
import { MOCK_TRANSCRIPTS } from '../data';

const CallScreen = ({
  callTarget,
  callType,
  onEndCall,
  activeAccent
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [isDenoiseOn, setIsDenoiseOn] = useState(true);
  const [callActiveTime, setCallActiveTime] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("Establishing quantum uplink. Syncing biometric signals...");
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [noiseFilterLevel, setNoiseFilterLevel] = useState(99.42);

  const canvasRef = useRef(null);
  const synthCtxRef = useRef(null);

  // Time counting hook
  useEffect(() => {
    const timer = setInterval(() => {
      setCallActiveTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulating live rolling transcripts popping up
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setCurrentTranscript(MOCK_TRANSCRIPTS[index % MOCK_TRANSCRIPTS.length]);
      index++;
      setNoiseFilterLevel(+(98 + Math.random() * 1.8).toFixed(2));
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Simulating crypt handshakes counting to 100
  useEffect(() => {
    const timer = setInterval(() => {
      setEncryptionProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 300);
    return () => clearInterval(timer);
  }, []);

  // Dynamic Frequency Canvas Oscillating rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw beautiful layered particle cyber-waves
      const waveCount = 3;
      const colors = [
        `rgba(6, 182, 212, ${isMuted ? '0.08' : '0.4'})`,  // Cyan
        `rgba(168, 85, 247, ${isMuted ? '0.05' : '0.25'})`, // Purple
        `rgba(255, 255, 255, ${isMuted ? '0.03' : '0.15'})` // White
      ];

      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        ctx.lineWidth = 1.5 + (w * 0.8);
        ctx.strokeStyle = colors[w];

        const frequency = 0.015 + (w * 0.005);
        const amplitude = isMuted ? 2 : (25 - (w * 5)) * (1 + Math.sin(phase * 0.5) * 0.2);

        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * frequency + phase + (w * Math.PI / 4)) * amplitude;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      phase += isMuted ? 0.02 : 0.09;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isMuted]);

  // Handle dial sounds directly from the browser Oscillator synth API when toggling options!
  const triggerBeepTone = (frequency = 440, type = 'sine') => {
    try {
      if (!synthCtxRef.current) {
        synthCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioCtx = synthCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      
      // Cyber decay gain envelope
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn("Synthesizer sound blocked in browser environment context.");
    }
  };

  const handleMuteBtn = () => {
    triggerBeepTone(isMuted ? 600 : 300, 'sine');
    setIsMuted(!isMuted);
  };

  const handleVideoBtn = () => {
    triggerBeepTone(isVideoOff ? 700 : 350, 'sawtooth');
    setIsVideoOff(!isVideoOff);
  };

  const formattedCallTime = () => {
    const mins = Math.floor(callActiveTime / 60);
    const secs = callActiveTime % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="call-interface-portal" className="fixed inset-0 z-[6000] bg-zinc-950 flex flex-col justify-between p-6 overflow-hidden">
      
      {/* Decorative tech grid overlay for call */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.04] to-purple-500/[0.04]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:30px_30px]" />

      {/* Header telemetry links */}
      <header className="flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/10 flex items-center justify-center">
            <Shield size={16} className="text-cyan-400 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 block uppercase">CRYP-MESH LEVEL-V</span>
            <span className="text-xs font-bold font-mono text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Zap size={11} className="text-emerald-400" /> SECURE HANDSHAPE ({Math.min(100, encryptionProgress)}%)
            </span>
          </div>
        </div>

        {/* Floating Call Time */}
        <div className="bg-zinc-900/80 border border-white/10 px-4 py-2 rounded-2xl font-mono text-xs text-cyan-400 flex items-center gap-2 font-bold shadow-[0_0_15px_rgba(6,182,212,0.1)]">
          <Radio size={12} className="text-cyan-400 animate-pulse" />
          <span>{formattedCallTime()}</span>
        </div>
      </header>

      {/* Main Calling Frame Grid split */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 my-6 items-center z-10 max-w-5xl mx-auto w-full">
        
        {/* Participant Profile / Avatar camera mock */}
        <div className="relative aspect-video rounded-[30px] overflow-hidden bg-zinc-900 border border-white/5 flex flex-col items-center justify-center p-6 shadow-2xl relative">
          
          {/* Subtle camera scanline overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.015] to-transparent bg-[size:100%_4px] pointer-events-none" />
          
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-xl border border-white/5 font-mono text-[10px] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>LINK FEED: OUTBOUND</span>
          </div>

          <div className="text-center">
            <div className="relative inline-block mb-4">
              <img 
                src={callTarget.avatar} 
                className="w-24 h-24 rounded-[30px] object-cover border-2 border-cyan-500/30 p-1 bg-zinc-950" 
                alt={callTarget.name} 
              />
              <div className="absolute inset-x-0 -bottom-2 flex justify-center">
                <span className="text-[8px] font-mono bg-cyan-950 border border-cyan-700 font-bold px-2 py-0.5 rounded text-cyan-400 uppercase tracking-widest">
                  {callTarget.latency || '0.2ms'}
                </span>
              </div>
            </div>
            <h3 className="font-mono text-base font-black text-white uppercase tracking-wider">{callTarget.name}</h3>
            <p className="text-[10px] font-mono text-zinc-500 uppercase mt-1">Remote Node Terminal</p>
          </div>
        </div>

        {/* Local Feed / Camera Mock with particle matrix fallback */}
        <div className="relative aspect-video rounded-[30px] overflow-hidden bg-zinc-900 border border-white/5 flex flex-col items-center justify-center p-6 shadow-2xl relative transition-all">
          
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-xl border border-white/5 font-mono text-[10px] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span>OPERATOR FEED: LOCAL</span>
          </div>

          {isVideoOff ? (
            <div className="text-center">
              <div className="w-20 h-20 rounded-[25px] bg-zinc-950 border border-white/10 mx-auto mb-4 flex items-center justify-center text-zinc-600 shadow-inner">
                <VideoOff size={28} />
              </div>
              <h4 className="font-mono text-sm font-bold text-zinc-400 uppercase">Camera Blocked</h4>
              <p className="text-[9px] font-mono text-zinc-600 uppercase mt-1">Bio-encryption Shielded</p>
            </div>
          ) : (
            <div className="absolute inset-0 bg-stone-900 flex items-center justify-center">
              {/* Dynamic glowing bio matrix represent mockup */}
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-cyan-500/10" />
              <div className="text-center relative z-10 p-4">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin flex items-center justify-center mx-auto mb-3">
                  <Radio size={20} className="text-cyan-400 animate-pulse" />
                </div>
                <p className="font-mono text-[11px] text-cyan-400 font-bold uppercase tracking-widest animate-pulse">
                  Simulating Ingress Camera Feedback
                </p>
                <p className="text-[8px] font-mono text-zinc-500 mt-1 uppercase">
                  Biometric Face Mesh Matrix Integrity 100%
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Acoustic wave visualizer and real-time phonetic transcript bar */}
      <section className="bg-zinc-950/80 border border-white/5 p-4 rounded-3xl max-w-4xl mx-auto w-full mb-6 relative z-10 overflow-hidden">
        
        {/* Real-time transcript ticker */}
        <div className="mb-3.5 pb-3 border-b border-white/5 flex items-start gap-3">
          <div className="bg-cyan-950/50 p-2 rounded-xl border border-cyan-800/30 text-cyan-400 shrink-0 select-none">
            <Layers size={14} className="animate-pulse" />
          </div>
          <div className="flex-1">
            <span className="text-[9px] font-mono text-cyan-500/80 uppercase font-black tracking-widest block mb-0.5">
              Phonetic Transcription Feed (Live Ticker)
            </span>
            <p className="text-zinc-300 font-mono text-xs italic animate-slide-up leading-relaxed">
              "{currentTranscript}"
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[9px] font-mono text-zinc-500 block">DNL SENSITIVITY</span>
            <span className="text-xs font-mono font-bold text-emerald-400">{noiseFilterLevel}dB</span>
          </div>
        </div>

        {/* Frequency Drawing Wave */}
        <div className="h-14 w-full relative">
          <canvas 
            ref={canvasRef} 
            width={600} 
            height={56} 
            className="w-full h-full block" 
          />
          <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-4 font-mono text-[8px] text-zinc-700 uppercase">
            <span>Grid Line A</span>
            <span>Freq Multi-Cap</span>
            <span>Grid Line B</span>
          </div>
        </div>
      </section>

      {/* Control console controls at the footer */}
      <footer className="z-10 bg-zinc-900 border border-white/10 rounded-[35px] max-w-xl mx-auto w-full p-4 flex justify-around items-center shrink-0 shadow-2xl">
        {/* Mute toggle button */}
        <button
          onClick={handleMuteBtn}
          className={`p-4 rounded-full border transition-all cursor-pointer ${
            isMuted 
              ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30' 
              : 'bg-zinc-800 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-700'
          }`}
          title={isMuted ? 'Unmute Audio link' : 'Mute Audio link'}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Video feed toggle button */}
        <button
          onClick={handleVideoBtn}
          className={`p-4 rounded-full border transition-all cursor-pointer ${
            isVideoOff 
              ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30' 
              : 'bg-zinc-800 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-700'
          }`}
          title={isVideoOff ? 'Enable camera' : 'Disable camera'}
        >
          {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>

        {/* Ambient background drone soundscape toggle button */}
        <button
          onClick={() => {
            triggerBeepTone(440, 'triangle');
            setIsDenoiseOn(!isDenoiseOn);
          }}
          className={`p-4 rounded-full border transition-all cursor-pointer ${
            isDenoiseOn 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
              : 'bg-zinc-800 border-white/5 text-zinc-500 hover:text-white hover:bg-zinc-700'
          }`}
          title="Digital Noise Filter Toggle"
        >
          <Radio size={20} />
        </button>

        {/* Extreme call cancellation protocol */}
        <button
          onClick={() => {
            triggerBeepTone(150, 'sawtooth');
            onEndCall();
          }}
          className="p-5 bg-red-600 hover:bg-red-500 rounded-full text-white transition-all transform active:scale-95 shadow-[0_0_25px_rgba(239,68,68,0.5)] cursor-pointer"
          title="Sever Quantum Tunnel link"
        >
          <PhoneOff size={22} />
        </button>
      </footer>
    </div>
  );
};

export default CallScreen;
