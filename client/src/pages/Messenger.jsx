import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GLOW_PRESETS, INITIAL_CHATS, INITIAL_GROUPS, INITIAL_MESSAGES } from '../data';
import Sidebar from "./Sidebar";
import ChatWindow from '../components/ChatWindow';
import CallScreen from '../components/CallScreen';
import SettingsScreen from '../components/SettingsScreen';
import BiometricScreen from '../components/BiometricScreen';
import SearchScreen from './SearchScreen';
import { ShieldAlert, ShieldCheck, Clock, PhoneOff, Mic, Phone, Video } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
const showToast = {
  success: (msg) => {
    try {
      if (toast && typeof toast.success === 'function') {
        toast.success(msg);
      } else {
        console.log("SUCCESS TOAST fallback:", msg);
      }
    } catch (err) {
      console.log("SUCCESS TOAST fallback:", msg);
    }
  },
  error: (msg) => {
    try {
      if (toast && typeof toast.error === 'function') {
        toast.error(msg);
      } else {
        console.error("ERROR TOAST fallback:", msg);
      }
    } catch (err) {
      console.error("ERROR TOAST fallback:", msg);
    }
  }
};

const API_NODES = [
  'https://my-app-v6xz.onrender.com',
  'https://my-app-2-uzoi.onrender.com',
  'https://my-app-3-kn3k.onrender.com',
  'https://my-app-4-btda.onrender.com'
];

const getLiveNode = () => {
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://localhost:5005";
  }
  return API_NODES[0];
};

const BASE_URL = getLiveNode();

export default function Messenger() {
  const { user, api, socket: contextSocket, currentNode: contextCurrentNode, switchUser: contextSwitchUser } = useAuth();
  const [localSocket, setLocalSocket] = useState(null);

  // --- Persistent Client States ---
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('onyx_profile_node');
    return saved ? JSON.parse(saved) : {
      name: "Operator Node (You)",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      bio: "Rogue Quantum Deck Architect",
      _id: "me"
    };
  });

  const socket = contextSocket || localSocket;
  const currentNode = contextCurrentNode || BASE_URL;

  // --- Dynamic fallback socket connection ---
  useEffect(() => {
    if (contextSocket) {
      if (localSocket) {
        localSocket.disconnect();
        setLocalSocket(null);
      }
      return;
    }

    const currentUserId = userProfile?._id || 'me';
    let socketInstance = null;

    try {
      socketInstance = io(BASE_URL, {
        query: { userId: currentUserId },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        secure: true,
        withCredentials: true
      });

      socketInstance.on("connect", () => {
        console.log("%c 🚀 Local fallback neural link active: " + socketInstance.id, "color: #0d9488; font-weight: bold;");
        socketInstance.emit("addNewUser", currentUserId);
        setLocalSocket(socketInstance);
      });

      socketInstance.on("connect_error", (err) => {
        console.warn("📡 Local fallback signal pending/error:", err);
      });

      return () => {
        if (socketInstance) {
          socketInstance.disconnect();
          console.log("📡 Local fallback neural link closed.");
        }
      };
    } catch (err) {
      console.error("Local fallback socket initialization error:", err);
    }
  }, [contextSocket, userProfile?._id]);

  const switchUser = contextSwitchUser || React.useCallback((userId) => {
    localStorage.setItem('onyx_token', "sandbox_token_signature_" + userId);
    localStorage.setItem('onyx_selected_user_id', userId);
    
    let profile = {
      _id: userId,
      firstName: userId === 'me' ? "Operator" : userId === 'user-kaelen' ? "Kaelen" : "Sasha",
      lastName: userId === 'me' ? "Node" : userId === 'user-kaelen' ? "Vex" : "Glimmer",
      username: userId === 'me' ? "me_operator" : userId === 'user-kaelen' ? "kaelen_deck" : "sasha_design",
      avatar: userId === 'me' 
        ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
        : userId === 'user-kaelen'
        ? "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80"
        : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      bio: userId === 'me'
        ? "Rogue Quantum Deck Architect"
        : userId === 'user-kaelen'
        ? "Underground network decker and freelance ingress engineer."
        : "Synthetic interface architect."
    };
    
    setUserProfile({
      name: `${profile.firstName} ${profile.lastName}`,
      avatar: profile.avatar,
      bio: profile.bio,
      _id: profile._id
    });
    localStorage.setItem('onyx_profile_node', JSON.stringify({
      name: `${profile.firstName} ${profile.lastName}`,
      avatar: profile.avatar,
      bio: profile.bio,
      _id: profile._id
    }));

    window.location.reload();
  }, [contextSwitchUser]);

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
    try {
      const saved = localStorage.getItem('onyx_groups_node');
      return saved ? JSON.parse(saved) : INITIAL_GROUPS;
    } catch (e) {
      console.error("Local group state corrupted, resetting.", e);
      return INITIAL_GROUPS;
    }
  });

  const [messagesHistory, setMessagesHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('onyx_messages_history_v2');
      return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
    } catch (e) {
      console.error("LocalStorage Corrupted, resetting history", e);
      return INITIAL_MESSAGES;
    }
  });

  const [stories, setStories] = useState(() => {
    const saved = localStorage.getItem('onyx_stories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(st => {
            // Auto migrate old stored configurations if they exist
            if (st.userId && !st.nodeId) {
              return {
                id: st.id,
                nodeId: st.userId,
                nodeName: st.userName || "Operator",
                nodeAvatar: st.avatar,
                timestamp: st.timestamp || "Just now",
                media: st.slides?.[0]?.url || "bg-gradient-to-tr from-cyan-950 via-zinc-900 to-purple-950",
                caption: st.slides?.[0]?.caption || "Neural link synchronized"
              };
            }
            return st;
          });
        }
      } catch (e) {
        localStorage.removeItem('onyx_stories');
      }
    }
    return [];
  });

  const [broadcastChannels, setBroadcastChannels] = useState(() => {
    const saved = localStorage.getItem('onyx_channels_list_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [searchedNodes, setSearchedNodes] = useState([]);
  const [unreadChatIds, setUnreadChatIds] = useState([]);
  const [incomingCallSession, setIncomingCallSession] = useState(null);

  const [selectedChatId, setSelectedChatId] = useState(null);
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
  const activeCallSessionRef = useRef(null);
  useEffect(() => {
    activeCallSessionRef.current = activeCallSession;
  }, [activeCallSession]);
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
    return saved ? JSON.parse(saved) : INITIAL_CHATS;
  });

  const selectedChatIdRef = useRef(null);
  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  const dynamicChatsRef = useRef(null);
  useEffect(() => {
    dynamicChatsRef.current = dynamicChats;
  }, [dynamicChats]);

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
    localStorage.setItem('onyx_messages_history_v2', JSON.stringify(messagesHistory));
  }, [messagesHistory]);

  useEffect(() => {
    localStorage.setItem('onyx_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('onyx_channels_list_v2', JSON.stringify(broadcastChannels));
  }, [broadcastChannels]);

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
    const currentUserId = user?._id || userProfile?._id || 'me';
    let opponentId = conv.userDetails?._id || conv.userDetails?.id;
    if (!opponentId && conv.members) {
      opponentId = conv.members.find(m => m.toString() !== currentUserId.toString());
    }
    
    // Fallback info if userDetails can't be fetched
    let defaultName = "Operator Node";
    let defaultAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80";
    if (opponentId === "bot-onyx") {
      defaultName = "Onyx Core Intelligence";
      defaultAvatar = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80";
    } else if (opponentId === "bot-luna") {
      defaultName = "Advisor Luna";
      defaultAvatar = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80";
    } else if (opponentId === "user-kaelen") {
      defaultName = "Kaelen Vex";
      defaultAvatar = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80";
    }

    const resolvedIsBot = isBot || (opponentId?.startsWith("bot-") || false);

    return {
      id: conv._id,
      name: conv.userDetails ? `${conv.userDetails.firstName} ${conv.userDetails.lastName}` : defaultName,
      avatar: conv.userDetails?.avatar || defaultAvatar,
      lastMsg: conv.lastMessage?.text || "Neural connection established. Ready.",
      time: conv.updatedAt ? new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now",
      online: conv.userDetails?.online || resolvedIsBot || false,
      isBot: resolvedIsBot,
      bio: conv.userDetails?.bio || "Zero-Knowledge Terminal Node",
      encryptionKey: resolvedIsBot ? (opponentId === 'bot-onyx' ? 'AES-512-NX' : 'RSA-4096-LUNA') : 'PGP-LINK-SECURE',
      latency: resolvedIsBot ? '0.04ms' : '15ms',
      otherId: opponentId
    };
  };

  // Main Loader function for conversations
  const loadAllConversations = () => {
    const fetchApi = api ? api.get('/messages/conversations').then(res => res.data) : fetch('/api/messages/conversations').then(res => res.json());
    
    fetchApi
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(formatBackendConversation);
          
          let latestDynamic = [];
          try {
            const saved = localStorage.getItem('onyx_dynamic_chats');
            latestDynamic = saved ? JSON.parse(saved) : (dynamicChatsRef.current || []);
          } catch (e) {
            latestDynamic = dynamicChatsRef.current || [];
          }

          setChatList(() => {
            const combined = [...formatted];
            latestDynamic.forEach(d => {
              if (!combined.some(c => c.id === d.id || (d.otherId && c.otherId === d.otherId))) {
                combined.push(d);
              }
            });
            if (combined.length === 0) {
              return INITIAL_CHATS;
            }
            return combined;
          });
          
          // If we have a selectedChatId that is a temp ID, resolve it to the loaded real conversation ID
          const currentSelectedId = selectedChatIdRef.current;
          if (currentSelectedId && currentSelectedId.startsWith("conv-temp-")) {
            const tempUserId = currentSelectedId.replace("conv-temp-", "");
            const matchingRealConv = formatted.find(c => c.otherId === tempUserId);
            if (matchingRealConv) {
              const realConvId = matchingRealConv.id;
              console.log(`💡 [LOAD CONVERSATIONS] Auto-resolving selectedChatId from temp ${currentSelectedId} to real ${realConvId}`);
              
              setDynamicChats(prev => {
                const next = prev.map(c => {
                  if (c.id === currentSelectedId) {
                    return { ...c, id: realConvId };
                  }
                  return c;
                });
                localStorage.setItem('onyx_dynamic_chats', JSON.stringify(next));
                return next;
              });

              setMessagesHistory(prev => {
                const updated = { ...prev };
                const oldList = updated[currentSelectedId] || [];
                updated[realConvId] = [...(updated[realConvId] || []), ...oldList].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
                delete updated[currentSelectedId];
                return updated;
              });

              setSelectedChatId(realConvId);
            }
          }
          
          // Verify if active selected chat still active, fallback if not set
          const activeList = formatted.length > 0 ? formatted : (latestDynamic.length > 0 ? latestDynamic : INITIAL_CHATS);
          if (activeList.length > 0 && !currentSelectedId) {
            setSelectedChatId(activeList[0].id);
          }
        }
      })
      .catch(err => {
        console.warn("REST API conversations fetch offline simulation fallback:", err);
        const fallback = INITIAL_CHATS;
        
        let latestDynamic = [];
        try {
          const saved = localStorage.getItem('onyx_dynamic_chats');
          latestDynamic = saved ? JSON.parse(saved) : (dynamicChatsRef.current || []);
        } catch (e) {
          latestDynamic = dynamicChatsRef.current || [];
        }

        setChatList(() => {
          const combined = [...fallback];
          latestDynamic.forEach(d => {
            if (!combined.some(c => c.id === d.id || (d.otherId && c.otherId === d.otherId))) {
              combined.push(d);
            }
          });
          if (combined.length === 0) {
            return INITIAL_CHATS;
          }
          return combined;
        });

        // Verify if active selected chat still active, fallback if not set
        const currentSelectedId = selectedChatIdRef.current;
        if (!currentSelectedId) {
          const fallbackList = latestDynamic.length > 0 ? latestDynamic : INITIAL_CHATS;
          if (fallbackList.length > 0) {
            setSelectedChatId(fallbackList[0].id);
          }
        }
      });
  };

  // Initial load, background synchronization, and browser notification permission queries
  useEffect(() => {
    loadAllConversations();

    // Prompts users for permission to trigger native browser notification handshakes
    if (typeof Notification !== 'undefined' && Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log("🔔 [NOTIFICATIONS] Secure link notifications enabled.");
        }
      });
    }
  }, [user]);

  // Periodic visual handshake sync to support 100% reliable transport even across transient offline frames
  useEffect(() => {
    const runBackgroundSync = () => {
      // 1. Reload conversations to update previews and unreads in sidebar
      loadAllConversations();

      // 2. Fetch latest history for actively selected direct chat to pull down new messages without page refreshes
      const idToRefresh = selectedChatIdRef.current;
      if (idToRefresh && !idToRefresh.startsWith("group-") && !idToRefresh.startsWith("conv-temp-")) {
        const historyApi = api 
          ? api.get(`/messages/history/${idToRefresh}`).then(res => res.data) 
          : fetch(`/api/messages/history/${idToRefresh}`).then(res => res.json());

        historyApi
          .then(data => {
            if (Array.isArray(data)) {
              // Retrieve partner contact details directly from chatList to prevent temporal dead zone (TDZ) reference errors
              const targetChat = chatList.find(c => c.id === idToRefresh || c.otherId === idToRefresh);
              const partnerName = targetChat?.name || "Grid Operator";

              const formattedMsgs = data.map((m) => {
                const isMsgMe = m.senderId === 'me' || m.senderId === (userProfile?._id || 'me');
                return {
                  id: m.id || m._id,
                  sender: isMsgMe ? 'me' : m.senderId,
                  senderName: isMsgMe ? userProfile.name : partnerName,
                  text: m.text,
                  file: m.image,
                  time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
                };
              });

              setMessagesHistory(prev => {
                const currentList = prev[idToRefresh] || [];
                // Check if we actually have any new incoming messages to avoid triggering infinite state updates
                const hasNewMessages = formattedMsgs.length !== currentList.filter(m => !m.id.startsWith("usr-predict-")).length ||
                  formattedMsgs.some(f => !currentList.some(c => c.id === f.id));

                if (!hasNewMessages) return prev;

                // Merge preserving local optimistic predictive messages
                const merged = [...formattedMsgs];
                currentList.forEach(localMsg => {
                  const alreadyExists = formattedMsgs.some(serverMsg => 
                    serverMsg.id === localMsg.id || 
                    (serverMsg.text === localMsg.text && serverMsg.sender === localMsg.sender)
                  );
                  if (!alreadyExists && localMsg.id.startsWith("usr-predict-")) {
                    merged.push(localMsg);
                  }
                });

                return {
                  ...prev,
                  [idToRefresh]: merged
                };
              });
            }
          })
          .catch(err => {
            console.debug("Background messages synchronizer bypassed:", err);
          });
      }
    };

    // Keep background sync running every 4 seconds for highly responsive delivery
    const syncInterval = setInterval(runBackgroundSync, 4000);
    return () => clearInterval(syncInterval);
  }, [userProfile?._id, chatList]);

  // Global user gesture detection to unlock AudioContext compliant with browser autoplay policies
  useEffect(() => {
    const enableAudioOnGesture = () => {
      window.hasOnyxAudioBeenGestureActivated = true;
      document.removeEventListener('click', enableAudioOnGesture);
      document.removeEventListener('touchstart', enableAudioOnGesture);
    };
    document.addEventListener('click', enableAudioOnGesture);
    document.addEventListener('touchstart', enableAudioOnGesture);
    return () => {
      document.removeEventListener('click', enableAudioOnGesture);
      document.removeEventListener('touchstart', enableAudioOnGesture);
    };
  }, []);

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

  // --- Socket.IO Multi-User real-time sync & Calling Handshakes ---
  useEffect(() => {
    if (!socket) return;

    socket.on("receiveMessage", (data) => {
      console.log("⚡ [SOCKET] Message stream ingress payload:", data);
      
      // Play a quick soft digital chirp synth sound for message notification (only if user interacted)
      try {
        if (window.hasOnyxAudioBeenGestureActivated) {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.setValueAtTime(580, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
          osc.type = "sine";
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.2);
        }
      } catch (e) {}

      const msgId = data.message?.id || data.message?._id;
      let originId = data.conversationId;
      const currentUserId = user?._id || userProfile?._id || 'me';

      let partnerId = null;
      if (data.conversation && data.conversation.members) {
        const members = data.conversation.members.map(m => m.toString());
        partnerId = members.find(m => m !== currentUserId.toString());
      }

      // Show beautiful visual in-app toast notification if the message is from someone else
      const senderId = data.message?.senderId;
      const isMsgFromMe = senderId === 'me' || (senderId && currentUserId && senderId.toString() === currentUserId.toString());
      if (!isMsgFromMe) {
        let senderName = "Remote Operative";
        if (data.conversation?.userDetails) {
          senderName = `${data.conversation.userDetails.firstName || ''} ${data.conversation.userDetails.lastName || ''}`.trim() || data.conversation.userDetails.username || "Operator Node";
        } else {
          const matchCh = chatList.find(c => c.otherId === senderId || c.id === senderId || (partnerId && (c.otherId === partnerId || c.id === partnerId)));
          if (matchCh) senderName = matchCh.name;
        }
        
        toast(`💬 New Message from ${senderName}:\n"${data.message?.text || 'Secured packet'}"`, {
          icon: '📩',
          style: {
            background: '#09090b',
            color: '#22d3ee',
            border: '1px solid rgba(34, 211, 238, 0.4)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.8)',
            borderRadius: '1rem',
            fontFamily: 'monospace',
            fontSize: '11px',
          },
          duration: 4000
        });

        // Trigger native browser notification with actual sender details if permitted
        if (typeof Notification !== 'undefined' && Notification.permission === "granted") {
          new Notification(`💬 Message from ${senderName}`, { 
            body: data.message?.text || "Secured packet received.",
            icon: data.conversation?.userDetails?.avatar || "/favicon.ico"
          });
        }
      }

      // Reload conversations list to update previews
      loadAllConversations();

      // Dynamically resolve target chat ID based on members to align sender and recipient views
      if (partnerId) {
        const matchedChat = chatList.find(c => 
          c.id === partnerId || 
          c.otherId === partnerId || 
          c.id === `conv-temp-${partnerId}` ||
          c.id === `conv-${partnerId}` ||
          c.id === originId
        );
        if (matchedChat) {
          originId = matchedChat.id;
        } else {
          originId = partnerId;
        }
      }

      let activeId = selectedChatId;

      // Automatically swap our selected chat from temp ID to real DB ID if this received message belongs to it
      if (selectedChatId && selectedChatId.startsWith("conv-temp-")) {
        const tempTargetUserId = selectedChatId.replace("conv-temp-", "");
        let isMatch = (data.message?.senderId === tempTargetUserId);

        if (!isMatch && partnerId && tempTargetUserId === partnerId) {
          isMatch = true;
        }

        if (isMatch) {
          const realConvId = data.conversationId;
          console.log(`🔄 [SOCKET SWAP] Automatically switching selectedChatId from temp ${selectedChatId} to real ${realConvId}`);
          
          setDynamicChats(prev => {
            const next = prev.map(c => {
              if (c.id === selectedChatId || c.otherId === tempTargetUserId) {
                return { ...c, id: realConvId };
              }
              return c;
            });
            localStorage.setItem('onyx_dynamic_chats', JSON.stringify(next));
            return next;
          });

          setChatList(prev => prev.map(c => {
            if (c.id === selectedChatId || c.otherId === tempTargetUserId) {
              return { ...c, id: realConvId };
            }
            return c;
          }));

          setMessagesHistory(prev => {
            const updated = { ...prev };
            const oldList = updated[selectedChatId] || [];
            updated[realConvId] = [...(updated[realConvId] || []), ...oldList].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
            delete updated[selectedChatId];
            return updated;
          });
          
          setSelectedChatId(realConvId);
          activeId = realConvId;
        }
      }

      // Determine if this received message matches the active chat view (whether it is by real ID, temp ID, or partner ID)
      let incomingMessageMatchesActive = false;
      if (originId === activeId || data.conversationId === activeId) {
        incomingMessageMatchesActive = true;
      } else if (activeId && activeId.startsWith("conv-temp-")) {
        const tempTargetUserId = activeId.replace("conv-temp-", "");
        if (tempTargetUserId === partnerId || tempTargetUserId === data.conversationId) {
          incomingMessageMatchesActive = true;
        }
      } else if (activeId && partnerId && activeId === partnerId) {
        incomingMessageMatchesActive = true;
      }

      // ALWAYS format and store the received message into history mapping under all matching keys
      // to guarantee that no messages are missed when the user switches views or opens chat.
      setMessagesHistory(prev => {
        const isSenderMe = data.message?.senderId === 'me' || (data.message?.senderId && currentUserId && data.message.senderId.toString() === currentUserId.toString());
        const newMsgFormatted = {
          id: msgId,
          sender: isSenderMe ? 'me' : (data.message?.senderId || 'opponent'),
          senderName: isSenderMe ? userProfile.name : "Remote Operator",
          text: data.message?.text || "",
          file: data.message?.image || null,
          time: new Date(data.message?.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const nextHistory = { ...prev };
        const activeKey = activeId || originId || data.conversationId || partnerId;
        const tempPartnerKey = partnerId ? `conv-temp-${partnerId}` : null;

        const targetKeys = [
          activeKey,
          data.conversationId,
          partnerId,
          tempPartnerKey
        ].filter(Boolean);

        // Deduplicate key updates cleanly and perform updates functionally
        const uniqueKeys = [...new Set(targetKeys)];
        uniqueKeys.forEach(key => {
          const list = nextHistory[key] || [];
          if (!list.some(m => m.id === msgId)) {
            nextHistory[key] = [...list, newMsgFormatted];
          }
        });

        return nextHistory;
      });

      if (!incomingMessageMatchesActive) {
        // Mark as unread!
        const unreadKey = originId || data.conversationId || partnerId;
        if (unreadKey) {
          setUnreadChatIds(prev => prev.includes(unreadKey) ? prev : [...prev, unreadKey]);
        }
      }
    });

    socket.on("incomingCall", (data) => {
      console.log("📞 [SOCKET] Telemetry Incoming call detected:", data);
      
      // Auto busy signaling if user is already in another call
      if (activeCallSessionRef.current) {
        console.log("☎️ User is busy in an active session. Emitting busy signal to caller.");
        socket.emit("webrtcSignal", {
          to: data.from,
          from: userProfile._id || "me",
          signal: { type: "partnerBusy" }
        });
        socket.emit("declineCall", {
          to: data.from,
          from: userProfile._id || "me"
        });
        return;
      }

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification(`Onyx Secure Call from ${data.name}`, { body: `Encryption rate synced.` });
      }

      setIncomingCallSession({
        from: data.from,
        name: data.name,
        avatar: data.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        type: data.type
      });
    });

    socket.on("callCancelled", (data) => {
      console.log("🛑 [SOCKET] Incoming call aborted by remote peer.");
      showToast.error("Onyx connection link disconnected or declined.");
      setIncomingCallSession(null);
      setActiveCallSession(null);
    });

    socket.on("callConnected", (data) => {
      console.log("🔗 [SOCKET] Incoming call accepted by remote agent.");
      showToast.success("Onyx secure connection link established!");
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("incomingCall");
      socket.off("callCancelled");
      socket.off("callConnected");
    };
  }, [socket, selectedChatId, userProfile.name, user, chatList]);

  // If a chat is selected, clear its unread status
  useEffect(() => {
    if (selectedChatId) {
      setUnreadChatIds(prev => prev.filter(id => id !== selectedChatId));
    }
  }, [selectedChatId]);

  // --- Beautiful recurring Dial Tone Ringtone synthesis ---
  useEffect(() => {
    let timer;
    if (incomingCallSession) {
      const playBbeebRing = () => {
        try {
          // Avoid playing the dial tone until the user gesture has unlocked the audio layer
          if (!window.hasOnyxAudioBeenGestureActivated) {
            return;
          }
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const playDualTone = (f1, f2, duration, delay) => {
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc1.frequency.value = f1;
            osc1.type = "sine";
            osc2.frequency.value = f2;
            osc2.type = "sine";

            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + delay + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + duration);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(audioCtx.destination);

            osc1.start(audioCtx.currentTime + delay);
            osc2.start(audioCtx.currentTime + delay);

            osc1.stop(audioCtx.currentTime + delay + duration + 0.1);
            osc2.stop(audioCtx.currentTime + delay + duration + 0.1);
          };

          // Mimics standard secure electronic ringtone chord double ring
          playDualTone(440, 480, 0.35, 0);
          playDualTone(440, 480, 0.35, 0.45);
        } catch (e) {
          console.warn("Ringtone synthesizer blocked in browser canvas context.");
        }
      };

      playBbeebRing();
      timer = setInterval(playBbeebRing, 2200);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [incomingCallSession]);

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
        setDynamicChats(prev => {
          const next = prev.map(c => {
            if (c.id === tempConvId) {
              return {
                ...c,
                id: newConv._id,
                lastMsg: newConv.lastMessage?.text || "Neural connection established."
              };
            }
            return c;
          });
          localStorage.setItem('onyx_dynamic_chats', JSON.stringify(next));
          return next;
        });

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
          const targetChat = chatList.find(c => c.id === selectedChatId || c.otherId === selectedChatId);
          const partnerName = targetChat?.name || "Grid Operator";

          const formattedMsgs = data.map((m) => {
            const isMsgMe = m.senderId === 'me' || m.senderId === (userProfile?._id || 'me');
            return {
              id: m.id || m._id,
              sender: isMsgMe ? 'me' : m.senderId,
              senderName: isMsgMe ? userProfile.name : partnerName,
              text: m.text,
              file: m.image,
              time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
            };
          });

          setMessagesHistory(prev => {
            const currentList = prev[selectedChatId] || [];
            const merged = [...formattedMsgs];
            currentList.forEach(localMsg => {
              const alreadyExists = formattedMsgs.some(serverMsg => 
                serverMsg.id === localMsg.id || 
                (serverMsg.text === localMsg.text && serverMsg.sender === localMsg.sender)
              );
              if (!alreadyExists) {
                merged.push(localMsg);
              }
            });
            return {
              ...prev,
              [selectedChatId]: merged
            };
          });
        } else {
          throw new Error("Invalid array payload received. Reverting to local store.");
        }
      })
      .catch(err => {
        console.warn("History API link offline. Reverting local mock messages history.");
        let fallbackKey = selectedChatId;
        if (fallbackKey) {
          if (fallbackKey.includes("onyx")) fallbackKey = "bot-onyx";
          else if (fallbackKey.includes("luna")) fallbackKey = "bot-luna";
          else if (fallbackKey.includes("kaelen")) fallbackKey = "user-kaelen";
          else if (fallbackKey.includes("sasha")) fallbackKey = "user-sasha";
        }
        const fallbackMsgs = INITIAL_MESSAGES[fallbackKey] || [];
        setMessagesHistory(prev => {
          const currentList = prev[selectedChatId] || [];
          const merged = [...fallbackMsgs];
          currentList.forEach(localMsg => {
            const alreadyExists = fallbackMsgs.some(serverMsg => 
              serverMsg.id === localMsg.id || 
              (serverMsg.text === localMsg.text && serverMsg.sender === localMsg.sender)
            );
            if (!alreadyExists) {
              merged.push(localMsg);
            }
          });
          return {
            ...prev,
            [selectedChatId]: merged
          };
        });
      });
  }, [selectedChatId, api, chatList, userProfile?._id]);

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

  const combinedChatList = [
    ...chatList,
    ...broadcastChannels
  ];

  const filteredChatList = combinedChatList
    .filter(c => !deletedChatIds.includes(c.id))
    .map(c => ({
      ...c,
      isMuted: mutedChatIds.includes(c.id),
      isBlocked: blockedChatIds.includes(c.id),
      unread: unreadChatIds.includes(c.id)
    }));

  const isSelectedChatGroup = selectedChatId ? selectedChatId.startsWith("group-") : false;
  const selectedChatDetails = isSelectedChatGroup 
    ? groupList.find(g => g.id === selectedChatId)
    : (filteredChatList.find(c => c.id === selectedChatId) || 
       (selectedChatId && selectedChatId.startsWith("conv-temp-") 
        ? filteredChatList.find(c => c.otherId === selectedChatId.replace("conv-temp-", ""))
        : null));

  const resolvedSelectedIdForMessages = selectedChatDetails ? selectedChatDetails.id : selectedChatId;
  const activeMessages = messagesHistory[resolvedSelectedIdForMessages] || messagesHistory[selectedChatId] || [];

  // --- Direct Chat message triggers & AI Core integrations ---
  const handleSendMessage = async ({ text, file, replyTo }) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (selectedChatDetails?.isChannel) {
      const newMessage = {
        id: "chanMsg-" + Date.now(),
        sender: "me",
        senderName: userProfile.name,
        text: text,
        time: timeString,
        isCreator: true,
        replyTo: replyTo || null
      };

      setMessagesHistory(prev => ({
        ...prev,
        [selectedChatId]: [...(prev[selectedChatId] || []), newMessage]
      }));

      setBroadcastChannels(prev => prev.map(ch => ch.id === selectedChatId ? { ...ch, lastMsg: `Broadcast: ${text}`, time: 'Just now' } : ch));
      return;
    }

    if (isSelectedChatGroup) {
      const newMessage = {
        id: "usr-" + Date.now(),
        sender: "me",
        senderName: userProfile.name,
        text: text,
        time: timeString,
        replyTo: replyTo || null
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
      time: timeString,
      replyTo: replyTo || null
    };

    setMessagesHistory(prev => ({
      ...prev,
      [resolvedSelectedIdForMessages]: [...(prev[resolvedSelectedIdForMessages] || []), clientPredictionMsg]
    }));

    // Self destruct mechanism
    if (selfDestructDuration > 0) {
      const targetMsgId = clientPredictionMsg.id;
      setTimeout(() => {
        setMessagesHistory(prev => ({
          ...prev,
          [resolvedSelectedIdForMessages]: (prev[resolvedSelectedIdForMessages] || []).filter(m => m.id !== targetMsgId)
        }));
      }, selfDestructDuration * 1000);
    }

    try {
      let responseData;
      if (api) {
        const res = await api.post("/messages/message", {
          conversationId: resolvedSelectedIdForMessages,
          text: text,
          image: file || null
        });
        responseData = res.data;
      } else {
        responseData = await fetch("/api/messages/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: resolvedSelectedIdForMessages,
            text: text,
            image: file || null
          })
        }).then(r => r.json());
      }

      // Dynamic conversion sync if backend maps to real Mongo conversation ID
      const activeChatId = responseData && responseData.conversationId ? responseData.conversationId : resolvedSelectedIdForMessages;
      if (responseData && responseData.conversationId && responseData.conversationId !== selectedChatId && responseData.conversationId !== resolvedSelectedIdForMessages) {
        const realConvId = responseData.conversationId;
        console.log(`🔄 Swapping raw/temp selectedChatId: ${selectedChatId} for real mapped conversationId: ${realConvId}`);
        
        setDynamicChats(prev => {
          const next = prev.map(c => {
            if (c.id === selectedChatId || (selectedChatId && selectedChatId.startsWith("conv-temp-") && c.otherId === selectedChatId.replace("conv-temp-", ""))) {
              return { ...c, id: realConvId };
            }
            return c;
          });
          localStorage.setItem('onyx_dynamic_chats', JSON.stringify(next));
          return next;
        });

        setChatList(prev => prev.map(c => {
          if (c.id === selectedChatId || (selectedChatId && selectedChatId.startsWith("conv-temp-") && c.otherId === selectedChatId.replace("conv-temp-", ""))) {
            return { ...c, id: realConvId };
          }
          return c;
        }));

        setMessagesHistory(prev => {
          const updated = { ...prev };
          const oldList = updated[selectedChatId] || [];
          updated[realConvId] = [...(updated[realConvId] || []), ...oldList].filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
          delete updated[selectedChatId];
          return updated;
        });

        setSelectedChatId(realConvId);
      }

      loadAllConversations();

      setTimeout(() => {
        const historyApi = api 
          ? api.get(`/messages/history/${activeChatId}`).then(res => res.data) 
          : fetch(`/api/messages/history/${activeChatId}`).then(res => res.json());

        historyApi
          .then(data => {
            if (Array.isArray(data)) {
              const formattedMsgs = data.map((m) => {
                const isMsgMe = m.senderId === 'me' || m.senderId === (userProfile?._id || 'me');
                return {
                  id: m.id || m._id,
                  sender: isMsgMe ? 'me' : m.senderId,
                  senderName: isMsgMe ? userProfile.name : (selectedChatDetails?.name || "Onyx Node"),
                  text: m.text,
                  file: m.image,
                  time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
                };
              });

              setMessagesHistory(prev => {
                const currentList = prev[activeChatId] || [];
                const merged = [...formattedMsgs];
                currentList.forEach(localMsg => {
                  const alreadyExists = formattedMsgs.some(serverMsg => 
                    serverMsg.id === localMsg.id || 
                    (serverMsg.text === localMsg.text && serverMsg.sender === localMsg.sender)
                  );
                  if (!alreadyExists) {
                    merged.push(localMsg);
                  }
                });
                return {
                  ...prev,
                  [activeChatId]: merged
                };
              });

              // Auto delete incoming bot response if self destruct active
              if (selfDestructDuration > 0) {
                formattedMsgs.forEach(m => {
                  if (m.sender !== 'me') {
                    setTimeout(() => {
                      setMessagesHistory(prev => ({
                        ...prev,
                        [activeChatId]: (prev[activeChatId] || []).filter(item => item.id !== m.id)
                      }));
                    }, selfDestructDuration * 1000);
                  }
                });
              }
            }
            setIsAITyping(false);
          })
          .catch(err => {
            console.warn("Failed retrieving history update. Retaining local predictive state:", err);
            setIsAITyping(false);
          });
      }, 1600);

    } catch (e) {
      console.warn("Failed sending server-side message. Resorting to local mock simulation logic:", e);
      
      if (selectedChatDetails?.isBot) {
        setTimeout(() => {
          let aiResponseText = "";
          const targetBot = selectedChatDetails.id || selectedChatId;
          if (targetBot.includes("luna")) {
            const lowText = (text || "").toLowerCase();
            if (lowText.includes("tire") || lowText.includes("burn") || lowText.includes("stress")) {
              aiResponseText = "🌱 [LUNAR SECURITY] Focus cycles indicate psychological hyper-intensity. Your biometric mesh matches baseline stress limits. Rest your eyes or select the Theta binaural hum soundscape in settings.";
            } else {
              aiResponseText = "🧠 [LUNAR INSIGHTS] Handshake acknowledged. Bio-telemetry looks stable. Onyx neural link keeps operations safe. Keep coding with breathing intervals.";
            }
          } else {
            aiResponseText = `🤖 [ONYX COMPILER] Local database sync offline. Raw transmission packet parsed: "${text}". Secure terminal interface is operating normally at 100% standard index.`;
          }

          const botMsg = {
            id: "msg-local-" + Date.now(),
            sender: targetBot.includes("luna") ? "bot-luna" : "bot-onyx",
            senderName: selectedChatDetails.name || "Core AI",
            text: aiResponseText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessagesHistory(prev => ({
            ...prev,
            [selectedChatId]: [...(prev[selectedChatId] || []).filter(m => m.id !== "usr-predict-" + Date.now()), botMsg]
          }));

          // Self destruct mechanism for simulated bot message as well
          if (selfDestructDuration > 0) {
            setTimeout(() => {
              setMessagesHistory(prev => ({
                ...prev,
                [selectedChatId]: (prev[selectedChatId] || []).filter(item => item.id !== botMsg.id)
              }));
            }, selfDestructDuration * 1000);
          }

          setIsAITyping(false);
        }, 1500);
      } else {
        setIsAITyping(false);
      }
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

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const callInitLog = {
      id: "callInit-" + Date.now(),
      sender: "system-log",
      senderName: "System Logger",
      text: `📡 Dialing Outgoing Secure ${type === 'video' ? 'Video' : 'Voice'} Call...`,
      time: timeString,
      isCallLog: true,
      callStatus: 'ringing',
      callType: type || 'video'
    };

    const targetChatId = target.id || selectedChatId;
    if (targetChatId) {
      setMessagesHistory(prev => ({
        ...prev,
        [targetChatId]: [...(prev[targetChatId] || []), callInitLog]
      }));
      setChatList(prev => prev.map(ch => ch.id === targetChatId ? { ...ch, lastMsg: `Dialing secure line...`, time: 'Just now' } : ch));
    }

    if (socket && target) {
      const otherId = target.otherId || target.id;
      console.log(`📞 Emitting initiateCall on socket to otherId: ${otherId}`);
      socket.emit("initiateCall", {
        to: otherId,
        type: type || 'video',
        from: userProfile._id || 'me',
        name: userProfile.name,
        avatar: userProfile.avatar
      });
    }
  };

  const handleAddStory = ({ caption, media, bgPreset }) => {
    const finalMedia = media || bgPreset || "bg-gradient-to-tr from-cyan-950 via-zinc-900 to-purple-950";
    const newStory = {
      id: "st-" + Date.now(),
      nodeId: "me",
      nodeName: userProfile.name,
      nodeAvatar: userProfile.avatar,
      timestamp: "Just now",
      media: finalMedia,
      caption: caption || "New neural sequence published +++"
    };

    setStories(prev => {
      // Keep only one story from "me" to avoid list bloat, placing the latest first
      return [
        newStory,
        ...prev.filter(s => s.nodeId !== "me")
      ];
    });

    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch(e) {}
  };

  const handleCreateChannel = ({ name, description, avatar }) => {
    const newChan = {
      id: "chan-" + Date.now(),
      name: name || "📢 Private Broadcast Network",
      avatar: avatar || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=150&q=80",
      lastMsg: "Broadcast channel initialized. Ready to transmit bulletin data.",
      time: "Just now",
      isChannel: true,
      joined: true,
      subscribers: 1,
      description: description || "No coordinates specified.",
      role: "owner"
    };

    setBroadcastChannels(prev => [...prev, newChan]);

    setMessagesHistory(prev => ({
      ...prev,
      [newChan.id]: [
        {
          id: "m-init-" + Date.now(),
          sender: "system",
          senderName: "SYSTEM CORE",
          text: `📢 Welcome to the Channel Bulletin Hub: "${newChan.name}". Broadcaster logs synced and active. Ready to broadcast.`,
          time: "Just now"
        }
      ]
    }));

    setSelectedChatId(newChan.id);
  };

  const handleJoinChannel = (channelId) => {
    setBroadcastChannels(prev => prev.map(ch => {
      if (ch.id === channelId) {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
          osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); 
          gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        } catch(e) {}

        return {
          ...ch,
          joined: true,
          subscribers: ch.subscribers + 1,
          lastMsg: `Joined channel Bulletin successfully.`
        };
      }
      return ch;
    }));

    setMessagesHistory(prev => ({
      ...prev,
      [channelId]: [
        ...(prev[channelId] || []),
        {
          id: "m-sys-join" + Date.now(),
          sender: "system",
          senderName: "SYSTEM CORE",
          text: `🔑 Secure client link authenticated successfully. Broadcast streams synchronized at node: ${channelId}. Welcome!`,
          time: "Just now"
        }
      ]
    }));
  };

  const handleEditMessage = (chatId, messageId, newText) => {
    setMessagesHistory(prev => {
      const msgs = prev[chatId] || [];
      const updated = msgs.map(m => m.id === messageId ? { ...m, text: newText, isEdited: true } : m);
      return {
        ...prev,
        [chatId]: updated
      };
    });
  };

  const handleForwardMessage = (targetChatId, text) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const forwardPayload = {
      id: "usr-forward-" + Date.now(),
      sender: "me",
      senderName: userProfile.name,
      text: text,
      time: timeString
    };

    setMessagesHistory(prev => ({
      ...prev,
      [targetChatId]: [...(prev[targetChatId] || []), forwardPayload]
    }));

    if (targetChatId.startsWith("group-")) {
      setGroupList(prev => prev.map(g => g.id === targetChatId ? { ...g, lastMsg: `You: ${text}`, time: 'Just now' } : g));
    } else if (targetChatId.startsWith("chan-")) {
      setBroadcastChannels(prev => prev.map(ch => ch.id === targetChatId ? { ...ch, lastMsg: `Broadcast: ${text}`, time: 'Just now' } : ch));
    } else {
      setChatList(prev => prev.map(ch => ch.id === targetChatId ? { ...ch, lastMsg: `You: ${text}`, time: 'Just now' } : ch));
    }
  };

  const handleDeleteMessage = (messageId) => {
    setMessagesHistory(prev => ({
      ...prev,
      [selectedChatId]: (prev[selectedChatId] || []).filter(m => m.id !== messageId)
    }));
  };

  const handleClearAllHistory = () => {
    setMessagesHistory({});
    setChatList([]);
    setGroupList([]);
    setBroadcastChannels([]);
    setStories([]);
    localStorage.removeItem('onyx_messages_history_v2');
    localStorage.removeItem('onyx_groups_node');
    localStorage.removeItem('onyx_channels_list_v2');
    localStorage.removeItem('onyx_stories');
    localStorage.removeItem('onyx_dynamic_chats');
    setSelectedChatId(null);
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
          socket={socket}
          callTarget={activeCallSession.target}
          callType={activeCallSession.type}
          onEndCall={(duration, status) => {
            const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let logMsgText = "";

            if (status === 'missed') {
              logMsgText = `❌ Missed Call (${activeCallSession.type === 'video' ? 'Video' : 'Voice'})`;
            } else {
              const minutes = Math.floor(duration / 60);
              const seconds = duration % 60;
              const durationStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
              logMsgText = `📞 Call Completed (${activeCallSession.type === 'video' ? 'Video' : 'Voice'}) — Duration: ${durationStr}`;
            }

            const callResultLog = {
              id: "callResult-" + Date.now(),
              sender: "system-log",
              senderName: "System Logger",
              text: logMsgText,
              time: timeString,
              isCallLog: true,
              callStatus: status,
              callDuration: duration,
              callType: activeCallSession.type
            };

            const targetChatId = activeCallSession.target.id || selectedChatId;
            if (targetChatId) {
              setMessagesHistory(prev => ({
                ...prev,
                [targetChatId]: [...(prev[targetChatId] || []), callResultLog]
              }));

              // Update the sidebar chat list
              setChatList(prev => prev.map(ch => ch.id === targetChatId ? { ...ch, lastMsg: logMsgText, time: 'Just now' } : ch));
            }

            if (socket && activeCallSession?.target) {
              const otherId = activeCallSession.target.otherId || activeCallSession.target.id;
              socket.emit("declineCall", {
                to: otherId,
                from: userProfile._id || 'me'
              });
            }
            setActiveCallSession(null);
          }}
          activeAccent={activeAccent}
          userProfile={userProfile}
        />
      )}

      {incomingCallSession && (
        <div id="incoming-call-portal" className="fixed inset-0 z-[7000] bg-[#0b141a]/95 backdrop-blur-md flex flex-col items-center justify-between p-8 font-sans text-[#e9edef]">
          {/* Top Lock Indicator */}
          <div className="flex items-center gap-2 mt-4 text-zinc-400">
            <ShieldCheck size={14} className="text-[#00a884] shrink-0" />
            <span className="text-[11px] font-bold tracking-widest uppercase">
              End-to-End Encrypted
            </span>
          </div>

          {/* Caller Profile Card */}
          <div className="flex flex-col items-center text-center my-auto">
            {/* Pulsing Avatar Frame */}
            <div className="relative mb-6">
              <div className="absolute inset-x-0 -inset-y-4 rounded-full bg-[#00a884]/15 animate-ping duration-2000" />
              <div className="absolute inset-0 rounded-full bg-[#128c7e]/10 animate-pulse duration-1000" />
              <img 
                src={incomingCallSession.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                className="w-28 h-28 rounded-full object-cover border-4 border-[#121b22] relative z-10 shadow-2xl"
                alt="Caller avatar"
                referrerPolicy="no-referrer"
              />
            </div>

            <h2 className="text-2xl font-black text-white mb-1.5 tracking-wider">
              {incomingCallSession.name}
            </h2>
            <p className="text-sm text-[#00a884] font-bold tracking-widest uppercase flex items-center gap-1.5 justify-center">
              {incomingCallSession.type === 'video' ? <Video size={14} /> : <Phone size={14} />}
              <span>Incoming WhatsApp {incomingCallSession.type === 'video' ? 'Video' : 'Voice'} Call</span>
            </p>
          </div>

          {/* Bottom Action Keys */}
          <div className="w-full max-w-sm mb-6 flex flex-col items-center gap-6">
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-black animate-pulse">
              Swipe or click to answer
            </span>
            
            <div className="flex justify-center gap-10 w-full">
              {/* Decline Call Button */}
              <button
                onClick={() => {
                  try {
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.frequency.value = 180;
                    osc.type = "sawtooth";
                    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.3);
                  } catch (e) {}

                  // Save missed call to chat bar
                  const targetChatId = incomingCallSession.from;
                  const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const logMsgText = `❌ Missed Call (${incomingCallSession.type === 'video' ? 'Video' : 'Voice'})`;
                  const missedLog = {
                    id: "callResult-" + Date.now(),
                    sender: "system-log",
                    senderName: "System Logger",
                    text: logMsgText,
                    time: timeString,
                    isCallLog: true,
                    callStatus: 'missed',
                    callType: incomingCallSession.type
                  };
                  if (targetChatId) {
                    setMessagesHistory(prev => ({
                      ...prev,
                      [targetChatId]: [...(prev[targetChatId] || []), missedLog]
                    }));
                    setChatList(prev => prev.map(ch => ch.id === targetChatId ? { ...ch, lastMsg: logMsgText, time: 'Just now' } : ch));
                  }

                  if (socket) {
                    socket.emit("declineCall", {
                      to: incomingCallSession.from,
                      from: userProfile._id || 'me'
                    });
                  }
                  setIncomingCallSession(null);
                }}
                className="w-16 h-16 rounded-full bg-[#ea0038] hover:bg-[#c9002e] text-white flex items-center justify-center transition-all cursor-pointer shadow-[0_4px_20px_rgba(234,0,56,0.3)] active:scale-90"
                title="Decline Call"
              >
                <PhoneOff size={24} />
              </button>

              {/* Accept Call Button */}
              <button
                onClick={() => {
                  try {
                    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.frequency.value = 880;
                    osc.type = "sine";
                    gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start();
                    osc.stop(audioCtx.currentTime + 0.3);
                  } catch(e) {}

                  if (socket) {
                    socket.emit("acceptCall", {
                      to: incomingCallSession.from,
                      from: userProfile._id || 'me'
                    });
                  }

                  // Launch active call session full-screen
                  setActiveCallSession({
                    target: {
                      id: incomingCallSession.from,
                      name: incomingCallSession.name,
                      avatar: incomingCallSession.avatar,
                      otherId: incomingCallSession.from,
                      isIncoming: true
                    },
                    type: incomingCallSession.type
                  });

                  setIncomingCallSession(null);
                }}
                className="w-16 h-16 rounded-full bg-[#00a884] hover:bg-[#009675] text-white flex items-center justify-center transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,168,132,0.3)] active:scale-90"
                title="Accept Call"
              >
                <Phone size={24} className="animate-bounce" />
              </button>
            </div>
          </div>
        </div>
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
          showSearchScreen={showSearchScreen}
          onCreateGroup={handleCreateGroup}
          onToggleMute={handleToggleMute}
          onToggleBlock={handleToggleBlock}
          onDeleteChat={handleDeleteChat}
          switchUser={switchUser}
          stories={stories}
          onAddStory={handleAddStory}
          broadcastChannels={broadcastChannels}
          onCreateChannel={handleCreateChannel}
          onJoinChannel={handleJoinChannel}
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
                  onJoinChannel={handleJoinChannel}
                  onEditMessage={handleEditMessage}
                  onForwardMessage={handleForwardMessage}
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
