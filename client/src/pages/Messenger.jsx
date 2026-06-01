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
import { useAuth } from '../context/AuthContext';
import Sidebar from "./Sidebar";
import ChatWindow from '../components/ChatWindow';
import CallScreen from '../components/CallScreen';
import SettingsScreen from '../components/SettingsScreen';
import BiometricScreen from '../components/BiometricScreen';
import SearchScreen from './SearchScreen';
import { ShieldAlert, Clock } from 'lucide-react';
export default function Messenger() {
  const { user, api, socket, currentNode } = useAuth();

  // --- Persistent Client States ---
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('onyx_profile_node');
    return saved ? JSON.parse(saved) : {
      name: "Operator Node (You)",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      bio: "Rogue Quantum Deck Architect"
    };
  });

  // Sync with AuthProvider user session dynamically
  useEffect(() => {
    if (user) {
      setUserProfile({
        name: user.name || `${user.firstName || 'Operator'} ${user.lastName || 'Node'}`,
        avatar: user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        bio: user.bio || "Zero-Knowledge Terminal Node",
        _id: user._id
      });
    }
  }, [user]);

  const [chatList, setChatList] = useState([]);
  const [groupList, setGroupList] = useState(() => {
    const saved = localStorage.getItem('onyx_groups_node');
    return saved ? JSON.parse(saved) : INITIAL_GROUPS;
  });

  const [messagesHistory, setMessagesHistory] = useState({});
  const [searchedNodes, setSearchedNodes] = useState([]);

  const [selectedChatId, setSelectedChatId] = useState("conv-onyx");
  const [activeTab, setActiveTab] = useState("chats"); 
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
  const [showSearchScreen, setShowSearchScreen] = useState(false);
  const [showControlLab, setShowControlLab] = useState(false);
  const [isInternetOffline, setIsInternetOffline] = useState(false);
  const [selfDestructDuration, setSelfDestructDuration] = useState(0); // in seconds, 0 = Off
  
  // Call Session Active State
  const [activeCallSession, setActiveCallSession] = useState(null); 
  const [isAITyping, setIsAITyping] = useState(false);

  // --- Block, Mute, Delete and Dynamic Chats State ---
  const [deletedChatIds, setDeletedChatIds] = useState(() => {
    const saved = localStorage.getItem('onyx_deleted_nodes');
    return saved ? JSON.parse(saved) : [];
  });

  const [blockedChatIds, setBlockedChatIds] = useState(() => {
    const saved = localStorage.getItem('onyx_blocked_nodes');
    return saved ? JSON.parse(saved) : [];
  });

  const [mutedChatIds, setMutedChatIds] = useState(() => {
    const saved = localStorage.getItem('onyx_muted_nodes');
    return saved ? JSON.parse(saved) : [];
  });

  const [dynamicChats, setDynamicChats] = useState(() => {
    const saved = localStorage.getItem('onyx_dynamic_chats');
    return saved ? JSON.parse(saved) : [];
  });

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
    localStorage.setItem('onyx_groups_node', JSON.stringify(groupList));
  }, [groupList]);

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

  // Format backend conversation list to client interface
  const formatBackendConversation = (conv) => {
    const isBot = conv.userDetails?.isBot || false;
    return {
      id: conv._id,
      name: conv.userDetails ? `${conv.userDetails.firstName} ${conv.userDetails.lastName}` : "Operator Node",
      avatar: conv.userDetails?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      lastMsg: conv.lastMessage?.text || "Neural connection established. Ready.",
      time: conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
      online: conv.userDetails?.online || false,
      isBot: isBot,
      bio: conv.userDetails?.bio || "Zero-Knowledge Terminal Node",
      encryptionKey: isBot ? (conv.userDetails?._id === 'bot-onyx' ? 'AES-512-NX' : 'RSA-4096-LUNA') : 'PGP-LINK-SECURE',
      latency: isBot ? '0.04ms' : '15ms',
      otherId: conv.userDetails?._id || conv.userDetails?.id
    };
  };

  // Main Loader function for conversations
  const loadAllConversations = () => {
    const fetchApi = api ? api.get('/messages/conversations').then(res => res.data) : fetch('/api/messages/conversations').then(res => res.json());
    
    fetchApi
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(formatBackendConversation);
          
          setChatList(() => {
            const combined = [...formatted];
            dynamicChats.forEach(d => {
              if (!combined.some(c => c.id === d.id || (d.otherId && c.otherId === d.otherId))) {
                combined.push(d);
              }
            });
            return combined;
          });
          
          // Verify if active selected chat still active, fallback if not set
          if (formatted.length > 0 && !selectedChatId) {
            setSelectedChatId(formatted[0].id);
          }
        }
      })
      .catch(err => {
        console.warn("REST API conversations fetch offline simulation fallback:", err);
        const fallback = [
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
        
        setChatList(() => {
          const combined = [...fallback];
          dynamicChats.forEach(d => {
            if (!combined.some(c => c.id === d.id || (d.otherId && c.otherId === d.otherId))) {
              combined.push(d);
            }
          });
          return combined;
        });
      });
  };

  // Initial load
  useEffect(() => {
    loadAllConversations();
  }, [user, dynamicChats]);

  // --- Searched Users dynamic lookup ---
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchedNodes([]);
      return;
    }

    const searchTimeout = setTimeout(() => {
      const searchApi = api ? api.get(`/messages/search-users/${encodeURIComponent(searchQuery)}`).then(res => res.data) : fetch(`/api/messages/search-users/${encodeURIComponent(searchQuery)}`).then(res => res.json());
      
      searchApi
        .then(data => {
          if (Array.isArray(data)) {
            setSearchedNodes(data.filter(u => u._id !== 'me'));
          }
        })
        .catch(err => {
          console.warn("Search-users API offline:", err);
          setSearchedNodes([]);
        });
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  // Handle Mute, Block and Delete Actions
  const handleToggleMute = (chatId) => {
    setMutedChatIds(prev => {
      const isMuted = prev.includes(chatId);
      const next = isMuted ? prev.filter(id => id !== chatId) : [...prev, chatId];
      localStorage.setItem('onyx_muted_nodes', JSON.stringify(next));
      return next;
    });
  };

  const handleToggleBlock = (chatId) => {
    setBlockedChatIds(prev => {
      const isBlocked = prev.includes(chatId);
      const next = isBlocked ? prev.filter(id => id !== chatId) : [...prev, chatId];
      localStorage.setItem('onyx_blocked_nodes', JSON.stringify(next));
      return next;
    });
  };

  const handleDeleteChat = (chatId) => {
    // Purge from state immediately and set as deleted
    setDeletedChatIds(prev => {
      const next = [...prev, chatId];
      localStorage.setItem('onyx_deleted_nodes', JSON.stringify(next));
      return next;
    });
    
    // Also remove from dynamic chats if there
    setDynamicChats(prev => {
      const next = prev.filter(c => c.id !== chatId);
      localStorage.setItem('onyx_dynamic_chats', JSON.stringify(next));
      return next;
    });

    setSelectedChatId("");

    // Network delete
    const deleteApi = api ? api.delete(`/messages/conversations/${chatId}`).then(res => res.data) : fetch(`/api/messages/conversations/${chatId}`, {
      method: "DELETE"
    }).then(res => res.json());

    deleteApi
      .then(() => {
        loadAllConversations();
      })
      .catch(err => {
        console.warn("Purge call bypassed:", err);
      });
  };

  // Establish standard coupling on searchable users list item click
  const handleConnectUser = (node) => {
    const nodeUserId = node._id || node.id;
    const tempConvId = `conv-temp-${nodeUserId}`;
    
    // Un-delete if previously deleted
    setDeletedChatIds(prev => {
      const next = prev.filter(id => id !== tempConvId);
      localStorage.setItem('onyx_deleted_nodes', JSON.stringify(next));
      return next;
    });

    // Make an optimistic chat object
    const optimisticChat = {
      id: tempConvId,
      name: node.fullName || `${node.firstName || ''} ${node.lastName || ''}`.trim() || node.username || "Grid Operator",
      avatar: node.avatar || node.profilePic || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      lastMsg: "Handshake completed. Start sending secure packages.",
      time: "Just now",
      online: true,
      isBot: node.isBot || false,
      bio: node.bio || "Zero-Knowledge Terminal Node",
      encryptionKey: 'PGP-LINK-SECURE',
      latency: '15ms',
      otherId: nodeUserId
    };

    // Save locally
    setDynamicChats(prev => {
      if (prev.some(c => c.otherId === nodeUserId || c.id === tempConvId)) return prev;
      const next = [optimisticChat, ...prev];
      localStorage.setItem('onyx_dynamic_chats', JSON.stringify(next));
      return next;
    });

    setChatList(prev => {
      if (prev.some(c => c.otherId === nodeUserId || c.id === tempConvId)) return prev;
      return [optimisticChat, ...prev];
    });

    setSelectedChatId(tempConvId);
    setSearchQuery("");
    setActiveTab("chats");
    setShowSearchScreen(false);

    // Call API to create permanent link
    const connectApi = api ? api.post('/messages/conversations/create', { otherId: nodeUserId }).then(res => res.data) : fetch('/api/messages/conversations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otherId: nodeUserId })
    }).then(res => res.json());

    connectApi
      .then(newConv => {
        // Swap temp with real ID
        setDynamicChats(prev => prev.map(c => {
          if (c.id === tempConvId) {
            return {
              ...c,
              id: newConv._id,
              lastMsg: newConv.lastMessage?.text || "Neural connection established."
            };
          }
          return c;
        }));

        setChatList(prev => prev.map(c => {
          if (c.id === tempConvId) {
            return {
              ...c,
              id: newConv._id,
              lastMsg: newConv.lastMessage?.text || "Neural connection established."
            };
          }
          return c;
        }));

        setSelectedChatId(newConv._id);
        loadAllConversations();
      })
      .catch(err => {
        console.error("Link assembly error:", err);
      });
  };

  const handleCreateGroup = ({ name, description, avatar, invitedMemberIds = [] }) => {
    // Dynamic mapping of invited peer nodes from the operator's linked contacts / following
    const invitedMembers = chatList
      .filter(item => invitedMemberIds.includes(item.id))
      .map(item => ({ id: item.id, name: item.name, avatar: item.avatar }));

    const newGroupId = "group-" + Date.now();
    const newGroup = {
      id: newGroupId,
      name: name,
      description: description,
      membersCount: invitedMembers.length + 1, // Include operator themselves
      avatar: avatar,
      lastMsg: "Secure group channel active. System online.",
      time: "Just now",
      unread: false,
      members: [
        { id: "me", name: userProfile.name, avatar: userProfile.avatar },
        ...invitedMembers
      ]
    };

    setGroupList(prev => [newGroup, ...prev]);
    
    // Initialize empty message history for this group
    setMessagesHistory(prev => ({
      ...prev,
      [newGroupId]: [
        { 
          id: "m-init-" + Date.now(), 
          sender: "system", 
          senderName: "SYSTEM CORE", 
          text: `Secure cryptographic network created by ${userProfile.name}. Initial handshakes validated. Encryption protocol: SHA-256 AES-GCM. Welcome to ${name}! members connected: ${invitedMembers.length > 0 ? invitedMembers.map(m => m.name).join(', ') : 'None'}.`, 
          time: "Just now" 
        }
      ]
    }));

    // Auto select the newly created group!
    setSelectedChatId(newGroupId);
  };

  const handleAddGroupMember = (groupId, memberId) => {
    const contact = chatList.find(c => c.id === memberId);
    if (!contact) return;

    setGroupList(prev => prev.map(g => {
      if (g.id === groupId) {
        if (g.members.some(m => m.id === memberId)) return g;
        const updatedMembers = [...g.members, { id: contact.id, name: contact.name, avatar: contact.avatar }];
        return {
          ...g,
          membersCount: updatedMembers.length,
          members: updatedMembers
        };
      }
      return g;
    }));

    const systemMsg = {
      id: "m-sys-" + Date.now(),
      sender: "system",
      senderName: "SYSTEM CORE",
      text: `📡 [NODE LINKED] Operator ${contact.name} successfully connected to this encryption channel. Latency target: ${contact.latency || '12ms'}.`,
      time: "Just now"
    };

    setMessagesHistory(prev => ({
      ...prev,
      [groupId]: [...(prev[groupId] || []), systemMsg]
    }));
  };

  // Fetch Message history for direct conversation selection
  useEffect(() => {
    if (!selectedChatId) return;
    if (selectedChatId.startsWith("group-")) return; 

    const historyApi = api ? api.get(`/messages/history/${selectedChatId}`).then(res => res.data) : fetch(`/api/messages/history/${selectedChatId}`).then(res => res.json());

    historyApi
      .then(data => {
        if (Array.isArray(data)) {
          const formattedMsgs = data.map((m) => ({
            id: m.id || m._id,
            sender: m.senderId === 'me' ? 'me' : m.senderId,
            senderName: m.senderId === 'me' ? userProfile.name : (selectedChatDetails?.name || "Grid Operator"),
            text: m.text,
            file: m.image,
            time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
          }));

          setMessagesHistory(prev => ({
            ...prev,
            [selectedChatId]: formattedMsgs
          }));
        }
      })
      .catch(err => {
        console.warn("History API link offline. Reverting local mock messages history.");
        setMessagesHistory(INITIAL_MESSAGES);
      });
  }, [selectedChatId, api]);

  // --- Background Ambiance Synthesizer Drone ---
  useEffect(() => {
    if (ambientSound === 'mute') {
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

      if (!oscillatorNodeRef.current) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        
        let freq = 80;
        if (ambientSound === 'neural-binaural') freq = 210;
        if (ambientSound === 'cyber-drone') freq = 60;
        
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        // Low volume comfort envelope
        gain.gain.setValueAtTime(0.012, audioCtx.currentTime);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();

        oscillatorNodeRef.current = osc;
        gainNodeRef.current = gain;
      } else {
        let freq = 80;
        if (ambientSound === 'neural-binaural') freq = 210;
        if (ambientSound === 'cyber-drone') freq = 60;
        oscillatorNodeRef.current.frequency.setValueAtTime(freq, audioCtx.currentTime);
      }
    } catch (e) {
      console.warn("Acoustic node click required to boot audio context.");
    }
  }, [ambientSound]);

  // Adjust synthesizer gain dynamically based on visual accents!
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      let adjustment = 0.012;
      if (activeAccent.id === 'crimson') adjustment = 0.008; 
      if (activeAccent.id === 'purple') adjustment = 0.018;  
      gainNodeRef.current.gain.setValueAtTime(adjustment, audioCtxRef.current.currentTime);
    }
  }, [activeAccent, ambientSound]);

  const isSecurityLockOpen = isBiometricLocked && !isAppUnlocked;

  const filteredChatList = chatList
    .filter(c => !deletedChatIds.includes(c.id))
    .map(c => ({
      ...c,
      isMuted: mutedChatIds.includes(c.id),
      isBlocked: blockedChatIds.includes(c.id)
    }));

  const isSelectedChatGroup = selectedChatId ? selectedChatId.startsWith("group-") : false;
  const selectedChatDetails = isSelectedChatGroup 
    ? groupList.find(g => g.id === selectedChatId)
    : filteredChatList.find(c => c.id === selectedChatId);

  const activeMessages = messagesHistory[selectedChatId] || [];

  // --- Direct Chat message triggers & AI Core integrations ---
  const handleSendMessage = async ({ text, file }) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isSelectedChatGroup) {
      const newMessage = {
        id: "usr-" + Date.now(),
        sender: "me",
        senderName: userProfile.name,
        text: text,
        time: timeString
      };

      setMessagesHistory(prev => ({
        ...prev,
        [selectedChatId]: [...(prev[selectedChatId] || []), newMessage]
      }));

      setGroupList(prev => prev.map(g => g.id === selectedChatId ? { ...g, lastMsg: `You: ${text || 'Transmitting core coordinates...'}`, time: 'Just now' } : g));

      // Self destruct mechanism
      if (selfDestructDuration > 0) {
        const targetMsgId = newMessage.id;
        setTimeout(() => {
          setMessagesHistory(prev => ({
            ...prev,
            [selectedChatId]: (prev[selectedChatId] || []).filter(m => m.id !== targetMsgId)
          }));
        }, selfDestructDuration * 1000);
      }

      return;
    }

    if (selectedChatDetails?.isBot) {
      setIsAITyping(true);
    }

    const clientPredictionMsg = {
      id: "usr-predict-" + Date.now(),
      sender: "me",
      senderName: userProfile.name,
      text: text,
      file: file,
      time: timeString
    };

    setMessagesHistory(prev => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), clientPredictionMsg]
    }));

    // Self destruct mechanism
    if (selfDestructDuration > 0) {
      const targetMsgId = clientPredictionMsg.id;
      setTimeout(() => {
        setMessagesHistory(prev => ({
          ...prev,
          [selectedChatId]: (prev[selectedChatId] || []).filter(m => m.id !== targetMsgId)
        }));
      }, selfDestructDuration * 1000);
    }

    try {
      if (api) {
        await api.post("/messages/message", {
          conversationId: selectedChatId,
          text: text,
          image: file || null
        });
      } else {
        await fetch("/api/messages/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: selectedChatId,
            text: text,
            image: file || null
          })
        }).then(r => r.json());
      }

      loadAllConversations();

      setTimeout(() => {
        const historyApi = api ? api.get(`/messages/history/${selectedChatId}`).then(res => res.data) : fetch(`/api/messages/history/${selectedChatId}`).then(res => res.json());

        historyApi
          .then(data => {
            if (Array.isArray(data)) {
              const formattedMsgs = data.map((m) => ({
                id: m.id || m._id,
                sender: m.senderId === 'me' ? 'me' : m.senderId,
                senderName: m.senderId === 'me' ? userProfile.name : (selectedChatDetails?.name || "Onyx Node"),
                text: m.text,
                file: m.image,
                time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
              }));

              setMessagesHistory(prev => ({
                ...prev,
                [selectedChatId]: formattedMsgs
              }));

              // Auto delete incoming bot response if self destruct active
              if (selfDestructDuration > 0) {
                formattedMsgs.forEach(m => {
                  if (m.sender !== 'me') {
                    setTimeout(() => {
                      setMessagesHistory(prev => ({
                        ...prev,
                        [selectedChatId]: (prev[selectedChatId] || []).filter(item => item.id !== m.id)
                      }));
                    }, selfDestructDuration * 1000);
                  }
                });
              }
            }
            setIsAITyping(false);
          });
      }, 1600);

    } catch (e) {
      console.warn("Failed sending server-side message. Resorting to local mock simulation logic:", e);
      setIsAITyping(false);
    }
  };

  const handleRotateActiveKey = () => {
    if (!selectedChatId) return;

    // Generate random hex-string key
    const hexChars = "0123456789ABCDEF";
    let randomHex = "";
    for (let i = 0; i < 16; i++) {
      randomHex += hexChars[Math.floor(Math.random() * 16)];
    }
    const newKey = `AES-GCM-${randomHex}`;

    // Update in list
    if (selectedChatId.startsWith("group-")) {
      setGroupList(prev => prev.map(g => g.id === selectedChatId ? { ...g, encryptionKey: newKey } : g));
    } else {
      setChatList(prev => prev.map(c => c.id === selectedChatId ? { ...c, encryptionKey: newKey } : c));
    }

    // Append system message reporting key rotation
    const systemMsg = {
      id: "m-rot-" + Date.now(),
      sender: "system",
      senderName: "CRYPTOGRAPHY ENGINE",
      text: `🔄 [ROTATION SUCCESSFUL] Handshake keys regenerated. Base session key: ${newKey}. All preceding messages in transit purged from remote caches. Zero-Knowledge tunnel hardened.`,
      time: "Just now"
    };

    setMessagesHistory(prev => ({
      ...prev,
      [selectedChatId]: [...(prev[selectedChatId] || []), systemMsg]
    }));
  };

  const handleExecuteVoiceCommand = (cmd) => {
    if (cmd.type === "NAV_SETTINGS") {
      setShowSettingsView(true);
      setSelectedChatId("");
    } else if (cmd.type === "NAV_CHATS") {
      setShowSettingsView(false);
      setSelectedChatId(chatList[0]?.id || "conv-onyx");
    } else if (cmd.type === "SELECT_CHAT") {
      setSelectedChatId(cmd.targetId);
      setShowSettingsView(false);
    } else if (cmd.type === "CLEAR_CHAT") {
      handleClearAllHistory();
    } else if (cmd.type === "CHANGE_THEME") {
      const foundAccent = GLOW_PRESETS.find(p => p.id === cmd.themeId);
      if (foundAccent) {
        setActiveAccent(foundAccent);
      }
    } else if (cmd.type === "ROTATE_KEY") {
      handleRotateActiveKey();
    } else if (cmd.type === "LAUNCH_CALL") {
      const activeObj = selectedChatDetails || chatList[0];
      if (activeObj) {
        handleInitiateCall(activeObj, "video");
      }
    } else if (cmd.type === "TOGGLE_LOCK") {
      setIsBiometricLocked(prev => !prev);
    }
  };

  const handleInitiateCall = (target, type) => {
    setActiveCallSession({
      target: target,
      type: type || 'video'
    });
  };

  const handleDeleteMessage = (messageId) => {
    setMessagesHistory(prev => ({
      ...prev,
      [selectedChatId]: (prev[selectedChatId] || []).filter(m => m.id !== messageId)
    }));
  };

  const handleClearAllHistory = () => {
    setMessagesHistory(INITIAL_MESSAGES);
    setChatList([
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
      }
    ]);
    setGroupList(INITIAL_GROUPS);
  };

  return (
    <div id="master-root-wrapper" className="w-screen h-[100dvh] bg-zinc-950 text-white font-sans select-none flex overflow-hidden">
      
      {isSecurityLockOpen && (
        <BiometricScreen 
          onApproved={() => setIsAppUnlocked(true)}
          userProfile={userProfile}
          activeAccent={activeAccent}
        />
      )}

      {activeCallSession && (
        <CallScreen 
          callTarget={activeCallSession.target}
          callType={activeCallSession.type}
          onEndCall={() => setActiveCallSession(null)}
          activeAccent={activeAccent}
        />
      )}

      <div className="flex-1 flex overflow-hidden relative font-mono">
        <Sidebar 
          chatList={filteredChatList}
          groupList={groupList}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedChatId={selectedChatId}
          setSelectedChatId={(id) => {
            setSelectedChatId(id);
            setShowSettingsView(false); 
            setShowSearchScreen(false);
          }}
          showSearch={searchQuery !== ""}
          setShowSearch={() => {}}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onInitiateCall={handleInitiateCall}
          activeAccent={activeAccent}
          onOpenSettings={() => {
            setShowSettingsView(true);
            setSelectedChatId(""); 
            setShowSearchScreen(false);
          }}
          onOpenSearchScreen={() => {
            setShowSearchScreen(true);
            setSelectedChatId("");
            setShowSettingsView(false);
          }}
          ambientSound={ambientSound}
          setAmbientSound={setAmbientSound}
          userProfile={userProfile}
          latencySpeed={systemLatency}
          searchedNodes={searchedNodes}
          onConnectUser={handleConnectUser}
          showSettingsView={showSettingsView}
          onCreateGroup={handleCreateGroup}
          onToggleMute={handleToggleMute}
          onToggleBlock={handleToggleBlock}
          onDeleteChat={handleDeleteChat}
        />

        <div id="viewport-right-frame" className={`flex-1 h-full overflow-hidden flex flex-col bg-zinc-950 ${
          (selectedChatId || showSettingsView || showSearchScreen) ? 'flex' : 'hidden md:flex'
        }`}>
          {showSettingsView ? (
            <SettingsScreen 
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              onClose={() => {
                setShowSettingsView(false);
                setSelectedChatId(chatList[0]?.id || "conv-onyx"); 
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
          ) : showSearchScreen ? (
            <SearchScreen 
              onBack={() => setShowSearchScreen(false)}
              onSelect={(node) => {
                handleConnectUser(node);
              }}
            />
          ) : selectedChatDetails ? (
            <div className="flex-1 h-full flex relative overflow-hidden">
              <div className="flex-1 h-full flex flex-col relative overflow-hidden">
                
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
                  onBackToList={() => setSelectedChatId("")}
                  chatList={filteredChatList}
                  onAddGroupMember={handleAddGroupMember}
                  showControlLab={showControlLab}
                  onToggleControlLab={() => setShowControlLab(!showControlLab)}
                  isMuted={selectedChatDetails ? mutedChatIds.includes(selectedChatDetails.id) : false}
                  isBlocked={selectedChatDetails ? blockedChatIds.includes(selectedChatDetails.id) : false}
                  onToggleMute={handleToggleMute}
                  onToggleBlock={handleToggleBlock}
                  onDeleteChat={handleDeleteChat}
                />
              </div>

              {showControlLab && (
                <OnyxLabConsole 
                  onClose={() => setShowControlLab(false)}
                  activeAccent={activeAccent}
                  userProfile={userProfile}
                  messages={activeMessages}
                  systemLatency={systemLatency}
                  selfDestructDuration={selfDestructDuration}
                  setSelfDestructDuration={setSelfDestructDuration}
                  handleRotateActiveKey={handleRotateActiveKey}
                  handleExecuteVoiceCommand={handleExecuteVoiceCommand}
                  isInternetOffline={isInternetOffline}
                  onToggleInternetOffline={() => setIsInternetOffline(!isInternetOffline)}
                  activeChat={selectedChatDetails}
                />
              )}
            </div>
          ) : (
            <div className="flex-1 h-full flex flex-col items-center justify-center p-8 bg-zinc-950 relative text-center">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
              <div className="mb-6 p-4 rounded-3xl bg-zinc-900 border border-white/5 animate-pulse">
                <ShieldAlert className="text-zinc-500 mx-auto" size={48} />
              </div>
              <h2 className="text-xl font-mono font-black uppercase tracking-wider text-zinc-100 flex items-center justify-center gap-2">
                ONYX SECURE INTERFACE <span className={`w-2.5 h-2.5 rounded-full ${activeAccent.bg} animate-ping`} />
              </h2>
              <p className="text-zinc-500 text-xs font-mono max-w-sm mx-auto mt-2 leading-relaxed">
                Terminal synced. Select any neural target or groups coordinate on the left to initiate decryption streams or encrypted calling lines.
              </p>

              <button 
                type="button"
                onClick={() => {
                  setShowSearchScreen(true);
                  setSelectedChatId("");
                  setShowSettingsView(false);
                }}
                className="mt-6 px-5 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold rounded-2xl text-xs hover:-translate-y-0.5 transition-all uppercase tracking-wider cursor-pointer"
              >
                Scan Neural Network for Nodes [SEARCH]
              </button>
              
              <div className="mt-8 bg-zinc-900/45 border border-white/5 px-4 py-2 rounded-2xl inline-flex items-center gap-2.5 text-zinc-500 font-mono text-[11px] uppercase tracking-widest">
                <Clock size={13} className="text-cyan-400" />
                <span>UTC CLOCK: {utcClockTime.toISOString().replace("T", " ").split(".")[0]}</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
