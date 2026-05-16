import React, { useState, useContext } from 'react';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import AISearchBar from '../components/AISearchBar';

// --- AUTH CONTEXT IMPORT ---
import { AuthContext } from '../context/AuthContext';

// OnyxMessengerHome থেকে পাঠানো 'onSelect' প্রপটি এখানে রিসিভ করা হয়েছে
const SearchScreen = ({ onBack, onSelect }) => {
  // গ্লোবাল AuthContext থেকে ইউজার ডাটা অ্যাক্সেস করা হচ্ছে (প্রয়োজনে ব্যবহারের জন্য)
  const { user: currentUser } = useContext(AuthContext);
  
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ==========================================================
      ⚡ NEURAL SEARCH ENGINE
  ========================================================== */
  const handleNeuralSearch = async (query) => {
    if (!query || !query.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("onyx_token");

      if (!token) {
        toast.error("Access Denied: Please login again.");
        return;
      }

      const response = await axios.post(
        'https://my-app-3-kn3k.onrender.com', 'https://my-app-2-uzoi.onrender.com','https://my-app-v6xz.onrender.com','https://my-app-4-btda.onrender.com',
        { query: query.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }
      );
      
      // সার্চ রেজাল্ট থেকে নিজের নোড/আইডি স্বয়ংক্রিয়ভাবে ফিল্টার করে বাদ দেওয়া হচ্ছে
      const filteredResults = (response.data.results || []).filter(
        (node) => (node._id || node.id) !== currentUser?._id
      );

      setSearchResults(filteredResults);
    } catch (err) {
      console.error("❌ Neural search error:", err);
      if (err.response?.status === 401) {
        toast.error("Session Expired.");
      } else {
        toast.error("Failed to sync with neural nodes.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    const targetId = user._id || user.id;

    if (!targetId) {
      toast.error("Invalid Node: ID missing.");
      return;
    }

    const userData = {
      _id: targetId,
      fullName: user.fullName || user.username || "Unknown Node",
      profilePic: user.profilePic || user.userAvatar || user.avatar || null,
      online: true 
    };

    // OnyxMessengerHome-এর handleUserSelect ফাংশনটিকে কল করা হচ্ছে
    if (onSelect && typeof onSelect === 'function') {
      onSelect(userData); 
    } else {
      // যদি কোনো কারণে প্রপ না থাকে তবে সরাসরি মেসেজ পেজে নিয়ে যাবে
      navigate(`/messages/${targetId}`);
    }
  };

  return (
    <div className="bg-[#000000] h-screen flex flex-col selection:bg-cyan-500/30 overflow-hidden">
      {/* Header */}
      <header className="p-4 flex items-center gap-4 border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <button 
          onClick={onBack || (() => navigate(-1))} 
          className="p-3 bg-zinc-900 rounded-2xl text-zinc-400 hover:text-white transition-all active:scale-90 border border-white/5"
        >
          <FaArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">Neural Link</h2>
          <p className="text-white text-xs font-bold">Search Nodes</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pt-6 no-scrollbar">
        <div className="px-6">
          <AISearchBar onSearchExecute={handleNeuralSearch} />
        </div>
        
        {/* Results */}
        <div className="mt-8 px-6 space-y-3 pb-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-zinc-600 text-[10px] uppercase tracking-widest animate-pulse">
                Scanning Neural Network...
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map(user => (
              <div 
                key={user._id || user.id} 
                onClick={() => handleUserSelect(user)} 
                className="p-4 bg-zinc-900/30 border border-white/5 rounded-[2rem] flex items-center gap-4 hover:bg-zinc-800/40 hover:border-cyan-500/20 transition-all cursor-pointer group"
              >
                <div className="relative shrink-0">
                  <img 
                    src={user.profilePic || user.userAvatar || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username || "Drifter")}&background=06b6d4&color=fff&bold=true`} 
                    className="w-14 h-14 rounded-2xl object-cover border border-white/10 group-hover:border-cyan-500/50 transition-colors" 
                    alt="" 
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-[#000] rounded-full"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm tracking-tight truncate group-hover:text-cyan-400">
                    {user.fullName || user.username}
                  </h3>
                  <p className="text-zinc-500 text-[10px] font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-cyan-500/40 rounded-full"></span>
                    {user.location || "Global Node"}
                  </p>
                </div>

                <div className="w-9 h-9 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-500 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 border border-dashed border-zinc-900 rounded-[3rem] opacity-60">
              <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">No nodes found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchScreen;