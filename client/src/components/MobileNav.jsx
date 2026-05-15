import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Play, 
  Plus, 
  Users, 
  MessageSquare, 
  X, 
  Video, 
  Type, 
  Image, 
  Radio,
  Zap
} from 'lucide-react';

// মডিউল ইমপোর্ট
import NeuralEditor from '../modules/NeuralEditor'; 
import LiveStudio from '../modules/LiveStudio';

const MobileNavbar = () => {
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const navigate = useNavigate();

  // ক্রিয়েশন হাব অপশনসমূহ
  const creationOptions = [
    { id: 'reels', label: 'Reels', icon: <Play size={20} />, color: 'text-pink-500', desc: 'Sync vertical' },
    { id: 'video', label: 'Video', icon: <Video size={20} />, color: 'text-blue-500', desc: 'Upload file' },
    { id: 'text', label: 'Neural Text', icon: <Type size={20} />, color: 'text-white', desc: 'Post thoughts' },
    { id: 'photo', label: 'Photo', icon: <Image size={20} />, color: 'text-green-500', desc: 'Visual node' },
    { id: 'live', label: 'Go Live', icon: <Radio size={20} />, color: 'text-red-500', desc: 'Real-time sync' },
  ];

  // হ্যান্ডেল ক্লিক লজিক
  const handleOptionClick = (id) => {
    setIsHubOpen(false); // মডাল বন্ধ হবে
    
    if (id === 'live') {
      setActiveModule('live'); // লাইভ স্টুডিও মডিউল ওপেন হবে
    } else if (id === 'text') {
      setActiveModule('text'); // নিউরাল টেক্সট মডিউল ওপেন হবে
    } else {
      // বাকি সব (reels, video, photo) সরাসরি এডিটরে যাবে
      navigate('/reels-editor', { state: { type: id } });
    }
  };

  return (
    <>
      {/* --- ১. মূল মোবাইল ন্যাভবার (Onyx Aesthetics) --- */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-black/80 backdrop-blur-3xl border-t border-white/5 z-[100] transition-all duration-500 pb-safe">
        <div className="flex justify-around items-center h-20 px-4 pb-2">
          
          {/* Neural Feed */}
          <NavLink to="/feed" className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-cyan-400 scale-110' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {({ isActive }) => (
              <>
                <div className={isActive ? "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : ""}>
                   <Home size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[7px] font-black uppercase tracking-[0.2em]">Neural</span>
              </>
            )}
          </NavLink>

          {/* Reels */}
          <NavLink to="/reels" className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-cyan-400 scale-110' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {({ isActive }) => (
              <>
                <div className={isActive ? "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : ""}>
                   <Play size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[7px] font-black uppercase tracking-[0.2em]">Reels</span>
              </>
            )}
          </NavLink>

          {/* মেইন ক্রিয়েটিভ ইঞ্জিন বাটন (Plus) */}
          <div className="relative -top-6">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsHubOpen(true)}
              className="bg-white text-black p-4 rounded-[22px] shadow-[0_10px_30px_rgba(255,255,255,0.15)] transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-cyan-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-20" />
              <Plus size={26} strokeWidth={3} className="relative z-10" />
            </motion.button>
          </div>

          {/* Syncs (Following) */}
          <NavLink to="/following" className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-cyan-400 scale-110' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {({ isActive }) => (
              <>
                <div className={isActive ? "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : ""}>
                   <Users size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[7px] font-black uppercase tracking-[0.2em]">Syncs</span>
              </>
            )}
          </NavLink>

          {/* Comms (Messages) */}
          <NavLink to="/messages" className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-cyan-400 scale-110' : 'text-zinc-500 hover:text-zinc-300'}`}>
            {({ isActive }) => (
              <>
                <div className={isActive ? "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : ""}>
                   <MessageSquare size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[7px] font-black uppercase tracking-[0.2em]">Comms</span>
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* --- ২. ক্রিয়েশন হাব মডাল (Neural Engine V3) --- */}
      <AnimatePresence>
        {isHubOpen && (
          <div className="fixed inset-0 z-[150] flex items-end justify-center px-4 pb-28">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
              onClick={() => setIsHubOpen(false)}
            />
            
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-6 shadow-[0_-20px_80px_rgba(0,0,0,1)]"
            >
              <div className="flex justify-between items-center mb-8 px-4">
                <div className="flex items-center gap-2">
                   <Zap size={14} className="text-cyan-500 fill-cyan-500 animate-pulse" />
                   <h2 className="text-[10px] font-black uppercase tracking-[0.5em] italic text-cyan-500/80">Neural_Engine_V3</h2>
                </div>
                <button 
                  onClick={() => setIsHubOpen(false)} 
                  className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full text-white transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[60vh] hide-scrollbar">
                {creationOptions.map((opt) => (
                  <motion.button
                    key={opt.id}
                    whileHover={{ x: 10 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOptionClick(opt.id)}
                    className="flex items-center gap-5 p-5 rounded-[2.2rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] hover:border-cyan-500/30 transition-all group"
                  >
                    <div className={`p-4 rounded-2xl bg-black border border-white/10 ${opt.color} shadow-inner`}>
                      {opt.icon}
                    </div>
                    <div className="text-left">
                      <p className="text-[12px] font-black uppercase tracking-widest text-white group-hover:text-cyan-400 transition-colors">{opt.label}</p>
                      <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-tight mt-1">{opt.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-8 flex justify-center opacity-20">
                 <p className="text-[7px] text-white font-black uppercase tracking-[1em]">Onyx_Neural_Protocol</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- ৩. কন্ডিশনাল মডিউল রেন্ডারিং --- */}
      {activeModule === 'text' && (
        <NeuralEditor isOpen={true} onClose={() => setActiveModule(null)} />
      )}

      {activeModule === 'live' && (
        <LiveStudio isOpen={true} onClose={() => setActiveModule(null)} />
      )}
    </>
  );
};

export default MobileNavbar;