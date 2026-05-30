// Voltagram High-Fidelity Futuristic Data Store (2035 Timeline)

export const ACCENT_COLORS = [
  { id: "cyan", name: "Neon Cyan", value: "#00f3ff", shadow: "rgba(0, 243, 255, 0.4)" },
  { id: "purple", name: "Psychedelic Purple", value: "#bd00ff", shadow: "rgba(189, 0, 255, 0.4)" },
  { id: "pink", name: "Cyber Pink", value: "#ff007f", shadow: "rgba(255, 0, 127, 0.4)" },
  { id: "green", name: "Hyper Green", value: "#39ff14", shadow: "rgba(57, 255, 20, 0.4)" },
];

export const CURRENT_USER = {
  name: "Alexander Vance",
  username: "vance.neural",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
  tier: "QUANTUM LEGEND",
  verified: true,
  followers: "42.8M",
  following: "1,035",
  nftBadgeId: "NFT-8392X-VOLT",
  bio: "Senior Sub-Space Relay Node Operator. Syncing reality loops since 2018. Member of the Decentralized Council of Cyberpunk Aesthetics.",
  timeline: [
    { id: 1, time: "09:30 UTC", event: "Decentralized identity re-validated on Solana v12" },
    { id: 2, time: "Yesterday", event: "Generated hyper-reel titled 'Neo-Tokyo Sunset' (8.2M Views)" },
    { id: 3, time: "2 days ago", event: "Upgraded node transceiver unit to 100 Quantum Exabytes/sec" },
  ],
};

export const STORIES = [
  {
    id: 1,
    user: "Nova Prime",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    hasActiveStory: true,
    viewed: false,
    storyContent: "https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&w=400&q=80",
    caption: "Deep space transmission nodes on peak efficiency today 🌌",
    filter: "QUANTUM NEON",
  },
  {
    id: 2,
    user: "Zero-Cool",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    hasActiveStory: true,
    viewed: false,
    storyContent: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=400&q=80",
    caption: "Overclocking the synapse chip. Do not ping. 🧠🔌",
    filter: "CHIP SYNC 2.0",
  },
  {
    id: 3,
    user: "Katarina V",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    hasActiveStory: true,
    viewed: true,
    storyContent: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80",
    caption: "Retro cyberpunk café in New Angeles. Coffee is still premium grade.",
    filter: "CHROME GLOW",
  },
  {
    id: 4,
    user: "Kai_3000",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80",
    hasActiveStory: true,
    viewed: false,
    storyContent: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80",
    caption: "VR flight test coordinates locked. See you in the slipstream.",
    filter: "GRID VECTOR",
  },
];

export const CALLS = [
  {
    id: 1,
    name: "Dr. Evelyn Wu",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
    type: "incoming",
    status: "Ringing neural connection...",
    cryptoVerified: "HASH-EE912",
  },
  {
    id: 2,
    name: "Orion Task Force",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80",
    type: "outgoing",
    status: "Completed multi-peer link",
    cryptoVerified: "POLY-LINK-87",
  },
];

export const REELS = [
  {
    id: 1,
    title: "Vaporwave Synths",
    creator: "PixelNoir",
    thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=300&q=80",
    views: "1.4M",
    likes: "250K",
  },
  {
    id: 2,
    title: "Quantum Compiler Secrets",
    creator: "TechSly",
    thumbnail: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80",
    views: "931K",
    likes: "182K",
  },
  {
    id: 3,
    title: "Metaspaces Tour 2035",
    creator: "GridWalker",
    thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=300&q=80",
    views: "3.2M",
    likes: "612K",
  },
];

export const BACKEND_ARCH = [
  { id: "node", name: "Node.js (v24)", desc: "Primary asymptotic event-loop runtime serving as our super-conductive service node base.", status: "OPTIMIZED", speed: "0.2ms latency" },
  { id: "express", name: "Express.js", desc: "Super-charged REST neural pipelines managing core encryption validation routing.", status: "LIVE", speed: "140K req/s" },
  { id: "socket", name: "Socket.IO (v6)", desc: "Websocket-v6 relay servers syncing reactive matrix messages instantly across devices.", status: "SYNCED", speed: "8.2M active links" },
  { id: "redis", name: "Redis Quantum", desc: "Non-volatile sub-nanosecond cache routing active sessions & neural presence states.", status: "ACTIVE", speed: "1.0 ns fetch" },
  { id: "mongo", name: "MongoDB Atlas v9", desc: "Decentralized document cluster holding multi-media feeds and JSON ledger telemetry.", status: "REPLICATED", speed: "No SQL shards" },
  { id: "postgres", name: "PostgreSQL 18", desc: "Core relational ledger maintaining ledger credentials, blockchain identity states, and user indices.", status: "SECURE", speed: "Fully Encrypted" },
  { id: "kafka", name: "Apache Kafka", desc: "Decentralized event stream broker filtering up to 10 Trillion message signals per solar cycle.", status: "STREAMING", speed: "Zero loss logs" },
  { id: "k8s", name: "Kubernetes Sub-Grid", desc: "Autonomous self-orchestrating pod grids mapping computing workloads on-demand.", status: "AUTO-SCALE", speed: "1,200 active nodes" },
  { id: "webrtc", name: "WebRTC Engine", desc: "Peer-to-peer real-time direct tunnels conveying ultra-HD 8K media signals securely.", status: "ESTABLISHED", speed: "99.9% direct link" },
  { id: "mediasoup", name: "Mediasoup SFU", desc: "Selective Forwarding Unit managing low latency, multi-party hypercomms with hardware encoding.", status: "ROUTING", speed: "8K 120 FPS" },
  { id: "docker", name: "Docker Sandbox", desc: "Isolated micro-environment capsules running containerized chat-bots in ironclad safety.", status: "SANDBOXED", speed: "Immutable" },
  { id: "aws", name: "AWS Graviton 5", desc: "Serverless quantum compute nodes dynamically auto-routed by deep space satlinks.", status: "HIGH ENERGY", speed: "Eco-green grid" },
  { id: "cloudflare", name: "Cloudflare Warp", desc: "Hypersonic edge shield preventing hyper-spatial DDOS, malicious cyber-waves, and quantum code injections.", status: "DEFENSE 100", speed: "Hyper-cached" },
];

export const CHATS = [
  {
    id: 1,
    name: "Evelyn Wu",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
    status: "active",
    unread: 2,
    online: true,
    lastActive: "Now",
    bio: "Chief AI Modality Architect at NeuraLink v6. Quantum network pioneer.",
    messages: [
      { id: 1, sender: "them", text: "Welcome to the future of messenger architecture. Did you push the latest Kafka broker upgrade?", time: "10:14 AM", seen: true },
      { id: 2, sender: "you", text: "Affirmative, the sub-space latency dropped to 0.4ms immediately. I also locked the quantum end-to-end encryption keys.", time: "10:15 AM", seen: true },
      { id: 3, sender: "them", text: "Outstanding! Let's test the WebRTC 8K stereo audio translation system in our next call.", time: "10:18 AM", unread: true },
      { id: 4, sender: "them", text: "The anti-hack AI protection looks completely solid.", time: "10:19 AM", unread: true }
    ]
  },
  {
    id: 2,
    name: "Zero-Cool (Hacker-Clan)",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    status: "offline",
    unread: 0,
    online: false,
    lastActive: "40s ago",
    bio: "Black-Hat converted to Blockchain Security Expert. Cyberpunk collector.",
    messages: [
      { id: 1, sender: "you", text: "Are you still tracking the network anomaly in Node #9?", time: "09:01 AM", seen: true },
      { id: 2, sender: "them", text: "Negative, it was just a localized solar loop. Spanner DB integrity is completely green.", time: "09:05 AM", seen: true }
    ]
  },
  {
    id: 3,
    name: "Katarina V",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    status: "active",
    unread: 0,
    online: true,
    lastActive: "Now",
    bio: "Metaspace Visual Designer. Constructing holographic social modules.",
    messages: [
      { id: 1, sender: "them", text: "Look at the new 3D floating dashboard panels in Voltagram!", time: "08:12 AM", seen: true },
      { id: 2, sender: "you", text: "They match Apple Vision Pro v4 styling perfectly! Glassmorphism overlays look incredibly realistic.", time: "08:15 AM", seen: true }
    ]
  },
  {
    id: 4,
    name: "Kai_3000",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80",
    status: "offline",
    unread: 0,
    online: false,
    lastActive: "2 hrs ago",
    bio: "Drone racing champion & neural sync pilot.",
    messages: [
      { id: 1, sender: "them", text: "Yo, flight telemetry sync completes in 5m. Standard P2P stream.", time: "Yesterday", seen: true }
    ]
  }
];

export const SOCIAL_POSTS = [
  {
    id: 1,
    creatorName: "Katarina V",
    creatorHandle: "katarina.design",
    creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
    content: "Just finalized the glassmorphic design language for Voltagram's 2035 release! Synthesizing extreme micro-vibrations and visual neon glows to make communication feel tactile and physical even on flat glass screens. What do you think of this layout? ✨🚀 #CyberpunkUI #FuturisticDesign",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    likes: "4.8K",
    comments: [
      { name: "vance.neural", text: "This looks staggeringly good. The blur filters are incredibly smooth." },
      { name: "Kai_3000", text: "Feels like I'm inside a cyberpunk cruiser dashboard." }
    ],
    liveStream: false,
  },
  {
    id: 2,
    creatorName: "Dr. Evelyn Wu",
    creatorHandle: "evelyn.neural",
    creatorAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80",
    content: "Voltagram live networks successfully survived a simulated 100 Terabit quantum decryption flood in our test nodes! The decentralized blockchain-based identity verification successfully rejected 100% of the unauthorized synapse cloning attempts. True zero-trust security is finally here. 🛡️💻",
    image: null,
    likes: "12.5K",
    comments: [
      { name: "Zero-Cool", text: "Incredible resilience. Usually Node.js setups buckle under cyber-pulse, but Kafka's buffered arrays performed miracles." }
    ],
    liveStream: false,
  },
  {
    id: 3,
    creatorName: "LUNA GLOBAL",
    creatorHandle: "luna.live",
    creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
    content: "BROADCAST ACTIVE: Launching our new orbital sub-relay server over Neo-Berlin! Live stream diagnostic overlays are flashing below. Link in to observe the quantum packet distribution. 🌌📡",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
    likes: "25.3K",
    comments: [],
    liveStream: true,
    viewers: "142K watching",
  }
];

export const SECURITY_FEATURES = [
  { id: "e2ee", name: "Ironclad E2EE v5", desc: "Keys rotated dynamically inside encrypted local hardware enclaves on every character typed.", status: "SECURE", icon: "Lock" },
  { id: "quantum", name: "Quantum Encryption (Lattice)", desc: "Resistance against decryption protocols of futuristic 2035 quantum computers.", status: "LIVE SYSTEM", icon: "ShieldAlert" },
  { id: "blockchain", name: "Solana Blockchain ID", desc: "No central logins. Your profile is validated across 4,000 decentralized nodes globally.", status: "VERIFIED", icon: "Link" },
  { id: "anti_hack", name: "Anti-Cloning Autonomous AI", desc: "Deters device spoofing and memory injection techniques instantly.", status: "THREAT CLEAR", icon: "ShieldCheck" },
  { id: "device", name: "Quantum Device Link", desc: "Dynamic hardware signature handshakes tracking device integrity.", status: "SYNCED", icon: "Cpu" },
  { id: "biometric", name: "Neural Biometric ID", desc: "Pulse and retina synchronization checking standard status loops.", status: "ACTIVE", icon: "Fingerprint" },
];
