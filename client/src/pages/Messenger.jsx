import React, { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaCommentDots, FaCog, FaPlus, FaUsers, FaCheck } from 'react-icons/fa';

// --- Global Context & Features ---
import { AuthContext } from '../context/AuthContext';
import SearchScreen from './SearchScreen'; 
import ChatInterface from './ChatInterface';
import SettingsScreen from './SettingsScreen'; 

// --- 🛠️ Components ---
import GroupChatInterface from '../components/GroupChatInterface';

// --- Sound Assets ---
const MSG_SOUND = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3"; 
const CALL_SOUND = "https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3";

// গ্লোবাল অ্যাভাটার হেল্পার
const getAvatarUrl = (target) => {
  if (!target) return `https://ui-avatars.com/api/?name=User&background=18181b&color=fff`;
  const pic = target.profilePic || target.avatar || target.profileImage;
  if (pic && typeof pic === 'string' && pic.startsWith('http')) return pic;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(target.fullName || target.name || target.username || "Onyx")}&background=8b5cf6&color=fff&bold=true`;
};

/* ==========================================================
    🚀 MAIN COMPONENT: ONYX MESSENGER HOME (Story Bar Removed)
========================================================== */
const OnyxMessengerHome = () => {
  const { user, socket } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  
  const [activeFilter, setActiveFilter] = useState('All');
  const [showGroupModal, setShowGroupModal] = useState(false);

  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);

  const msgAudio = useRef(new Audio(MSG_SOUND));
  const callAudio = useRef(new Audio(CALL_SOUND));

  const availableContacts = [
    { id: 'u1', name: 'Alisha Alam' },
    { id: 'u3', name: 'Md. Fahad' },
    { id: 'u4', name: 'Romjan Ali' }
  ];

  const [chatList, setChatList] = useState(() => {
    const savedChats = localStorage.getItem('onyx_recent_connections');
    return savedChats ? JSON.parse(savedChats) : [
      { _id: "u1", fullName: "Alisha Alam", lastMsg: "Let's catch up tomorrow? 9:41 PM", time: "9:41 PM", online: true, typing: true, unreadCount: 2, isGroup: false, isChannel: false },
      { _id: "u2", fullName: "Dream Team", lastMsg: "Evan: That's awesome!", time: "9:30 PM", online: true, unreadCount: 5, isGroup: true, isChannel: false },
      { _id: "u3", fullName: "Md. Fahad", lastMsg: "🎙️ Voice message", time: "9:20 PM", online: false, unreadCount: 1, isGroup: false, isChannel: false },
      { _id: "u4", fullName: "Romjan Ali", lastMsg: "Reacted ❤️ to your message", time: "8:45 PM", online: false, isGroup: false, isChannel: false },
      { _id: "u5", fullName: "Onyx Tech Channel", lastMsg: "System deployment successful.", time: "7:12 PM", online: false, isGroup: false, isChannel: true }
    ];
  });

  useEffect(() => {
    localStorage.setItem('onyx_recent_connections', JSON.stringify(chatList));
  }, [chatList]);

  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (data) => {
      if (data.isIncomingCall || data.isCallSignal) return;
      setChatList(prev => {
        const filtered = prev.filter(c => c._id !== data.senderId);
        const existing = prev.find(c => c._id === data.senderId);
        const updatedChat = {
          ...existing,
          _id: data.senderId,
          fullName: data.senderName || "Unknown Node",
          lastMsg: data.text || (data.mediaUrl ? "🖼️ Image Transmission" : "Encrypted transmission..."),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          online: true,
          unreadCount: (!selectedChat || selectedChat._id !== data.senderId) ? ((existing?.unreadCount || 0) + 1) : 0,
          profilePic: data.senderAvatar || null
        };
        return [updatedChat, ...filtered];
      });

      if (!selectedChat || selectedChat._id !== data.senderId) {
        msgAudio.current.currentTime = 0;
        msgAudio.current.play().catch(() => {});
      }
    };

    const handleIncomingGroupMessage = (data) => {
      setChatList(prev => {
        const filtered = prev.filter(c => c._id !== data.groupId);
        const existing = prev.find(c => c._id === data.groupId);
        const textPayload = data.text ? `${data.sender.fullName.split(' ')[0]}: ${data.text}` : `${data.sender.fullName.split(' ')[0]}: 🖼️ Sent a photo`;
        const updatedGroup = {
          ...existing,
          _id: data.groupId,
          fullName: existing?.fullName || "Matrix Pipeline",
          lastMsg: textPayload,
          time: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isGroup: true,
          unreadCount: (!selectedChat || selectedChat._id !== data.groupId) ? ((existing?.unreadCount || 0) + 1) : 0,
        };
        return [updatedGroup, ...filtered];
      });

      if (!selectedChat || selectedChat._id !== data.groupId) {
        msgAudio.current.currentTime = 0;
        msgAudio.current.play().catch(() => {});
      }
    };

    const handleIncomingCall = (data) => {
      setIncomingCall(data);
      callAudio.current.loop = true;
      callAudio.current.currentTime = 0;
      callAudio.current.play().catch(e => console.warn("Audio blocked"));
    };

    const handleCallEnded = () => {
      setIncomingCall(null);
      callAudio.current.pause();
      callAudio.current.currentTime = 0;
    };

    socket.on("getMessage", handleIncomingMessage);
    socket.on("receive_group_message", handleIncomingGroupMessage);
    socket.on("$incomingCall", handleIncomingCall);
    socket.on("callEnded", handleCallEnded);

    return () => {
      socket.off("getMessage", handleIncomingMessage);
      socket.off("receive_group_message", handleIncomingGroupMessage);
      socket.off("$incomingCall", handleIncomingCall);
      socket.off("callEnded", handleCallEnded);
    };
  }, [socket, selectedChat]);

  useEffect(() => {
    if (selectedChat && selectedChat.isGroup && socket && user) {
      socket.emit('join_group_room', { groupId: selectedChat._id, userId: user._id });
    }
  }, [selectedChat, socket, user]);

  const acceptCall = () => {
    if (!incomingCall || !user || !socket) return;
    callAudio.current.pause();
    const roomId = incomingCall.roomId || [user._id, incomingCall.from].sort().join("-");
    const callType = incomingCall.callType || incomingCall.type || 'video';
    socket.emit("answerCall", { to: incomingCall.from, signal: incomingCall.signalData, roomId });
    navigate(`/call/${roomId}?type=${callType}&mode=inbound`, {
      state: { incomingSignal: incomingCall.signalData, callerId: incomingCall.from }
    });
    setIncomingCall(null);
  };
  
  const declineCall = () => {
    if (!incomingCall || !socket) return;
    callAudio.current.pause();
    socket.emit("endCall", { to: incomingCall.from });
    setIncomingCall(null);
  };

  const handleUserSelect = useCallback((u) => {
    if (!u) return;
    const userId = u._id || u.id;
    const normalizedUser = {
      ...u, _id: userId, fullName: u.fullName || u.name || "Drifter", online: true, lastMsg: "Neural link established"
    };
    setChatList(prev => [normalizedUser, ...prev.filter(c => c._id !== userId)]);
    setSelectedChat(normalizedUser);
    setShowSearch(false);
  }, []);

  const handleCreateGroupSubmit = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return alert('Please enter a group name!');
    
    const newGroupNode = {
      _id: "group_" + Date.now(),
      fullName: newGroupName,
      lastMsg: `${user?.fullName || "You"} spawned this pipeline Node`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      online: true,
      unreadCount: 0,
      isGroup: true,
      isChannel: false,
      members: selectedMembers
    };

    setChatList(prev => [newGroupNode, ...prev]);
    setNewGroupName('');
    setSelectedMembers([]);
    setShowGroupModal(false);
    setSelectedChat(newGroupNode);
  };

  const toggleMemberSelection = (id) => {
    setSelectedMembers(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const filteredChats = chatList.filter(chat => {
    if (activeFilter === 'Unread') return chat.unreadCount && chat.unreadCount > 0;
    if (activeFilter === 'Groups') return chat.isGroup;
    if (activeFilter === 'Channels') return chat.isChannel;
    return true;
  });

  return (
    <div className="bg-[#0b0c10] h-[100dvh] text-[#f1f1f1] flex flex-col overflow-hidden font-sans select-none relative">
      
      {activeTab === 'chats' ? (
        <>
          <header className="px-5 pt-8 pb-3 bg-[#0b0c10] z-40">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-100">
                Onyx<span className="text-[#a855f7]">Drift</span>
              </h2>
              <button 
                onClick={() => setShowGroupModal(true)} 
                className="w-8 h-8 rounded-full bg-[#16171d] border border-zinc-800 flex items-center justify-center text-zinc-300 active:scale-90 transition-transform hover:border-purple-500/50"
              >
                <FaPlus size={12} />
              </button>
            </div>
            
            <div 
              onClick={() => setShowSearch(true)} 
              className="relative mb-5 bg-[#16171d] border border-zinc-800/40 rounded-2xl py-3.5 pl-4 cursor-text text-zinc-500 text-xs tracking-wide flex items-center gap-2"
            >
              <span className="text-zinc-500 text-sm">🔍</span>
              Search anything...
            </div>

            <div className="flex gap-2 text-xs font-semibold overflow-x-auto no-scrollbar pb-1">
              {["All", "Unread", "Groups", "Channels"].map((tab) => (
                <span 
                  key={tab} 
                  onClick={() => setActiveFilter(tab)}
                  className={`px-4 py-2 rounded-full cursor-pointer transition-all ${activeFilter === tab ? 'bg-[#7c3aed] text-white' : 'bg-[#16171d] text-zinc-400 border border-zinc-800/20'}`}
                >
                  {tab}
                </span>
              ))}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-5 pb-24 no-scrollbar">
            <div className="space-y-1">
              {filteredChats.map((chat) => (
                <motion.div 
                  layout 
                  key={chat._id} 
                  onClick={() => {
                    setChatList(prev => prev.map(c => c._id === chat._id ? { ...c, unreadCount: 0 } : c));
                    setSelectedChat(chat);
                  }}
                  className="flex items-center justify-between py-3.5 px-2 rounded-2xl hover:bg-[#16171d]/50 cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      <img src={getAvatarUrl(chat)} className="w-12 h-12 rounded-full object-cover border border-zinc-800" alt="" />
                      {chat.online && !chat.isGroup && <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#22c55e] border-2 border-[#0b0c10] rounded-full" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-zinc-200 truncate">{chat.fullName}</h4>
                      <p className={`text-xs truncate mt-0.5 ${chat.typing ? 'text-[#a855f7] font-medium' : 'text-zinc-500'}`}>
                        {chat.typing ? "Typing..." : chat.lastMsg}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                    <span className="text-[10px] text-zinc-500 font-medium">{chat.time}</span>
                    {chat.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#7c3aed] text-white font-black text-[9px] flex items-center justify-center">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}

              {filteredChats.length === 0 && (
                <div className="text-center py-10 text-xs text-zinc-600">
                  No transmissions found in this node.
                </div>
              )}
            </div>
          </main>
        </>
      ) : activeTab === 'settings' ? (
        <SettingsScreen onBack={() => setActiveTab('chats')} />
      ) : null}

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-[#0b0c10] border-t border-zinc-900/60 flex items-center justify-around z-40 px-6">
        <button 
          onClick={() => setActiveTab('chats')} 
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'chats' ? 'text-[#a855f7]' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          <FaCommentDots size={20} />
          <span className="text-[9px] font-bold tracking-wider uppercase">Chats</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('settings')} 
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'settings' ? 'text-[#a855f7]' : 'text-zinc-500 hover:text-zinc-400'}`}
        >
          <FaCog size={20} />
          <span className="text-[9px] font-bold tracking-wider uppercase">Settings</span>
        </button>
      </nav>

      {/* Overlays / Popups */}
      <AnimatePresence>
        {showGroupModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-end justify-center sm:items-center p-0 sm:p-4"
            onClick={() => setShowGroupModal(false)}
          >
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="w-full sm:max-w-md bg-[#16171d] border-t sm:border border-zinc-800 rounded-t-[2.5rem] sm:rounded-[2rem] p-6 text-left shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-200 flex items-center gap-2">
                  <FaUsers className="text-purple-500" /> Create Group Pipeline
                </h3>
                <button onClick={() => setShowGroupModal(false)} className="text-zinc-500 text-xs hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateGroupSubmit} className="space-y-5">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 block mb-2">Group Name / Identifier</label>
                  <input 
                    type="text" 
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Dream Team, Core Sync" 
                    className="w-full bg-[#0b0c10] border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-purple-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 block mb-2">Select Members</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                    {availableContacts.map(contact => (
                      <div 
                        key={contact.id}
                        onClick={() => toggleMemberSelection(contact.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedMembers.includes(contact.id) ? 'bg-purple-950/20 border-purple-500/60' : 'bg-[#0b0c10] border-zinc-900'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-zinc-800 text-xs font-black flex items-center justify-center text-zinc-300">
                            {contact.name[0]}
                          </div>
                          <span className="text-xs font-semibold text-zinc-300">{contact.name}</span>
                        </div>
                        {selectedMembers.includes(contact.id) && <FaCheck size={10} className="text-purple-400" />}
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#db2777] text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Create and Establish Link
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {incomingCall && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[9999] bg-[#0c0d14] p-6 flex flex-col justify-between"
          >
            <div className="absolute inset-0 opacity-20 bg-cover bg-center blur-3xl scale-110 pointer-events-none"
                 style={{ backgroundImage: `url(${getAvatarUrl({ name: incomingCall.name, profilePic: incomingCall.avatar })})` }} />
            <div className="text-zinc-500 text-xs font-semibold text-center mt-6 z-10">9:41</div>
            <div className="text-center z-10 my-auto">
              <img src={getAvatarUrl({ name: incomingCall.name, profilePic: incomingCall.avatar })} className="w-28 h-28 rounded-full mx-auto object-cover border-2 border-zinc-800 p-1 mb-6" alt="" />
              <h3 className="text-2xl font-bold tracking-tight text-white mb-2">{incomingCall.name || "Alisha Alam"}</h3>
              <p className="text-zinc-400 text-sm tracking-wide">Incoming Video Call</p>
            </div>
            <div className="flex flex-col items-center gap-12 z-10 mb-8">
              <div className="flex justify-center gap-16 w-full max-xs">
                <button onClick={declineCall} className="w-16 h-16 flex items-center justify-center bg-[#ea4335] rounded-full text-white">✕</button>
                <button onClick={acceptCall} className="w-16 h-16 flex items-center justify-center bg-[#34a853] rounded-full text-white">✓</button>
              </div>
            </div>
          </motion.div>
        )}

        {showSearch && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] bg-[#0b0c10]">
            <SearchScreen onSelect={handleUserSelect} onBack={() => setShowSearch(false)} />
          </motion.div>
        )}

        {selectedChat && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 28, stiffness: 240 }} className="fixed inset-0 z-[5000] bg-[#0b0c10]">
            {selectedChat.isGroup ? (
              <GroupChatInterface activeGroup={selectedChat} onBack={() => setSelectedChat(null)} />
            ) : (
              <ChatInterface activeChat={selectedChat} onBack={() => setSelectedChat(null)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnyxMessengerHome;