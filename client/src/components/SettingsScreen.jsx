import React, { useState } from 'react';
import { 
  User, Lock, Bell, MessageSquare, Phone, Database, Globe, Shield, 
  Palette, Users, BookOpen, Cpu, Gem, HelpCircle, Sliders, LogOut,
  Trash2, Check, ArrowLeft, KeySquare, ChevronRight, RefreshCw, 
  Smartphone, Eye, EyeOff, Radio, Plus, Trash, AlertTriangle, Play, Info
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
  // Mobile / Laptop layout selection state
  const [activeCategoryId, setActiveCategoryId] = useState(null); // null shows category list on mobile

  // --- 1. Account Settings States ---
  const [profileName, setProfileName] = useState(userProfile.name);
  const [profileBio, setProfileBio] = useState(userProfile.bio);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [username, setUsername] = useState("@decker_operator");
  const [phoneNumber, setPhoneNumber] = useState("+1 (555) 011-3000");
  const [emailAddress, setEmailAddress] = useState("operator@onyx.citadel");
  const [passwordInput, setPasswordInput] = useState("••••••••••••••••");
  const [is2faEnabled, setIs2faEnabled] = useState(true);
  const [verificationBadge, setVerificationBadge] = useState(true);

  // --- 2. Privacy Settings States ---
  const [lastSeen, setLastSeen] = useState("Nobody");
  const [onlineStatus, setOnlineStatus] = useState("Contacts Only");
  const [profilePhotoVisibility, setProfilePhotoVisibility] = useState("Everyone");
  const [storyVisibility, setStoryVisibility] = useState("Everyone");
  const [isReadReceiptsOn, setIsReadReceiptsOn] = useState(true);
  const [isTypingIndicatorOn, setIsTypingIndicatorOn] = useState(true);
  const [isActiveStatusOn, setIsActiveStatusOn] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState(["rogue_tracer_44", "mainframe_spy_9"]);
  const [restrictedUsers, setRestrictedUsers] = useState(["noisy_drift_node"]);
  const [hidePhoneNumber, setHidePhoneNumber] = useState(true);

  // --- 3. Notification Settings States ---
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [groupNotifications, setGroupNotifications] = useState(true);
  const [callNotifications, setCallNotifications] = useState(true);
  const [storyNotifications, setStoryNotifications] = useState(false);
  const [mentionNotifications, setMentionNotifications] = useState(true);
  const [selectedSound, setSelectedSound] = useState("cybernetic-blip");
  const [vibrationMode, setVibrationMode] = useState("cyber-pulse");
  const [muteAllNotifications, setMuteAllNotifications] = useState(false);

  // --- 4. Chat Settings States ---
  const [activeWallpaper, setActiveWallpaper] = useState("matrix-grid");
  const [fontSize, setFontSize] = useState("14px");
  const [autoDownload, setAutoDownload] = useState(true);
  const [autoSave, setAutoSave] = useState(false);
  const [ambientTranslation, setAmbientTranslation] = useState(true);
  const [backupSchedule, setBackupSchedule] = useState("Daily");
  const [backupStatus, setBackupStatus] = useState("Backup Synced");

  // --- 5. Call Settings States ---
  const [callQuality, setCallQuality] = useState("high-fidelity");
  const [dataSaver, setDataSaver] = useState(false);
  const [noiseCancellation, setNoiseCancellation] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [callRecording, setCallRecording] = useState(false);
  const [videoQuality, setVideoQuality] = useState("ultra-mesh");
  const [backgroundBlur, setBackgroundBlur] = useState(true);
  const [cameraEffects, setCameraEffects] = useState(false);

  // --- 6. Storage & Data States ---
  const [storageUsage, setStorageUsage] = useState("1.42 GB");
  const [cacheUsage, setCacheUsage] = useState("246.8 MB");
  const [downloadPreference, setDownloadPreference] = useState("wifi-only");
  const [mediaCompression, setMediaCompression] = useState(true);
  const [wifiOnlyDownloads, setWifiOnlyDownloads] = useState(true);

  // --- 7. Language & Region States ---
  const [activeLang, setActiveLang] = useState("English");
  const [activeRegion, setActiveRegion] = useState("Citadel Node 01");
  const [timeFormat, setTimeFormat] = useState("24H");
  const [dateFormat, setDateFormat] = useState("YYYY-MM-DD");

  // --- 8. Security Center States ---
  const [activeSessions, setActiveSessions] = useState([
    { id: "s1", device: "Onyx Deck Mainframe v4.8", location: "Singapore Ingress Proxy", active: true },
    { id: "s2", device: "Sub-Citadel Mobile Node", location: "Sector 7 Proxy Terminal", active: false }
  ]);
  const [securityAlerts, setSecurityAlerts] = useState(true);

  // --- 9. Appearance States ---
  const [chatBubbleStyle, setChatBubbleStyle] = useState("cyber-slanted");
  const [appIconTheme, setAppIconTheme] = useState("default-onyx");

  // --- 10. Group Settings States ---
  const [groupPermissions, setGroupPermissions] = useState("admins-only");
  const [isAdminControlsEnabled, setIsAdminControlsEnabled] = useState(true);
  const [joinRequests, setJoinRequests] = useState([
    { id: "j1", node: "drift_operator_x" },
    { id: "j2", node: "quantum_hacker" }
  ]);
  const [randomInviteHash, setRandomInviteHash] = useState("onyx-invite-9a4f2");

  // --- 11. Story Settings States ---
  const [storyPrivacy, setStoryPrivacy] = useState("contacts");
  const [isStoryArchiveEnabled, setIsStoryArchiveEnabled] = useState(true);
  const [storyAutoSave, setStoryAutoSave] = useState(false);
  const [isStoryReactionOn, setIsStoryReactionOn] = useState(true);

  // --- 12. AI Features States ---
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true);
  const [aiSummaryEnabled, setAiSummaryEnabled] = useState(true);
  const [aiTranslationEnabled, setAiTranslationEnabled] = useState(true);
  const [aiSuggestionsEnabled, setAiSuggestionsEnabled] = useState(true);
  const [aiImageGeneratorEnabled, setAiImageGeneratorEnabled] = useState(true);

  // --- 13. Premium Features States ---
  const [premiumActive, setPremiumActive] = useState(false);

  // --- 14. Help & Support States ---
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);
  const [problemReportText, setProblemReportText] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  // --- 15. Advanced States ---
  const [developerMode, setDeveloperMode] = useState(true);
  const [matrixRainEnabled, setMatrixRainEnabled] = useState(true);
  const [proxyURL, setProxyURL] = useState("https://ais-dev-onyx-grid/api");
  const [debugLogs, setDebugLogs] = useState([
    "BOOTSTRAP: Ingress stream synched flawlessly on Port 3000.",
    "DECRYPTION: Handshake matched with AES-512-NX key.",
    "AMBIENCE: Digital audio synthesizer hum mapped successfully."
  ]);

  // General state variables
  const [cleaningActive, setCleaningActive] = useState(false);

  // Action methods
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
      setCacheUsage("0 Bytes");
    }, 1500);
  };

  const addDebugLog = () => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [
      ...prev,
      `[${timestamp}] NODE_ALERT: Signal frequency re-aligned at ${+(0.08 + Math.random() * 0.05).toFixed(2)}ms.`
    ]);
  };

  // List of all 16 categories
  const categories = [
    { id: 'account', label: 'Account Settings', icon: User, color: 'text-cyan-400', desc: 'Secure profile identities and 2FA credentials' },
    { id: 'privacy', label: 'Privacy Settings', icon: Lock, color: 'text-purple-400', desc: 'Visibilities, read receipts and blocklists' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'text-amber-400', desc: 'Custom audio blips and vibration triggers' },
    { id: 'chat_settings', label: 'Chat Settings', icon: MessageSquare, color: 'text-green-400', desc: 'Wallpapers, text dimensions and data backup' },
    { id: 'call_settings', label: 'Call Settings', icon: Phone, color: 'text-pink-400', desc: 'Quality matrix and active recording options' },
    { id: 'storage', label: 'Storage & Data', icon: Database, color: 'text-indigo-400', desc: 'Purge signal caches and download restrictions' },
    { id: 'language', label: 'Language & Region', icon: Globe, color: 'text-emerald-400', desc: 'Core linguistic parameters and formats' },
    { id: 'security', label: 'Security Center', icon: Shield, color: 'text-red-400', desc: 'Revoke external sessions and inspect devices' },
    { id: 'appearance', label: 'Appearance', icon: Palette, color: 'text-violet-400', desc: 'Set cybermatic accents and glowing profiles' },
    { id: 'group_settings', label: 'Group Settings', icon: Users, color: 'text-sky-400', desc: 'Permissions, admin limits and invite tokens' },
    { id: 'story_settings', label: 'Story Settings', icon: BookOpen, color: 'text-rose-450', desc: 'Media archives and reaction logs' },
    { id: 'ai_features', label: 'AI Features', icon: Cpu, color: 'text-blue-400', desc: 'Translate transcripts and assistant options' },
    { id: 'premium', label: 'Premium Features', icon: Gem, color: 'text-yellow-400', desc: 'Signature verifications and analytics dashboards' },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, color: 'text-teal-400', desc: 'Read Citadel FAQS or submit bug parameters' },
    { id: 'advanced', label: 'Advanced Settings', icon: Sliders, color: 'text-orange-400', desc: 'Developer modes and interactive console feeds' },
    { id: 'acc_management', label: 'Account Management', icon: LogOut, color: 'text-red-500', desc: 'Terminal switches or purge system' }
  ];

  const currentCategoryId = activeCategoryId || 'account';

  return (
    <div id="settings-view-viewport" className="flex-1 h-full bg-black flex flex-col md:flex-row overflow-hidden relative">
      
      {/* Background ambient mesh */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/[0.012] via-transparent to-cyan-500/[0.012] pointer-events-none" />

      {/* LEFT COLUMN: Categories list (Responsive toggle based on activeCategoryId) */}
      <div className={`w-full md:w-[320px] lg:w-[360px] border-r border-white/5 bg-zinc-950 flex flex-col shrink-0 overflow-hidden ${
        activeCategoryId !== null ? 'hidden md:flex' : 'flex'
      }`}>
        <header className="p-5 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md flex items-center gap-4 z-10 shrink-0 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Return to messages"
            >
              <ArrowLeft size={15} />
            </button>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Citadel Config</h2>
              <p className="text-[9px] font-mono text-zinc-500 uppercase">16 Modular Sub-systems Loaded</p>
            </div>
          </div>
          <span className="text-[9px] font-mono bg-cyan-950/40 border border-cyan-800 text-cyan-400 px-1.5 py-0.5 rounded font-bold uppercase select-none animate-pulse">
            Sys Online
          </span>
        </header>

        {/* Scrollable categories lists */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 no-scrollbar">
          {categories.map((cat) => {
            const IconComponent = cat.icon;
            const isSelected = currentCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between group ${
                  isSelected 
                    ? 'bg-zinc-900 border-white/10 shadow-lg shadow-black/80' 
                    : 'bg-zinc-900/20 border-transparent hover:bg-zinc-900/40 hover:border-white/5'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-xl bg-zinc-950 border border-white/5 group-hover:scale-105 transition-transform ${cat.color}`}>
                    <IconComponent size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-mono font-bold leading-normal ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {cat.label}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-500 truncate max-w-[190px] mt-0.5 group-hover:text-zinc-400 transition-colors">
                      {cat.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight size={13} className="text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Specific Configuration Form (Responsive toggle based on activeCategoryId) */}
      <div className={`flex-1 h-full bg-black flex flex-col relative overflow-hidden ${
        activeCategoryId === null ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Header containing returns under mobile */}
        <header className="p-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md flex items-center gap-3.5 z-10 shrink-0">
          <button
            onClick={() => setActiveCategoryId(null)}
            className="md:hidden p-2.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Return to list"
          >
            <ArrowLeft size={15} />
          </button>
          
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-xl bg-zinc-900 border border-white/5 ${
              categories.find(c => c.id === currentCategoryId)?.color || 'text-cyan-400'
            }`}>
              {React.createElement(categories.find(c => c.id === currentCategoryId)?.icon || User, { size: 16 })}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-black text-white uppercase tracking-widest truncate">
                {categories.find(c => c.id === currentCategoryId)?.label}
              </h3>
              <p className="text-[9px] font-mono text-cyan-455 uppercase truncate">
                Configuration node parameters and controls
              </p>
            </div>
          </div>
        </header>

        {/* Scrollable details panel wrapper */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 no-scrollbar font-mono">
          
          {/* ==================== 1. ACCOUNT SETTINGS ==================== */}
          {currentCategoryId === 'account' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User size={13} /> Update Profile Info
                </h4>

                <form onSubmit={saveProfile} className="space-y-4">
                  <div className="flex items-center gap-4 py-2 border-b border-white/5 mb-2">
                    <img src={userProfile.avatar} className="w-14 h-14 rounded-2xl object-cover border border-white/10" alt="Avatar" />
                    <div>
                      <p className="text-[10px] text-zinc-500 block">ENCRYPTED IDENTITY CARD</p>
                      <p className="text-xs font-bold text-zinc-300 mt-0.5">SHA-256 Authorized Operator</p>
                      <span className="text-[8px] bg-cyan-950 border border-cyan-800 text-cyan-400 px-1 py-0.5 rounded font-black uppercase mt-1 inline-block">
                        Active Stream
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-zinc-500 block mb-1 uppercase">Node Custom Name</label>
                      <input 
                        type="text" 
                        value={profileName} 
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/30"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 block mb-1 uppercase">Profile Bio status</label>
                      <input 
                        type="text" 
                        value={profileBio} 
                        onChange={(e) => setProfileBio(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500/30"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-3 bg-cyan-500 text-black text-xs font-bold uppercase rounded-xl border border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.35)] transition-all cursor-pointer flex justify-center items-center gap-2"
                  >
                    {saveSuccess ? "Credentials Synced ✔" : "Sync Profile Changes"}
                  </button>
                </form>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Sliders size={13} /> Operator Credentials & verification
                </h4>

                <div className="space-y-3.5 pt-2">
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-300 block font-bold">Terminal Username</span>
                      <span className="text-[10px] text-zinc-500">Uniquely visible to peer search</span>
                    </div>
                    <input 
                      type="text" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      className="bg-zinc-950 border border-white/5 px-2.5 py-1 text-xs text-right text-cyan-400 focus:outline-none rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-300 block font-bold">Primary Satellite Phone</span>
                      <span className="text-[10px] text-zinc-500">Used for satellite incoming audio lines</span>
                    </div>
                    <input 
                      type="text" 
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-zinc-950 border border-white/5 px-2.5 py-1 text-xs text-right text-zinc-300 focus:outline-none rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-300 block font-bold">Email Coordinate</span>
                      <span className="text-[10px] text-zinc-500">Node recovery parameters address</span>
                    </div>
                    <input 
                      type="text" 
                      value={emailAddress} 
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="bg-zinc-950 border border-white/5 px-2.5 py-1 text-xs text-right text-zinc-300 focus:outline-none rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-300 block font-bold">Terminal Password</span>
                      <span className="text-[10px] text-zinc-500">Decryption key for loading interface</span>
                    </div>
                    <input 
                      type="password" 
                      value={passwordInput} 
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="bg-zinc-950 border border-white/5 px-2.5 py-1 text-xs text-right text-zinc-400 focus:outline-none rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-300 block font-bold">Two-Factor Encryption Pulse (2FA)</span>
                      <span className="text-[10px] text-zinc-500">Require visual sequence block verification</span>
                    </div>
                    <button 
                      onClick={() => setIs2faEnabled(!is2faEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        is2faEnabled ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {is2faEnabled ? 'PULSE ACTIVE' : 'INACTIVE'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-xs text-zinc-300 block font-bold">Identity Verification Badge</span>
                      <span className="text-[10px] text-zinc-500">Show high-security Verified seal on profile</span>
                    </div>
                    <button 
                      onClick={() => setVerificationBadge(!verificationBadge)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        verificationBadge ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {verificationBadge ? 'VERIFIED NODE' : 'UNVERIFIED'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 2. PRIVACY SETTINGS ==================== */}
          {currentCategoryId === 'privacy' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <Lock size={13} /> Secure Connection Visibilities
                </h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Last Seen Carbon Seal</span>
                      <span className="text-[10px] text-zinc-500">Who can view your last active timestamp</span>
                    </div>
                    <select 
                      value={lastSeen} 
                      onChange={(e) => setLastSeen(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2.5 py-1.5 text-xs text-zinc-300 rounded focus:outline-none"
                    >
                      <option value="Everyone">Everyone</option>
                      <option value="Contacts Only">Contacts Only</option>
                      <option value="Nobody">Nobody</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Online Status Handshake</span>
                      <span className="text-[10px] text-zinc-500">Transmit green active pulse indicators</span>
                    </div>
                    <select 
                      value={onlineStatus} 
                      onChange={(e) => setOnlineStatus(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2.5 py-1.5 text-xs text-zinc-300 rounded focus:outline-none"
                    >
                      <option value="Everyone">Everyone</option>
                      <option value="Contacts Only">Contacts Only</option>
                      <option value="Nobody">Nobody</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Profile Photo Encryption</span>
                      <span className="text-[10px] text-zinc-500">Limit peer avatar loading caches</span>
                    </div>
                    <select 
                      value={profilePhotoVisibility} 
                      onChange={(e) => setProfilePhotoVisibility(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2.5 py-1.5 text-xs text-zinc-300 rounded focus:outline-none"
                    >
                      <option value="Everyone">Everyone</option>
                      <option value="Contacts Only">Contacts Only</option>
                      <option value="Nobody">Nobody</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Media Story Broadcast privacy</span>
                      <span className="text-[10px] text-zinc-500">Visibility restrictions on story threads</span>
                    </div>
                    <select 
                      value={storyVisibility} 
                      onChange={(e) => setStoryVisibility(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2.5 py-1.5 text-xs text-zinc-300 rounded focus:outline-none"
                    >
                      <option value="Everyone">Everyone</option>
                      <option value="Contacts Only">Contacts Only</option>
                      <option value="Nobody">Nobody</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Read Receipts Checkmarks</span>
                      <span className="text-[10px] text-zinc-500">Emit neon double checks when message is read</span>
                    </div>
                    <button 
                      onClick={() => setIsReadReceiptsOn(!isReadReceiptsOn)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        isReadReceiptsOn ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {isReadReceiptsOn ? 'EMITTING' : 'MASKED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Typing Indicator wave</span>
                      <span className="text-[10px] text-zinc-500">Display dynamic parsing line above header</span>
                    </div>
                    <button 
                      onClick={() => setIsTypingIndicatorOn(!isTypingIndicatorOn)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        isTypingIndicatorOn ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {isTypingIndicatorOn ? 'ACTIVE' : 'MUTED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Hide Primary Satellite Phone No.</span>
                      <span className="text-[10px] text-zinc-500">Shield digit numbers from unregistered nodes</span>
                    </div>
                    <button 
                      onClick={() => setHidePhoneNumber(!hidePhoneNumber)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        hidePhoneNumber ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {hidePhoneNumber ? 'SHIELDED' : 'UNSHIELDED'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Blocked Users interactive list */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Blocked Peer Nodes ({blockedUsers.length})
                </h4>
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Rogue transmitters blocked from requesting audio rings or decryption channels.
                </p>

                <div className="space-y-2 pt-1.5">
                  {blockedUsers.map((user) => (
                    <div key={user} className="flex items-center justify-between bg-zinc-950/60 p-3 rounded-xl border border-white/5">
                      <span className="text-xs text-red-400 font-bold font-mono">@{user}</span>
                      <button 
                        onClick={() => setBlockedUsers(prev => prev.filter(b => b !== user))}
                        className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 hover:text-white bg-zinc-900 px-2.5 py-1 rounded border border-white/5 cursor-pointer"
                      >
                        Authorize Node
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-2">
                    <input 
                      type="text" 
                      placeholder="Insert peer username to block..." 
                      id="block-input-field" 
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          setBlockedUsers(prev => [...prev, e.target.value.trim()]);
                          e.target.value = "";
                        }
                      }}
                      className="flex-1 bg-zinc-950 border border-white/5 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-red-500/30 text-zinc-350"
                    />
                    <button 
                      onClick={() => {
                        const el = document.getElementById("block-input-field");
                        if (el && el.value.trim()) {
                          setBlockedUsers(prev => [...prev, el.value.trim()]);
                          el.value = "";
                        }
                      }}
                      className="px-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/20 cursor-pointer"
                    >
                      Block
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 3. NOTIFICATION SETTINGS ==================== */}
          {currentCategoryId === 'notifications' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Bell size={13} /> Alarm & Haptic Configuration
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-zinc-500">MUTE ALL CHANNELS</span>
                    <button 
                      onClick={() => setMuteAllNotifications(!muteAllNotifications)}
                      className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase ${
                        muteAllNotifications ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-zinc-950 text-zinc-400'
                      }`}
                    >
                      {muteAllNotifications ? 'Muted' : 'Sound On'}
                    </button>
                  </div>
                </div>

                <div className={`space-y-4 ${muteAllNotifications ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Direct Message Alarms</span>
                      <span className="text-[10px] text-zinc-500">Flash border when peer transmits package</span>
                    </div>
                    <button 
                      onClick={() => setMessageNotifications(!messageNotifications)}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                        messageNotifications ? 'bg-amber-500 justify-end' : 'bg-zinc-850 justify-start'
                      }`}
                    >
                      <span className="bg-black w-5 h-5 rounded-full" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Decentralized Group Ring</span>
                      <span className="text-[10px] text-zinc-500">Notify upon new text entries to active streams</span>
                    </div>
                    <button 
                      onClick={() => setGroupNotifications(!groupNotifications)}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                        groupNotifications ? 'bg-amber-500 justify-end' : 'bg-zinc-850 justify-start'
                      }`}
                    >
                      <span className="bg-black w-5 h-5 rounded-full" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Secure Call Ringing</span>
                      <span className="text-[10px] text-zinc-500">Trigger acoustic alarms on inbound calling links</span>
                    </div>
                    <button 
                      onClick={() => setCallNotifications(!callNotifications)}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                        callNotifications ? 'bg-amber-500 justify-end' : 'bg-zinc-850 justify-start'
                      }`}
                    >
                      <span className="bg-black w-5 h-5 rounded-full" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Story updates tracker</span>
                      <span className="text-[10px] text-zinc-500">Notify when peers publish raw story blocks</span>
                    </div>
                    <button 
                      onClick={() => setStoryNotifications(!storyNotifications)}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                        storyNotifications ? 'bg-amber-500 justify-end' : 'bg-zinc-850 justify-start'
                      }`}
                    >
                      <span className="bg-black w-5 h-5 rounded-full" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Mention Alert Handshakes</span>
                      <span className="text-[10px] text-zinc-500">Inbound notification when handle @me is labeled</span>
                    </div>
                    <button 
                      onClick={() => setMentionNotifications(!mentionNotifications)}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center p-0.5 ${
                        mentionNotifications ? 'bg-amber-500 justify-end' : 'bg-zinc-850 justify-start'
                      }`}
                    >
                      <span className="bg-black w-5 h-5 rounded-full" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Haptic Vibration Sequence</span>
                      <span className="text-[10px] text-zinc-500">Mobile mechanical feedback amplitude</span>
                    </div>
                    <select 
                      value={vibrationMode} 
                      onChange={(e) => setVibrationMode(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2 py-1.5 text-xs text-zinc-300 rounded"
                    >
                      <option value="none">Disabled</option>
                      <option value="soft-pulse">Soft Pulse</option>
                      <option value="cyber-pulse">Cyber Pulse (Short)</option>
                      <option value="critical-loop">Warning Beacon (Loop)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Acoustic Signal Sound</span>
                      <span className="text-[10px] text-zinc-500">Select simulated digital speaker track</span>
                    </div>
                    <select 
                      value={selectedSound} 
                      onChange={(e) => setSelectedSound(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2 py-1.5 text-xs text-zinc-300 rounded"
                    >
                      <option value="cybernetic-blip">Cyber Blip</option>
                      <option value="neon-echo">Neon Echo Sine</option>
                      <option value="analog-gong">Quantum Hum</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 4. CHAT SETTINGS ==================== */}
          {currentCategoryId === 'chat_settings' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare size={13} /> Rendering & Wallpapers
                </h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Canvas Background Matrix</span>
                      <span className="text-[10px] text-zinc-500">Toggle vector layout visualizer grids</span>
                    </div>
                    <select 
                      value={activeWallpaper} 
                      onChange={(e) => setActiveWallpaper(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2 py-1.5 text-xs text-zinc-200 rounded"
                    >
                      <option value="matrix-grid">Digital Matrix Grid</option>
                      <option value="carbon-solid">Carbon Dark Solid</option>
                      <option value="quantum-lines">Quantum Slanted lines</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Terminal Font Size Dimensions</span>
                      <span className="text-[10px] text-zinc-500">Scale message text readable size</span>
                    </div>
                    <select 
                      value={fontSize} 
                      onChange={(e) => setFontSize(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2 py-1.5 text-xs text-zinc-200 rounded"
                    >
                      <option value="11px">Compact (11px)</option>
                      <option value="14px">Optimized (14px)</option>
                      <option value="18px">Display (18px)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Auto-Download Media streams</span>
                      <span className="text-[10px] text-zinc-500">Allow auto decryption of camera image coordinates</span>
                    </div>
                    <button 
                      onClick={() => setAutoDownload(!autoDownload)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        autoDownload ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {autoDownload ? 'AUTO ON' : 'MANUAL'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Save Media Files to Local Cache</span>
                      <span className="text-[10px] text-zinc-500">Auto cache downloaded files locally</span>
                    </div>
                    <button 
                      onClick={() => setAutoSave(!autoSave)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        autoSave ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {autoSave ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Auto-Translation Node Link</span>
                      <span className="text-[10px] text-zinc-500">Translate foreign packet files via AI summarizer</span>
                    </div>
                    <button 
                      onClick={() => setAmbientTranslation(!ambientTranslation)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        ambientTranslation ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {ambientTranslation ? 'TRANSLATE ACTIVATED' : 'RAW'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Backups Sync interactive elements */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Cloud Signal Backups Dashboard
                </h4>
                <p className="text-[10px] text-zinc-500 leading-relaxed">
                  Encrypt the local chat index database into a consolidated .JSON package and submit to main server backup logs.
                </p>

                <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-200 font-bold block">{backupStatus} ({backupSchedule})</span>
                    <span className="text-[10px] text-zinc-500">Last uploaded backup index packet: 10 mins ago</span>
                  </div>
                  <button 
                    onClick={() => {
                      setBackupStatus("Uploading index...");
                      setTimeout(() => setBackupStatus("Backup Synced"), 1200);
                    }}
                    className="px-3 py-2 bg-green-500/10 border border-green-500/35 text-green-400 text-xs font-bold rounded-xl hover:bg-green-500/25 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <RefreshCw size={11} className="animate-spin" /> Manual Backup
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 5. CALL SETTINGS ==================== */}
          {currentCategoryId === 'call_settings' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-2">
                  <Phone size={13} /> Sat-Link & Call Quality Modulation
                </h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-250 block font-bold">Signal Compression Quality</span>
                      <span className="text-[10px] text-zinc-500">Satellite link calling audio resolution profiles</span>
                    </div>
                    <select 
                      value={callQuality} 
                      onChange={(e) => setCallQuality(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2 py-1.5 text-xs text-zinc-200 rounded"
                    >
                      <option value="satellite-low">Low-Bandwidth Satellite</option>
                      <option value="high-fidelity">High-Fidelity Fiber Link</option>
                      <option value="neural-synthesized">Neural Synthesized stream</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-250 block font-bold">Neural Data Saver Mode</span>
                      <span className="text-[10px] text-zinc-500">Minimize orbital downstream bytes bandwidth usage</span>
                    </div>
                    <button 
                      onClick={() => setDataSaver(!dataSaver)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        dataSaver ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {dataSaver ? 'ACTIVE SAVER' : 'UNLIMITED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-250 block font-bold">Acoustic Noise Cancellation</span>
                      <span className="text-[10px] text-zinc-500">Filter background hum frequencies using DSP</span>
                    </div>
                    <button 
                      onClick={() => setNoiseCancellation(!noiseCancellation)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        noiseCancellation ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {noiseCancellation ? 'ACTIVE DSP' : 'RAW ACOUSTIC'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-250 block font-bold">Echo Deflow Cancellation</span>
                      <span className="text-[10px] text-zinc-500">Bypass feedback sound loops inside speakers</span>
                    </div>
                    <button 
                      onClick={() => setEchoCancellation(!echoCancellation)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        echoCancellation ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {echoCancellation ? 'ACTIVE' : 'MUTED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-250 block font-bold">Record Calling Audio Packets</span>
                      <span className="text-[10px] text-zinc-500">Locally write calling audio stream as MP3</span>
                    </div>
                    <button 
                      onClick={() => setCallRecording(!callRecording)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        callRecording ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {callRecording ? 'RECORDING' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-250 block font-bold">Local Video Stream Frame</span>
                      <span className="text-[10px] text-zinc-500">Set resolution coordinates for orbital camera grid</span>
                    </div>
                    <select 
                      value={videoQuality} 
                      onChange={(e) => setVideoQuality(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2.5 py-1.5 text-xs text-zinc-200 rounded"
                    >
                      <option value="sd-480">Standard SD (480p)</option>
                      <option value="hd-720">HD Resolution (720p)</option>
                      <option value="ultra-mesh">Ultra-Mesh Quantum Feed</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-250 block font-bold">Background Lens Blur</span>
                      <span className="text-[10px] text-zinc-500">Dynamically obscure background grid outline</span>
                    </div>
                    <button 
                      onClick={() => setBackgroundBlur(!backgroundBlur)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        backgroundBlur ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {backgroundBlur ? 'SOFT-BLUR ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 6. STORAGE & DATA ==================== */}
          {currentCategoryId === 'storage' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5">
                  <span className="text-[9px] text-zinc-500 block uppercase font-mono mb-1">Decrypted Index Space</span>
                  <p className="text-2xl font-bold font-mono tracking-wider text-indigo-400">{storageUsage}</p>
                  <p className="text-[10px] text-zinc-500 mt-2">Active chats and downloaded files logs size</p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] text-zinc-500 block uppercase font-mono mb-1">Temporary Cache log index</span>
                    <p className="text-xl font-bold font-mono tracking-wider text-zinc-300">{cacheUsage}</p>
                  </div>
                  <button 
                    onClick={executeCacheCleaning}
                    disabled={cleaningActive}
                    className="mt-3 w-full py-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/25 text-red-400 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer flex justify-center items-center gap-1.5"
                  >
                    <Trash2 size={11} className={cleaningActive ? 'animate-bounce' : ''} />
                    {cleaningActive ? 'Purging local files...' : 'Purge cache & reload'}
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Media Auto-Download restrictions
                </h4>

                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-250 block font-bold">Preferred Download Satellite Route</span>
                      <span className="text-[10px] text-zinc-500">Allow media decoding channels on network route</span>
                    </div>
                    <select 
                      value={downloadPreference} 
                      onChange={(e) => setDownloadPreference(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2 py-1.5 text-xs text-zinc-200 rounded"
                    >
                      <option value="any">Cellular or Wi-Fi</option>
                      <option value="wifi-only">Only Satellite Wi-Fi</option>
                      <option value="never">Never auto-load</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-250 block font-bold">Fuzzy Media Compression</span>
                      <span className="text-[10px] text-zinc-500">Compress outbound camera files to maximize uplink</span>
                    </div>
                    <button 
                      onClick={() => setMediaCompression(!mediaCompression)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        mediaCompression ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {mediaCompression ? 'SAVE BANDWIDTH' : 'LOSSLESS RAW'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-250 block font-bold">Restrict Large PDF Document feeds</span>
                      <span className="text-[10px] text-zinc-500">Only fetch coordinates under 10MB when on roaming link</span>
                    </div>
                    <button 
                      onClick={() => setWifiOnlyDownloads(!wifiOnlyDownloads)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        wifiOnlyDownloads ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {wifiOnlyDownloads ? 'RESTRICTED' : 'UNLIMITED'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 7. LANGUAGE & REGION ==================== */}
          {currentCategoryId === 'language' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Globe size={13} /> Linguistic Core Adjust
                </h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Core Dictionary Language</span>
                      <span className="text-[10px] text-zinc-500">Translate interactive screens descriptions</span>
                    </div>
                    <select 
                      value={activeLang} 
                      onChange={(e) => setActiveLang(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2 py-1.5 text-xs text-zinc-200 rounded"
                    >
                      <option value="English">English Standard</option>
                      <option value="Bengali">Bengali (বাংলা)</option>
                      <option value="Japanese">Neo-Tokyo Nihongo (日本語)</option>
                      <option value="Cyber-Slang">Citadel Hybrid Cyber-Slang</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Active Geocentric Station</span>
                      <span className="text-[10px] text-zinc-500">Station node identifier lookup for proxies</span>
                    </div>
                    <select 
                      value={activeRegion} 
                      onChange={(e) => setActiveRegion(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2 py-1.5 text-xs text-zinc-200 rounded"
                    >
                      <option value="Citadel Node 01">Citadel geostationary Node 1</option>
                      <option value="Sector 4 Ground">Sector 4 Earth Ground level</option>
                      <option value="Orbiting Helix">Orbiting Helix Grid-C</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Time coordinate representation</span>
                      <span className="text-[10px] text-zinc-500">Switch clocks between standard UTC or localized</span>
                    </div>
                    <button 
                      onClick={() => setTimeFormat(timeFormat === '24H' ? '12H' : '24H')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-white/5 text-xs text-emerald-400 font-bold"
                    >
                      {timeFormat} FORMAT clock
                    </button>
                  </div>

                  <div className="flex items-center justify-between pb-3">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Diagnostic Date representation</span>
                      <span className="text-[10px] text-zinc-500">Sequence layout syntax for status reports</span>
                    </div>
                    <select 
                      value={dateFormat} 
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2 py-1.5 text-xs text-zinc-200 rounded"
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD (2026-05-31)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (31/05/2026)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 8. SECURITY CENTER ==================== */}
          {currentCategoryId === 'security' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2">
                  <Shield size={13} /> Inspected Session Nodes
                </h4>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Inspect secure terminals verified under your credentials key. Revoke foreign nodes if any unauthorized packet stream is scanned.
                </p>

                <div className="space-y-3 pt-1">
                  {activeSessions.map((ses) => (
                    <div key={ses.id} className="p-3 bg-zinc-950 border border-white/5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Smartphone size={16} className={ses.active ? 'text-red-400 animate-pulse' : 'text-zinc-600'} />
                        <div>
                          <span className="text-xs text-zinc-250 block font-bold">
                            {ses.device} {ses.active && <span className="text-[8px] bg-red-950 border border-red-800 text-red-400 px-1 py-0.5 rounded ml-1 tracking-widest font-black uppercase">CURRENT</span>}
                          </span>
                          <span className="text-[10px] text-zinc-500">{ses.location}</span>
                        </div>
                      </div>

                      {!ses.active ? (
                        <button 
                          onClick={() => setActiveSessions(prev => prev.filter(s => s.id !== ses.id))}
                          className="px-2.5 py-1 bg-red-500/10 border border-red-500/35 text-red-500 text-[10px] hover:text-white hover:bg-red-500/20 rounded cursor-pointer"
                        >
                          Revoke Node
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-500">AES-512 Master</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-200 block font-bold">Active Hardware Security Warnings</span>
                    <span className="text-[10px] text-zinc-500">Audit login attempts and trigger alarms on new link</span>
                  </div>
                  <button 
                    onClick={() => setSecurityAlerts(!securityAlerts)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                      securityAlerts ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-zinc-950 text-zinc-500'
                    }`}
                  >
                    {securityAlerts ? 'ALERTS ON' : 'SILENT'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 9. APPEARANCE ==================== */}
          {currentCategoryId === 'appearance' && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Theme select cloned logic */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-2">
                  <Palette size={13} /> Cybernetic presences & glow theme
                </h4>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Re-orient the telemetry light waves of the Onyx Chat screen. Accents propagate instantly to the sidebars, glow frames, and visual indicators.
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
                          <span className="text-xs font-bold text-zinc-200">{preset.name}</span>
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
              </div>

              {/* Chat bubble styling presets */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Interactive Text Bubble Geometry
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Message Bubble style</span>
                      <span className="text-[10px] text-zinc-500">Adjust the visual geometry borders of chat logs</span>
                    </div>
                    <select 
                      value={chatBubbleStyle} 
                      onChange={(e) => setChatBubbleStyle(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2 py-1.5 text-xs text-zinc-200 rounded"
                    >
                      <option value="flat">Standard Box (Flat)</option>
                      <option value="cyber-slanted">Slanted Sci-Fi Corners</option>
                      <option value="classic-rounded">Classic Rounded</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">App Launcher Custom Icon</span>
                      <span className="text-[10px] text-zinc-500">Configure visual mock launcher theme</span>
                    </div>
                    <select 
                      value={appIconTheme} 
                      onChange={(e) => setAppIconTheme(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2 py-1.5 text-xs text-zinc-200 rounded"
                    >
                      <option value="default-onyx">Default Onyx Core</option>
                      <option value="neon-holo">Neon Blue Hologram</option>
                      <option value="crimson-secure">Crimson Secure Shield</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* sound scape hum preset */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Acoustic background hum waves
                </h4>
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
                          <span className="text-xs font-bold text-zinc-200">{sound.name}</span>
                          <span className="text-[9px] text-zinc-500">
                            {sound.frequency ? `Oscillating Wave: ${sound.frequency}Hz` : 'Silence node state'}
                          </span>
                        </div>
                        {isSelected && <Check size={13} className="text-emerald-400 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 10. GROUP SETTINGS ==================== */}
          {currentCategoryId === 'group_settings' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                  <Users size={13} /> Collective permissions
                </h4>

                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Write Transmission Authority</span>
                      <span className="text-[10px] text-zinc-500">Who can emit messages inside neural group rooms</span>
                    </div>
                    <select 
                      value={groupPermissions} 
                      onChange={(e) => setGroupPermissions(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2 py-1.5 text-xs text-zinc-200 rounded"
                    >
                      <option value="everyone">All Room Nodes</option>
                      <option value="admins-only">Room Admin Nodes Only</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Admin bypass approval checks</span>
                      <span className="text-[10px] text-zinc-500">Require administrator handshakes before adding peer</span>
                    </div>
                    <button 
                      onClick={() => setIsAdminControlsEnabled(!isAdminControlsEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        isAdminControlsEnabled ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {isAdminControlsEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Room Invite custom hash link</span>
                      <span className="text-[10px] text-zinc-500">Secure entry access string token</span>
                    </div>
                    <span className="text-xs bg-zinc-950 px-2.5 py-1 text-sky-400 font-bold border border-white/5 rounded">
                      {randomInviteHash}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pending requests */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Pending Entrance Handshakes ({joinRequests.length})
                </h4>
                <p className="text-[10px] text-zinc-500 leading-normal">
                  Incoming operators requested to connect with Citadel channels.
                </p>

                <div className="space-y-2 pt-1.5">
                  {joinRequests.map((req) => (
                    <div key={req.id} className="flex items-center justify-between bg-zinc-950/60 p-3 rounded-xl border border-white/5">
                      <span className="text-xs text-sky-400 font-bold">@{req.node}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setJoinRequests(prev => prev.filter(r => r.id !== req.id))}
                          className="px-2.5 py-1 rounded bg-green-500/10 text-green-400 text-[10px] font-bold border border-green-500/20 hover:bg-green-500/25 cursor-pointer"
                        >
                          Approve entry
                        </button>
                        <button 
                          onClick={() => setJoinRequests(prev => prev.filter(r => r.id !== req.id))}
                          className="px-2.5 py-1 rounded bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-500/20 hover:bg-red-500/25 cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 11. STORY SETTINGS ==================== */}
          {currentCategoryId === 'story_settings' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen size={13} /> Temporary visual stories visibility
                </h4>

                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Broadcast visibility limit</span>
                      <span className="text-[10px] text-zinc-500">Who can load your 24-hour visual media stories</span>
                    </div>
                    <select 
                      value={storyPrivacy} 
                      onChange={(e) => setStoryPrivacy(e.target.value)}
                      className="bg-zinc-950 border border-white/10 px-2 py-1.5 text-xs text-zinc-200 rounded"
                    >
                      <option value="everyone">All Connected Nodes</option>
                      <option value="contacts">My Direct Peer Nodes</option>
                      <option value="only-me">Private Archive</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Auto-Save stories to decrypted index</span>
                      <span className="text-[10px] text-zinc-500">Keep expired story blocks inside private history fold</span>
                    </div>
                    <button 
                      onClick={() => setIsStoryArchiveEnabled(!isStoryArchiveEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        isStoryArchiveEnabled ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {isStoryArchiveEnabled ? 'ARCHIVE ACTIVE' : 'AUTO-DELETE'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Auto-Save received stories</span>
                      <span className="text-[10px] text-zinc-500">Write other peer stories immediately in download segment</span>
                    </div>
                    <button 
                      onClick={() => setStoryAutoSave(!storyAutoSave)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        storyAutoSave ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {storyAutoSave ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pb-3">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Story quick reaction keys</span>
                      <span className="text-[10px] text-zinc-500">Enable peer nodes to send micro expression handshakes</span>
                    </div>
                    <button 
                      onClick={() => setIsStoryReactionOn(!isStoryReactionOn)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        isStoryReactionOn ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {isStoryReactionOn ? 'REACTIONS ACTIVE' : 'REACTIONS FILTERED'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 12. AI FEATURES ==================== */}
          {currentCategoryId === 'ai_features' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                  <Cpu size={13} /> Gemini neural model filters
                </h4>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  Configure integrated model configurations. Onyx connects with Google's advanced Gemini frameworks to summarize and decrypt peer outputs.
                </p>

                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-250 block font-bold">Enable Onyx AI assistant bot</span>
                      <span className="text-[10px] text-zinc-500">Allow AI bot responses in direct chat list</span>
                    </div>
                    <button 
                      onClick={() => setAiAssistantEnabled(!aiAssistantEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        aiAssistantEnabled ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {aiAssistantEnabled ? 'AI ASSISTANT ENABLED' : 'BOT MUTED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-250 block font-bold">AI Chat summaries panel</span>
                      <span className="text-[10px] text-zinc-500">Auto transcribe group coordinates upon handshake</span>
                    </div>
                    <button 
                      onClick={() => setAiSummaryEnabled(!aiSummaryEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        aiSummaryEnabled ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {aiSummaryEnabled ? 'ACTIVE TRANSCRIBE' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-250 block font-bold">AI Live Translation feeds</span>
                      <span className="text-[10px] text-zinc-500">Decrypt foreign language feeds automatically</span>
                    </div>
                    <button 
                      onClick={() => setAiTranslationEnabled(!aiTranslationEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        aiTranslationEnabled ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {aiTranslationEnabled ? 'ACTIVE DECRYPTION' : 'DISABLED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-250 block font-bold">Suggested Quick reply scripts</span>
                      <span className="text-[10px] text-zinc-500">Provide phonetic shortcut templates below chat bar</span>
                    </div>
                    <button 
                      onClick={() => setAiSuggestionsEnabled(!aiSuggestionsEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        aiSuggestionsEnabled ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {aiSuggestionsEnabled ? 'ACTIVE SUGGEST' : 'OFF'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-250 block font-bold">AI Image generation pipeline</span>
                      <span className="text-[10px] text-zinc-500">Allow media generation using custom textual prompt feeds</span>
                    </div>
                    <button 
                      onClick={() => setAiImageGeneratorEnabled(!aiImageGeneratorEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        aiImageGeneratorEnabled ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {aiImageGeneratorEnabled ? 'PIPELINE ACTIVE' : 'LOCKED'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 13. PREMIUM FEATURES ==================== */}
          {currentCategoryId === 'premium' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-6 rounded-2xl bg-zinc-900/40 border border-white/5 relative overflow-hidden text-center">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/30 to-transparent" />
                <div className="mb-4 inline-flex p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
                  <Gem size={28} className="animate-bounce" />
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider mb-2">
                  Upgrade to Onyx Prime signature status
                </h4>
                <p className="text-[11px] text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
                  Enable premium verifications, signature profile glowing matrices, uncompromised satellite bandwidth downloads and orbital system metrics.
                </p>

                <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-white/5 rounded-xl text-left mb-6">
                  <div>
                    <span className="text-xs text-yellow-405 font-bold block">Node Verified Badge status</span>
                    <span className="text-[10px] text-zinc-500">Displays verified golden badge beside user profile</span>
                  </div>
                  <button 
                    onClick={() => setPremiumActive(!premiumActive)}
                    className={`px-4 py-2 text-xs font-bold rounded-xl uppercase transition-all ${
                      premiumActive ? 'bg-yellow-500 text-black border border-yellow-400 hover:shadow-[0_0_12px_rgba(234,179,8,0.35)]' : 'bg-zinc-90 w bg-zinc-950 text-zinc-500 border border-transparent'
                    }`}
                  >
                    {premiumActive ? 'Active Signature' : 'Verify Node'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-3.5 bg-zinc-950/20 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-yellow-505 font-bold block">Prime Exclusive Themes</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">Unlock Crimson Cyber and Toxic emerald neon matrix overlays.</p>
                  </div>
                  <div className="p-3.5 bg-zinc-950/20 border border-white/5 rounded-xl">
                    <span className="text-[10px] text-yellow-505 font-bold block">Detailed Signal Stats</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-normal">Inspect real-time reverse proxy connection logs on the sidebar.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 14. HELP & SUPPORT ==================== */}
          {currentCategoryId === 'help' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle size={13} /> Secure FAQ Handbooks
                </h4>

                {/* FAQ Toggles */}
                <div className="space-y-2.5">
                  {[
                    { q: "What is the Geostationary Ingress link Port 3000?", a: "Onyx runs behind an advanced reverse-proxy container routing only on port 3000. Keep this configured correctly inside package.json, otherwise standard client handshakes fail." },
                    { q: "Is the message history persistent?", a: "By default, Onyx Chat saves message history locally. You can sync files to the server using the Chat Settings backup module." },
                    { q: "How do I upgrade to Premium status?", a: "Tap on the Premium Features section and click on the 'Activate Signature Verification' button to verify your node status instantly." }
                  ].map((faq, index) => {
                    const isOpen = faqOpenIndex === index;
                    return (
                      <div key={index} className="bg-zinc-950 border border-white/5 rounded-xl overflow-hidden">
                        <button 
                          onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                          className="w-full p-3.5 text-left text-xs font-bold font-mono text-zinc-200 hover:text-white flex justify-between items-center cursor-pointer"
                        >
                          <span>{faq.q}</span>
                          <span className="text-[10px] text-zinc-500">{isOpen ? "[Collapse]" : "[Expand]"}</span>
                        </button>
                        {isOpen && (
                          <div className="p-3.5 pt-0 border-t border-white/5 text-[10px] leading-relaxed text-zinc-400 font-mono">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bug report form */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  Submit Telemetry Issue parameters
                </h4>

                <div className="space-y-3.5">
                  <textarea 
                    value={problemReportText}
                    onChange={(e) => setProblemReportText(e.target.value)}
                    placeholder="Describe diagnostic anomaly logs..." 
                    className="w-full min-h-[90px] bg-zinc-950 border border-white/15 focus:border-teal-500/35 rounded-xl p-3 text-xs focus:outline-none focus:text-white font-mono text-zinc-300"
                  />
                  
                  <button 
                    onClick={() => {
                      if (problemReportText.trim()) {
                        setReportSuccess(true);
                        setProblemReportText("");
                        setTimeout(() => setReportSuccess(false), 3000);
                      }
                    }}
                    className="w-full py-2.5 bg-teal-500 text-black font-sans text-xs font-bold uppercase rounded-xl hover:shadow-[0_0_12px_rgba(20,184,166,0.35)] transition-all cursor-pointer"
                  >
                    {reportSuccess ? "Anomalies Submitted ✔" : "Transmit Anomaly logs"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================== 15. ADVANCED SETTINGS ==================== */}
          {currentCategoryId === 'advanced' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                  <Sliders size={13} /> Developer mode configuration
                </h4>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Active Developer controls</span>
                      <span className="text-[10px] text-zinc-500">Inject raw diagnostic log trackers on sidebar</span>
                    </div>
                    <button 
                      onClick={() => setDeveloperMode(!developerMode)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        developerMode ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {developerMode ? 'ACTIVE MODE' : 'LOCKED'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Simulate Matrix Rain canvas overlay</span>
                      <span className="text-[10px] text-zinc-500">Inject fluid digital rain in browser background</span>
                    </div>
                    <button 
                      onClick={() => setMatrixRainEnabled(!matrixRainEnabled)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold ${
                        matrixRainEnabled ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      {matrixRainEnabled ? 'RAIN ACTIVE' : 'STEADY'}
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5 pt-2">
                    <label className="text-[10px] text-zinc-500 block uppercase">Custom Core Ingress Proxy Endpoint</label>
                    <input 
                      type="text" 
                      value={proxyURL} 
                      onChange={(e) => setProxyURL(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-zinc-300 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Debug logs console */}
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Interactive diagnostic console feeds
                  </h4>
                  <button 
                    onClick={addDebugLog}
                    className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded text-[9px] hover:bg-orange-500/20 cursor-pointer"
                  >
                    Emit test signal
                  </button>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-white/10 max-h-[160px] overflow-y-auto font-mono text-[9px] text-amber-500/90 space-y-1">
                  {debugLogs.map((log, i) => (
                    <p key={i} className="leading-relaxed hover:text-white transition-colors">
                      &gt; {log}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== 16. ACCOUNT MANAGEMENT ==================== */}
          {currentCategoryId === 'acc_management' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-zinc-900/40 border border-white/5 space-y-4">
                <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-2">
                  <LogOut size={13} /> De-authorization of console
                </h4>
                <p className="text-[11px] text-zinc-400 leading-normal">
                  De-authorize user credentials from this sandbox browser instance. Deletions propagate only to local coordinates storage.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-4 bg-zinc-950/40 border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-zinc-200 block font-bold">Logout session credentials</span>
                      <span className="text-[10px] text-zinc-500">Instantly switch active operant profile</span>
                    </div>
                    <button 
                      onClick={() => onClose()}
                      className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/20 transition-all cursor-pointer"
                    >
                      Logout Node
                    </button>
                  </div>

                  <div className="p-4 bg-zinc-950/40 border border-red-500/10 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-red-405 block font-bold">Purge and Purify Database index</span>
                      <span className="text-[10px] text-zinc-500">Completely wipes chat history blocks!</span>
                    </div>
                    <button 
                      onClick={executeCacheCleaning}
                      className="px-3 py-1.5 bg-red-500 border border-red-400 text-black font-mono text-xs font-black rounded-lg hover:bg-red-650 transition-all cursor-pointer"
                    >
                      PURGE DATA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer containing diagnostic specs */}
        <footer className="p-4 bg-zinc-950 border-t border-white/5 text-[9px] font-mono text-zinc-500 uppercase flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Radio size={11} className="text-cyan-400 animate-pulse" />
            <span>Proxy Ingress: EXTERN-ROUTE-OK</span>
          </div>
          <span className="hidden sm:inline">SHA-256 Key: AES-512-NX</span>
          <span>Latency: {latencySpeed}</span>
        </footer>

      </div>

    </div>
  );
};

export default SettingsScreen;
