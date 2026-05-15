import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 
import { 
  FaHeart, FaRegHeart, FaComment, FaPaperPlane, 
  FaRegBookmark, FaBookmark, FaEllipsisH, FaTimes 
} from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import toast from "react-hot-toast";

/* ==========================================================
    🛠️ REEL ITEM COMPONENT
   ========================================================== */
const ReelItem = ({ reel }) => {
  const { user: currentUser, api } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState(reel?.isLiked || false);
  const [likeCount, setLikeCount] = useState(reel?.likesCount || reel?.likes?.length || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [isFollowing, setIsFollowing] = useState(reel?.isFollowing || false);
  const [showComments, setShowComments] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false); 
  const [showMore, setShowMore] = useState(false);
  const videoRef = useRef(null);

  const textLimit = 60; 

  // আইডি এবং ডাটা রেজোলিউশন
  const authorId = 
    reel?.author?._id || 
    reel?.author?.id ||
    reel?.user?._id || 
    reel?.user?.id ||
    reel?.authorId || 
    reel?.userId;

  const displayName = reel?.author?.fullName || reel?.user?.fullName || reel?.fullName || reel?.username || "Onyx Drifter";
  const rawUsername = reel?.author?.username || reel?.user?.username || reel?.username || "drifter";
  const formattedUsername = String(rawUsername).toLowerCase().replace(/\s+/g, '');
  const avatarUrl = reel?.author?.profilePic || reel?.user?.profilePic || reel?.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}`;

  const handleProfileClick = (e) => {
    if(e) { e.preventDefault(); e.stopPropagation(); }

    if (!authorId) {
      toast.error("Neural link broken: ID not found");
      return;
    }

    const cleanAuthorId = String(authorId).replace(/^:/, '').trim();
    const currentUserId = currentUser?._id || currentUser?.id;
    const cleanCurrentId = currentUserId ? String(currentUserId).replace(/^:/, '').trim() : null;

    if (cleanCurrentId && cleanAuthorId === cleanCurrentId) {
      navigate("/my-profile");
    } else {
      navigate(`/profile/${cleanAuthorId}`);
    }
  };

  const handleLike = async (e) => {
    if(e) e.stopPropagation();
    const newLikedState = !liked;
    const reelId = reel?._id || reel?.id;
    setLiked(newLikedState);
    setLikeCount(newLikedState ? likeCount + 1 : likeCount - 1);

    try {
      await api.post(`/posts/${reelId}/like`);
    } catch (err) { 
      setLiked(!newLikedState);
      setLikeCount(liked ? likeCount : likeCount - 1);
      toast.error("Signal lost");
    }
  };

  const handleFollow = async (e) => {
    if(e) e.stopPropagation(); 
    if (!authorId) return;
    const prevFollowing = isFollowing;
    setIsFollowing(!isFollowing);
    try {
      await api.post(`/users/follow/${authorId}`);
      toast.success(isFollowing ? "Disconnected" : "Neural Link Established");
    } catch (err) {
      setIsFollowing(prevFollowing); 
      toast.error("Transmission failed");
    }
  };

  const handleShare = (e) => {
    if(e) e.stopPropagation();
    const shareUrl = `${window.location.origin}/post/${reel?._id || reel?.id}`;
    if (navigator.share) {
      navigator.share({ title: `OnyxDrift`, text: reel?.caption || "Neural content detected!", url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link synced to clipboard!");
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setPlaying(true);
        } else {
          videoRef.current?.pause();
          setPlaying(false);
        }
      }, { threshold: 0.8 }
    );
    if (videoRef.current) observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative w-full h-[100dvh] snap-start bg-black flex flex-col items-center justify-center overflow-hidden">
      <div className="relative w-full max-w-[420px] h-full bg-black overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          onClick={() => { 
            if (videoRef.current) {
                videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
                setPlaying(!videoRef.current.paused);
            }
          }}
          src={reel?.mediaUrl || reel?.videoUrl}
          className="w-full h-full object-cover cursor-pointer"
          loop playsInline
        />

        <div className="absolute top-12 left-6 z-20">
          <button onClick={() => navigate(-1)} className="bg-black/30 backdrop-blur-md p-2.5 rounded-full text-white active:scale-90 transition-transform">
            <IoIosArrowBack size={22} />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 pb-12 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10 text-white pointer-events-none">
          <div className="pointer-events-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 cursor-pointer group" onClick={handleProfileClick}>
                <div className="relative">
                  <img src={avatarUrl} className="w-12 h-12 rounded-full border-2 border-cyan-500/50 p-0.5 object-cover" alt="avatar" />
                  <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-pulse -z-10"></div>
                </div>
                
                {/* 🛠️ ইউজারনেম এবং ফলো বাটন সেকশন (পছন্দমতো আপডেট করা হয়েছে) */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    {/* Username (@drifter_2298) এখন মেইন টেক্সট */}
                    <h4 className="text-[14px] font-black tracking-tight group-hover:text-cyan-400 transition-colors leading-none">
                        @{formattedUsername}
                    </h4>
                    {currentUser && authorId && String(authorId).replace(/^:/, '') !== String(currentUser?._id || currentUser?.id).replace(/^:/, '') && (
                        <button 
                        onClick={handleFollow}
                        className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase transition-all active:scale-95 border border-white/20 ${isFollowing ? 'bg-white/5 text-zinc-500' : 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.3)]'}`}
                        >
                        {isFollowing ? 'Following' : 'Follow'}
                        </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[13px] text-zinc-200 mb-6 leading-snug font-medium max-w-[85%]">
              <p>
                {isExpanded ? (reel?.caption || reel?.text) : `${(reel?.caption || reel?.text || "").substring(0, textLimit)}`}
                {((reel?.caption?.length || reel?.text?.length) > textLimit) && (
                  <button onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }} className="ml-2 text-cyan-400 font-black uppercase text-[10px] hover:underline">
                    {isExpanded ? " See less" : "... See more"}
                  </button>
                )}
              </p>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-white/5">
              <div className="flex items-center gap-8">
                 <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={handleLike}>
                    {liked ? <FaHeart className="text-rose-500 scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]" size={24}/> : <FaRegHeart className="group-hover:text-rose-400 transition-colors" size={24}/>}
                    <span className="text-[11px] font-black">{likeCount}</span>
                 </div>
                 <div className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={(e) => { e.stopPropagation(); setShowComments(true); }}>
                    <FaComment className="group-hover:text-cyan-400 transition-colors" size={24}/>
                    <span className="text-[11px] font-black">{reel?.commentsCount || 0}</span>
                 </div>
              </div>
              <div className="flex items-center gap-6">
                 <button onClick={handleShare} className="active:scale-90 transition-transform"><FaPaperPlane size={20} className="rotate-12 opacity-90 hover:text-cyan-400" /></button>
                 <button onClick={(e) => { e.stopPropagation(); setIsSaved(!isSaved); }} className="active:scale-90 transition-transform">
                    {isSaved ? <FaBookmark size={20} className="text-cyan-400" /> : <FaRegBookmark size={20} className="opacity-90 hover:text-cyan-400" />}
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); setShowMore(true); }} className="active:scale-90 transition-transform"><FaEllipsisH size={20} className="opacity-90 hover:text-cyan-400" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================
    👤 PUBLIC PROFILE COMPONENT
   ========================================================== */
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

  if (loading) return <div className="h-screen bg-black flex items-center justify-center text-cyan-500 font-black">SYNCING_PROFILE...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <button onClick={() => navigate(-1)} className="mb-6 bg-white/5 p-3 rounded-full"><IoIosArrowBack size={20}/></button>
      <div className="flex flex-col items-center">
        <img src={profile?.profilePic || profile?.avatar} className="w-24 h-24 rounded-full border-2 border-cyan-500 mb-4" alt="profile"/>
        <h2 className="text-2xl font-black">{profile?.fullName}</h2>
        <p className="text-zinc-500 font-bold mb-6">@{profile?.username}</p>
        
        <div className="grid grid-cols-3 gap-1 w-full">
          {posts.map(post => (
            <div key={post._id} className="aspect-square bg-zinc-900 overflow-hidden">
               {post.mediaUrl?.includes('video') ? (
                 <video src={post.mediaUrl} className="w-full h-full object-cover" />
               ) : (
                 <img src={post.mediaUrl} className="w-full h-full object-cover" alt="post" />
               )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ==========================================================
    🚀 REELS FEED COMPONENT
   ========================================================== */
const ReelsFeed = ({ reels = [] }) => {
  if (!reels || reels.length === 0) return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
      <p className="text-[10px] text-cyan-500 font-black tracking-widest uppercase animate-pulse">Syncing_Neural_Feed</p>
    </div>
  );

  return (
    <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth">
      {reels.map((reel) => (
        <ReelItem key={reel?._id || reel?.id || Math.random()} reel={reel} />
      ))}
    </div>
  );
};

export default ReelsFeed;