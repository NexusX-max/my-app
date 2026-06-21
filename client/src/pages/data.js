// Static Asset Definitions for Onyx Drift AI Studio

export const COLOR_PRESETS = [
  {
    id: "night-drift",
    name: "Night Drift",
    description: "Deep nocturnal blues, ultra high-contrast shadows, and raw cold exposure.",
    cssClass: "brightness-95 contrast-125 saturate-75 sepia-[0.1] hue-rotate-[190deg]"
  },
  {
    id: "tokyo-neon",
    name: "Tokyo Neon",
    description: "Vibrant Tokyo nights, hyper cyber-cyan and oversaturated hot pink glow.",
    cssClass: "brightness-105 contrast-110 saturate-150 hue-rotate-[320deg] drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]"
  },
  {
    id: "dark-asphalt",
    name: "Dark Asphalt",
    description: "Monochrome urban canvas. High definition industrial grit and bleached whites.",
    cssClass: "grayscale brightness-90 contrast-135"
  },
  {
    id: "cyber-street",
    name: "Cyber Street",
    description: "Dystopian city vibe. Toxic green glows and highly saturated electric yellows.",
    cssClass: "brightness-100 contrast-115 saturate-[1.25] hue-rotate-[85deg]"
  },
  {
    id: "rain-run",
    name: "Rain Run",
    description: "Slick moody rain-soaked pavement. Heavy cold cyan grading with high film grain simulation.",
    cssClass: "brightness-90 contrast-105 saturate-[0.8] hue-rotate-[200deg]"
  },
  {
    id: "retro-japan",
    name: "Retro Japan",
    description: "Vintage 1990 VHS drift aesthetic, organic lens warmth, and sunset solarization.",
    cssClass: "sepia-[0.35] brightness-100 contrast-95 saturate-[1.1] hue-rotate-[-10deg]"
  }
];

export const TRACK_LIST = [
  {
    id: "track-1",
    title: "Tokyo Revenge Phonk",
    genre: "Phonk",
    duration: "2:45",
    bpm: 145,
    fileSize: "6.4MB",
    waveformPoints: [30, 45, 12, 67, 89, 43, 21, 65, 78, 90, 110, 43, 22, 65, 87, 100, 34, 12, 54, 87, 95, 65, 23, 10]
  },
  {
    id: "track-2",
    title: "V6 Twin Turbo",
    genre: "Drift",
    duration: "3:12",
    bpm: 130,
    fileSize: "7.2MB",
    waveformPoints: [20, 30, 40, 50, 45, 60, 80, 95, 110, 120, 100, 90, 80, 85, 95, 105, 110, 80, 60, 40, 30, 20, 10, 5]
  },
  {
    id: "track-3",
    title: "Akihabara Neon Beats",
    genre: "Gaming",
    duration: "2:20",
    bpm: 125,
    fileSize: "5.1MB",
    waveformPoints: [50, 60, 70, 80, 90, 60, 50, 70, 80, 90, 100, 80, 90, 100, 110, 120, 80, 70, 65, 50, 40, 30, 20, 10]
  },
  {
    id: "track-4",
    title: "Glitch Nocturnal Loop",
    genre: "Anime",
    duration: "2:58",
    bpm: 140,
    fileSize: "6.8MB",
    waveformPoints: [40, 30, 50, 60, 40, 80, 90, 100, 40, 30, 60, 70, 90, 100, 110, 50, 40, 60, 70, 90, 80, 50, 30, 20]
  },
  {
    id: "track-5",
    title: "Midnight Shinto Run",
    genre: "For You",
    duration: "3:30",
    bpm: 135,
    fileSize: "8.1MB",
    waveformPoints: [10, 20, 35, 50, 65, 80, 95, 110, 90, 75, 60, 50, 45, 60, 75, 90, 105, 120, 100, 80, 60, 40, 20, 10]
  }
];

export const STICKERS = [
  { id: "stk-drift", value: "🏎️ Drift Pro", type: "text", style: "bg-red-600 text-white font-black italic px-4 py-2 border-2 border-white rounded shadow-lg tracking-widest uppercase text-xl" },
  { id: "stk-tokyo", value: "東京 NOCTURNAL", type: "text", style: "bg-black text-rose-500 font-extrabold px-4 py-2 border-2 border-rose-500 rounded shadow-[0_0_15px_rgba(244,63,94,0.5)] tracking-widest text-lg" },
  { id: "stk-phonk", value: "🎧 PHONK", type: "text", style: "bg-yellow-400 text-black font-black px-4 py-1.5 border border-black rounded shadow-md tracking-wider transform -rotate-3 text-lg" },
  { id: "stk-boost", value: "🔥 BOOSTED", type: "text", style: "bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold px-4 py-2 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.6)] animate-pulse text-lg" },
  { id: "stk-jdm", value: "🇯🇵 JDM", type: "text", style: "bg-white text-black font-semibold border-2 border-red-500 px-3 py-1 text-base tracking-widest rounded shadow" },
  
  // High fidelity Picture presets (Unsplash)
  { id: "pic-speedometer", value: "https://images.unsplash.com/photo-1611244419377-b0a760c31352?auto=format&fit=crop&q=80&w=260", type: "image", label: "🚨 Redline HUD" },
  { id: "pic-steering", value: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=260", type: "image", label: "🏎️ Steering Wheel" },
  { id: "pic-wheel", value: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=260", type: "image", label: "🔥 Hot Wheels Glow" },
  { id: "pic-turbo", value: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=260", type: "image", label: "⚙️ Turbo Compressor" },

  { id: "stk-turbo", value: "🐌 TURBO", type: "emoji", style: "text-5xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]" },
  { id: "stk-flame", value: "🔥", type: "emoji", style: "text-6xl drop-shadow-[0_4px_12px_rgba(249,115,22,0.6)] animate-bounce" },
  { id: "stk-crown", value: "👑", type: "emoji", style: "text-6xl drop-shadow-[0_4px_12px_rgba(234,179,8,0.5)]" }
];

export const EFFECTS = [
  { id: "effect-glow", name: "Glow Burst", description: "Expands light sources with warm hyper-real chromatic blooms.", styleClass: "shadow-[inset_0_0_30px_rgba(236,72,153,0.6)] border-rose-500", effectValue: "glow-burst" },
  { id: "effect-blur", name: "Motion Blur", description: "Simulates high-velocity street movement with camera shutter drag.", styleClass: "blur-[1.5px] scale-[1.03]", effectValue: "motion-blur" },
  { id: "effect-shake", name: "Camera Shake", description: "High frequency impact shake mimicking solid-track racing chassis.", styleClass: "animate-[shake_0.4s_infinite]", effectValue: "camera-shake" },
  { id: "effect-flash", name: "Strobe Flash", description: "Synchronized white frames on downbeats to highlight drift clips.", styleClass: "animate-[pulse_0.2s_infinite]", effectValue: "strobe-flash" },
  { id: "effect-ramp", name: "Speed Ramp", description: "Dynamic fast-slow frame velocity curves for stylish tires-skid shots.", styleClass: "transition-all duration-300", effectValue: "speed-ramp" },
  { id: "effect-cinematic", name: "Cinematic Letterbox", description: "Adds ultra-wide aesthetic top and bottom cinema curtains.", styleClass: "before:content-[''] before:absolute before:inset-x-0 before:top-0 before:h-12 before:bg-black before:z-10 after:content-[''] after:absolute after:inset-x-0 after:bottom-0 after:h-12 after:bg-black after:z-10", effectValue: "letterbox" }
];

export const SAMPLE_CLIP_PLAYBACK = [
  {
    id: "clip-1",
    title: "Skyline Drift Engine Startup",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-on-a-wet-track-40114-large.mp4",
    thumbnail: "https://images.unsplash.com/photo-1611245801319-467475143301?w=400&auto=format&fit=crop&q=80",
    length: "15.0s",
    scenes: [
      { id: "s1", time: 0, text: "Revving Twin Turbo Inline 6 🚗💨" },
      { id: "s2", time: 4, text: "Tokyo Expressway Entry: Shift Up" },
      { id: "s3", time: 8, text: "Drift Angle Lock - Tires Burning 🏁" },
      { id: "s4", time: 12, text: "Cyber Lights Reflex" }
    ]
  }
];
