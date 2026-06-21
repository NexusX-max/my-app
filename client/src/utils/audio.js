// Web Audio API Synthesizer player for Voltagram
// Allows playing actual generated synth soundtracks for high-fidelity simulation without server external audio asset loads

let audioCtx = null;
let currentSynth = null;
let noteInterval = null;

const SONGS_MELODIES = {
  time_for_africa: [
    { note: 329.63, duration: 0.3, label: 'E4' }, // E
    { note: 392.00, duration: 0.3, label: 'G4' }, // G
    { note: 440.00, duration: 0.5, label: 'A4' }, // A
    { note: 440.00, duration: 0.3, label: 'A4' },
    { note: 392.00, duration: 0.3, label: 'G4' },
    { note: 349.23, duration: 0.6, label: 'F4' }, // F
    { note: 349.23, duration: 0.3, label: 'F4' },
    { note: 349.23, duration: 0.3, label: 'F4' },
    { note: 392.00, duration: 0.5, label: 'G4' },
    { note: 261.63, duration: 0.8, label: 'C4' }, // C
  ],
  lost_soul: [
    { note: 220.00, duration: 0.8, label: 'A3' },
    { note: 261.63, duration: 0.8, label: 'C4' },
    { note: 329.63, duration: 0.8, label: 'E4' },
    { note: 293.66, duration: 0.8, label: 'D4' },
    { note: 196.00, duration: 0.8, label: 'G3' },
    { note: 246.94, duration: 0.8, label: 'B3' },
    { note: 293.66, duration: 0.8, label: 'D4' },
    { note: 220.00, duration: 1.2, label: 'A3' },
  ],
  waka_waka: [
    { note: 293.66, duration: 0.25, label: 'D4' },
    { note: 293.66, duration: 0.25, label: 'D4' },
    { note: 293.66, duration: 0.25, label: 'D4' },
    { note: 329.63, duration: 0.5, label: 'E4' },
    { note: 392.00, duration: 0.25, label: 'G4' },
    { note: 392.00, duration: 0.25, label: 'G4' },
    { note: 349.23, duration: 0.5, label: 'F4' },
    { note: 329.63, duration: 0.5, label: 'E4' },
    { note: 293.66, duration: 0.75, label: 'D4' },
  ],
  birds_feather: [
    { note: 349.23, duration: 0.5, label: 'F4' },
    { note: 440.00, duration: 0.5, label: 'A4' },
    { note: 523.25, duration: 0.5, label: 'C5' },
    { note: 440.00, duration: 0.5, label: 'A4' },
    { note: 392.00, duration: 0.5, label: 'G4' },
    { note: 493.88, duration: 0.5, label: 'B4' },
    { note: 587.33, duration: 0.5, label: 'D5' },
    { note: 493.88, duration: 0.5, label: 'B4' },
  ],
  neon_sunset: [
    { note: 146.83, duration: 0.4, label: 'D3' },
    { note: 146.83, duration: 0.4, label: 'D3' },
    { note: 293.66, duration: 0.4, label: 'D4' },
    { note: 220.00, duration: 0.4, label: 'A3' },
    { note: 130.81, duration: 0.4, label: 'C3' },
    { note: 130.81, duration: 0.4, label: 'C3' },
    { note: 261.63, duration: 0.4, label: 'C4' },
    { note: 196.00, duration: 0.4, label: 'G3' },
  ]
};

export function ensureAudioContext() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    return null;
  }
}

export function startSynthSession(songId, onNoteTriggered = () => {}) {
  // Stop existing sessions if any (clears timer)
  if (noteInterval) {
    clearTimeout(noteInterval);
    noteInterval = null;
  }

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    
    // Always call helper to ensure we have a valid, resumed context
    ensureAudioContext();
    
    // Auto-resume if context is suspended by the browser's autoplay policy
    const autoResume = () => {
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume().catch(e => console.warn('AudioContext resume failed:', e));
      }
    };
    if (audioCtx && audioCtx.state === 'suspended') {
      autoResume();
      window.addEventListener('click', autoResume, { once: true });
      window.addEventListener('touchstart', autoResume, { once: true });
      window.addEventListener('mousedown', autoResume, { once: true });
    }
    
    // Master Gain for volume
    const masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.08, audioCtx.currentTime); // keep volume gentle
    masterGain.connect(audioCtx.destination);

    const melody = SONGS_MELODIES[songId] || SONGS_MELODIES['time_for_africa'];
    let noteIdx = 0;

    const playNextNote = () => {
      if (!audioCtx || audioCtx.state === 'closed') return;
      
      const currentNote = melody[noteIdx];
      const osc = audioCtx.createOscillator();
      const noteGain = audioCtx.createGain();
      
      // Determine synth type
      if (songId === 'lost_soul') {
        osc.type = 'sawtooth';
      } else if (songId === 'neon_sunset') {
        osc.type = 'square';
      } else if (songId === 'birds_feather') {
        osc.type = 'sine';
      } else {
        osc.type = 'triangle';
      }

      osc.frequency.setValueAtTime(currentNote.note, audioCtx.currentTime);
      
      // Envelope
      noteGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + currentNote.duration - 0.05);
      
      osc.connect(noteGain);
      noteGain.connect(masterGain);
      
      osc.start();
      osc.stop(audioCtx.currentTime + currentNote.duration);
      
      // Callback for visualizer sync
      onNoteTriggered(currentNote);

      noteIdx = (noteIdx + 1) % melody.length;
      
      // Schedule next note
      noteInterval = setTimeout(playNextNote, currentNote.duration * 1000);
    };

    // Begin loop
    playNextNote();
  } catch (err) {
    console.warn('Audio synthesis failed to initialize:', err);
  }
}

export function stopSynthSession() {
  if (noteInterval) {
    clearTimeout(noteInterval);
    noteInterval = null;
  }
  // Keep the audioCtx warm (alive) so it is ready for instant playback
  // without encountering browser programmatic autoplay blocks!
}

export function playSuccessChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const tempCtx = new AudioContextClass();
    const g = tempCtx.createGain();
    g.gain.setValueAtTime(0.05, tempCtx.currentTime);
    g.connect(tempCtx.destination);
    
    const o1 = tempCtx.createOscillator();
    o1.frequency.setValueAtTime(523.25, tempCtx.currentTime); // C5
    o1.frequency.setValueAtTime(659.25, tempCtx.currentTime + 0.1); // E5
    o1.frequency.setValueAtTime(783.99, tempCtx.currentTime + 0.2); // G5
    o1.frequency.setValueAtTime(1046.50, tempCtx.currentTime + 0.3); // C6
    
    o1.connect(g);
    o1.start();
    o1.stop(tempCtx.currentTime + 0.6);
    setTimeout(() => tempCtx.close(), 1000);
  } catch (e) {}
}

export function playCameraClick() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const tempCtx = new AudioContextClass();
    const g = tempCtx.createGain();
    g.gain.setValueAtTime(0.1, tempCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, tempCtx.currentTime + 0.15);
    g.connect(tempCtx.destination);
    
    const o = tempCtx.createOscillator();
    o.type = 'triangle';
    o.frequency.setValueAtTime(800, tempCtx.currentTime);
    o.frequency.exponentialRampToValueAtTime(120, tempCtx.currentTime + 0.1);
    
    o.connect(g);
    o.start();
    o.stop(tempCtx.currentTime + 0.15);
    setTimeout(() => tempCtx.close(), 500);
  } catch (e) {}
}

// Global user gesture unlock setup for browser environment compatibility
if (typeof window !== 'undefined') {
  const triggerGlobalAudioUnlock = () => {
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  };
  window.addEventListener('click', triggerGlobalAudioUnlock, { capture: true, passive: true });
  window.addEventListener('touchstart', triggerGlobalAudioUnlock, { capture: true, passive: true });
  window.addEventListener('mousedown', triggerGlobalAudioUnlock, { capture: true, passive: true });
}

