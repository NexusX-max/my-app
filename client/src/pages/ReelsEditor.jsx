import React, { useState, useEffect, useContext } from 'react';
import MobileFrame from '../components/MobileFrame';
import ReelsEditor from '../components/ReelsEditor';
import NewPostScreen from '../components/NewPostScreen';
import { FILTERS } from '../data/DataTemplates';
import { playSuccessChime, ensureAudioContext } from '../utils/audio';
import { Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function App() {
  // AuthContext থেকে api ইন্সট্যান্সটি নেওয়া হলো (এটি ইন্টারসেপ্টরসহ)
  const { api } = useContext(AuthContext); 
  
  const [activeScreen, setActiveScreen] = useState('editor');
  
  const [sharedPost, setSharedPost] = useState(() => {
    try {
      const saved = localStorage.getItem('onyx_sharedPost');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [reelsData, setReelsData] = useState(() => {
    try {
      const saved = localStorage.getItem('onyx_reelsData');
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const [media, setMedia] = useState(null);
  const [selectedSong, setSelectedSong] = useState(null);
  const [textOverlays, setTextOverlays] = useState([]);
  const [stickers, setStickers] = useState([]);
  const [activeFilter, setActiveFilter] = useState('normal');
  const [filterStrength, setFilterStrength] = useState(100);
  const [adjustments, setAdjustments] = useState({
    brightness: 100, contrast: 100, saturation: 100, blur: 0
  });
  const [canvasRatio, setCanvasRatio] = useState('9:16');
  const [allClips, setAllClips] = useState([]);
  const [activeClipIndex, setActiveClipIndex] = useState(-1);
  const [sharingProgress, setSharingProgress] = useState(0);
  const [sharingLabel] = useState('Extracting soundtrack loops...');
  const [toast, setToast] = useState('');

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => { setToast(''); }, 2800);
  };

  const handleShareReelPost = (info) => {
    const newPost = {
      media, canvasRatio, activeFilter, adjustments, textOverlays, stickers, selectedSong,
      caption: info.caption, tags: info.tags, location: info.location,
      poll: info.poll, prompt: info.prompt, aiLabelOn: info.aiLabelOn,
      timestamp: 'Just now'
    };
    try {
      localStorage.setItem('onyx_sharedPost', JSON.stringify(newPost));
      localStorage.setItem('onyx_reelsData', JSON.stringify([...reelsData, newPost]));
    } catch (e) {}
    setSharedPost(newPost);
    setReelsData(prev => [...prev, newPost]);
    setSharingProgress(0);
    setActiveScreen('sharing');
  };

  // ✅ সমাধান: সরাসরি api ইন্সট্যান্স ব্যবহার করা হয়েছে
  const handleUploadToOnyx = async (specificCaption = null, specificMedia = null) => {
    const postMedia = specificMedia || media;
    const postCaption = specificCaption || "New creation from Voltagram";
    const postType = postMedia?.type || 'video';

    try {
      const postData = { 
        text: postCaption, 
        mediaUrl: postMedia?.url, 
        mediaType: postType, 
        category: postType === 'video' ? 'reels' : 'feed' 
      };
      
      // এখানে api.post ব্যবহার করায় ইন্টারসেপ্টর স্বয়ংক্রিয়ভাবে টোকেন যুক্ত করবে
      await api.post("/posts", postData);
      
      triggerToast("Synced to OnyxDrift Grid!");
      setTimeout(() => { setActiveScreen('editor'); }, 1000);
    } catch (err) {
      console.error("Upload error:", err);
      triggerToast("Sync Failed: Authentication Error");
      setTimeout(() => { setActiveScreen('editor'); }, 1000);
    }
  };

  useEffect(() => {
    if (activeScreen !== 'sharing') return;
    let prg = 0;
    const interval = setInterval(() => {
      prg += 10;
      setSharingProgress(prg);
      if (prg >= 100) {
        clearInterval(interval);
       playSuccessChime();
        setActiveScreen('player');
        triggerToast("🚀 Shared successfully!");
        let finalCaption = "New creation from Voltagram";
        try {
          const saved = localStorage.getItem('onyx_sharedPost');
          if (saved) finalCaption = JSON.parse(saved).caption || finalCaption;
        } catch (e) {}
        handleUploadToOnyx(finalCaption, media);
      }
    }, 180);
    return () => clearInterval(interval);
  }, [activeScreen, media]);

  return (
    <div className="min-h-screen bg-[#07070a] text-neutral-100 font-sans flex flex-col justify-between py-6 px-4">
      <header className="max-w-2xl mx-auto w-full text-center mb-1 space-y-1.5 select-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-900/35 text-xs text-blue-400 font-extrabold tracking-wide uppercase shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
          <span>Pure Reels Editor</span>
        </div>
        <h1 className="text-3xl font-extrabold italic tracking-tight text-white select-none">
          Voltagram <span className="text-blue-500 not-italic">Live</span>
        </h1>
      </header>

      <main className="flex-1 flex items-center justify-center relative my-2">
        <MobileFrame>
          {toast && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-neutral-900 border border-neutral-800 text-white text-[11px] font-bold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          {activeScreen === 'editor' && (
            <ReelsEditor
              media={media} setMedia={setMedia} selectedSong={selectedSong} setSelectedSong={setSelectedSong}
              textOverlays={textOverlays} setTextOverlays={setTextOverlays} stickers={stickers} setStickers={setStickers}
              activeFilter={activeFilter} setActiveFilter={setActiveFilter} filterStrength={filterStrength} setFilterStrength={setFilterStrength}
              adjustments={adjustments} setAdjustments={setAdjustments} canvasRatio={canvasRatio} setCanvasRatio={setCanvasRatio}
              allClips={allClips} setAllClips={setAllClips} activeClipIndex={activeClipIndex} setActiveClipIndex={setActiveClipIndex}
              onNext={() => { ensureAudioContext(); setActiveScreen('new_post'); }}
            />
          )}

          {activeScreen === 'new_post' && (
            <NewPostScreen
              media={media} canvasRatio={canvasRatio} activeFilter={activeFilter} adjustments={adjustments}
              textOverlays={textOverlays} stickers={stickers} selectedSong={selectedSong} setSelectedSong={setSelectedSong}
              onBack={() => setActiveScreen('editor')} onShare={handleShareReelPost}
            />
          )}

          {activeScreen === 'sharing' && (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#010101] text-white p-6 space-y-7 z-50">
              <span className="text-2xl font-black">{sharingProgress}%</span>
              <p className="text-sm font-bold">{sharingLabel}</p>
            </div>
          )}
        </MobileFrame>
      </main>
    </div>
  );
}