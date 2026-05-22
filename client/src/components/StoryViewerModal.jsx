import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaperPlane } from 'react-icons/fa';

const StoryViewerModal = ({ isOpen, storyData, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [selectedPoll, setSelectedPoll] = useState(null);

  // অটো প্রোগ্রেস বার টাইমার লজিক (৫ সেকেন্ড স্টোরি লাইফ)
  useEffect(() => {
    if (!isOpen) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);
          onClose(); // সময় শেষ হলে অটো ক্লোজ বা নেক্সট স্টোরি লোড
          return 100;
        }
        return old + 2; // স্মুথ প্রোগ্রেস স্পিড
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, storyData, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[999999] bg-[#000] flex flex-col justify-between overflow-hidden"
    >
      {/* 🔮 Background Layer: Dynamic Blur Background Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110 pointer-events-none"
        style={{ backgroundImage: `url(${storyData?.mediaUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'})` }}
      />

      {/* 🔴 Top Bar Controls with Progress Indicators */}
      <div className="z-10 px-4 pt-6 bg-gradient-to-b from-black/80 to-transparent pb-10">
        <div className="w-full bg-zinc-800 h-[3px] rounded-full overflow-hidden mb-4 flex gap-1">
          <div 
            className="bg-white h-full transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={storyData?.avatar || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80'} className="w-9 h-9 rounded-full border border-zinc-700 object-cover" alt="" />
            <div>
              <h4 className="text-xs font-bold text-white tracking-wide">{storyData?.name || 'Alisha Alam'}</h4>
              <p className="text-[9px] text-zinc-400">4h ago • Matrix Stream</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white text-sm bg-zinc-900/40 backdrop-blur-md rounded-full w-8 h-8 flex items-center justify-center">✕</button>
        </div>
      </div>

      {/* 🖼️ Main Content Section (Photo/Video/Overlay Frame) */}
      <div className="flex-1 z-10 flex flex-col items-center justify-center px-6 relative">
        <img 
          src={storyData?.mediaUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600'} 
          className="max-h-[65dvh] w-full object-contain rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.8)] border border-zinc-800/40" 
          alt="Story content" 
        />

        {/* 🔥 Interactive Features Display Layer (Poll Sample) */}
        <div className="absolute bottom-12 w-full max-w-xs bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/60 p-4 rounded-2xl text-center shadow-2xl animate-bounceSubtle">
          <p className="text-xs font-black text-zinc-100 mb-3">🔥 Will OnyxDrift rule social media in 2026?</p>
          <div className="space-y-2">
            {['100% Absolutely 👑', 'No doubt about it!🚀'].map((opt, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedPoll(idx)}
                className={`w-full py-2.5 text-xs font-bold rounded-xl border transition-all ${selectedPoll === idx ? 'bg-purple-600 border-purple-400 text-white' : 'bg-black/40 border-zinc-800/40 text-zinc-300 hover:bg-black/60'}`}
              >
                {opt} {selectedPoll !== null && (idx === 0 ? '— 87%' : '— 13%')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📥 Bottom Action Bar (Quick Replies + Ultra Premium Reactions) */}
      <footer className="z-10 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12 pb-6 flex flex-col items-center gap-4">
        
        {/* Quick Reactions Matrix Cluster */}
        <div className="flex gap-5 justify-center">
          {['❤️', '🔥', '😂', '😮', '👏', '😢'].map((emoji) => (
            <motion.span 
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.8 }}
              key={emoji} 
              className="text-xl cursor-pointer bg-zinc-900/40 backdrop-blur-md p-2 rounded-full w-10 h-10 flex items-center justify-center border border-zinc-800/30"
            >
              {emoji}
            </motion.span>
          ))}
        </div>

        {/* Reply Message Input */}
        <div className="w-full flex items-center gap-2 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl px-3 py-1 focus-within:border-purple-500/50 transition-all">
          <input 
            type="text" 
            placeholder="Send instant transmission reply..." 
            className="flex-1 bg-transparent text-xs text-zinc-100 py-3 px-2 focus:outline-none placeholder-zinc-500"
          />
          <button className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center text-white active:scale-90 transition-transform">
            <FaPaperPlane size={10} />
          </button>
        </div>
      </footer>
    </motion.div>
  );
};

export default StoryViewerModal;