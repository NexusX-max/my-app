import React, { useEffect, useState, useCallback } from 'react';
import { 
  FaUserPlus, FaEnvelope, FaPhoneAlt, FaRocket, 
  FaUserCheck, FaSearch, FaArrowLeft
} from 'react-icons/fa';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

import PublicProfile from './PublicProfile'; 

const getDisplayName = (u) => {
  if (!u) return "Drifter";
  // MongoDB ডাটাবেজ অনুযায়ী firstName এবং lastName চেক করা হচ্ছে
  if (u.firstName || u.lastName) {
    return `${u.firstName || ''} ${u.lastName || ''}`.trim();
  }
  return u.fullName || u.displayName || u.username || "Drifter";
};

const FollowingPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const { api } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeId } = useParams(); // URL params থেকে id নেয়া

  // PublicProfile এ id হিসেবে পাঠানোর জন্য targetId নির্ধারণ
  const queryParams = new URLSearchParams(location.search);
  const targetUserId = routeId || queryParams.get('userId');

  const loadDiscoveryList = useCallback(async (query = "") => {
    if (targetUserId) return; 
    
    try {
      setLoading(true);
      // আপনার নিউরাল সার্চ এন্ডপয়েন্ট
      const res = await api.post('/v1/search/neural', { 
        query: query.trim() || "all" 
      });
      
      // ডাটা হ্যান্ডলিং যাতে সরাসরি অ্যারে বা অবজেক্ট যাই আসুক সেট হয়
      const userData = res.data.results || res.data;
      setUsers(Array.isArray(userData) ? userData : []);

    } catch (err) {
      console.error("🔍 Identity Scanner Offline:", err.message);
      try {
        const fallback = await api.get('/user/search', { params: { q: query || "all" } });
        const fallbackData = fallback.data.results || fallback.data;
        setUsers(Array.isArray(fallbackData) ? fallbackData : []);
      } catch (e) {
        console.error("Critical: Fallback failed too");
      }
    } finally {
      setLoading(false);
    }
  }, [api, targetUserId]);

  // Initial Load: পেজ ওপেন হওয়ার সাথে সাথে ডিফল্ট ইউজার দেখানোর জন্য
  useEffect(() => {
    if (!targetUserId) {
      loadDiscoveryList(""); 
    }
  }, [targetUserId, loadDiscoveryList]);

  // Search Debounce: ইউজার টাইপ করলে সার্চ করার জন্য
  useEffect(() => {
    if (!targetUserId && searchTerm) {
      const delayDebounceFn = setTimeout(() => {
        loadDiscoveryList(searchTerm);
      }, 500); 
      return () => clearTimeout(delayDebounceFn);
    }
  }, [targetUserId, searchTerm, loadDiscoveryList]);

  const handleFollow = async (targetId) => {
    try {
      // PublicProfile এর এন্ডপয়েন্টের সাথে মিল রেখে আপডেট করা হয়েছে
      await api.post(`/users/follow/${targetId}`);
      toast.success("Neural Link Established!");
    } catch (err) { 
      toast.error("Link Failed: Frequency Mismatch");
    }
  };

  if (targetUserId) {
    return (
      <div className="relative min-h-screen bg-[#020617]">
          <button 
            onClick={() => navigate('/following')} 
            className="fixed top-5 left-5 z-[100] bg-white/10 p-4 rounded-full backdrop-blur-xl border border-white/10 hover:bg-cyan-500/20 transition-all group shadow-2xl"
          >
            <FaArrowLeft className="text-cyan-500 group-hover:-translate-x-1 transition-transform" />
          </button>
          
          <div className="animate-in fade-in zoom-in duration-500">
            {/* PublicProfile এখন সরাসরি id প্যারামস থেকে ডাটা নিবে */}
            <PublicProfile /> 
          </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-transparent min-h-screen max-w-7xl mx-auto selection:bg-cyan-500/30 font-sans">
      
      {/* Header Section */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="animate-in fade-in slide-in-from-left duration-700">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 text-zinc-500 hover:text-cyan-400 transition-colors text-[10px] font-black uppercase tracking-[0.2em] mb-4 group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> 
            Back to Feed
          </button>
          <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter flex items-center gap-4 uppercase">
            <FaRocket className="text-cyan-500 animate-bounce-slow" /> 
            Identity_Scanner
          </h1>
          <p className="text-zinc-600 text-[9px] font-bold tracking-[0.3em] uppercase mt-2">Discover & Link with Neural Nodes</p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-[400px] animate-in fade-in slide-in-from-right duration-700">
          <input 
            type="text" 
            placeholder="SCAN NEURAL ID (NAME, ROLE, SKILL)..." 
            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-[10px] font-bold tracking-widest outline-none focus:border-cyan-500/40 focus:bg-white/[0.05] transition-all backdrop-blur-3xl uppercase placeholder:text-zinc-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-500/50" size={14} />
        </div>
      </div>

      {/* Discovery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {users.length > 0 ? (
          users.map((u) => (
            <div 
              key={u._id} 
              className="backdrop-blur-3xl border rounded-[2.5rem] p-8 transition-all duration-500 group bg-white/[0.02] border-white/5 hover:border-cyan-500/20 hover:bg-white/[0.04] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[80px] group-hover:bg-cyan-500/10 transition-all duration-700" />
              
              <div className="flex flex-col items-center text-center relative z-10">
                <div 
                  className="relative cursor-pointer" 
                  onClick={() => navigate(`/following/${u._id}`)} // URL প্যারামস হিসেবে পাঠানো হচ্ছে
                >
                  <img 
                    src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=0D0D0D&color=06b6d4`} 
                    className="w-28 h-28 rounded-[2.5rem] object-cover border-4 border-white/5 shadow-2xl group-hover:scale-105 group-hover:border-cyan-500/30 transition-all duration-500" 
                    alt={u.username} 
                  />
                  {(u.isVerified || u.role === 'admin') && (
                    <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-black p-2 rounded-full ring-4 ring-[#020617] shadow-[0_0_15px_#06b6d4]">
                      <FaUserCheck size={12} />
                    </div>
                  )}
                </div>
                
                <h3 className="text-white font-black text-2xl mt-6 italic uppercase tracking-tighter group-hover:text-cyan-400 transition-colors">
                  {getDisplayName(u)}
                </h3>
                <p className="text-cyan-500/40 text-[10px] font-black tracking-[0.3em] uppercase mt-2">
                  @{u.username || "drifter"}
                </p>
              </div>
              
              {/* Actions */}
              <div className="mt-10 grid grid-cols-3 gap-4 relative z-10">
                  <button 
                    onClick={() => handleFollow(u._id)} 
                    className="flex flex-col items-center p-4 bg-white/[0.03] border border-white/5 rounded-3xl text-cyan-500 hover:bg-cyan-500 hover:text-black hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    <FaUserPlus size={18} />
                    <span className="text-[8px] font-black mt-2 uppercase tracking-tighter">Link</span>
                  </button>
                  
                  <button 
                    onClick={() => navigate(`/messages?userId=${u._id}`)} 
                    className="flex flex-col items-center p-4 bg-white/[0.03] border border-white/5 rounded-3xl text-purple-500 hover:bg-purple-600 hover:text-white hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    <FaEnvelope size={18} />
                    <span className="text-[8px] font-black mt-2 uppercase tracking-tighter">Comms</span>
                  </button>
                  
                  <button 
                    onClick={() => navigate(`/call/${u._id}`)} 
                    className="flex flex-col items-center p-4 bg-white/[0.03] border border-white/5 rounded-3xl text-emerald-500 hover:bg-emerald-600 hover:text-white hover:scale-105 transition-all duration-300 shadow-lg"
                  >
                    <FaPhoneAlt size={18} />
                    <span className="text-[8px] font-black mt-2 uppercase tracking-tighter">Voice</span>
                  </button>
              </div>
            </div>
          ))
        ) : !loading && (
            <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
                <p className="text-zinc-700 text-xs font-black uppercase tracking-[0.4em]">No Neural Signals Detected</p>
            </div>
        )}
      </div>

      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#000]/60 backdrop-blur-md z-[1000]">
          <div className="w-16 h-16 border-t-2 border-cyan-500 rounded-full animate-spin" />
          <p className="text-cyan-500 text-[10px] font-black uppercase mt-6 animate-pulse">Syncing Network...</p>
        </div>
      )}
    </div>
  );
};

export default FollowingPage;