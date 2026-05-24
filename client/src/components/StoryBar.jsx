import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import StoryCreatorModal from './StoryCreatorModal';
import StoryViewerModal from './StoryViewerModal';

const StoryBar = () => {
  const { user, api, socket } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // মোডাল স্টেট - ট্রিগার করার জন্য
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await api.get('/story/feed'); 
        if (response.data.success) {
          setStories(response.data.data);
        }
      } catch (err) {
        console.error("Transmission error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, [api]);

  return (
    <div className="w-full bg-[#0b0c10] pt-6 pb-4 border-b border-zinc-900/40 select-none">
      <div className="px-5 mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-black tracking-tight text-zinc-100">Onyx Matrix Streams</h2>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto px-5 no-scrollbar active:cursor-grabbing">
        {/* ➕ My Drift Upload - ক্লিক করলে মোডাল ওপেন হবে */}
        <button 
          onClick={() => setIsCreatorOpen(true)}
          className="relative flex-shrink-0 w-[110px] h-[175px] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-900 cursor-pointer group"
        >
          <img src={user?.profilePic || "https://ui-avatars.com/api/?name=Onyx"} className="w-full h-full object-cover opacity-50" alt="Self" />
          <div className="absolute inset-0 flex flex-col justify-between p-3 z-10">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
              <FaPlus className="text-white text-xs" />
            </div>
            <span className="text-zinc-200 text-[11px] font-bold">My Drift</span>
          </div>
        </button>

        {loading ? (
          <div className="flex items-center justify-center w-full">
            <FaSpinner className="animate-spin text-purple-500" />
          </div>
        ) : (
          stories.map((story) => (
            <motion.div 
              key={story._id} 
              whileTap={{ scale: 0.95 }} 
              onClick={() => setSelectedStory(story)} // স্টোরি সিলেক্ট করার হ্যান্ডলার
              className="relative flex-shrink-0 w-[110px] h-[175px] rounded-2xl overflow-hidden border border-zinc-900/60 cursor-pointer"
            >
              <img src={story.mediaUrl} className="w-full h-full object-cover" alt="story" />
              <div className="absolute inset-0 flex flex-col justify-between p-3 z-10">
                <div className="w-9 h-9 rounded-full p-[2px] bg-zinc-700">
                  <img src={story.user?.profilePic} className="w-full h-full rounded-full object-cover" />
                </div>
                <span className="text-zinc-100 text-[11px] font-bold truncate">{story.user?.username}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* মোডাল রেন্ডারিং - শর্তসাপেক্ষে (Conditional Rendering) */}
      {isCreatorOpen && (
        <StoryCreatorModal onClose={() => setIsCreatorOpen(false)} />
      )}
      {selectedStory && (
        <StoryViewerModal story={selectedStory} onClose={() => setSelectedStory(null)} />
      )}
    </div>
  );
};

export default StoryBar;