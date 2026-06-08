import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Globe,
  Volume2,
  VolumeX,
  Trash2,
  Terminal,
  ShieldCheck,
  FileText,
  Phone,
  Video,
  X,
  CheckCheck,
  ArrowLeft,
  UserPlus,
  Users,
  Ban,
  ShieldAlert,
  Pencil,
  Share,
  Sparkles,
} from "lucide-react";

const ChatWindow = ({
  activeChat,
  isGroup,
  messages,
  onSendMessage,
  onInitiateCall,
  onDeleteMessage,
  activeAccent,
  onBackToList,
  chatList = [],
  onAddGroupMember,
  showControlLab = false,
  onToggleControlLab,
  isMuted = false,
  isBlocked = false,
  onToggleMute,
  onToggleBlock,
  onDeleteChat,
  onEditMessage = () => {},
  onForwardMessage = () => {},
  onJoinChannel = () => {},
  groupList = [],
  channelsList = [],
}) => {
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [decryptionStates, setDecryptionStates] = useState({});
  const [isDecodingId, setIsDecodingId] = useState(null);
  const [commandSuccessMsg, setCommandSuccessMsg] = useState(null);
  const [showInvitePopover, setShowInvitePopover] = useState(false);

  const [replyMessage, setReplyMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [forwardMessage, setForwardMessage] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  // States and refs for 2-second hold-press security options
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const progressIntervalRef = useRef(null);
  const startTimeRef = useRef(0);
  const hasTriggeredRef = useRef(false);
  const touchStartRef = useRef({ x: 0, y: 0 });

  const handleStartHold = (e) => {
    if (e.type === "mousedown" && e.button !== 0) return;

    handleCancelHold();

    hasTriggeredRef.current = false;
    startTimeRef.current = Date.now();
    setIsHolding(true);
    setHoldProgress(0);

    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    }

    const duration = 2000; // 2 seconds
    const intervalTime = 40;
    let currentProgress = 0;

    progressIntervalRef.current = setInterval(() => {
      currentProgress += (intervalTime / duration) * 100;
      if (currentProgress >= 100) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
        setHoldProgress(100);
        hasTriggeredRef.current = true;

        if (window.navigator?.vibrate) {
          window.navigator.vibrate(40);
        }

        setShowOptionsMenu(true);
        setIsHolding(false);
        setHoldProgress(0);
      } else {
        setHoldProgress(currentProgress);
      }
    }, intervalTime);
  };

  const handleCancelHold = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  };

  const handleTouchMove = (e) => {
    if (!isHolding) return;
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > 15) {
        handleCancelHold();
      }
    }
  };

  const handleRelease = (e) => {
    if (e.type === "mouseup" && e.button !== 0) return;
    handleCancelHold();
  };

  const viewportRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages, isDecodingId]);

  const handleSend = () => {
    if (!inputText.trim() && !selectedFile) return;

    if (editingMessage) {
      onEditMessage(activeChat.id, editingMessage.id, inputText);
      setEditingMessage(null);
      setInputText("");
      setSelectedFile(null);
      return;
    }

    // Check for special slash commands inside direct or group channels
    if (inputText.startsWith("/")) {
      handleSlashCommand(inputText.trim());
      setInputText("");
      return;
    }

    onSendMessage({
      text: inputText,
      file: selectedFile,
      replyTo: replyMessage
        ? {
            id: replyMessage.id,
            senderName:
              replyMessage.senderName ||
              (replyMessage.sender === "me" ? "Operator" : replyMessage.sender),
            text: replyMessage.text,
          }
        : null,
    });

    setReplyMessage(null);
    setInputText("");
    setSelectedFile(null);
  };

  const handleSlashCommand = (cmd) => {
    const action = cmd.toLowerCase().split(" ")[0];
    let replyText = "";

    if (action === "/hack") {
      replyText =
        "⚙️ [SYSTEM LOG] Decrypting proxy layers... Mainframe response: APPROVED. Signal level optimal. Ingress secure on Port 3000.";
    } else if (action === "/quote") {
      const quotes = [
        '"The Net is vast and infinite." — Puppet Master',
        '"Technology is a useful servant but a dangerous master." — Christian Lous Lange',
        '"High-quality visuals deserve pristine code alignments." — Onyx v4.8 Manual',
        '"Any sufficiently advanced technology is indistinguishable from magic." — Arthur C. Clarke',
      ];
      replyText = `🔮 [COSMIC WISDOM] ${quotes[Math.floor(Math.random() * quotes.length)]}`;
    } else if (action === "/theme") {
      replyText =
        "🎨 [PALETTE ENGINE] Palette alignment synchronized. Accent signal cycles optimized.";
    } else {
      replyText =
        "⚠️ [TERMINAL ERROR] Unrecognized slash protocol. Powered systems offline. Try /hack, /quote, or /theme.";
    }

    // Trigger local feedback success banner
    setCommandSuccessMsg(replyText);
    setTimeout(() => setCommandSuccessMsg(null), 6000);
  };

  // Text-to-speech mechanism
  const triggerSpeak = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      // Clean text of technical accents
      const cleanText = text.replace(/[*_`\[\]]/g, "");
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported on this device node.");
    }
  };

  // Cyber Decrypt Decryption effect
  const startDecryptAnimation = (messageId, originalText) => {
    setIsDecodingId(messageId);

    // Simulate cyclic character scrambling
    let count = 0;
    const scrambledChars = "!@#$%^&*()_+{}[]|:;<>?,./~";

    const interval = setInterval(() => {
      const randomizedText = originalText
        .split("")
        .map((char, index) => {
          if (index < count || char === " ") return char;
          return scrambledChars[
            Math.floor(Math.random() * scrambledChars.length)
          ];
        })
        .join("");

      setDecryptionStates((prev) => ({
        ...prev,
        [messageId]: randomizedText,
      }));

      count += Math.ceil(originalText.length / 8);

      if (count >= originalText.length) {
        clearInterval(interval);
        setDecryptionStates((prev) => ({
          ...prev,
          [messageId]: `🔑 [DECRYPT INTEGRITY VERIFIED] ${originalText}`,
        }));
        setIsDecodingId(null);
      }
    }, 80);
  };

  const selectImgAttachment = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFile({
          name: file.name,
          type: file.type,
          dataUrl: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // Popular quick emojis
  const quickEmojis = ["🎯", "🔥", "👍", "❤️", "😂", "😮", "🙏", "✨"];

  if (!activeChat) {
    return (
      <div id="chat-window-empty-viewport" className="flex-1 h-full bg-[#0b141a] flex flex-col items-center justify-center p-8 text-center font-sans relative overflow-hidden">
        {/* Futuristic glowing grid decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
        
        <div className={`w-20 h-20 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center mb-6 shadow-2xl relative group ${activeAccent?.glow || 'shadow-[0_0_20px_rgba(6,182,212,0.35)]'}`}>
          <Terminal size={32} className={`${activeAccent?.text || 'text-cyan-400'} animate-pulse`} />
        </div>
        
        <h2 className="text-xl font-bold text-white tracking-wide mb-2 uppercase font-mono">
          Onyx Live Secure Node
        </h2>
        <p className="text-sm text-zinc-400 max-w-md leading-relaxed mx-auto">
          All demo/mock chats have been completely deactivated. Search for real users or wait for incoming client connections to initiate fully live peer-to-peer web messaging.
        </p>
        
        <div className="mt-8 flex flex-col items-center gap-2 max-w-sm w-full bg-[#111b21]/60 border border-zinc-800/80 p-4 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00a884] animate-ping shrink-0" />
            <span className="text-[#00a884] font-bold uppercase tracking-wider">SECURE TUNNEL ACTIVE</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-mono mt-1 text-center leading-normal">
            Zero-knowledge keys initialized dynamically. Direct socket routing on Port 3000 running in secure container.
          </p>
        </div>
      </div>
    );
  }

  return (
    //�  return (
    <div
      id="chat-window-viewport"
      className="flex-1 h-full bg-[#0b141a] flex flex-col overflow-hidden relative font-sans"
    >
      {/* Viewport Header */}
      <header className="p-3 bg-[#202c33] border-b border-[#2a3942] flex justify-between items-center z-10 shrink-0 shadow-sm font-sans">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBackToList}
            className="md:hidden p-2 rounded-full hover:bg-[#2a3942] text-zinc-350 hover:text-white transition-colors cursor-pointer shrink-0"
            title="Return to list"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Interactive holdable profile info wrapper */}
          <div
            onMouseDown={handleStartHold}
            onMouseUp={handleRelease}
            onMouseLeave={handleCancelHold}
            onTouchStart={handleStartHold}
            onTouchEnd={handleRelease}
            onTouchMove={handleTouchMove}
            onTouchCancel={handleCancelHold}
            onContextMenu={(e) => e.preventDefault()}
            className="flex items-center gap-3 min-w-0 cursor-pointer select-none active:opacity-90 relative overflow-hidden rounded-xl p-1 -m-1 border border-transparent hover:bg-black/10 group"
            title="Hold for options"
          >
            {/* Visual Holding Decrypt Progress Overlay */}
            {isHolding && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-[0.5px] pointer-events-none overflow-hidden rounded-xl z-30 flex items-center justify-center">
                <div
                  className="absolute bottom-0 left-0 top-0 bg-[#00a884]/30 transition-all duration-75"
                  style={{ width: `${holdProgress}%` }}
                />
                <span className="text-[9px] font-bold text-[#00a884] uppercase tracking-wider animate-pulse z-40">
                  CONNECTING... {Math.round(holdProgress)}%
                </span>
              </div>
            )}

            <div className="relative shrink-0">
              <img
                src={activeChat.avatar}
                className="w-10 h-10 rounded-full object-cover border border-[#2a3942]"
                alt={activeChat.name}
                referrerPolicy="no-referrer"
              />
              {activeChat.online && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#202c33] rounded-full" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#e9edef] flex items-center gap-1.5 truncate">
                {activeChat.name}
                {activeChat.isBot && (
                  <span className="text-[8px] px-1 bg-[#111b21] border border-[#222e35] text-[#00a884] rounded font-semibold">
                    Bot
                  </span>
                )}
                {isMuted && (
                  <span className="text-[8px] px-1 bg-[#111b21] border border-[#222e35] text-zinc-400 rounded font-semibold uppercase">
                    MUTED
                  </span>
                )}
                {isBlocked && (
                  <span className="text-[8px] px-1 bg-[#111b21] border border-red-900 text-red-400 rounded font-semibold uppercase">
                    BLOCKED
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-zinc-400 truncate">
                {isGroup
                  ? `${activeChat.membersCount} participants`
                  : activeChat.online
                    ? "Online"
                    : "Offline"}
              </p>
            </div>
          </div>
        </div>

        {/* Header Icons actions */}
        <div className="flex items-center gap-1">
          {isGroup && (
            <button
              onClick={() => setShowInvitePopover(!showInvitePopover)}
              className={`p-2 rounded-full hover:bg-[#2a3942] transition-all cursor-pointer flex items-center justify-center relative select-none ${
                showInvitePopover
                  ? "bg-[#111b21] text-[#00a884]"
                  : "text-zinc-300 hover:text-white"
              }`}
              title="Add Person"
            >
              <UserPlus size={16} />
            </button>
          )}
          <button
            onClick={() => onInitiateCall(activeChat, "audio")}
            className="p-2 rounded-full hover:bg-[#2a3942] text-zinc-305 hover:text-white transition-all cursor-pointer"
            title="Voice Call"
          >
            <Phone size={16} />
          </button>
          <button
            onClick={() => onInitiateCall(activeChat, "video")}
            className="p-2 rounded-full hover:bg-[#2a3942] text-zinc-305 hover:text-white transition-all cursor-pointer"
            title="Video Call"
          >
            <Video size={16} />
          </button>
        </div>
      </header>

      {/* Dynamic Popover / Drawer to Invite Peers to an Existing Group */}
      {isGroup && showInvitePopover && (
        <div className="absolute top-[73px] left-0 right-0 bg-zinc-950/95 border-b border-purple-500/20 shadow-[0_15px_30px_rgba(0,0,0,0.85)] z-40 p-4 animate-slide-down">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-[11px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <Users size={12} className="text-purple-400" /> DIRECT INBOUND
                LINK PEER (Invite)
              </h4>
              <button
                onClick={() => setShowInvitePopover(false)}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold uppercase font-mono cursor-pointer"
              >
                Done
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto no-scrollbar pb-1">
              {(() => {
                const curMemberIds = (activeChat.members || []).map(
                  (m) => m.id,
                );
                const candidates = chatList.filter(
                  (c) => !curMemberIds.includes(c.id),
                );

                if (candidates.length === 0) {
                  return (
                    <div className="text-[11px] text-zinc-500 font-mono py-4 col-span-2 text-center bg-zinc-900/30 rounded-xl border border-white/5">
                      All available nodes successfully patched into this channel
                      mesh connection.
                    </div>
                  );
                }

                return candidates.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => {
                      onAddGroupMember(activeChat.id, contact.id);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-950 border border-white/5 hover:border-purple-500/30 hover:bg-purple-950/20 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={contact.avatar}
                        className="w-7 h-7 rounded-lg object-cover border border-white/10"
                        alt=""
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="text-xs text-zinc-200 truncate font-semibold leading-tight">
                          {contact.name}
                        </p>
                        <p className="text-[9px] text-zinc-500 font-mono leading-none tracking-tight">
                          Latency: {contact.latency || "10ms"}
                        </p>
                      </div>
                    </div>

                    <button className="text-[10px] font-bold text-purple-400 opacity-60 group-hover:opacity-100 hover:text-purple-300 px-2 py-1 bg-purple-500/10 border border-purple-500/20 uppercase rounded-lg cursor-pointer">
                      Link +
                    </button>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Success Command Console Banner */}
      {commandSuccessMsg && (
        <div className="bg-cyan-950/80 border-b border-cyan-800/40 px-5 py-3 text-xs font-mono text-cyan-300 flex items-center gap-2.5 justify-between relative z-20 animate-slide-down">
          <div className="flex items-center gap-2">
            <Terminal size={12} className="text-cyan-400 animate-pulse" />
            <span>{commandSuccessMsg}</span>
          </div>
          <button
            onClick={() => setCommandSuccessMsg(null)}
            className="text-zinc-500 hover:text-white"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Messages Canvas Workspace */}
      <main
        ref={viewportRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar bg-zinc-950/20 font-mono"
      >
        {/* Connection Established Warning banner */}
        <div className="flex justify-center my-2">
          <span className="text-[10px] uppercase font-mono tracking-widest bg-zinc-900/40 border border-white/5 text-zinc-500 px-3 py-1.5 rounded-xl">
            🔒 Neural handshake complete. End-to-end sandbox cipher intact.
          </span>
        </div>

        {messages.map((msg) => {
          if (msg.sender === "system-log") {
            const isMiss = msg.callStatus === "missed";
            return (
              <div
                key={msg.id}
                className="w-full flex justify-center my-4 animate-fade-in font-mono"
              >
                <div
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 max-w-[90%] sm:max-w-[70%] w-full shadow-lg ${
                    isMiss
                      ? "bg-rose-950/20 border-rose-500/20 text-rose-400"
                      : "bg-emerald-950/20 border-emerald-500/20 text-emerald-400"
                  }`}
                >
                  <div
                    className={`p-3 rounded-xl flex items-center justify-center ${
                      isMiss ? "bg-rose-900/30" : "bg-emerald-900/30"
                    }`}
                  >
                    {msg.callType === "video" ? (
                      <Video size={18} />
                    ) : (
                      <Phone size={18} />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <p
                      className={`text-xs font-black uppercase tracking-widest ${
                        isMiss ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {isMiss ? "Missed Call Log" : "Secure Call Completed"}
                    </p>
                    <p className="text-[11px] text-zinc-300 mt-1">{msg.text}</p>
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase shrink-0 font-bold">
                    {msg.time}
                  </div>
                </div>
              </div>
            );
          }

          const isMe = msg.sender === "me";
          const decryptionText = decryptionStates[msg.id];
          const hasImage = msg.file && msg.file.type?.startsWith("image/");
          const hasGenericFile =
            msg.file && !msg.file.type?.startsWith("image/");

          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] sm:max-w-[70%] space-y-1 transition-all group ${
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              {/* Message sender label with precise group roles */}
              {!isMe &&
                (isGroup || activeChat.isChannel) &&
                (() => {
                  let roleText = "Operator";
                  let roleColor = "bg-zinc-950 border-zinc-900 text-zinc-550";

                  if (msg.sender === "bot-onyx") {
                    roleText = "Citadel Admin";
                    roleColor =
                      "bg-cyan-950/40 border-cyan-800/30 text-cyan-400 font-extrabold";
                  } else if (msg.sender === "user-kaelen") {
                    roleText = "Lead Deck Mod";
                    roleColor =
                      "bg-purple-950/40 border-purple-800/30 text-purple-400";
                  } else if (msg.sender === "bot-luna") {
                    roleText = "Core Advisor";
                    roleColor =
                      "bg-emerald-950/40 border-emerald-800/30 text-emerald-400";
                  } else if (msg.sender === "system") {
                    roleText = "Network Hub";
                    roleColor =
                      "bg-rose-955/40 border-rose-800/30 text-rose-450";
                  } else if (msg.isCreator || activeChat.isChannel) {
                    roleText = "Broadcaster";
                    roleColor =
                      "bg-pink-950/40 border-pink-800/30 text-pink-400 font-extrabold";
                  }

                  return (
                    <div className="flex items-center gap-1.5 ml-1 mb-0.5">
                      <span className="text-[10px] font-bold font-mono text-zinc-300">
                        {msg.senderName || "Active Node"}
                      </span>
                      <span
                        className={`text-[7.5px] px-1.5 py-0.5 border rounded-md font-mono uppercase tracking-wider font-extrabold ${roleColor}`}
                      >
                        {roleText}
                      </span>
                    </div>
                  );
                })()}

              {/* Chat Bubble Layout */}
              <div
                className={`relative p-3.5 rounded-2xl text-xs md:text-sm shadow-lg leading-relaxed ${
                  isMe
                    ? `bg-zinc-900 text-white rounded-br-none border border-white/10 ${activeAccent.border}`
                    : `bg-zinc-900/50 text-zinc-100 rounded-bl-none border border-white/5`
                }`}
              >
                {/* Replying target header preview */}
                {msg.replyTo && (
                  <div className="bg-black/50 border-l-[3px] border-cyan-400 p-2.5 rounded-xl mb-3 text-[10px] font-mono opacity-90 select-none">
                    <span className="text-cyan-400 block font-black text-[7.5px] uppercase tracking-wider mb-0.5">
                      ↳ REPLIED TO @{msg.replyTo.senderName}:
                    </span>
                    <span className="truncate block font-semibold text-zinc-400 italic">
                      "{msg.replyTo.text}"
                    </span>
                  </div>
                )}
                {/* Image Media attachment */}
                {hasImage && msg.file && (
                  <div className="mb-2.5 rounded-xl overflow-hidden max-h-[220px] max-w-[280px] bg-zinc-950 border border-white/5">
                    <img
                      src={msg.file.dataUrl}
                      className="object-cover w-full h-full"
                      alt="Attachment"
                    />
                  </div>
                )}

                {/* File Attachment */}
                {hasGenericFile && msg.file && (
                  <div className="mb-2 bg-black/40 p-2.5 rounded-xl border border-white/5 flex items-center gap-2.5 font-mono text-zinc-400 text-[11px]">
                    <FileText size={16} className="text-cyan-400" />
                    <div className="truncate">
                      <p className="text-zinc-200 text-xs truncate font-bold">
                        {msg.file.name}
                      </p>
                      <p className="text-[9px] text-zinc-505 uppercase">
                        Binary Stream
                      </p>
                    </div>
                  </div>
                )}

                {/* Normal Text Content */}
                <span className="whitespace-pre-wrap selection:bg-cyan-500/30 selection:text-white">
                  {decryptionText || msg.text}
                </span>

                {/* Micro Actions overlay toggling on hover */}
                <div
                  className={`absolute top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 ${
                    isMe ? "right-full mr-2.5" : "left-full ml-2.5"
                  }`}
                >
                  {/* Reply button */}
                  <button
                    onClick={() =>
                      setReplyMessage({
                        id: msg.id,
                        senderName:
                          msg.senderName || (isMe ? "Operator" : msg.sender),
                        text: msg.text,
                      })
                    }
                    className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Reply to thread"
                  >
                    <ArrowLeft size={11} className="scale-x-[-1]" />
                  </button>

                  {/* Forward button */}
                  <button
                    onClick={() => setForwardMessage(msg)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-pink-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Forward node packet"
                  >
                    <Share size={11} />
                  </button>

                  {/* Edit button */}
                  {isMe && (
                    <button
                      onClick={() => {
                        setEditingMessage(msg);
                        setInputText(msg.text);
                      }}
                      className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-amber-500 hover:bg-zinc-800 transition-all cursor-pointer"
                      title="Edit code sequence"
                    >
                      <Pencil size={11} />
                    </button>
                  )}

                  {/* Translator Decrypt Action */}
                  <button
                    onClick={() => startDecryptAnimation(msg.id, msg.text)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 transition-all cursor-pointer"
                    title="Decrypt Code"
                    disabled={isDecodingId === msg.id}
                  >
                    <Globe
                      size={11}
                      className={
                        isDecodingId === msg.id
                          ? "animate-spin text-cyan-400"
                          : ""
                      }
                    />
                  </button>

                  {/* Speech synthesis speaker Action */}
                  <button
                    onClick={() => triggerSpeak(msg.text)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-450 hover:text-purple-400 hover:bg-zinc-805 transition-all cursor-pointer"
                    title="Audio Synthesizer Speech"
                  >
                    <Volume2 size={11} />
                  </button>

                  {/* Deletion action */}
                  <button
                    onClick={() => onDeleteMessage(msg.id)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Purge Link"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

              {/* Timestamp metadata */}
              <div className="flex items-center gap-1.5 px-2 text-[9px] font-mono text-zinc-500">
                <span>{msg.time}</span>
                {isMe && <CheckCheck size={11} className="text-cyan-400" />}
              </div>
            </div>
          );
        })}
      </main>

      {/* Footer input panel */}
      <footer className="p-3 bg-zinc-950/90 border-t border-white/5 relative z-10 font-mono">
        {/* Reply Message Preview banner */}
        {replyMessage && (
          <div className="px-3.5 py-2 mb-2 bg-zinc-900 border border-cyan-500/20 rounded-xl flex items-center justify-between text-[11px] font-mono animate-slide-down">
            <div className="flex items-center gap-2 text-cyan-400 font-bold truncate">
              <ArrowLeft size={12} className="scale-x-[-1]" />
              <span className="truncate">
                Replying to @{replyMessage.senderName}:{" "}
                <span className="text-zinc-400 font-semibold italic">
                  "{replyMessage.text}"
                </span>
              </span>
            </div>
            <button
              onClick={() => setReplyMessage(null)}
              className="text-zinc-500 hover:text-white shrink-0 cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* Edit Message Preview banner */}
        {editingMessage && (
          <div className="px-3.5 py-2 mb-2 bg-zinc-900 border border-amber-500/20 rounded-xl flex items-center justify-between text-[11px] font-mono animate-slide-down">
            <div className="flex items-center gap-2 text-amber-500 font-bold truncate">
              <Pencil size={12} />
              <span className="truncate">
                Editing:{" "}
                <span className="text-zinc-400 font-semibold italic">
                  "{editingMessage.text}"
                </span>
              </span>
            </div>
            <button
              onClick={() => {
                setEditingMessage(null);
                setInputText("");
              }}
              className="text-zinc-505 hover:text-white shrink-0 cursor-pointer"
            >
              <X size={13} />
            </button>
          </div>
        )}

        {/* AI Recommendations panel */}
        {showAIAssistant && (
          <div className="p-2 mb-2 bg-purple-950/15 border border-purple-500/20 rounded-xl flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-[10px] animate-slide-down">
            <span className="text-purple-400 font-bold px-1.5 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles size={11} className="animate-pulse" /> SUGGEST:
            </span>
            {[
              {
                prompt:
                  "💡 [ENCRYPTED SECURE LINK]: Dispatching next transmission...",
                label: "Secure cipher",
              },
              {
                prompt:
                  "🤖 Onyx core system log coordinates check: Status Nominal.",
                label: "System update",
              },
              {
                prompt:
                  "👋 Establishing connection handshake. Authenticating peer link.",
                label: "Greeting handshakes",
              },
              {
                prompt: "/quote Inject secure quotation stream: ",
                label: "Quote command",
              },
            ].map((rec) => (
              <button
                key={rec.label}
                type="button"
                onClick={() => {
                  setInputText(rec.prompt);
                  setShowAIAssistant(false);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-300 hover:text-white transition-all shrink-0 cursor-pointer font-bold uppercase text-[8.5px]"
              >
                {rec.label}
              </button>
            ))}
          </div>
        )}

        {/* File preview dialog */}
        {selectedFile && (
          <div className="px-4 py-2 mb-2 bg-zinc-905 border border-zinc-850 rounded-xl flex items-center justify-between font-mono text-xs text-zinc-300">
            <div className="flex items-center gap-2 truncate">
              <FileText size={14} className="text-cyan-400" />
              <span className="truncate">
                {selectedFile.name} (Ready to upload)
              </span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-zinc-500 hover:text-white shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Emojis & Command helper bar */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-1" id="quick-emojis-row">
            {quickEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setInputText((prev) => prev + emoji)}
                className="hover:scale-125 hover:-translate-y-0.5 transition-transform text-sm px-1.5 py-0.5 cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>

          <span className="text-[9px] font-mono text-zinc-600 uppercase">
            {isGroup
              ? "Slash commands: /hack, /quote, /theme"
              : "Onyx Neural Net Mode"}
          </span>
        </div>

        {/* Console Textarea Bar */}
        {isBlocked ? (
          <div className="flex gap-2.5 items-center justify-center p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-red-400 font-mono text-xs uppercase tracking-widest animate-pulse">
            <ShieldAlert size={14} className="text-red-500 shrink-0" />
            <span>
              ⛔ [SECURE COUPLING RESTRICTED] Link blocked. Unblock target node
              to resume channel communications.
            </span>
          </div>
        ) : activeChat && activeChat.isChannel && !activeChat.joined ? (
          <button
            type="button"
            onClick={() => {
              onJoinChannel(activeChat.id);
            }}
            className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-black font-bold font-mono tracking-widest text-[11px] rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.35)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Globe className="animate-pulse" size={14} />
            <span>ESTABLISH SECURE LINK & SUBSCRIBE (JOIN CHANNEL) +</span>
          </button>
        ) : activeChat &&
          activeChat.isChannel &&
          activeChat.joined &&
          activeChat.role !== "owner" ? (
          <div className="w-full py-3.5 px-4 bg-zinc-900/40 border border-pink-500/15 text-pink-400 font-mono text-center text-[10px] font-bold uppercase tracking-widest rounded-2xl">
            📢 Connected to Broadcast Hub. Awaiting next core transmission
            packet...
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            {/* Sparkles AI suggest button */}
            <button
              onClick={() => setShowAIAssistant((prev) => !prev)}
              className={`p-3 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                showAIAssistant
                  ? "bg-purple-500/20 border-purple-500/40 text-purple-400 animate-pulse"
                  : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-purple-400"
              }`}
              title="AI prompt suggest"
            >
              <Sparkles size={14} />
            </button>

            {/* File Link Button */}
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
              title="Attach Signal Asset"
            >
              <Paperclip size={14} />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={selectImgAttachment}
              className="hidden"
              accept="image/*,application/pdf,text/*"
            />

            {/* Primary inputs */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={
                  isGroup
                    ? "Query active hub... try /hack or /quote"
                    : "Type message... (Real AI responses for Onyx AI Core bot)"
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full bg-zinc-900/50 border border-white/5 text-zinc-100 placeholder-zinc-500 rounded-xl py-3 pl-4 pr-10 text-xs font-mono focus:outline-none focus:border-cyan-500/40 focus:bg-zinc-900/80 transition-all"
              />
              {inputText.startsWith("/") && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] bg-cyan-950 border border-cyan-800 text-cyan-400 px-1 py-0.5 font-bold font-mono uppercase tracking-widest rounded animate-pulse">
                  SLASH COMMAND
                </div>
              )}
            </div>

            {/* Core Send command */}
            <button
              onClick={handleSend}
              disabled={!inputText.trim() && !selectedFile}
              className={`p-3 rounded-xl font-bold flex items-center justify-center transition-all cursor-pointer border shrink-0 ${
                inputText.trim() || selectedFile
                  ? `bg-cyan-500 border-cyan-400 text-black hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]`
                  : "bg-zinc-900 border-transparent text-zinc-600 cursor-not-allowed"
              }`}
            >
              <Send size={14} />
            </button>
          </div>
        )}
      </footer>

      {/* 2-Second Hold Context Menu Dialog / Bottom Sheet modal */}
      {showOptionsMenu && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Top micro scan lines */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 via-transparent to-purple-500" />

            {/* Profile/Identity target header */}
            <div className="text-center mb-6">
              <div className="relative inline-block mb-3">
                <img
                  src={activeChat.avatar}
                  className="w-16 h-16 rounded-2xl object-cover mx-auto border-2 border-cyan-500/30"
                  alt={activeChat.name}
                />
                {activeChat.online && (
                  <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 bg-emerald-500 border-2 border-black rounded-full" />
                )}
              </div>
              <h3 className="font-mono font-black text-white text-base tracking-tight uppercase">
                {activeChat.name}
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono italic truncate max-w-xs mx-auto mt-1">
                {activeChat.bio || "Zero-Knowledge Terminal Node"}
              </p>
            </div>

            {/* Grid Axis Options spacing */}
            <div className="space-y-3.5">
              {/* Toggle Mute option button */}
              {!isGroup && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleMute(activeChat.id);
                  }}
                  className={`w-full py-3.5 px-4 rounded-xl border flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isMuted
                      ? "bg-amber-950/30 border-amber-500/40 text-amber-400"
                      : "bg-zinc-900/50 border-white/5 text-zinc-300 hover:border-amber-500/30 hover:text-amber-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    <span>
                      {isMuted ? "UNMUTE SECURE LINK" : "MUTE SECURE LINK"}
                    </span>
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-zinc-800">
                    {isMuted ? "MUTED" : "ALERTS"}
                  </span>
                </button>
              )}

              {/* Toggle Block option button */}
              {!isGroup && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleBlock(activeChat.id);
                  }}
                  className={`w-full py-3.5 px-4 rounded-xl border flex items-center justify-between text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isBlocked
                      ? "bg-red-950/30 border-red-500/40 text-red-400"
                      : "bg-zinc-900/50 border-white/5 text-zinc-300 hover:border-red-500/30 hover:text-red-400"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Ban size={14} />
                    <span>
                      {isBlocked
                        ? "UNBLOCK PEER TRANSIT"
                        : "BLOCK PEER TRANSIT"}
                    </span>
                  </div>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-zinc-800">
                    {isBlocked ? "BLOCKED" : "ALLOWED"}
                  </span>
                </button>
              )}

              {/* Delete button (dangerous crimson layout) */}
              <button
                type="button"
                onClick={() => {
                  if (
                    confirm(
                      `Purge all decrypted logs and channel links with ${activeChat.name}? This action is permanent.`,
                    )
                  ) {
                    onDeleteChat(activeChat.id);
                    setShowOptionsMenu(false);
                  }
                }}
                className="w-full py-3.5 px-4 bg-red-950/20 hover:bg-red-950/40 border border-red-900/20 hover:border-red-500/40 text-red-400 rounded-xl flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              >
                <Trash2 size={14} className="text-red-500" />
                <span>PURGE DATABASE LOGS (DELETE)</span>
              </button>
            </div>

            {/* Dismiss boundary element */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowOptionsMenu(false)}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-zinc-400 hover:text-white transition-all rounded-xl text-xs font-bold uppercase tracking-widest cursor-pointer text-center"
              >
                DISMISS INTERFACE
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Forwarding Modal Overlay */}
      {forwardMessage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 font-mono select-none">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.85)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-pink-500 via-transparent to-cyan-500" />

            <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-4">
              <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                <Share size={12} /> FORWARD NEURAL TRANSCRIPTION
              </h3>
              <button
                onClick={() => setForwardMessage(null)}
                className="text-[9px] text-zinc-500 hover:text-white uppercase font-bold"
              >
                Cancel
              </button>
            </div>

            <p className="text-[10px] text-zinc-400 mb-4 bg-zinc-900/60 p-2.5 rounded-xl border border-white/5 italic">
              Payload: "{forwardMessage.text.slice(0, 80)}
              {forwardMessage.text.length > 80 ? "..." : ""}"
            </p>

            <span className="block text-[8px] uppercase tracking-widest text-zinc-500 font-bold mb-2">
              Select target sync coordinate
            </span>

            <div className="space-y-1.5 max-h-[220px] overflow-y-auto no-scrollbar mb-4">
              {chatList
                .filter((ch) => ch.id !== activeChat.id)
                .map((target) => (
                  <div
                    key={target.id}
                    onClick={() => {
                      onForwardMessage(target.id, forwardMessage.text);
                      try {
                        const audioCtx = new (
                          window.AudioContext || window.webkitAudioContext
                        )();
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
                        osc.type = "sine";
                        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(
                          0.0001,
                          audioCtx.currentTime + 0.15,
                        );
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.start();
                        osc.stop(audioCtx.currentTime + 0.2);
                      } catch (e) {}
                      alert(`Payload forwarded securely to ${target.name}!`);
                      setForwardMessage(null);
                    }}
                    className="flex items-center gap-2.5 p-2.5 bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5 hover:border-pink-500/30 rounded-xl cursor-pointer transition-all"
                  >
                    <img
                      src={target.avatar}
                      className="w-7 h-7 rounded-lg object-cover"
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-200 truncate leading-none">
                        {target.name}
                      </p>
                      <span className="text-[7.5px] text-zinc-500 font-bold uppercase font-mono tracking-wider">
                        {target.isChannel
                          ? "Broadcast"
                          : target.membersCount
                            ? "Group"
                            : "Direct Link"}
                      </span>
                    </div>
                  </div>
                ))}
              {chatList.length <= 1 && (
                <p className="text-[10px] text-zinc-650 text-center py-4">
                  No secondary transit nodes identified.
                </p>
              )}
            </div>

            <button
              onClick={() => setForwardMessage(null)}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border border-white/5"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;