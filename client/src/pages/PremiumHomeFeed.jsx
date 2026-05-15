import React, { useEffect, useState, useMemo, useCallback, useContext, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios'; 
import { 
  FaHeart, FaRegHeart, FaSearch, FaRegComment, 
  FaImage, FaTimes, FaVolumeUp, FaVolumeMute, FaArrowLeft, FaCog, FaBell, FaUser, FaSignOutAlt
} from 'react-icons/fa';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from "react-hot-toast";
import { AuthContext } from '../context/AuthContext';

// ১. তোমার তৈরি করা নোটিফিকেশন সিস্টেমটি ইম্পোর্ট করো
import NotificationSystem from "../components/NotificationSystem";
let globalIsMuted = true;

const CLOUD_NAME = "dx0cf0ggu";
const UPLOAD_PRESET = "my_onyx_preset"; 

/* ==========================================================
    🧠 স্মার্ট ভিডিও ইঞ্জিন
========================================================== */
const NeuralVideoPlayer = ({ src }) => {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(globalIsMuted);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.6 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  const toggleMute = (e) => {
    e.stopPropagation();
    globalIsMuted = !muted;
    setMuted(!muted);
  };

  return (
    <div className="relative group/video rounded-2xl md:rounded-[32px] overflow-hidden bg-black border border-white/10 shadow-2xl w-full aspect-video flex items-center justify-center">
      <video
        ref={videoRef}
        src={src}
        muted={muted}
        loop
        playsInline
        className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover/video:scale-105"
        onClick={toggleMute}
      />
      <button 
        onClick={toggleMute}
        className="absolute bottom-4 right-4 p-3 bg-black/60 backdrop-blur-xl rounded-full text-white border border-white/10 opacity-0 group-hover/video:opacity-100 transition-all z-20"
      >
        {muted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} className="text-cyan-400" />}
      </button>
    </div>
  );
};

/* ==========================================================
    🚀 ২. প্রোফাইল ড্রপডাউন মেনু (Updated with Notifications)
========================================================== */
const ProfileDropdown = ({ user, logout, navigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-white/10 overflow-hidden cursor-pointer hover:border-cyan-500 transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)]"
      >
        {(user?.avatar || user?.profilePic) ? (
          <img src={user?.avatar || user?.profilePic} className="w-full h-full object-cover" alt="me" />
        ) : (
          <span className="flex items-center justify-center h-full font-black text-white">{user?.firstName?.charAt(0)}</span>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-72 bg-black/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] z-[1000] overflow-hidden"
          >
            <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
               <img src={user?.avatar || user?.profilePic} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt="me" />
               <div className="overflow-hidden">
                  <p className="text-xs font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[9px] text-cyan-500 font-mono tracking-widest uppercase">Neural_Link_Active</p>
               </div>
            </div>

            <div className="py-2 border-b border-white/5 bg-black/40">
                <div className="px-5 py-2 flex justify-between items-center">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Neural Signals</h3>
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                    </span>
                </div>
                <NotificationSystem /> 
            </div>

            <div className="p-2 grid grid-cols-2 gap-1">
              <Link to={`/profile/${user?._id}`} onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/5 text-zinc-400 hover:text-cyan-400 transition-all group">
                <FaUser size={14} className="group-hover:scale-110 transition-all" />
                <span className="text-[9px] font-black uppercase tracking-tighter">Profile</span>
              </Link>
              
              <Link to="/settings" onClick={() => setIsOpen(false)} className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/5 text-zinc-400 hover:text-cyan-400 transition-all group">
                <FaCog size={14} className="group-hover:rotate-90 transition-all duration-500" />
                <span className="text-[9px] font-black uppercase tracking-tighter">Config</span>
              </Link>
            </div>

            <button onClick={logout} className="w-full p-4 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-500/10 transition-all border-t border-white/5 tracking-[0.2em]">
                Disconnect_Node
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ==========================================================
    🚀 ৩. পোস্ট তৈরির কম্পোনেন্ট
========================================================== */
const CreatePost = ({ onPostCreated, api, user }) => {
  const [text, setText] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async () => {
    if (!text.trim() && !media) return toast.error("Transmission data required");
    setLoading(true);
    try {
      let uploadedUrl = "";
      let type = "text";
      if (media) {
        const formData = new FormData();
        formData.append("file", media);
        formData.append("upload_preset", UPLOAD_PRESET); 
        const cloudRes = await axios.post(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, formData);
        uploadedUrl = cloudRes.data.secure_url;
        type = media.type.startsWith("video") ? "video" : "image";
      }
      await api.post("/posts", { text, mediaUrl: uploadedUrl, mediaType: type });
      toast.success("Onyx Synced!");
      setText(""); setMedia(null); setPreview(null);
      if (onPostCreated) onPostCreated();
    } catch (err) { 
      toast.error("Transmission Failed"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="p-6 border-b border-white/5 bg-black">
      <div className="flex gap-4">
        <img 
          src={user?.avatar || user?.profilePic || `https://ui-avatars.com/api/?name=${user?.firstName || 'U'}`} 
          className="w-12 h-12 rounded-2xl object-cover border border-white/10" 
          alt="me"
        />
        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share a neural spark..."
            className="w-full bg-transparent border-none focus:ring-0 text-lg text-white placeholder-zinc-600 resize-none min-h-[60px]"
          />
          {preview && (
            <div className="relative mt-3 rounded-2xl overflow-hidden border border-white/10 max-h-80">
              <button onClick={() => {setMedia(null); setPreview(null);}} className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white z-10">
                <FaTimes size={12} />
              </button>
              {media?.type?.startsWith("video") ? (
                <video src={preview} className="w-full h-full object-cover aspect-video" />
              ) : (
                <img src={preview} className="w-full h-full object-cover aspect-video" alt="p" />
              )}
            </div>
          )}
          <div className="flex justify-between items-center mt-4">
            <button onClick={() => fileInputRef.current.click()} className="text-cyan-500 p-2 hover:bg-cyan-500/10 rounded-xl transition-all">
              <FaImage size={20} />
              <input type="file" ref={fileInputRef} onChange={(e) => { const file = e.target.files[0]; if (file) { setMedia(file); setPreview(URL.createObjectURL(file)); }}} className="hidden" accept="image/*,video/*" />
            </button>
            <button onClick={handleSubmit} disabled={loading} className="bg-white text-black px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-cyan-400 transition-all">
              {loading ? "TRANSMITTING..." : "TRANSMIT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================
    🌌 ৪. মেইন হোম ফিড
========================================================= */
const PremiumHomeFeed = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout, api, loading: isAuthLoading } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Global");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  // --- নতুন সার্চ হ্যান্ডলার (এন্টার চাপলে কাজ করবে) ---
  const handleGlobalSearch = (e) => {
    if (e.key === 'Enter' && localSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(localSearch)}`);
    }
  };

  const fetchPosts = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const res = await api.get("/posts/neural-feed"); 
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) { 
      toast.error("Grid Connection Failed"); 
    } finally { 
      setLoading(false); 
    }
  }, [api, currentUser]);

  useEffect(() => { if (currentUser) fetchPosts(); }, [currentUser, fetchPosts]);

  const handleLike = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await api.post(`/posts/${id}/like`);
      setPosts(prev => prev.map(p => (p._id === id || p.id === id) ? { ...p, likesCount: res.data.likesCount, isLiked: res.data.liked } : p));
    } catch (err) { toast.error("Sync failed"); }
  };

  const handleCommentClick = (postId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!postId) return toast.error("Neural data missing");
    navigate(`/post/${postId}`);
  };

  const filteredPosts = useMemo(() => {
    return posts.filter(p => p.text?.toLowerCase().includes(localSearch.toLowerCase()));
  }, [posts, localSearch]);

  if (isAuthLoading) return <div className="bg-black h-screen flex items-center justify-center font-mono text-cyan-500 animate-pulse uppercase tracking-widest">Initializing_Onyx_Link...</div>;

  return (
    <div className="bg-black min-h-screen text-zinc-300 font-sans">
      <header className="sticky top-0 z-[100] bg-black/90 backdrop-blur-2xl border-b border-white/5 p-4 px-8 flex justify-between items-center">
        <h2 className="text-xl font-black italic tracking-tighter cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>ONYX<span className="text-cyan-500 not-italic font-mono">DRIFT</span></h2>
        
        <div className="flex items-center gap-4">
            <AnimatePresence>
              {isSearchActive && (
                <motion.input 
                  initial={{ width: 0, opacity: 0 }} animate={{ width: 200, opacity: 1 }} exit={{ width: 0, opacity: 0 }} 
                  type="text" 
                  placeholder="Press enter to search..." 
                  value={localSearch} 
                  onChange={(e) => setLocalSearch(e.target.value)} 
                  onKeyDown={handleGlobalSearch} // এন্টার হ্যান্ডলার যুক্ত হলো
                  className="bg-zinc-900 border border-cyan-500/30 rounded-full px-4 py-1 text-xs text-white outline-none font-mono" 
                />
              )}
            </AnimatePresence>
            
            <button onClick={() => setIsSearchActive(!isSearchActive)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all text-zinc-400">
              <FaSearch size={14} />
            </button>

            <ProfileDropdown user={currentUser} logout={logout} navigate={navigate} />
        </div>
      </header>

      <main className="max-w-xl mx-auto border-x border-white/5 min-h-screen bg-black">
        <CreatePost onPostCreated={fetchPosts} api={api} user={currentUser} />

        <div className="flex border-b border-white/5 sticky top-[68px] bg-black/95 backdrop-blur-xl z-40">
          {["Global", "Following"].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] relative transition-all ${activeFilter === f ? "text-cyan-400" : "text-zinc-600 hover:text-zinc-400"}`}>
              {f}{activeFilter === f && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-[2px] bg-cyan-500 shadow-[0_0_10px_#06b6d4]" />}
            </button>
          ))}
        </div>

        <div className="flex flex-col pb-24">
          {filteredPosts.length > 0 ? filteredPosts.map((post) => {
            const author = post.author || {};
            const authorId = author._id || author.id;
            const pid = post._id || post.id;
            const fullName = author.firstName ? `${author.firstName} ${author.lastName || ''}` : "Onyx Drifter";
            const avatar = author.avatar || author.profilePic || `https://ui-avatars.com/api/?name=${fullName}`;
            
            return (
              <motion.article 
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} key={pid} 
                className="p-6 border-b border-white/5 hover:bg-zinc-900/30 transition-colors"
              >
                <div className="flex gap-4">
                  <img 
                    onClick={() => authorId && navigate(`/profile/${authorId}`)}
                    src={avatar} 
                    className="w-12 h-12 rounded-2xl object-cover border border-white/10 cursor-pointer hover:border-cyan-500 transition-all" 
                    alt="av" 
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div onClick={() => authorId && navigate(`/profile/${authorId}`)} className="cursor-pointer group">
                        <h4 className="font-bold text-white leading-none group-hover:text-cyan-400 transition-all">{fullName}</h4>
                        <p className="text-[10px] text-zinc-600 font-mono mt-1">@{author.username || "drifter"}</p>
                      </div>
                    </div>

                    <p className="text-[15px] leading-relaxed text-zinc-300 mt-3 mb-4">{post.text}</p>
                    
                    {post.mediaUrl && (
                      <div className="mb-4">
                        {post.mediaType === 'video' ? (
                          <NeuralVideoPlayer src={post.mediaUrl} />
                        ) : (
                          <div className="rounded-3xl overflow-hidden border border-white/10 bg-zinc-950 shadow-2xl">
                            <img src={post.mediaUrl} className="w-full h-auto max-h-[600px] object-cover" alt="post-media" />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-6 mt-4 text-zinc-500">
                      <button onClick={(e) => handleLike(pid, e)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${post.isLiked ? 'text-rose-500 bg-rose-500/10' : 'hover:bg-white/5'}`}>
                        {post.isLiked ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
                        <span className="text-xs font-bold">{post.likesCount || 0}</span>
                      </button>
                      
                      <button onClick={(e) => handleCommentClick(pid, e)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all text-zinc-400 hover:text-cyan-400">
                        <FaRegComment size={16}/>
                        <span className="text-xs font-bold">{post.commentsCount || (post.comments ? post.comments.length : 0)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          }) : (
            <div className="p-20 text-center text-zinc-600 font-mono text-[10px] uppercase tracking-widest animate-pulse">
              {loading ? "Scanning_Neural_Frequencies..." : "No_Transmissions_In_This_Sector"}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

/* ==========================================================
    👤 ৫. পাবলিক প্রোফাইল
========================================================= */
export const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const targetId = id?.replace(/^:/, '').trim(); 
    if (!targetId || targetId === "undefined" || targetId.length < 12) {
        navigate('/');
        return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/users/profile/${targetId}`);
        if (res.data) {
          setProfile(res.data.user);
          setPosts(Array.isArray(res.data.posts) ? res.data.posts : []);
        }
      } catch (err) { 
        toast.error("Neural link unstable.");
        navigate('/');
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [id, api, navigate]);

  if (loading) return <div className="bg-black h-screen flex items-center justify-center font-mono text-cyan-500 animate-pulse tracking-tighter uppercase">SYNCING_PROFILE_DATA...</div>;

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 p-4 flex items-center gap-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <FaArrowLeft />
        </button>
        <h2 className="font-black text-lg tracking-tight">{profile?.firstName || "Drifter"}</h2>
      </div>
      
      <div className="h-40 bg-zinc-900 border-b border-white/5 relative">
        {profile?.coverImg && <img src={profile.coverImg} className="w-full h-full object-cover" alt="cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      
      <div className="px-6 -mt-12 relative z-10">
        <img 
          src={profile?.avatar || profile?.profilePic || `https://ui-avatars.com/api/?name=${profile?.firstName}`} 
          className="w-24 h-24 rounded-[32px] border-4 border-black object-cover shadow-2xl shadow-cyan-500/20" 
          alt="avatar" 
        />
        <div className="mt-4">
          <h1 className="text-2xl font-black">{profile?.firstName} {profile?.lastName}</h1>
          <p className="text-cyan-500 font-mono text-sm">@{profile?.username || 'unknown'}</p>
          <p className="mt-4 text-zinc-400 text-sm max-w-lg leading-relaxed">{profile?.bio || "No neural bio available."}</p>
        </div>
      </div>

      <div className="mt-8 border-t border-white/5 pb-20">
        <div className="p-4 border-b border-white/5 bg-zinc-900/20 text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Neural Transmissions
        </div>
        {posts.length > 0 ? posts.map(post => {
            const pid = post._id || post.id;
            return (
              <article key={pid} className="p-6 border-b border-white/5 hover:bg-zinc-900/20 transition-all cursor-pointer" onClick={() => navigate(`/post/${pid}`)}>
                <p className="text-zinc-300 mb-4 leading-relaxed">{post.text}</p>
                {post.mediaUrl && (
                  <div className="rounded-[32px] overflow-hidden border border-white/10 max-w-md shadow-xl bg-zinc-950 aspect-video">
                    {post.mediaType === 'video' ? <NeuralVideoPlayer src={post.mediaUrl} /> : <img src={post.mediaUrl} className="w-full h-full object-cover" alt="post-media" />}
                  </div>
                )}
              </article>
            );
        }) : (
          <div className="p-20 text-center text-zinc-600 font-mono text-xs uppercase tracking-widest">No transmissions found.</div>
        )}
      </div>
    </div>
  );
};

export default PremiumHomeFeed;