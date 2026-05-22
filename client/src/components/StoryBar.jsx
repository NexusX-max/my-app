import React, { useState } from 'react';
import { motion } from 'framer-motion';

const StoryBar = ({ user }) => {
  // ডামি ডাটা মনস্টার স্টোরি ফিডের জন্য
  const [activeStories] = useState([
    { id: 'u1', name: 'Alisha Alam', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', hasUnseen: true },
    { id: 'u2', name: 'Md. Fahad', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', hasUnseen: true },
    { id: 'u3', name: 'Romjan Ali', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', hasUnseen: false },
    { id: 'u4', name: 'Onyx AI', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150', hasUnseen: true, isAi: true }
  ]);

  return (
    <div className="w-full bg-[#0b0c10] pt-6 pb-4 border-b border-zinc-900/40">
      <div className="px-5 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black tracking-tight text-zinc-100">Onyx Matrix Streams</h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mt-0.5">Live Fluid Transmissions</p>
        </div>
        <span className="text-[10px] bg-purple-950/40 text-purple-400 border border-purple-500/30 px-2 py-1 rounded-full font-bold">24H Node</span>
      </div>

      {/* 🔮 Horizontal Story Scroll (Pre-loaded Container) */}
      <div className="flex gap-4 overflow-x-auto px-5 no-scrollbar active:cursor-grabbing">
        
        {/* কলার নিজের স্টোরি অ্যাড নোড */}
        <div className="flex flex-col items-center space-y-1.5 shrink-0 cursor-pointer">
          <div className="relative w-16 h-16 rounded-full p-[2px] bg-zinc-800 flex items-center justify-center">
            <img 
              src={user?.profilePic || "https://ui-avatars.com/api/?name=Onyx&background=16171d&color=fff"} 
              className="w-full h-full rounded-full object-cover border-2 border-[#0b0c10]" 
              alt="My Drift" 
            />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#7c3aed] text-white border-2 border-[#0b0c10] rounded-full flex items-center justify-center font-black text-xs">+</div>
          </div>
          <span className="text-[10px] text-zinc-400 font-bold tracking-wide">My Drift</span>
        </div>

        {/* বাকিদের প্রিমিয়াম গ্লোয়িং স্টোরি লিং */}
        {activeStories.map((story) => (
          <motion.div 
            whileTap={{ scale: 0.93 }}
            key={story.id} 
            className="flex flex-col items-center space-y-1.5 shrink-0 cursor-pointer group"
          >
            <div className="relative w-16 h-16 rounded-full flex items-center justify-center">
              {/* 🌈 Glowing Ring Engine based on unseen status */}
              {story.hasUnseen && (
                <div className={`absolute inset-0 rounded-full animate-spin [animation-duration:6s] bg-gradient-to-tr ${story.isAi ? 'from-cyan-400 via-blue-500 to-purple-600' : 'from-[#a855f7] via-[#ec4899] to-[#3b82f6]'} p-[2px] shadow-[0_0_15px_rgba(168,85,247,0.4)]`} />
              )}
              
              <div className="w-[calc(100%-4px)] h-[calc(100%-4px)] rounded-full bg-[#0b0c10] z-10 p-[2px]">
                <img 
                  src={story.avatar} 
                  className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  alt={story.name} 
                />
              </div>

              {/* AI ব্যাজ ইন্ডিকেটর */}
              {story.isAi && (
                <span className="absolute -top-1 -right-1 bg-cyan-500 text-black text-[7px] font-black uppercase px-1 rounded z-20 shadow-md">AI</span>
              )}
            </div>
            <span className="text-[10px] text-zinc-400 font-medium truncate w-14 text-center tracking-tight">
              {story.name.split(' ')[0]}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StoryBar;