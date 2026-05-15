import React, { useState } from 'react';
import { 
  FaUser, FaLock, FaRobot, FaPalette, 
  FaBell, FaPowerOff, FaArrowLeft, FaShieldAlt 
} from 'react-icons/fa';
import { 
  ShieldCheck, Fingerprint, MapPin, RefreshCw, 
  EyeOff, Smartphone, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

/* ==========================================================
    ⚡ SECURITY COMPONENT (Integrated)
========================================================== */
const SecurityContent = () => {
  const [ghostMode, setGhostMode] = useState(false);
  const [aiRotation, setAiRotation] = useState(true);

  const CustomSwitch = ({ active, toggle, color }) => (
    <div 
      onClick={toggle} 
      className={`w-12 h-6 rounded-full p-1 transition-all cursor-pointer ${active ? color : 'bg-zinc-800'}`}
    >
      <motion.div 
        animate={{ x: active ? 24 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-4 h-4 bg-white rounded-full shadow-lg"
      />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Neural Shield Status */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cyan-900/40 to-purple-900/40 p-6 rounded-[32px] border border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.1)]">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white italic tracking-tighter uppercase">Neural Shield Active</h2>
            <p className="text-cyan-400 text-[10px] font-black tracking-[0.2em]">ENCRYPTION: AES-256-GCM</p>
          </div>
          <ShieldCheck size={40} className="text-cyan-400 drop-shadow-[0_0_10px_#22d3ee]" />
        </div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
      </div>

      {/* Active Nodes */}
      <div className="bg-zinc-900/30 rounded-[32px] p-6 border border-white/5">
        <h3 className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Active Nodes (Devices)</h3>
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400"><Smartphone size={20} /></div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Main Controller (Current)</p>
            <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">
              <MapPin size={10} className="text-cyan-500" /> <span>Dhaka, Bangladesh</span>
            </div>
          </div>
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="bg-zinc-900/30 rounded-[32px] overflow-hidden border border-white/5">
        <div className="p-5 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-2xl text-red-400"><EyeOff size={20}/></div>
            <div>
              <h3 className="font-bold text-white text-sm">Ghost Mode</h3>
              <p className="text-zinc-500 text-[10px]">Invisible to searches & anti-screenshot.</p>
            </div>
          </div>
          <CustomSwitch active={ghostMode} toggle={() => setGhostMode(!ghostMode)} color="bg-red-500" />
        </div>

        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400"><RefreshCw size={20}/></div>
            <div>
              <h3 className="font-bold text-white text-sm">AI-Key Rotation</h3>
              <p className="text-zinc-500 text-[10px]">Auto-rotates session keys every 24h.</p>
            </div>
          </div>
          <CustomSwitch active={aiRotation} toggle={() => setAiRotation(!aiRotation)} color="bg-cyan-500" />
        </div>
      </div>

      <button className="w-full p-5 bg-white/5 border border-white/5 rounded-[2rem] flex items-center justify-center gap-3 group hover:bg-cyan-500/10 transition-all active:scale-[0.98]">
        <Fingerprint className="text-cyan-400 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Setup Neural ID</span>
      </button>
    </div>
  );
};

/* ==========================================================
    ⚡ MAIN SETTINGS SCREEN
========================================================== */
const SettingsScreen = ({ onBack }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('main'); // 'main' or 'security'

  const handleLogout = () => {
    localStorage.removeItem("onyx_token");
    toast.success("Node Disconnected");
    navigate('/login');
  };

  const SettingItem = ({ icon, label, subLabel, onClick, color = "text-zinc-400", danger = false }) => (
    <div 
      onClick={onClick}
      className={`group p-4 bg-zinc-900/30 border border-white/5 rounded-[2rem] flex items-center gap-4 hover:bg-zinc-800/40 ${danger ? 'hover:border-red-500/20' : 'hover:border-cyan-500/20'} transition-all cursor-pointer active:scale-[0.98]`}
    >
      <div className={`w-12 h-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center ${color} group-hover:bg-cyan-500 group-hover:text-black transition-all shadow-inner`}>
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="text-white text-sm font-bold tracking-tight">{label}</h3>
        <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-black mt-0.5">{subLabel}</p>
      </div>
      <ChevronRight size={16} className="text-zinc-700 group-hover:text-cyan-500 transition-colors" />
    </div>
  );

  return (
    <div className="bg-[#000000] min-h-screen flex flex-col selection:bg-cyan-500/30 font-sans">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <button 
          onClick={activeTab === 'main' ? (onBack || (() => navigate(-1))) : () => setActiveTab('main')} 
          className="p-3 bg-zinc-900 rounded-2xl text-zinc-400 hover:text-white transition-all active:scale-90 border border-white/5"
        >
          <FaArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">
            {activeTab === 'main' ? 'System Config' : 'Security Protocol'}
          </h2>
          <p className="text-white text-xs font-bold uppercase tracking-tighter">
            {activeTab === 'main' ? 'Neural Settings' : 'Shield & Encryption'}
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'main' ? (
            <motion.div 
              key="main"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <section className="space-y-3">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Identity</p>
                <SettingItem icon={<FaUser size={18} />} label="Avatar Synthesis" subLabel="Profile & Neural Tag" />
              </section>

              <section className="space-y-3">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Core Network</p>
                <SettingItem 
                  icon={<FaShieldAlt size={18} />} 
                  label="Privacy & Shield" 
                  subLabel="Encryption Status" 
                  onClick={() => setActiveTab('security')}
                  color="text-cyan-400"
                />
                <SettingItem icon={<FaRobot size={18} />} label="AI Agent Config" subLabel="Autonomy Settings" />
                <SettingItem icon={<FaPalette size={18} />} label="Onyx Interface" subLabel="Theme & Visuals" />
              </section>

              <section className="space-y-3">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Signals</p>
                <SettingItem icon={<FaBell size={18} />} label="Neural Pulse" subLabel="Notifications" />
              </section>

              <section className="pt-4 border-t border-white/5">
                <SettingItem 
                  icon={<FaPowerOff size={16} />} 
                  label="Disconnect Node" 
                  subLabel="Sign Out" 
                  color="text-red-500"
                  danger={true}
                  onClick={handleLogout}
                />
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="security"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <SecurityContent />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        <div className="pt-12 pb-6 text-center">
          <p className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.5em]">OnyxDrift v1.0.4-Beta</p>
          <p className="text-zinc-600 text-[8px] mt-2 font-bold uppercase tracking-widest leading-relaxed">
            Established by Private Neural Network <br/> Secure Collaboration Node
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;