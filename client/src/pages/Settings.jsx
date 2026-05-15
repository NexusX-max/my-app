import React, { useState, useEffect } from 'react';
import { 
  Lock, LogOut, ChevronRight, EyeOff, ShieldCheck, 
  ArrowLeft, Cpu, SlidersHorizontal, Zap, Radio, Activity
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Settings = () => {
  const [ghostMode, setGhostMode] = useState(false);
  const [autopilot, setAutopilot] = useState(true);
  const [aiPersonality, setAiPersonality] = useState(50);
  const [sensitivity, setSensitivity] = useState(0.8);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const API_URL = "https://api.onyx-drift.com";

  // Axios Instance with Token
  const onyxApi = axios.create({
    baseURL: API_URL,
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await onyxApi.get('/api/user/me');
        setGhostMode(res.data.ghostMode);
        setAutopilot(res.data.aiAutopilot ?? true);
        setAiPersonality(res.data.aiTone ?? 50);
      } catch (err) {
        toast.error("Neural Sync Failed");
      }
    };
    fetchConfig();
  }, []);

  const handleToggle = async (type) => {
    setLoading(true);
    try {
      let endpoint = type === 'ghost' ? '/api/user/toggle-ghost' : '/api/user/toggle-autopilot';
      const res = await onyxApi.put(endpoint);
      if (type === 'ghost') setGhostMode(res.data.ghostMode);
      else setAutopilot(res.data.aiAutopilot);
      toast.success(`${type.toUpperCase()} Protocol Updated`);
    } catch (err) {
      toast.error("Config Write Error");
    } finally {
      setLoading(false);
    }
  };

  const updateAiTone = async (val) => {
    setAiPersonality(val);
    try {
      await onyxApi.put('/api/user/update-ai-tone', { tone: val });
    } catch (err) { console.error("Tone sync failed"); }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Neural Link Severed");
    navigate('/login');
  };

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-[#010409] text-white font-mono selection:bg-cyan-500/30">
      
      {/* Header */}
      <div className="sticky top-0 z-50 p-6 bg-[#010409]/90 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-white/5 rounded-xl text-cyan-400 border border-white/10"
          >
            <ArrowLeft size={20} />
          </motion.button>
          <h1 className="text-lg font-black tracking-tighter uppercase italic bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            System_Config v2.0
          </h1>
        </div>
        <Radio className="text-red-500 animate-pulse" size={18} />
      </div>

      <div className="p-6 space-y-10 pb-32">
        
        {/* Status Dashboard */}
        <section className="grid grid-cols-2 gap-3">
          <StatusCard icon={Activity} label="Core_Sync" value="98.2%" color="text-cyan-400" />
          <StatusCard icon={Cpu} label="Neural_Load" value="14ms" color="text-purple-400" />
        </section>

        {/* Neural Calibration */}
        <section>
          <label className="text-[10px] font-black text-cyan-400/50 uppercase tracking-[0.4em] mb-4 block px-2">Neural Calibration</label>
          <div className="bg-[#0d1117] p-8 rounded-[2.5rem] border border-cyan-500/10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
               <div className="flex items-center gap-3">
                 <Zap className="text-cyan-400" size={20} />
                 <span className="text-sm font-bold italic">Eye-Track Sensitivity</span>
               </div>
               <span className="text-cyan-400 text-xs font-mono">{sensitivity}</span>
            </div>
            <input 
              type="range" min="0.1" max="1" step="0.05" value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </section>

        {/* AI Shadow Engine */}
        <section>
          <label className="text-[10px] font-black text-purple-400/50 uppercase tracking-[0.4em] mb-4 block px-2">Autonomous Engine</label>
          <div className="bg-[#0d1117] rounded-[2.5rem] border border-purple-500/10 overflow-hidden">
            <div className="p-6 flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-purple-500/5 to-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400"><Cpu size={22} /></div>
                <div>
                  <h3 className="text-sm font-bold italic">Shadow Mode</h3>
                  <p className="text-[9px] text-gray-500 uppercase">AI mimics your drift pattern</p>
                </div>
              </div>
              <Switch active={autopilot} toggle={() => handleToggle('autopilot')} color="bg-purple-500" />
            </div>
            <div className="p-8">
              <div className="flex justify-between text-[10px] mb-4 text-gray-400 uppercase font-black">
                <span>Logical</span>
                <span className="text-purple-400">Tone_Matrix</span>
                <span>Hyper_Social</span>
              </div>
              <input 
                type="range" min="0" max="100" value={aiPersonality} 
                onChange={(e) => updateAiTone(e.target.value)} 
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500" 
              />
            </div>
          </div>
        </section>

        {/* Security Protocols */}
        <section>
          <label className="text-[10px] font-black text-red-400/50 uppercase tracking-[0.4em] mb-4 block px-2">Security Protocols</label>
          <div className="bg-[#0d1117] rounded-[2.5rem] border border-red-500/10 overflow-hidden">
            <ToggleItem 
              icon={EyeOff} 
              title="Ghost Protocol" 
              subtitle="Cloak neural presence" 
              active={ghostMode} 
              onToggle={() => handleToggle('ghost')}
              color="bg-red-500"
            />
            <SettingItem 
              icon={ShieldCheck} 
              title="Neural Key" 
              subtitle="Reset access signature" 
              onClick={() => toast.error("Hardware Lock Active")}
              color="text-cyan-400"
              bg="bg-cyan-500/10"
            />
          </div>
        </section>

        {/* Termination */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout} 
          className="w-full p-6 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-[2.5rem] border border-red-500/20 font-black italic uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all"
        >
          <LogOut size={18} /> Sever Neural Link
        </motion.button>

      </div>
    </div>
  );
};

// --- Helper Components ---

const StatusCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-[#0d1117] p-4 rounded-3xl border border-white/5 flex items-center gap-3">
    <Icon className={color} size={18} />
    <div>
      <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">{label}</p>
      <p className="text-xs font-bold text-white">{value}</p>
    </div>
  </div>
);

const ToggleItem = ({ icon: Icon, title, subtitle, active, onToggle, color }) => (
  <div className="p-6 flex items-center justify-between border-b border-white/5">
    <div className="flex items-center gap-4">
      <div className={`p-3 bg-white/5 rounded-2xl text-gray-400`}><Icon size={22} /></div>
      <div>
        <h3 className="text-sm font-bold italic">{title}</h3>
        <p className="text-[9px] text-gray-500 uppercase">{subtitle}</p>
      </div>
    </div>
    <Switch active={active} toggle={onToggle} color={color} />
  </div>
);

const SettingItem = ({ icon: Icon, title, subtitle, onClick, color, bg }) => (
  <div onClick={onClick} className="flex items-center justify-between p-6 hover:bg-white/[0.02] cursor-pointer transition-all">
    <div className="flex items-center gap-4">
      <div className={`p-3 ${bg} rounded-2xl ${color}`}><Icon size={22} /></div>
      <div>
        <h3 className="text-sm font-bold italic text-gray-200">{title}</h3>
        <p className="text-[9px] text-gray-500 uppercase tracking-tighter">{subtitle}</p>
      </div>
    </div>
    <ChevronRight className="text-gray-700" size={16} />
  </div>
);

const Switch = ({ active, toggle, color }) => (
  <div 
    onClick={toggle} 
    className={`w-12 h-6 rounded-full p-1 transition-all duration-500 cursor-pointer flex items-center ${active ? color : 'bg-zinc-800'}`}
  >
    <motion.div 
      animate={{ x: active ? 24 : 0 }} 
      className="w-4 h-4 rounded-full bg-white shadow-lg" 
    />
  </div>
);

export default Settings;