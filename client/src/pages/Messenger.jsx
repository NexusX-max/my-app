import React, { useState, useEffect, useRef } from 'react';

import { 
  INITIAL_CHATS, 
  INITIAL_MESSAGES, 
  GLOW_PRESETS, 
  SOUND_MSG, 
  SOUND_CALL, 
  SOUND_DANGER, 
  AMBIENT_SOUNDSCAPES, 
  INITIAL_GROUPS, 
  MOCK_TRANSCRIPTS 
} from "../data";
import { AuthContext } from '../context/AuthContext';
import Sidebar from "./Sidebar";
import ChatWindow from '../components/ChatWindow';
import CallScreen from '../components/CallScreen';
import SettingsScreen from '../components/SettingsScreen';
import BiometricScreen from '../components/BiometricScreen';
import { AppWindow, ShieldAlert, Cpu, Radio, Zap, Clock, Info } from 'lucide-react';

export default function App() {
  // --- Persistent Client States ---
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('onyx_profile_node');
    return saved ? JSON.parse(saved) : {
      name: "Operator Node (You)",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      bio: "Rogue Quantum Deck Architect"
    };
  });

  const [chatList, setChatList] = useState(() => {
    const saved = localStorage.getItem('onyx_contacts_node');
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const [groupList, setGroupList] = useState(() => {
    const saved = localStorage.getItem('onyx_groups_node');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [messagesHistory, setMessagesHistory] = useState(() => {
    const saved = localStorage.getItem('onyx_messages_history');
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [selectedChatId, setSelectedChatId] = useState("bot-onyx");
  const [activeTab, setActiveTab] = useState("chats"); // chats | groups
  const [searchQuery, setSearchQuery] = useState("");
  
  // Custom Customization Styles State
  const [activeAccent, setActiveAccent] = useState(() => {
    const saved = localStorage.getItem('onyx_accent_node');
    return saved ? JSON.parse(saved) : GLOW_PRESETS[0]; // Default: Cyber Cyan
  });

  const [ambientSound, setAmbientSound] = useState(() => {
    return localStorage.getItem('onyx_ambient_sound') || "mute"; // Default: Muted
  });

  const [isBiometricLocked, setIsBiometricLocked] = useState(() => {
    return localStorage.getItem('onyx_biometric_lock') === 'true'; // Default: false
  });

  const [isAppUnlocked, setIsAppUnlocked] = useState(false);
  const [showSettingsView, setShowSettingsView] = useState(false);
  
  // Call Session Active State
  const [activeCallSession, setActiveCallSession] = useState(null); // null | { target, type }
  const [isAITyping, setIsAITyping] = useState(false);

  // UTC clock coordinates
  const [utcClockTime, setUtcClockTime] = useState(new Date("2026-05-27T03:00:00Z"));
  const [systemLatency, setSystemLatency] = useState("0.11ms");

  // Web Audio Refs for custom synthesizers!
  const audioCtxRef = useRef(null);
  const oscillatorNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('onyx_profile_node', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('onyx_contacts_node', JSON.stringify(chatList));
  }, [chatList]);

  useEffect(() => {
    localStorage.setItem('onyx_groups_node', JSON.stringify(groupList));
  }, [groupList]);

  useEffect(() => {
    localStorage.setItem('onyx_messages_history', JSON.stringify(messagesHistory));
  }, [messagesHistory]);

  useEffect(() => {
    localStorage.setItem('onyx_accent_node', JSON.stringify(activeAccent));
  }, [activeAccent]);

  useEffect(() => {
    localStorage.setItem('onyx_ambient_sound', ambientSound);
  }, [ambientSound]);

  useEffect(() => {
    localStorage.setItem('onyx_biometric_lock', String(isBiometricLocked));
  }, [isBiometricLocked]);

  // Tick the clock ahead by UTC standards
  useEffect(() => {
    const timer = setInterval(() => {
      setUtcClockTime(prev => new Date(prev.getTime() + 1000));
      // Simulate microscopic network latency drops
      setSystemLatency(+(0.08 + Math.random() * 0.06).toFixed(2) + "ms");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Background Ambiance Synthesizer Drone ---
  useEffect(() => {
    if (ambientSound === 'mute') {
      // Tear down oscillator
      if (oscillatorNodeRef.current) {
        oscillatorNodeRef.current.stop();
        oscillatorNodeRef.current.disconnect();
        oscillatorNodeRef.current = null;
      }
      return;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const audioCtx = audioCtxRef.current;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      // Check if oscillator already built
      if (!oscillatorNodeRef.current) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        
        let freq = 80;
        if (ambientSound === 'neural-binaural') freq = 210;
        if (ambientSound === 'cyber-drone') freq = 60;
        
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        // Low eye safe, sleep comfortable volume envelope
        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();

        oscillatorNodeRef.current = osc;
        gainNodeRef.current = gain;
      } else {
        // Change sound pitch dynamically!
        let freq = 80;
        if (ambientSound === 'neural-binaural') freq = 210;
        if (ambientSound === 'cyber-drone') freq = 60;
        oscillatorNodeRef.current.frequency.setValueAtTime(freq, audioCtx.currentTime);
      }
    } catch (e) {
      console.warn("Continuous sound background hum blocked by active browser policy click constraints.");
    }

    return () => {
      // Cleanup continuous droning when components de-mount
    };
  }, [ambientSound]);

  // Adjust synthesizer gain dynamically based on visual accents!
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      let adjustment = 0.012;
      if (activeAccent.id === 'crimson') adjustment = 0.008; // Safe level for Red frequencies
      if (activeAccent.id === 'purple') adjustment = 0.018;  // High frequency for Purple
      gainNodeRef.current.gain.setValueAtTime(adjustment, audioCtxRef.current.currentTime);
    }
  }, [activeAccent, ambientSound]);

  // Biometric Locking verification screen bypassed by default if not set
  const isSecurityLockOpen = isBiometricLocked && !isAppUnlocked;

  // Find currently selected conversation target records
  const isSelectedChatGroup = selectedChatId.startsWith("group-");
  const selectedChatDetails = isSelectedChatGroup 
    ? groupList.find(g => g.id === selectedChatId)
    : chatList.find(c => c.id === selectedChatId);

  const activeMessages = messagesHistory[selectedChatId] || [];

  // --- Direct Chat message triggers & AI Core integrations ---
  const handleSendMessage = async ({ text, file }) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = {
      id: "usr-" + Date.now(),
      sender: "me",
      senderName: userProfile.name,
      text: text,
      file: file,
      time: timeString
    };

    // Append to local message queues
    const updatedHistory = {
      ...messagesHistory,
      [selectedChatId]: [...activeMessages, newMessage]
    };
    
    setMessagesHistory(updatedHistory);

    // Update Sidebar last message tickers
    if (isSelectedChatGroup) {
      setGroupList(prev => prev.map(g => g.id === selectedChatId ? { ...g, lastMsg: `You: ${text || 'Binary transmission...'}`, time: 'Just now' } : g));
    } else {
      setChatList(prev => prev.map(c => c.id === selectedChatId ? { ...c, lastMsg: text || 'Binary transmission...', time: 'Just now' } : c));
    }

    // --- Intelligent Bot Synergy trigger (Gemini core processing) ---
    if (!isSelectedChatGroup && selectedChatDetails.isBot) {
      setIsAITyping(true);
      
      const updatedListForBot = [...activeMessages, newMessage];

      // Format current direct messages structure into model API standard format
      const formattedContents = updatedListForBot.map(msg => ({
        role: msg.sender === 'me' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // Fallback local triggers on specific Keywords to make offline dialogue look incredibly deep!
      const lastText = text.toLowerCase();
      let botResponseText = "";
      
      // If the target is the Chief Psychologist bot 'Dr. Luna Vane', reply locally with deep psychological wisdom
      if (selectedChatId === 'bot-luna') {
        setTimeout(() => {
          if (lastText.includes("burned") || lastText.includes("tired") || lastText.includes("stress")) {
            botResponseText = "🌱 [LUNAR DIAGNOSTIC] Cognitive overflow detected. Your processor cycles need to decouple from the active deck. Go configure the Theta Binaural Sync hum in the settings and take 20 breathing cycles.";
          } else if (lastText.includes("how") || lastText.includes("hack")) {
            botResponseText = "🧠 [LUNAR ANALYTICS] Curiosity spike normal. However, please remember that code compile speeds are optimized server-side. Rest your visual iris before continuing.";
          } else {
            botResponseText = "🌌 [LUNAR PROTOCOL] Thank you for checking in, operator. My bio-sensors confirm your focus rate is sustainable. Send inquiries about emotional stabilization loops anytime.";
          }

          const botResponseMsg = {
            id: "bot-" + Date.now(),
            sender: "bot-luna",
            senderName: "Dr. Luna Vane",
            text: botResponseText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessagesHistory(prev => ({
            ...prev,
            [selectedChatId]: [...(prev[selectedChatId] || []), botResponseMsg]
          }));

          setChatList(p => p.map(c => c.id === 'bot-luna' ? { ...c, lastMsg: botResponseText, time: 'Just now' } : c));
          setIsAITyping(false);
        }, 1200);
        return;
      }

      // If the target is Onyx Core AI, dial the real backend REST service /api/gemini/chat!
      if (selectedChatId === 'bot-onyx') {
        try {
          const res = await fetch("/api/gemini/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ contents: formattedContents })
          });
          
          const rawData = await res.json();
          if (rawData.error) {
            throw new Error(rawData.error);
          }

          botResponseText = rawData.text;
        } catch (error) {
          console.warn("Backend Gemini link suspended or unavailable (expected in offline local test). Splitting fallback sandbox rules...");
          
          if (lastText.includes("hello") || lastText.includes("hi") || lastText.includes("system")) {
            botResponseText = "⚙️ [ONYX LOCAL ROUTE] Hello operator! I am Onyx local routing system. My primary quantum cognitive core requires an active API key to boot. Access the setting menu to verify your proxy port 3000 health.";
          } else {
            botResponseText = `🤖 [ONYX SANDBOX COMPILER] Received sequence: "${text}". Connection is secure. Configure your GEMINI_API_KEY inside the Secrets panel to activate full artificial comprehension loops.`;
          }
        } finally {
          const aiResponseMsg = {
            id: "ai-" + Date.now(),
            sender: "bot-onyx",
            senderName: "Onyx Core AI",
            text: botResponseText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessagesHistory(prev => ({
            ...prev,
            [selectedChatId]: [...(prev[selectedChatId] || []), aiResponseMsg]
          }));

          setChatList(p => p.map(c => c.id === 'bot-onyx' ? { ...c, lastMsg: botResponseText, time: 'Just now' } : c));
          setIsAITyping(false);
        }
      }
    }
  };

  // --- Call protocol initialization ---
  const handleInitiateCall = (target, type) => {
    setActiveCallSession({
      target: target,
      type: type || 'video'
    });
  };

  // --- Delete particular message node ---
  const handleDeleteMessage = (messageId) => {
    setMessagesHistory(prev => ({
      ...prev,
      [selectedChatId]: (prev[selectedChatId] || []).filter(m => m.id !== messageId)
    }));
  };

  // --- Wipe/Reset entire conversation logs ---
  const handleClearAllHistory = () => {
    setMessagesHistory(INITIAL_MESSAGES);
    setChatList(INITIAL_CHATS);
    setGroupList(INITIAL_GROUPS);
  };

  return (
    <div id="master-root-wrapper" className="w-screen h-[100dvh] bg-zinc-950 text-white font-sans select-none flex overflow-hidden">
      
      {/* 1. Secure biometric security lock screen if shield option is active */}
      {isSecurityLockOpen && (
        <BiometricScreen 
          onApproved={() => setIsAppUnlocked(true)}
          userProfile={userProfile}
          activeAccent={activeAccent}
        />
      )}

      {/* 2. Immursive Full-screen active Video / Audio calling interface */}
      {activeCallSession && (
        <CallScreen 
          callTarget={activeCallSession.target}
          callType={activeCallSession.type}
          onEndCall={() => setActiveCallSession(null)}
          activeAccent={activeAccent}
        />
      )}

      {/* 3. Primary Full screen workspace dashboard */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Side: Navigation Sidebar block */}
        <Sidebar 
          chatList={chatList}
          groupList={groupList}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedChatId={selectedChatId}
          setSelectedChatId={(id) => {
            setSelectedChatId(id);
            setShowSettingsView(false); // Auto-focus chat window
          }}
          showSearch={searchQuery !== ""}
          setShowSearch={() => {}}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onInitiateCall={handleInitiateCall}
          activeAccent={activeAccent}
          onOpenSettings={() => {
            setShowSettingsView(true);
            setSelectedChatId(""); // Clear active highlight selection
          }}
          ambientSound={ambientSound}
          setAmbientSound={setAmbientSound}
          userProfile={userProfile}
          latencySpeed={systemLatency}
        />

        {/* Right Side Frame Viewport: Chat interface or Configure nodes settings */}
        <div className="flex-1 h-full overflow-hidden flex flex-col bg-stone-950">
          {showSettingsView ? (
            <SettingsScreen 
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              onClose={() => {
                setShowSettingsView(false);
                setSelectedChatId("bot-onyx"); // return focus back to AI Core bot
              }}
              activeAccent={activeAccent}
              setActiveAccent={setActiveAccent}
              ambientSound={ambientSound}
              setAmbientSound={setAmbientSound}
              isBiometricLocked={isBiometricLocked}
              setIsBiometricLocked={setIsBiometricLocked}
              clearAllHistory={handleClearAllHistory}
              latencySpeed={systemLatency}
            />
          ) : selectedChatDetails ? (
            <div className="flex-1 h-full flex flex-col relative overflow-hidden">
              
              {/* If AI model prompt compilation is active, draw dynamic top glow lines */}
              {isAITyping && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse z-50 flex justify-center">
                  <span className="text-[8px] font-mono text-cyan-400 bg-zinc-950 px-3 border border-cyan-800 rounded-b uppercase font-bold animate-pulse leading-none py-1">
                    Onyx AI node parsing phonetic codes...
                  </span>
                </div>
              )}

              <ChatWindow 
                activeChat={selectedChatDetails}
                isGroup={isSelectedChatGroup}
                messages={activeMessages}
                onSendMessage={handleSendMessage}
                onInitiateCall={handleInitiateCall}
                onDeleteMessage={handleDeleteMessage}
                activeAccent={activeAccent}
                userProfile={userProfile}
              />
            </div>
          ) : (
            // Idle Welcome frame overlay
            <div className="flex-1 h-full flex flex-col items-center justify-center p-8 bg-zinc-950 relative text-center">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
              <div className="mb-6 p-4 rounded-3xl bg-zinc-900 border border-white/5 animate-pulse">
                <ShieldAlert className="text-zinc-550 mx-auto" size={48} />
              </div>
              <h2 className="text-xl font-mono font-black uppercase tracking-wider text-zinc-100 flex items-center justify-center gap-2">
                ONYX SECURE INTERFACE <span className={`w-2.5 h-2.5 rounded-full ${activeAccent.bg}`} />
              </h2>
              <p className="text-zinc-500 text-xs font-mono max-w-sm mx-auto mt-2 leading-relaxed">
                Terminal synced. Select any neural target or groups coordinate on the left to initiate decryption streams or encrypted calling lines.
              </p>
              
              {/* Local timezone clocks ticker */}
              <div className="mt-8 bg-zinc-900/40 border border-white/5 px-4 py-2 rounded-2xl inline-flex items-center gap-2.5 text-zinc-550 font-mono text-[11px] uppercase tracking-widest text-zinc-400">
                <Clock size={13} />
                <span>UTC CLOCK: {utcClockTime.toISOString().replace("T", " ").split(".")[0]}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
