import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';

const StoryViewerModal = ({ isOpen, storyData, onClose, onReplySend, onReactionSend }) => {
  // storyData এর ভেতর এক বা একাধিক স্টোরির অ্যারে থাকতে পারে
  // উদাহরণ: storyData = { name: 'Alisha', avatar: '...', stories: [{ id: 1, mediaUrl: '...', type: 'image' }] }
  const storiesList = storyData?.stories || [
    { id: 'default', mediaUrl: storyData?.mediaUrl, type: storyData?.mediaType || 'image' }
  ];

  const [currentSegment, setCurrentSegment] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  const activeStory = storiesList[currentSegment];
  const videoRef = useRef(null);

  // ⏱️ ইউনিফাইড প্রোগ্রেস বার এবং অটো-নেক্সট ইঞ্জিন
  useEffect(() => {
    if (!isOpen || isPaused) return;

    setProgress(0);
    const storyDuration = activeStory?.type === 'video' ? 10000 : 5000; // ভিডিও ১০ সেকেন্ড, ছবি ৫ সেকেন্ড
    const intervalTime = 50; 
    const increment = (intervalTime / storyDuration) * 100;

    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);
          handleNext();
          return 100;
        }
        return old + increment;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isOpen, currentSegment, isPaused, activeStory]);

  // 🔀 নেভিগেশন কন্ট্রোলস (পরবর্তী বা পূর্ববর্তী স্টোরি সেগমেন্ট)
  const handleNext = () => {
    if (currentSegment < storiesList.length - 1) {
      setCurrentSegment(prev => prev + 1);
      setProgress(0);
      setSelectedPoll(null);
    } else {
      handleModalClose();
    }
  };

  const handlePrev = () => {
    if (currentSegment > 0) {
      setCurrentSegment(prev => prev - 1);
      setProgress(0);
      setSelectedPoll(null);
    }
  };

  const handleModalClose = () => {
    setCurrentSegment(0);
    setProgress(0);
    setSelectedPoll(null);
    setReplyText('');
    setIsPaused(false);
    onClose();
  };

  // 💬 রিপ্লাই ট্রান্সমিশন সাবমিট
  const handleSendReply = () => {
    if (!replyText.trim()) return;
    if (onReplySend) {
      onReplySend(activeStory?.id || storyData?.id, replyText);
    }
    setReplyText('');
    setIsPaused(false); // রিপ্লাই পাঠানোর পর টাইমার আবার চালু হবে
  };

  const handleEmojiReaction = (emoji) => {
    if (onReactionSend) {
      onReactionSend(activeStory?.id || storyData?.id, emoji);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="fixed inset-0 z-[999999] bg-[#000] flex flex-col justify-between overflow-hidden select-none"
      >
        {/* 🔮 ডাইনামিক ব্লার ব্যাকগ্রাউন্ড লেয়ার */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-30 scale-110 pointer-events-none transition-all duration-500"
          style={{ backgroundImage: `url(${activeStory?.mediaUrl || storyData?.mediaUrl})` }}
        />

        {/* 🔴 টপ বার: মাল্টি-সেগমেন্ট প্রোগ্রেস ইন্ডিকেটর */}
        <div className="z-20 px-4 pt-4 bg-gradient-to-b from-black/90 to-transparent pb-10">
          
          {/* মাল্টি-স্টোরি বার ইঞ্জিন (ইনস্টাগ্রাম স্টাইল) */}
          <div className="w-full flex gap-1.5 mb-4">
            {storiesList.map((_, idx) => (
              <div key={idx} className="flex-1 bg-zinc-800 h-[2px] rounded-full overflow-hidden">
                <div 
                  className="bg-white h-full ease-linear"
                  style={{ 
                    width: idx < currentSegment ? '100%' : idx === currentSegment ? `${progress}%` : '0%',
                    transition: idx === currentSegment && !isPaused ? 'width 50ms linear' : 'none'
                  }}
                />
              </div>
            ))}
          </div>

          {/* ইউজার ইনফো ও ক্লোজ বাটন */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <img 
                src={storyData?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80'} 
                className="w-9 h-9 rounded-full border border-zinc-800 object-cover shadow-md" 
                alt="node head" 
              />
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">{storyData?.name || 'Alisha Alam'}</h4>
                <p className="text-[9px] text-purple-400/80 font-semibold uppercase tracking-wider">Matrix Stream Node</p>
              </div>
            </div>
            <button 
              onClick={handleModalClose} 
              className="p-2 text-zinc-400 hover:text-white text-xs bg-zinc-900/50 backdrop-blur-md rounded-full w-7 h-7 flex items-center justify-center border border-zinc-800/30 transition-all active:scale-90"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 🖼️ মেইন কন্টেন্ট জোন (ট্যাপ ডিটেকশন সহ) */}
        <div className="flex-1 z-10 flex items-center justify-center px-4 relative">
          
          {/* লেফট সাইড টপ-টু-প্রিভিয়াস ক্লিক জোন */}
          <div className="absolute left-0 top-0 bottom-0 w-1/4 z-30 cursor-w-resize" onClick={handlePrev} />
          
          {/* রাইট সাইড টপ-টু-নেক্সট ক্লিক জোন */}
          <div className="absolute right-0 top-0 bottom-0 w-1/4 z-30 cursor-e-resize" onClick={handleNext} />

          {/* ইমার্সিভ মিডিয়া রেন্ডারার (ছবি অথবা ভিডিও) */}
          <div 
            className="w-full max-h-[68dvh] flex items-center justify-center rounded-3xl overflow-hidden relative shadow-[0_20px_60px_rgba(0,0,0,0.85)] border border-zinc-900"
            onMouseDown={() => setIsPaused(true)} // হোল্ড করলে টাইমার পজ হবে
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {activeStory?.type === 'video' ? (
              <video 
                ref={videoRef}
                src={activeStory.mediaUrl} 
                autoPlay 
                playsInline
                muted
                className="w-full h-full object-contain"
              />
            ) : (
              <img 
                src={activeStory?.mediaUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'} 
                className="w-full h-full object-contain" 
                alt="Stream Cluster Data" 
              />
            )}
          </div>

          {/* 🔥 ইন্টারঅ্যাক্টিভ পোল প্যানেল ওভারলে */}
          <div className="absolute bottom-6 w-full max-w-[280px] bg-zinc-950/80 backdrop-blur-xl border border-zinc-900 p-4 rounded-2xl text-center shadow-2xl z-40">
            <p className="text-[11px] font-black text-zinc-100 mb-3 tracking-tight">🔥 Will OnyxDrift rule social media within a year?</p>
            <div className="space-y-2">
              {['100% Absolutely 👑', 'No doubt about it!🚀'].map((opt, idx) => (
                <button 
                  key={idx}
                  onClick={() => {
                    setSelectedPoll(idx);
                    handleEmojiReaction(idx === 0 ? '👍' : '🔥');
                  }}
                  className={`w-full py-2 text-[11px] font-bold rounded-xl border transition-all ${selectedPoll === idx ? 'bg-purple-600 border-purple-400 text-white' : 'bg-black/40 border-zinc-900 text-zinc-400 hover:bg-black/60'}`}
                >
                  {opt} {selectedPoll !== null && (idx === 0 ? '— 87%' : '— 13%')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 📥 বটম অ্যাকশন বার (কুইক ইমোজি + রিপ্লাই ইনপুট) */}
        <footer className="z-20 p-4 bg-gradient-to-t from-black via-black/60 to-transparent pt-12 pb-6 flex flex-col items-center gap-4">
          
          {/* কুইক রিঅ্যাকশন ক্লাস্টার */}
          <div className="flex gap-4 justify-center">
            {['❤️', '🔥', '😂', '😮', '👏', '😢'].map((emoji) => (
              <motion.span 
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.85 }}
                key={emoji} 
                onClick={() => handleEmojiReaction(emoji)}
                className="text-lg cursor-pointer bg-zinc-900/30 backdrop-blur-md p-2 rounded-full w-10 h-10 flex items-center justify-center border border-zinc-900/40 hover:bg-zinc-900/60 transition-colors"
              >
                {emoji}
              </motion.span>
            ))}
          </div>

          {/* রিপ্লাই মেসেজ ইনপুট ক্যাপসুল */}
          <div className="w-full flex items-center gap-2 bg-zinc-950/70 backdrop-blur-xl border border-zinc-900 rounded-2xl px-3 py-1 focus-within:border-purple-500/40 transition-all">
            <input 
              type="text" 
              placeholder="Send instant transmission reply..." 
              value={replyText}
              onFocus={() => setIsPaused(true)} // টাইপ করার সময় স্টোরি পজ হবে
              onBlur={() => setIsPaused(false)}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
              className="flex-1 bg-transparent text-xs text-zinc-200 py-3 px-2 focus:outline-none placeholder-zinc-600"
            />
            <button 
              onClick={handleSendReply}
              className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center text-white active:scale-90 transition-transform shadow-[0_0_15px_rgba(124,58,237,0.4)]"
            >
              <FaPaperPlane size={10} />
            </button>
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryViewerModal;