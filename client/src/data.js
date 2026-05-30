// Initial Data & Mock Models for Onyx Messenger

export const SOUND_MSG = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";
export const SOUND_CALL = "https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3";
export const SOUND_DANGER = "https://assets.mixkit.co/active_storage/sfx/892/892-preview.mp3";

export const GLOW_PRESETS = [
  { id: 'cyan', name: 'Cyber Cyan', glow: 'shadow-[0_0_20px_rgba(6,182,212,0.35)]', border: 'border-cyan-500/20', text: 'text-cyan-400', bg: 'bg-cyan-500', accent: '#06b6d4' },
  { id: 'purple', name: 'Neon Violet', glow: 'shadow-[0_0_20px_rgba(168,85,247,0.35)]', border: 'border-purple-500/20', text: 'text-purple-400', bg: 'bg-purple-500', accent: '#a855f7' },
  { id: 'crimson', name: 'Ruby Crimson', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.35)]', border: 'border-red-500/20', text: 'text-red-400', bg: 'bg-red-500', accent: '#ef4444' },
  { id: 'emerald', name: 'Matrix Green', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.35)]', border: 'border-emerald-500/20', text: 'text-emerald-400', bg: 'bg-emerald-500', accent: '#10b981' }
];

export const AMBIENT_SOUNDSCAPES = [
  { id: 'mute', name: 'Soundscapes Muted (Silent)', frequency: 0 },
  { id: 'data-hum', name: 'Mainframe Hum (80Hz Synth)', frequency: 80 },
  { id: 'neural-binaural', name: 'Theta Wave Sync (210Hz Pulse)', frequency: 210 },
  { id: 'cyber-drone', name: 'Deep Space Drone (60Hz Sub)', frequency: 60 }
];

export const INITIAL_CHATS = [
  {
    id: "bot-onyx",
    name: "Onyx Core Intelligence",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80",
    lastMsg: "Neural link aggregated. All modules operating optimally.",
    time: "03:00 AM",
    online: true,
    isBot: true,
    bio: "Core artificial intelligence framework. Serves advanced network routing logic and deep inquiry.",
    encryptionKey: "AES-512-NX",
    latency: "0.04ms"
  },
  {
    id: "bot-luna",
    name: "Dr. Luna Vane",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    lastMsg: "Your focus waves seem slightly hyperactive today. Rest is useful.",
    time: "2:54 AM",
    online: true,
    isBot: true,
    bio: "Chief Bio-Neural Psychologist of Onyx Citadel. Specialized in operator burnout preservation.",
    encryptionKey: "RSA-4096-LUNA",
    latency: "1.12ms"
  },
  {
    id: "user-kaelen",
    name: "Kaelen Vex",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    lastMsg: "Just bypass the mainframe port 3000 rules. It's direct ingress.",
    time: "Yesterday",
    online: true,
    isBot: false,
    bio: "Underground network decker and freelance ingress engineer. Likes bypass tools.",
    encryptionKey: "PGP-MEMBER-99",
    latency: "12ms"
  },
  {
    id: "user-sasha",
    name: "Sasha Glimmer",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    lastMsg: "Our audio visualizers look incredible. Try calling me to inspect!",
    time: "May 25",
    online: false,
    isBot: false,
    bio: "Synthetic interface architect. Obsessed with high-refresh neon render grids.",
    encryptionKey: "BLOWFISH-SS",
    latency: "35ms"
  }
];

export const INITIAL_GROUPS = [
  {
    id: "group-underground",
    name: "🛡️ Cybernetic Underground",
    description: "The main grid for rogue operators to trade security hacks and visual bypass codes.",
    membersCount: 124,
    avatar: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=300&q=80",
    lastMsg: "Operator 9: Framework has updated index.html",
    time: "1:45 AM",
    unread: true,
    members: [
      { id: "me", name: "Operator Node (You)", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" },
      { id: "user-kaelen", name: "Kaelen Vex", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80" },
      { id: "user-sasha", name: "Sasha Glimmer", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
      { id: "bot-luna", name: "Dr. Luna Vane", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80" }
    ]
  },
  {
    id: "group-quantum",
    name: "⚛️ Quantum Coders Guild",
    description: "Proving standard ESM bundle limits. No frameworks, just extreme performance physics.",
    membersCount: 42,
    avatar: "https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=300&q=80",
    lastMsg: "Kaelen Vex: Did we configure Vite watching correctly?",
    time: "May 24",
    unread: false,
    members: [
      { id: "me", name: "Operator Node (You)", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" },
      { id: "user-kaelen", name: "Kaelen Vex", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80" }
    ]
  }
];

export const INITIAL_MESSAGES = {
  "bot-onyx": [
    { id: "m1", sender: "bot-onyx", text: "Onyx Core Boot v4.8 completed. All neural signals intact.", time: "02:50 AM" },
    { id: "m2", sender: "me", text: "Is the secure tunnel configured?", time: "02:51 AM" },
    { id: "m3", sender: "bot-onyx", text: "Affirmative. AES-512 level encapsulation active on all terminal entries. Send queries for intelligence synthesis.", time: "02:52 AM" }
  ],
  "bot-luna": [
    { id: "ml1", sender: "bot-luna", text: "Greetings operator. I monitored your bioprofile spikes. Are you spending too many cycles code linking?", time: "02:40 AM" },
    { id: "ml2", sender: "me", text: "I'm optimizing the visual refresh rate.", time: "02:42 AM" },
    { id: "ml3", sender: "bot-luna", text: "A standard architectural trap. Beautiful visuals deserve dynamic neural rest. Ground yourself in our ambient soundscapes.", time: "02:43 AM" }
  ],
  "user-kaelen": [
    { id: "mk1", sender: "user-kaelen", text: "Yo, are you looking at the live reverse proxy streams?", time: "Yesterday" },
    { id: "mk2", sender: "me", text: "Yeah, port 3000 is running behind the nginx layer perfectly.", time: "Yesterday" },
    { id: "mk3", sender: "user-kaelen", text: "Excellent. Just bypass the mainframe port 3000 rules. It's direct ingress.", time: "Yesterday" }
  ],
  "user-sasha": [
    { id: "ms1", sender: "user-sasha", text: "Sash-Grid is operational! Have you previewed our new layout?", time: "May 25" },
    { id: "ms2", sender: "user-sasha", text: "Our audio visualizers look incredible. Try calling me to inspect!", time: "May 25" }
  ],
  "group-underground": [
    { id: "gu1", sender: "user-kaelen", text: "I've successfully uploaded the decryption patterns to node-b.", time: "01:30 AM" },
    { id: "gu2", sender: "bot-luna", text: "Remember to breathe between terminal hacks, Kaelen.", time: "01:31 AM" },
    { id: "gu3", sender: "user-sasha", text: "Can we build a custom client to mask these packet bursts description lines?", time: "01:40 AM" },
    { id: "gu4", sender: "bot-onyx", text: "Operator 9: Framework has updated index.html", time: "01:45 AM" }
  ],
  "group-quantum": [
    { id: "gq1", sender: "user-kaelen", text: "Vite build outputs look pristine.", time: "May 24" },
    { id: "gq2", sender: "me", text: "Absolute compilation success inside Cloud Run container.", time: "May 24" },
    { id: "gq3", sender: "user-kaelen", text: "Did we configure Vite watching correctly?", time: "May 24" }
  ]
};

export const MOCK_TRANSCRIPTS = [
  "Integrating speech-to-text audio analyzer...",
  "Neural link sync complete. Scanning phonetic telemetry.",
  "Frequency lock: 104.2MHz. High signal clarity.",
  "Operator speech detected: 'Bypassing central firewall node...'",
  "Transmission latency averages 0.08ms over secure fiber.",
  "Vibrational analysis indicates confidence rating of 98.4%",
  "Inbound link node speaking: 'We must compile the Applet before deployment.'",
  "Voice pattern verified. Security handshake accepted."
];
