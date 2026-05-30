import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Paperclip, Globe, Volume2, Trash2, Terminal, ShieldCheck, 
  Maximize2, Smile, FileText, Phone, Video, Info, RefreshCw, X, 
  Sparkles, Check, CheckCheck 
} from 'lucide-react';

const ChatWindow = ({
  activeChat,
  isGroup,
  messages,
  onSendMessage,
  onInitiateCall,
  onDeleteMessage,
  activeAccent,
  userProfile
}) => {
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [decryptionStates, setDecryptionStates] = useState({}); // Stores translated/decoded text for elements
  const [isDecodingId, setIsDecodingId] = useState(null);
  const [commandSuccessMsg, setCommandSuccessMsg] = useState(null);
  
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

    // Check for special slash commands inside direct / group channels
    if (inputText.startsWith("/")) {
      handleSlashCommand(inputText.trim());
      setInputText("");
      return;
    }

    onSendMessage({
      text: inputText,
      file: selectedFile
    });
    
    setInputText("");
    setSelectedFile(null);
  };

  const handleSlashCommand = (cmd) => {
    const action = cmd.toLowerCase().split(" ")[0];
    let replyText = "";

    if (action === "/hack") {
      replyText = "⚙️ [SYSTEM LOG] Decrypting proxy layers... Mainframe response: APPROVED. Signal level optimal. Ingress secure on Port 3000.";
    } else if (action === "/quote") {
      const quotes = [
        "\"The Net is vast and infinite.\" — Puppet Master",
        "\"Technology is a useful servant but a dangerous master.\" — Christian Lous Lange",
        "\"High-quality visuals deserve pristine code alignments.\" — Onyx v4.8 Manual",
        "\"Any sufficiently advanced technology is indistinguishable from magic.\" — Arthur C. Clarke"
      ];
      replyText = `🔮 [COSMIC WISDOM] ${quotes[Math.floor(Math.random() * quotes.length)]}`;
    } else if (action === "/theme") {
      replyText = "🎨 [PALETTE ENGINE] Palette alignment synchronized. Accent signal cycles optimized.";
    } else {
      replyText = "⚠️ [TERMINAL ERROR] Unrecognized slash protocol. Powered systems offline. Try /hack, /quote, or /theme.";
    }

    // Trigger local feedback success banner
    setCommandSuccessMsg(replyText);
    setTimeout(() => setCommandSuccessMsg(null), 6000);
  };

  // Text-to-speech mechanism
  const triggerSpeak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clean text of technical accents
      const cleanText = text.replace(/[*_`\[\]]/g, '');
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
        .split('')
        .map((char, index) => {
          if (index < count || char === ' ') return char;
          return scrambledChars[Math.floor(Math.random() * scrambledChars.length)];
        })
        .join('');
        
      setDecryptionStates(prev => ({
        ...prev,
        [messageId]: randomizedText
      }));
      
      count += Math.ceil(originalText.length / 8);
      
      if (count >= originalText.length) {
        clearInterval(interval);
        setDecryptionStates(prev => ({
          ...prev,
          [messageId]: `🔑 [DECRYPT INTEGRITY VERIFIED] ${originalText}`
        }));
        setIsDecodingId(null);
      }
    }, 80);
  };

  const selectImgAttachment = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedFile({
          name: file.name,
          type: file.type,
          dataUrl: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Popular quick emojis
  const quickEmojis = ["🎯", "🔥", "🛡️", "🧬", "👽", "💎", "🔋", "⚠️"];

  return (
    <div id="chat-window-viewport" className="flex-1 h-full bg-black flex flex-col overflow-hidden relative">
      
      {/* Background Matrix-like visual gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.015] via-transparent to-purple-500/[0.015] pointer-events-none" />

      {/* Viewport Header */}
      <header className="p-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            <img 
              src={activeChat.avatar} 
              className={`w-11 h-11 rounded-xl object-cover border ${
                isGroup ? 'border-purple-500/20' : 'border-cyan-500/20'
              }`} 
              alt={activeChat.name} 
            />
            {activeChat.online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full" />
            )}
          </div>
          
          <div className="min-w-0">
            <h2 className="text-sm font-black text-zinc-100 flex items-center gap-1.5 truncate">
              {activeChat.name}
              {activeChat.isBot && (
                <span className="text-[7px] px-1 bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono rounded font-black">
                  SECURE BOT
                </span>
              )}
            </h2>
            <p className="text-[10px] text-zinc-500 truncate font-mono">
              {isGroup ? `${activeChat.membersCount} connected nodes on mesh` : `Signal Link: ${activeChat.encryptionKey || 'N/A'}`}
            </p>
          </div>
        </div>

        {/* Real-time Diagnostics Header Panel */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex flex-col items-end text-[9px] font-mono text-zinc-500 border-l border-white/5 pl-4">
            <span className="text-zinc-600">ENCRYPTION PROTOCOL:</span>
            <span className="text-cyan-400/80 font-bold flex items-center gap-1">
              <ShieldCheck size={10} className="text-cyan-400" /> {activeChat.encryptionKey || 'SEC-CHANNEL-X'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onInitiateCall(activeChat, 'audio')}
              className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 hover:border-cyan-500/20 transition-all cursor-pointer"
              title="Voice Protocol"
            >
              <Phone size={13} />
            </button>
            <button
              onClick={() => onInitiateCall(activeChat, 'video')}
              className="p-3 rounded-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-purple-400 hover:bg-zinc-800 hover:border-purple-500/20 transition-all cursor-pointer"
              title="Video Protocol"
            >
              <Video size={13} />
            </button>
          </div>
        </div>
      </header>

      {/* Success Command Console Banner */}
      {commandSuccessMsg && (
        <div className="bg-cyan-950/80 border-b border-cyan-800/40 px-5 py-3 text-xs font-mono text-cyan-300 flex items-center gap-2.5 justify-between relative z-20 animate-slide-down">
          <div className="flex items-center gap-2">
            <Terminal size={12} className="text-cyan-400 animate-pulse" />
            <span>{commandSuccessMsg}</span>
          </div>
          <button onClick={() => setCommandSuccessMsg(null)} className="text-zinc-500 hover:text-white">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Messages Canvas Workspace */}
      <main 
        ref={viewportRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 no-scrollbar bg-zinc-950/20"
      >
        {/* Connection Established Warning banner */}
        <div className="flex justify-center my-2">
          <span className="text-[10px] uppercase font-mono tracking-widest bg-zinc-900/40 border border-white/5 text-zinc-500 px-3 py-1.5 rounded-xl">
            🔒 Neural handshake complete. End-to-end sandbox cipher intact.
          </span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
          const decryptionText = decryptionStates[msg.id];
          const hasImage = msg.file && msg.file.type.startsWith('image/');
          const hasGenericFile = msg.file && !msg.file.type.startsWith('image/');

          return (
            <div 
              key={msg.id}
              className={`flex flex-col max-w-[85%] sm:max-w-[70%] space-y-1 transition-all group ${
                isMe ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              {/* Message sender label (only in group setups) */}
              {!isMe && isGroup && (
                <span className="text-[10px] font-mono text-purple-400 ml-2">
                  {msg.senderName || 'Anonymous Operator'}
                </span>
              )}

              {/* Chat Bubble Layout */}
              <div 
                className={`relative p-3.5 rounded-2xl text-xs md:text-sm shadow-lg leading-relaxed ${
                  isMe 
                    ? `bg-zinc-900 text-white rounded-br-none border border-white/10 ${activeAccent.border}` 
                    : `bg-zinc-900/50 text-zinc-100 rounded-bl-none border border-white/5`
                }`}
              >
                {/* Image Media attachment */}
                {hasImage && (
                  <div className="mb-2.5 rounded-xl overflow-hidden max-h-[220px] max-w-[280px] bg-zinc-950 border border-white/5">
                    <img src={msg.file.dataUrl} className="object-cover w-full h-full" alt="Attachment" />
                  </div>
                )}

                {/* File Attachment */}
                {hasGenericFile && (
                  <div className="mb-2 bg-black/40 p-2.5 rounded-xl border border-white/5 flex items-center gap-2.5 font-mono text-zinc-400 text-[11px]">
                    <FileText size={16} className="text-cyan-400" />
                    <div className="truncate">
                      <p className="text-zinc-200 text-xs truncate font-bold">{msg.file.name}</p>
                      <p className="text-[9px] text-zinc-500 uppercase">Binary Stream</p>
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
                    isMe ? 'right-full mr-2.5' : 'left-full ml-2.5'
                  }`}
                >
                  {/* Translator Decrypt Action */}
                  <button
                    onClick={() => startDecryptAnimation(msg.id, msg.text)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Decrypt Code"
                    disabled={isDecodingId === msg.id}
                  >
                    <Globe size={11} className={isDecodingId === msg.id ? 'animate-spin text-cyan-400' : ''} />
                  </button>

                  {/* Speech synthesis speaker Action */}
                  <button
                    onClick={() => triggerSpeak(msg.text)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-purple-400 hover:bg-zinc-800 transition-colors cursor-pointer"
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
                {isMe && (
                  <CheckCheck size={11} className="text-cyan-400" />
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Footer input panel */}
      <footer className="p-3 bg-zinc-950/90 border-t border-white/5 relative z-10">
        
        {/* File preview dialog */}
        {selectedFile && (
          <div className="px-4 py-2 mb-2 bg-zinc-900/60 border border-zinc-800 rounded-xl flex items-center justify-between font-mono text-xs text-zinc-300">
            <div className="flex items-center gap-2 truncate">
              <FileText size={14} className="text-cyan-400" />
              <span className="truncate">{selectedFile.name} (Ready to upload)</span>
            </div>
            <button onClick={() => setSelectedFile(null)} className="text-zinc-500 hover:text-white shrink-0">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Emojis & Command helper bar */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-1">
            {quickEmojis.map(emoji => (
              <button
                key={emoji}
                onClick={() => setInputText(prev => prev + emoji)}
                className="hover:scale-125 hover:-translate-y-0.5 transition-transform text-sm px-1.5 py-0.5"
              >
                {emoji}
              </button>
            ))}
          </div>

          <span className="text-[9px] font-mono text-zinc-600 uppercase">
            {isGroup ? "Slash commands: /hack, /quote, /theme" : "Onyx Neural Net Mode"}
          </span>
        </div>

        {/* Console Textarea Bar */}
        <div className="flex gap-2 items-center">
          {/* File Link Button */}
          <button
            onClick={() => fileInputRef.current.click()}
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
              placeholder={isGroup ? "Query active hub... try /hack or /quote" : "Type message... (Real AI responses for Onyx AI Core bot)"}
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
              (inputText.trim() || selectedFile)
                ? `bg-cyan-500 border-cyan-400 text-black hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]`
                : 'bg-zinc-900 border-transparent text-zinc-600 cursor-not-allowed'
            }`}
          >
            <Send size={14} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatWindow;
