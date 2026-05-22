import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft, FaPaperPlane, FaThumbtack, FaSmile, FaPhoneAlt, FaVideo, FaPaperclip, FaUserPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const GroupChatInterface = ({ activeGroup, onBack }) => {
  const { user, socket } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [pinnedMsg, setPinnedMsg] = useState(null);
  const [typingUsers, setTypingUsers] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null); 
  
  // 🛠️ মডাল ও নেটওয়ার্ক লিস্ট স্টেট
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedNewMembers, setSelectedNewMembers] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null); 
  const [networkUsers, setNetworkUsers] = useState([]); // ফলোয়ার + ফলোয়িং কম্বাইন্ড লিস্ট

  const chatBottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // 👥 ফলোয়ার এবং ফলোয়িং ইউজারদের থেকে ইনভাইট লিস্ট তৈরি করা
  useEffect(() => {
    if (!user) return;
    
    // ফলোয়ার এবং ফলোয়িং ডাটা কম্বাইন করা
    const followersList = user.followers || [];
    const followingList = user.following || [];
    const combined = [...followersList, ...followingList];

    // ডুপ্লিকেট ইউজার রিমুভ করার ফিল্টার (একই ফ্রেন্ড ফলোয়ার এবং ফলোয়িং দুই জায়গাতেই থাকতে পারে)
    const uniqueUsers = combined.filter((v, i, a) => a.findIndex(t => t._id === v._id) === i);
    
    // যারা অলরেডি এই গ্রুপে মেম্বার হিসেবে আছে তাদের লিস্ট থেকে বাদ দেওয়া
    const existingMemberIds = activeGroup?.members?.map(m => m.userId || m._id) || [];
    const inviteableUsers = uniqueUsers.filter(u => !existingMemberIds.includes(u._id));

    setNetworkUsers(inviteableUsers);
  }, [user, activeGroup]);

  // 📥 ডাটাবেজ থেকে আগের চ্যাট লোড করা
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!activeGroup?._id) return;
      try {
        const token = localStorage.getItem('token'); 
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';
        
        const response = await fetch(`${apiUrl}/api/groups/${activeGroup._id}/messages`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        
        if (data.success || data.messages) {
          const fetchedMessages = data.messages || data;
          setMessages(Array.isArray(fetchedMessages) ? fetchedMessages : []);
          const pinned = Array.isArray(fetchedMessages) ? fetchedMessages.find(m => m.isPinned) : null;
          if (pinned) setPinnedMsg(pinned);
        }
      } catch (error) {
        console.error("Error loading chat transmission history:", error);
      }
    };

    fetchChatHistory();
  }, [activeGroup]);

  // 🔌 সকেট কানেকশন ও লিসেনার্স
  useEffect(() => {
    if (!socket || !activeGroup) return;

    socket.emit('join_group_room', { groupId: activeGroup._id, userId: user._id });

    socket.on('receive_group_message', (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m._id === newMsg._id)) return prev;
        return [...prev, { ...newMsg, reactions: newMsg.reactions || [] }];
      });
    });

    socket.on('group_typing_broadcast', ({ username, isTyping }) => {
      setTypingUsers(prev => {
        if (isTyping) {
          return prev.includes(username) ? prev : [...prev, username];
        } else {
          return prev.filter(u => u !== username);
        }
      });
    });

    socket.on('receive_group_reaction', ({ msgId, reaction }) => {
      setMessages(prev => prev.map(m => m._id === msgId ? { ...m, currentReaction: reaction } : m));
    });

    socket.on('group_message_pinned', ({ message }) => {
      setPinnedMsg(message);
    });

    socket.on('group_members_updated', ({ updatedMembers }) => {
      if (activeGroup) activeGroup.members = updatedMembers;
    });

    return () => {
      socket.off('receive_group_message');
      socket.off('group_typing_broadcast');
      socket.off('receive_group_reaction');
      socket.off('group_message_pinned');
      socket.off('group_members_updated');
    };
  }, [socket, activeGroup, user]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // 📤 মেসেজ সেন্ডিং লজিক
  const handleSendMessage = () => {
    if (!inputText.trim() && !selectedMedia || !socket) return;

    const userInGroup = activeGroup.members?.find(m => m.userId === user._id);
    const userRole = userInGroup ? userInGroup.role : 'Member';
    
    if (activeGroup.permissions?.canMessage === 'Admin' && userRole === 'Member') {
      alert("Only Admins can broadcast messages in this cluster node.");
      return;
    }

    const messagePayload = {
      _id: "msg_" + Date.now(),
      groupId: activeGroup._id,
      text: inputText,
      mediaUrl: selectedMedia || null,
      sender: { _id: user._id, fullName: user.fullName || "Drifter Node" },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('send_group_message', messagePayload);
    setInputText('');
    setSelectedMedia(null);
    socket.emit('group_typing_signal', { groupId: activeGroup._id, username: user.fullName, isTyping: false });
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!socket) return;

    socket.emit('group_typing_signal', { groupId: activeGroup._id, username: user.fullName, isTyping: true });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('group_typing_signal', { groupId: activeGroup._id, username: user.fullName, isTyping: false });
    }, 2000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedMedia(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const initiateGroupCall = (type) => {
    if (!socket || !activeGroup) return;
    const roomId = `call_${activeGroup._id}_${Date.now()}`;
    socket.emit('initiate_group_call', { groupId: activeGroup._id, roomId, callType: type, callerName: user.fullName });
    alert(`Establishing Secure Group ${type === 'video' ? 'Video' : 'Audio'} Pipeline...`);
  };

  const handleAddMembersSubmit = () => {
    if (selectedNewMembers.length === 0) return;
    socket.emit('add_group_members', { groupId: activeGroup._id, memberIds: selectedNewMembers });
    setShowAddMemberModal(false);
    setSelectedNewMembers([]);
  };

  const toggleSelectNewMember = (id) => {
    setSelectedNewMembers(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  const addReaction = (msgId, reaction) => {
    socket.emit('send_group_reaction', { msgId, groupId: activeGroup._id, reaction, userId: user._id });
    setShowEmojiPicker(null);
  };

  const pinMessage = (msg) => {
    socket.emit('pin_group_message', { groupId: activeGroup._id, message: msg });
  };

  return (
    <div className="w-full h-full bg-[#0b0c10] flex flex-col justify-between text-[#f1f1f1] relative overflow-hidden">
      
      {/* 🟢 Header Section */}
      <header className="h-20 bg-[#16171d]/80 backdrop-blur-md px-4 flex items-center justify-between border-b border-zinc-900/60 sticky top-0 z-50">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="p-2 text-zinc-400 hover:text-white active:scale-90"><FaChevronLeft size={16} /></button>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(124,58,237,0.4)]">
            {activeGroup.fullName?.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm text-zinc-100 truncate">{activeGroup.fullName}</h3>
            <p className="text-[10px] text-purple-400 font-medium tracking-wide uppercase">Matrix Cluster Node</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => initiateGroupCall('audio')} className="p-2.5 text-zinc-400 hover:text-purple-400 active:scale-90 transition-colors"><FaPhoneAlt size={14} /></button>
          <button onClick={() => initiateGroupCall('video')} className="p-2.5 text-zinc-400 hover:text-purple-400 active:scale-90 transition-colors"><FaVideo size={15} /></button>
          <button onClick={() => setShowAddMemberModal(true)} className="p-2.5 text-zinc-400 hover:text-purple-400 active:scale-90 transition-colors"><FaUserPlus size={16} /></button>
        </div>
      </header>

      {/* 📌 Pinned Message Bar */}
      {pinnedMsg && (
        <div className="bg-purple-950/20 border-b border-purple-500/30 px-5 py-2.5 flex items-center justify-between text-xs backdrop-blur-sm z-40">
          <div className="flex items-center gap-2 truncate text-zinc-300">
            <FaThumbtack className="text-purple-400 shrink-0" size={10} />
            <span className="font-bold text-purple-300">{pinnedMsg.sender?.fullName}:</span>
            <span className="truncate">{pinnedMsg.text}</span>
          </div>
          <button onClick={() => setPinnedMsg(null)} className="text-zinc-500 text-[10px] ml-2">✕</button>
        </div>
      )}

      {/* 💬 Message Screen Matrix */}
      <main className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900/20 via-[#0b0c10] to-[#0b0c10]">
        {messages.map((msg) => {
          const isMe = msg.sender?._id === user._id;
          return (
            <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}>
              {!isMe && <span className="text-[10px] font-bold text-zinc-500 mb-1 ml-2">{msg.sender?.fullName}</span>}
              
              <div className="flex items-center gap-2 max-w-[80%] relative">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-[#16171d] border border-zinc-800 rounded-lg p-1 flex gap-2 z-10 shadow-xl">
                  <button onClick={() => pinMessage(msg)} className="text-[10px] text-zinc-400 hover:text-purple-400 px-1">Pin</button>
                  <button onClick={() => setShowEmojiPicker(showEmojiPicker === msg._id ? null : msg._id)} className="text-zinc-400 hover:text-yellow-400"><FaSmile size={12} /></button>
                </div>

                <div className={`px-4 py-3 rounded-2xl text-xs relative leading-relaxed tracking-wide ${isMe ? 'bg-[#7c3aed] text-white rounded-tr-none' : 'bg-[#16171d] text-zinc-200 rounded-tl-none border border-zinc-800/40'}`}>
                  {msg.mediaUrl && (
                    <img src={msg.mediaUrl} alt="transmitted files" className="max-w-full max-h-52 rounded-xl object-cover mb-2 border border-zinc-900/60" />
                  )}
                  {msg.text && <p>{msg.text}</p>}
                  {msg.currentReaction && (
                    <div className="absolute -bottom-2 right-2 bg-zinc-900 border border-zinc-800 rounded-full px-1.5 py-0.5 text-[9px]">{msg.currentReaction}</div>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {showEmojiPicker === msg._id && (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="flex gap-2 p-2 bg-zinc-900 border border-zinc-800 rounded-full mt-2 z-20">
                    {["❤️", "🔥", "😂", "👍", "😮"].map(emoji => (
                      <span key={emoji} onClick={() => addReaction(msg._id, emoji)} className="cursor-pointer text-sm hover:scale-125 transition-transform">{emoji}</span>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="text-[9px] text-zinc-600 font-medium mt-1 mx-1">{msg.timestamp}</span>
            </div>
          );
        })}
        {typingUsers.length > 0 && (
          <div className="text-[10px] text-purple-400 font-semibold italic animate-pulse bg-purple-950/10 py-1.5 px-3 rounded-full inline-block">
            {typingUsers.join(', ')} is writing...
          </div>
        )}
        <div ref={chatBottomRef} />
      </main>

      {/* ⌨️ Footer Stream System */}
      <footer className="p-4 bg-[#0b0c10] border-t border-zinc-900/40 pb-6 flex flex-col gap-2">
        <AnimatePresence>
          {selectedMedia && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="relative bg-[#16171d] p-2 border border-zinc-800 rounded-xl max-w-xs flex items-center gap-2">
              <img src={selectedMedia} alt="Preview" className="w-14 h-14 object-cover rounded-lg" />
              <span className="text-[10px] font-semibold text-zinc-500 truncate flex-1">Media Attached</span>
              <button onClick={() => setSelectedMedia(null)} className="w-5 h-5 bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center"><FaTimes size={10}/></button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2 bg-[#16171d] border border-zinc-800/60 rounded-2xl p-2 focus-within:border-purple-500/60 transition-all">
          <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-zinc-500 hover:text-purple-400"><FaPaperclip size={13} /></button>
          <input 
            type="text" 
            placeholder="Type transmission secure signal..." 
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-transparent border-none text-xs text-zinc-200 px-2 py-2.5 focus:outline-none"
          />
          <button onClick={handleSendMessage} className="w-9 h-9 bg-[#7c3aed] text-white flex items-center justify-center rounded-xl active:scale-90"><FaPaperPlane size={11} /></button>
        </div>
      </footer>

      {/* 👥 Dynamic Followers/Following Add Member Modal */}
      <AnimatePresence>
        {showAddMemberModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-end justify-center sm:items-center p-0 sm:p-4"
            onClick={() => setShowAddMemberModal(false)}
          >
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              className="w-full sm:max-w-md bg-[#16171d] border-t sm:border border-zinc-800 rounded-t-[2.5rem] sm:rounded-[2rem] p-6 text-left shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-sm font-black uppercase tracking-widest text-zinc-200 flex items-center gap-2">
                  <FaUserPlus className="text-purple-500" /> Cluster Network
                </h3>
                <button onClick={() => setShowAddMemberModal(false)} className="text-zinc-500 text-xs hover:text-white">✕</button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar mb-6">
                {networkUsers.length > 0 ? (
                  networkUsers.map(contact => (
                    <div 
                      key={contact._id}
                      onClick={() => toggleSelectNewMember(contact._id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedNewMembers.includes(contact._id) ? 'bg-purple-950/20 border-purple-500/60' : 'bg-[#0b0c10] border-zinc-900'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-zinc-800 text-[11px] font-black flex items-center justify-center text-zinc-400">
                          {(contact.fullName || contact.username || 'U')[0]}
                        </div>
                        <span className="text-xs font-semibold text-zinc-300">{contact.fullName || contact.username}</span>
                      </div>
                      {selectedNewMembers.includes(contact._id) && <FaCheck size={10} className="text-purple-400" />}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-zinc-500 text-xs py-4">No connections available to inject.</p>
                )}
              </div>

              <button 
                onClick={handleAddMembersSubmit}
                disabled={selectedNewMembers.length === 0}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#db2777] text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-40 disabled:scale-100"
              >
                Inject Selected Links
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GroupChatInterface;