import React, { useState, useContext, useEffect, useRef } from 'react';
import { 
  CheckCircle, Camera, Edit3, Plus, Loader2, X, Heart, MessageCircle, 
  Pin, Globe, MapPin, Play, Send, Volume2, VolumeX, Image, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthContext } from '../context/AuthContext';

const MyProfile = () => {
  // Extract user global profile and raw api instance from custom context
  const { user: contextUser, api } = useContext(AuthContext);
  
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Active view tab state (photos or videos)
  const [activeTab, setActiveTab] = useState('photos'); // 'photos' | 'videos'

  // Full-screen media view states
  const [selectedPhotoPost, setSelectedPhotoPost] = useState(null);
  const [selectedVideoPost, setSelectedVideoPost] = useState(null);
  const [videoCommentsVisible, setVideoCommentsVisible] = useState(true);

  // Form input states
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    website: ''
  });

  // Client-side instant input validation error tracker
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    website: ''
  });

  // New log transmission draft state
  const [newPostData, setNewPostData] = useState({
    text: '',
    mediaType: 'photo',
    mediaUrl: '',
    badge: 'Just seen',
    pinned: false
  });
  const [createPostLoading, setCreatePostLoading] = useState(false);
  const [createPostError, setCreatePostError] = useState('');

  // Local comments draft inputs
  const [newCommentText, setNewCommentText] = useState("");
  const [newReelsCommentText, setNewReelsCommentText] = useState("");

  // Video media elements settings
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  // Initialize data on user sync
  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
      setEditData({
        firstName: contextUser.firstName || '',
        lastName: contextUser.lastName || '',
        bio: contextUser.bio || '',
        location: contextUser.location || '',
        website: contextUser.website || ''
      });
    }
    fetchMyData();
    fetchMyPosts(); 
  }, [contextUser]);

  // Retrieve user payload from authentication token / profile-me route
  const fetchMyData = async () => {
    try {
      const res = await api.get('/profile/me');
      setUser(res.data);
      setEditData({
        firstName: res.data.firstName || '',
        lastName: res.data.lastName || '',
        bio: res.data.bio || '',
        location: res.data.location || '',
        website: res.data.website || ''
      });
      setLoading(false);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setLoading(false);
    }
  };

  // Retrieve posts payload from database route
  const fetchMyPosts = async () => {
    try {
      setPostsLoading(true);
      const res = await api.get('/posts/me');
      setPosts(res.data);
      setPostsLoading(false);
    } catch (err) {
      console.error("Posts fetch error:", err);
      setPostsLoading(false);
    }
  };

  // Real-time Input Validator
  const validateField = (name, value) => {
    let message = '';
    
    if (name === 'firstName' || name === 'lastName') {
      const fieldLabel = name === 'firstName' ? 'First name' : 'Last name';
      if (!value.trim()) {
        message = `${fieldLabel} is strictly required.`;
      } else if (value.trim().length < 2) {
        message = `${fieldLabel} must consist of at least 2 characters.`;
      } else if (value.trim().length > 20) {
        message = `${fieldLabel} range limit is 20 characters maximum.`;
      } else {
        const lettersOnly = /^[a-zA-Z\s\u0980-\u09FF]+$/;
        if (!lettersOnly.test(value)) {
          message = `${fieldLabel} protocol requires standard alphabetical letters only.`;
        }
      }
    }

    if (name === 'bio') {
      if (value && value.length > 160) {
        message = `Bio footprint limit is 160. (Passed: ${value.length}).`;
      }
    }

    if (name === 'location') {
      if (value && value.length > 50) {
        message = `Location coordinates cannot exceed 50 characters.`;
      }
    }

    if (name === 'website') {
      if (value && value.trim() !== '') {
        const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;
        if (!pattern.test(value)) {
          message = 'Transmission target link must be a valid URL formatted correctly.';
        }
      }
    }

    setErrors(prev => ({ ...prev, [name]: message }));
    return message === '';
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // Avatar/Cover graphic upload controller
  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append(type, file);

    try {
      const res = await api.put('/profile/update', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUser(res.data); 
      await fetchMyData(); 
    } catch (err) {
      console.error("Upload error:", err);
      alert("Synchronizer upload terminal returned error. Verify image network size.");
    }
  };

  // Identity sync with validation audit triggers and state handlers
  const handleUpdateText = async (e) => {
    e.preventDefault();

    // Audit trace all fields prior to sending payload
    const isFirstVal = validateField('firstName', editData.firstName);
    const isLastVal = validateField('lastName', editData.lastName);
    const isBioVal = validateField('bio', editData.bio);
    const isLocVal = validateField('location', editData.location);
    const isWebVal = validateField('website', editData.website);

    if (!isFirstVal || !isLastVal || !isBioVal || !isLocVal || !isWebVal) {
      return; 
    }

    try {
      const res = await api.put('/profile/update', editData);
      setUser(res.data);
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to synchronize digital identity records.");
    }
  };

  // Handle reading local file upload and converting to base64 Data URL
  const handlePostFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      setCreatePostError("File size is too heavy. Maximum 50MB is allowed.");
      return;
    }

    const isVideo = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewPostData(prev => ({
        ...prev,
        mediaType: isVideo ? 'video' : 'photo',
        mediaUrl: event.target.result,
        badge: isVideo ? 'Reel' : 'Snap'
      }));
    };
    reader.readAsDataURL(file);
  };

  // Create standard user-authored post logging action
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostData.text.trim()) {
      setCreatePostError("Text index cannot be blank.");
      return;
    }

    setCreatePostLoading(true);
    setCreatePostError("");

    try {
      let finalMediaUrl = newPostData.mediaUrl.trim();
      if (!finalMediaUrl) {
        if (newPostData.mediaType === 'photo') {
          // Dynamic aesthetic cyber Unsplash placeholders
          const rand = Math.floor(Math.random() * 100);
          finalMediaUrl = `https://images.unsplash.com/photo-${1550745165 + rand}?q=80&w=800&auto=format&fit=crop`;
        } else {
          // Mixkit stable high-definition web streams
          const preloadedVideos = [
            "https://assets.mixkit.co/videos/preview/mixkit-futuristic-subway-station-with-neon-lights-43956-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-neon-lines-41398-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-spinning-futuristic-car-wheel-38681-large.mp4"
          ];
          finalMediaUrl = preloadedVideos[Math.floor(Math.random() * preloadedVideos.length)];
        }
      }

      await api.addPost({
        text: newPostData.text,
        mediaType: newPostData.mediaType,
        mediaUrl: finalMediaUrl,
        image: newPostData.mediaType === 'photo' ? finalMediaUrl : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800",
        badge: newPostData.badge || null,
        pinned: newPostData.pinned
      });

      // Clear layout payload states
      setNewPostData({
        text: '',
        mediaType: 'photo',
        mediaUrl: '',
        badge: 'Just seen',
        pinned: false
      });
      setIsCreateModalOpen(false);
      setCreatePostLoading(false);
      await fetchMyPosts();
    } catch(err) {
      console.error(err);
      setCreatePostError("Failed to deploy transmission node.");
      setCreatePostLoading(false);
    }
  };

  // Filter content for active grids
  const getFilteredPhotos = () => posts.filter(p => !p.mediaType || p.mediaType === 'photo' || p.mediaType === 'image');
  const getFilteredVideos = () => posts.filter(p => p.mediaType === 'video' || p.mediaType === 'reels');

  // Interactive like trigger with instant sync and local fallback
  const handleLikePost = async (postId, tabType) => {
    const activeUsername = user?.username || "Anonymous";
    try {
      if (api && typeof api.toggleLike === 'function') {
        await api.toggleLike(postId, activeUsername);
      }
    } catch (err) {
      console.error("api.toggleLike failed, performing client-side toggle fallback:", err);
    }

    // Always synchronize local cached array to guarantee instant visual response
    setPosts(prev => {
      const updatedPosts = prev.map(p => {
        if (p._id === postId) {
          const alreadyLiked = p.likes ? p.likes.includes(activeUsername) : false;
          let newLikes = p.likes ? [...p.likes] : [];
          if (alreadyLiked) {
            newLikes = newLikes.filter(u => u !== activeUsername);
          } else {
            newLikes.push(activeUsername);
          }
          const updated = { ...p, likes: newLikes };
          
          // Re-sync open view modals immediately
          if (selectedPhotoPost && selectedPhotoPost._id === postId) {
            setSelectedPhotoPost(updated);
          }
          if (selectedVideoPost && selectedVideoPost._id === postId) {
            setSelectedVideoPost(updated);
          }
          return updated;
        }
        return p;
      });
      localStorage.setItem('posts_real_01', JSON.stringify(updatedPosts));
      return updatedPosts;
    });
  };

  // Add Comment on selected photo with local fallback
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedPhotoPost) return;

    const activeUser = user?.username || "You";
    const tempCommentId = 'comm_' + Date.now();
    let newComment = {
      id: tempCommentId,
      user: activeUser,
      text: newCommentText.trim(),
      time: "Just now"
    };

    try {
      if (api && typeof api.addComment === 'function') {
        const res = await api.addComment(selectedPhotoPost._id, {
          user: activeUser,
          text: newCommentText.trim()
        });
        if (res && res.data) {
          newComment = res.data;
        }
      }
    } catch (err) {
      console.error("api.addComment failed, performing client-side comment local fallback:", err);
    }

    // Always sync active view and posts list locally
    const updatedPost = {
      ...selectedPhotoPost,
      comments: [...(selectedPhotoPost.comments || []), newComment]
    };
    setSelectedPhotoPost(updatedPost);
    
    setPosts(prev => {
      const updatedPosts = prev.map(p => p._id === selectedPhotoPost._id ? updatedPost : p);
      localStorage.setItem('posts_real_01', JSON.stringify(updatedPosts));
      return updatedPosts;
    });
    setNewCommentText("");
  };

  // Add Comment on Reels screen with local fallback
  const handleAddReelsComment = async (e) => {
    e.preventDefault();
    if (!newReelsCommentText.trim() || !selectedVideoPost) return;

    const activeUser = user?.username || "You";
    const tempCommentId = 'comm_' + Date.now();
    let newComment = {
      id: tempCommentId,
      user: activeUser,
      text: newReelsCommentText.trim(),
      time: "Just now"
    };

    try {
      if (api && typeof api.addComment === 'function') {
        const res = await api.addComment(selectedVideoPost._id, {
          user: activeUser,
          text: newReelsCommentText.trim()
        });
        if (res && res.data) {
          newComment = res.data;
        }
      }
    } catch (err) {
      console.error("api.addComment failed on reels comment, performing client fallback:", err);
    }

    // Always sync active view and posts list locally
    const updatedPost = {
      ...selectedVideoPost,
      comments: [...(selectedVideoPost.comments || []), newComment]
    };
    setSelectedVideoPost(updatedPost);
    
    setPosts(prev => {
      const updatedPosts = prev.map(p => p._id === selectedVideoPost._id ? updatedPost : p);
      localStorage.setItem('posts_real_01', JSON.stringify(updatedPosts));
      return updatedPosts;
    });
    setNewReelsCommentText("");
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F14] flex flex-col items-center justify-center gap-3">
      <Loader2 className="text-[#1877F2] animate-spin" size={36} />
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Loading Profile...</span>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 bg-[#0B0F14] text-[#E5E7EB] font-sans antialiased selection:bg-[#1877F2]/20 select-none">
      
      {/* Cover Backdrop Area */}
      <div className="relative h-48 md:h-64 w-full bg-zinc-950 overflow-hidden border-b border-white/5">
        <img 
          src={user?.coverImg || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070"} 
          className="w-full h-full object-cover brightness-[0.5] transition-all duration-700 hover:scale-105"
          alt="cover"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-[#0B0F14]/20 to-transparent" />
        
        {/* Update Cover Button */}
        <label className="absolute bottom-4 right-4 p-2.5 bg-black/60 hover:bg-[#1877F2] hover:text-white backdrop-blur-xl border border-white/10 rounded-2xl text-white text-[10px] cursor-pointer transition-all flex items-center gap-2 group z-10 font-bold uppercase tracking-wider">
          <Camera size={14} className="text-[#1877F2] group-hover:text-white transition-colors" /> 
          <span>Update Cover</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'coverImg')} />
        </label>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative -mt-16">
        <div className="flex flex-col items-center md:items-start md:flex-row md:gap-6">
          
          {/* Circular Hologram Avatar Frame */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-[#1877F2]/20 blur-xl opacity-80 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-[#0B0F14] overflow-hidden shadow-[0_0_50px_rgba(24,119,242,0.15)] bg-[#121821]">
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName || 'O'}&background=1877F2&color=fff`} 
                className="w-full h-full object-cover transition-transform duration-550 group-hover:scale-105"
                alt="profile avatar"
                onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"; }}
              />
            </div>
            
            <label className="absolute bottom-2 right-2 p-2.5 bg-[#1877F2] border-4 border-[#0B0F14] rounded-full text-white cursor-pointer shadow-xl z-20 hover:scale-115 hover:bg-[#1877F2]/90 active:scale-95 transition-all">
              <Camera size={18} />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, 'avatar')} />
            </label>
          </div>

          {/* Identity Info Details */}
          <div className="mt-4 md:mt-24 flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter text-white">
                {user?.firstName} {user?.lastName}
              </h1>
              <CheckCircle className="text-[#1877F2] shrink-0" size={22} fill="#1877F2" />
            </div>
            
            <p className="text-[#1877F2] font-black tracking-[0.3em] text-[10px] mt-1.5 uppercase opacity-85">
              @{user?.username || 'anando_c'}
            </p>

            {/* Location & website anchors */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-xs text-zinc-400 font-bold font-mono">
              {user?.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} className="text-zinc-500" />
                  {user.location}
                </span>
              )}
              {user?.website && (
                <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[#1877F2] hover:underline">
                  <Globe size={12} />
                  {user.website.replace(/^https?:\/\//i, '')}
                </a>
              )}
            </div>

            {/* Styled Bio statement */}
            <p className="mt-4 text-xs md:text-sm text-zinc-400 max-w-lg mx-auto md:mx-0 leading-relaxed italic">
              "{user?.bio || 'No bio written yet.'}"
            </p>
            
            {/* Live profile stats */}
            <div className="flex gap-6 mt-6 justify-center md:justify-start">
              <div className="text-center md:text-left">
                <span className="block font-black text-xl text-white">{posts?.length || 0}</span>
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Posts</span>
              </div>
              <div className="border-x border-white/5 px-6 text-center md:text-left">
                <span className="block font-black text-xl text-white">{user?.followersCount || 0}</span>
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Followers</span>
              </div>
              <div className="text-center md:text-left">
                <span className="block font-black text-xl text-white">{user?.followingCount || 0}</span>
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Following</span>
              </div>
            </div>
          </div>

          {/* Header actions */}
          <div className="mt-6 md:mt-28 flex gap-3">
            <button 
              onClick={() => {
                setErrors({ firstName: '', lastName: '', bio: '', location: '', website: '' });
                setIsEditModalOpen(true);
              }} 
              className="bg-zinc-805 bg-zinc-900 hover:bg-[#1877F2] border border-white/5 text-white px-5 py-3 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center gap-2 tracking-widest"
            >
              <Edit3 size={14} /> Edit Profile
            </button>
            <button 
              onClick={() => {
                setCreatePostError("");
                setIsCreateModalOpen(true);
              }}
              className="bg-[#1877F2] text-white p-3.5 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={22} />
            </button>
          </div>
        </div>

        {/* --- DUAL TABS ON THE PROFILE PAGE FOR PHOTOS / VIDEOS --- */}
        <div className="mt-16 border-t border-white/5 pt-8">
          
          {/* Segmented Dual Bar Tab Selector - Optimized for stunning responsive layouts with elegant icons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="grid grid-cols-2 sm:flex bg-[#121821] p-1.5 rounded-2xl border border-white/5 w-full sm:w-auto">
              <button 
                onClick={() => setActiveTab('photos')}
                className={`relative px-6 py-2.5 rounded-xl transition-all flex items-center justify-center ${
                  activeTab === 'photos' ? 'bg-[#1877F2] text-white shadow-md' : 'text-zinc-500 hover:text-white'
                }`}
                title={`Photos (${getFilteredPhotos().length})`}
              >
                <Image size={18} className="shrink-0" />
              </button>
              
              <button 
                onClick={() => setActiveTab('videos')}
                className={`relative px-6 py-2.5 rounded-xl transition-all flex items-center justify-center ${
                  activeTab === 'videos' ? 'bg-[#1877F2] text-white shadow-md' : 'text-zinc-500 hover:text-white'
                }`}
                title={`Videos (${getFilteredVideos().length})`}
              >
                <Video size={18} className="shrink-0" />
              </button>
            </div>

            <div className="hidden sm:block h-[1px] flex-1 bg-gradient-to-r from-white/5 to-transparent"></div>
            
            <span className="text-[10px] uppercase font-mono font-bold text-zinc-500 tracking-wider">
              Your Captured Media
            </span>
          </div>

          {postsLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-[#1877F2]" size={36} />
            </div>
          ) : (
            <div>
              {/* PHOTOS TAB - Aesthetic 3-Column Image Feed Grid */}
              {activeTab === 'photos' && (
                <div>
                  {getFilteredPhotos().length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6">
                      {getFilteredPhotos().map((post, idx) => (
                        <div 
                          key={post._id || `photo-post-${idx}`} 
                          onClick={() => setSelectedPhotoPost(post)}
                          className="relative aspect-square rounded-xl md:rounded-[1.8rem] overflow-hidden bg-black border border-white/5 hover:border-[#1877F2]/40 transition-all duration-300 cursor-pointer group shadow-xl"
                        >
                          <img 
                            src={post.image || post.mediaUrl || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600"} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            alt="transmission snap" 
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600"; }}
                          />
                          
                          {/* Pin indicator on cover screen if post is pinned */}
                          {post.pinned && (
                            <div className="absolute top-2 right-2 md:top-3 md:right-3 p-1 md:p-1.5 bg-black/60 border border-white/10 rounded-lg md:rounded-xl text-[#1877F2] z-10 transition-transform group-hover:scale-110">
                              <Pin size={8} className="transform rotate-45 stroke-[3px]" />
                            </div>
                          )}

                          {/* Hover Overlay with Live Stats */}
                          <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 md:gap-6 text-[10px] md:text-sm font-black uppercase text-white">
                            <span className="flex items-center gap-0.5 md:gap-1 text-rose-500">
                              <Heart size={12} fill="currentColor" /> {post.likes?.length || 0}
                            </span>
                            <span className="flex items-center gap-0.5 md:gap-1 text-[#1877F2]">
                              <MessageCircle size={12} fill="currentColor" /> {post.comments?.length || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                      <p className="text-zinc-600 font-bold uppercase tracking-[0.2em] mb-4 text-xs">No photo logs found.</p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <button 
                          onClick={() => {
                            setNewPostData(prev => ({ ...prev, mediaType: 'photo' }));
                            setIsCreateModalOpen(true);
                          }}
                          className="bg-[#1877F2] text-white hover:brightness-110 text-xs font-bold uppercase px-4 py-2.5 rounded-xl transition-all"
                        >
                          Create Photo Post
                        </button>
                        <button 
                          onClick={() => {
                            localStorage.removeItem('posts_real_01');
                            window.location.reload();
                          }}
                          className="bg-zinc-900 border border-white/10 hover:border-[#1877F2]/40 text-xs font-bold uppercase px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white transition-all"
                        >
                          Reset Demo Feed
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIDEOS TAB - Styled EXACTLY like the user screen containing pin on top-right, badge with text on bottom-left, etc. */}
              {activeTab === 'videos' && (
                <div>
                  {getFilteredVideos().length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6">
                      {getFilteredVideos().map((post, idx) => (
                        <div 
                          key={post._id || `video-post-${idx}`} 
                          onClick={() => setSelectedVideoPost(post)}
                          className="relative aspect-square rounded-xl md:rounded-[1.8rem] overflow-hidden bg-zinc-950 border border-white/5 hover:border-[#1877F2]/40 transition-all duration-300 cursor-pointer group shadow-xl"
                        >
                          {/* Cover Video/Poster Frame Extraction */}
                          {post.mediaUrl ? (
                            <video 
                              src={post.mediaUrl} 
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-75 pointer-events-none" 
                              preload="metadata"
                              playsInline
                              muted
                            />
                          ) : (
                            <img 
                              src={post.image || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400"} 
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 brightness-75" 
                              alt="video thumbnail" 
                              referrerPolicy="no-referrer"
                              onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=400"; }}
                            />
                          )}
                          
                          {/* Inner Shadow Mesh Graphic overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 group-hover:bg-black/50 transition-colors pointer-events-none" />

                          {/* Top row elements - Badge (left) and pin thumbtack (right, if pinned) */}
                          <div className="absolute top-2 md:top-3.5 inset-x-2 md:inset-x-3.5 flex justify-between items-center pointer-events-none z-10">
                            <span className="p-0.5 md:p-1 px-1 md:px-1.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-white text-[7px] md:text-[8px] font-black uppercase tracking-widest scale-90 origin-left">
                              {post.badge || "Reel"}
                            </span>
                            
                            {post.pinned && (
                              <div className="p-1 md:p-1.5 bg-black/60 border border-white/10 rounded-lg text-white">
                                <Pin size={8} className="transform rotate-45 stroke-[3.5px] text-[#1877F2]" />
                              </div>
                            )}
                          </div>

                          {/* Bottom elements - "Just seen" overlay on left, Play symbol overlay on right */}
                          <div className="absolute bottom-2 md:bottom-3.5 inset-x-2 md:inset-x-3.5 flex items-end justify-between pointer-events-none z-10">
                            <span className="text-[8px] md:text-[10px] font-black tracking-wide text-zinc-300 italic drop-shadow-md truncate max-w-[65%]">
                              {post.badge === "Just seen" ? "Just seen" : "Video Stream"}
                            </span>
                            
                            <div className="p-1 md:p-2 bg-black/60 border border-white/10 backdrop-blur-md rounded-full text-white scale-75 md:scale-95 group-hover:scale-105 transition-transform shrink-0">
                              <Play size={8} className="fill-white shrink-0" />
                            </div>
                          </div>

                          {/* Grid center hover metrics overlay */}
                          <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 md:gap-5 text-[10px] md:text-xs font-black uppercase text-white z-20">
                            <span className="flex items-center gap-0.5 md:gap-1.5 text-rose-500">
                              <Heart size={12} fill="currentColor" /> {post.likes?.length || 0}
                            </span>
                            <span className="flex items-center gap-0.5 md:gap-1.5 text-[#1877F2]">
                              <MessageCircle size={12} fill="currentColor" /> {post.comments?.length || 0}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                      <p className="text-zinc-600 font-bold uppercase tracking-[0.2em] mb-4 text-xs">No video entries found.</p>
                      <div className="flex flex-wrap justify-center gap-3">
                        <button 
                          onClick={() => {
                            setNewPostData(prev => ({ ...prev, mediaType: 'video' }));
                            setIsCreateModalOpen(true);
                          }}
                          className="bg-[#1877F2] text-white hover:brightness-110 text-xs font-bold uppercase px-4 py-2.5 rounded-xl transition-all"
                        >
                          Create Video Post
                        </button>
                        <button 
                          onClick={() => {
                            localStorage.removeItem('posts_real_01');
                            window.location.reload();
                          }}
                          className="bg-zinc-900 border border-white/10 hover:border-[#1877F2]/40 text-xs font-bold uppercase px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white transition-all"
                        >
                          Reset Demo Feed
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- EDIT IDENTITY MODAL with Live-Validating Fields --- */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="bg-[#121821] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white bg-zinc-950 rounded-xl"
                title="Cancel changes"
              >
                <X size={18} />
              </button>

              <div className="mb-6">
                <span className="text-[9px] font-black tracking-[0.3em] text-[#1877F2] uppercase block">Profile Details</span>
                <h2 className="text-2xl font-black uppercase italic mb-8 tracking-tighter text-white">Edit <span className="text-[#1877F2]">Profile</span></h2>
              </div>

              <form onSubmit={handleUpdateText} className="space-y-4">
                
                {/* Names input rows */}
                <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1 font-mono">First Name</label>
                    <input 
                      type="text" 
                      name="firstName"
                      placeholder="Anando" 
                      className={`w-full bg-[#0B0F14] border ${errors.firstName ? 'border-rose-500 bg-rose-950/20' : 'border-white/5'} p-4 rounded-2xl focus:border-[#1877F2] outline-none text-white font-bold text-sm transition-all`} 
                      value={editData.firstName} 
                      onChange={handleEditChange} 
                    />
                    {errors.firstName && (
                      <span className="text-[9px] font-bold text-rose-500 uppercase font-mono mt-0.5 block">{errors.firstName}</span>
                    )}
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1 font-mono">Last Name</label>
                    <input 
                      type="text" 
                      name="lastName"
                      placeholder="Chowdhury" 
                      className={`w-full bg-[#0B0F14] border ${errors.lastName ? 'border-rose-500 bg-rose-950/20' : 'border-white/5'} p-4 rounded-2xl focus:border-[#1877F2] outline-none text-white font-bold text-sm transition-all`} 
                      value={editData.lastName} 
                      onChange={handleEditChange} 
                    />
                    {errors.lastName && (
                      <span className="text-[9px] font-bold text-rose-500 uppercase font-mono mt-0.5 block">{errors.lastName}</span>
                    )}
                  </div>
                </div>

                {/* Bio area */}
                <div>
                  <div className="flex justify-between items-center mb-1 font-mono">
                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Personal Bio</label>
                    <span className={`text-[8.5px] ${editData.bio.length > 160 ? 'text-rose-500' : 'text-zinc-550'}`}>{editData.bio.length}/160</span>
                  </div>
                  <textarea 
                    name="bio"
                    placeholder="Write a brief bio..." 
                    className={`w-full bg-[#0B0F14] border ${errors.bio ? 'border-rose-500 bg-rose-950/20' : 'border-white/5'} p-4 rounded-2xl focus:border-[#1877F2] outline-none text-white h-24 font-bold text-xs resize-none transition-all`} 
                    value={editData.bio} 
                    onChange={handleEditChange} 
                  />
                  {errors.bio && (
                    <span className="text-[9px] font-bold text-rose-500 uppercase font-mono mt-0.5 block">{errors.bio}</span>
                  )}
                </div>

                {/* Location and address */}
                <div>
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1 font-mono">Location</label>
                  <input 
                    type="text" 
                    name="location"
                    placeholder="Dhaka, Bangladesh" 
                    className={`w-full bg-[#0B0F14] border ${errors.location ? 'border-rose-500 bg-rose-950/20' : 'border-white/5'} p-4 rounded-2xl focus:border-[#1877F2] outline-none text-white font-bold text-sm transition-all`} 
                    value={editData.location} 
                    onChange={handleEditChange} 
                  />
                  {errors.location && (
                    <span className="text-[9px] font-bold text-rose-500 uppercase font-mono mt-0.5 block">{errors.location}</span>
                  )}
                </div>

                {/* Website url validation */}
                <div>
                  <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1 font-mono">Website URL</label>
                  <input 
                    type="text" 
                    name="website"
                    placeholder="https://anando.dev" 
                    className={`w-full bg-[#0B0F14] border ${errors.website ? 'border-rose-500 bg-rose-950/20' : 'border-white/5'} p-4 rounded-2xl focus:border-[#1877F2] outline-none text-white font-bold text-sm transition-all`} 
                    value={editData.website} 
                    onChange={handleEditChange} 
                  />
                  {errors.website && (
                    <span className="text-[9px] font-bold text-rose-500 uppercase font-mono block mt-0.5">{errors.website}</span>
                  )}
                </div>

                {/* Disable commit button on errors block */}
                <button 
                  type="submit" 
                  disabled={Object.values(errors).some(msg => msg !== "")}
                  className="w-full bg-[#1877F2] disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-black uppercase py-5 rounded-2xl hover:brightness-110 shadow-lg tracking-[0.2em] text-xs transition-all mt-4"
                >
                  Save Profile Changes
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CREATE NEW TRANSMISSION MODAL --- */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121821] border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
              
              <h3 className="text-xl font-bold uppercase italic text-white mb-6">Create <span className="text-[#1877F2]">New Post</span></h3>
              
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Caption</label>
                  <textarea 
                    placeholder="Write a caption..." 
                    className="w-full bg-[#0B0F14] border border-white/5 p-4 rounded-2xl outline-none focus:border-[#1877F2] text-white text-xs h-24 resize-none"
                    value={newPostData.text}
                    onChange={(e) => setNewPostData(prev => ({ ...prev, text: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Media Source Type</label>
                    <select 
                      className="w-full bg-[#0B0F14] border border-white/5 p-3 rounded-xl text-xs font-bold text-zinc-300 focus:border-[#1877F2] outline-none"
                      value={newPostData.mediaType}
                      onChange={(e) => setNewPostData(p => ({ ...p, mediaType: e.target.value }))}
                    >
                      <option value="photo">Image (Photos Tab)</option>
                      <option value="video">Video (Videos Tab)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Item Title Badge</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Just seen, 4K"
                      className="w-full bg-[#0B0F14] border border-white/5 p-3 rounded-xl text-xs text-white outline-none focus:border-[#1877F2]"
                      value={newPostData.badge}
                      onChange={(e) => setNewPostData(p => ({ ...p, badge: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Image/Video Link (optional)</label>
                  <input 
                    type="text" 
                    placeholder="HTTP link address to photo or video" 
                    className="w-full bg-[#0B0F14] border border-white/5 p-3.5 rounded-xl text-xs text-white outline-none focus:border-[#1877F2]"
                    value={newPostData.mediaUrl && !newPostData.mediaUrl.startsWith('data:') ? newPostData.mediaUrl : ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewPostData(prev => ({ ...prev, mediaUrl: val }));
                    }}
                  />
                  
                  <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest block text-center my-3">Or Upload Local Media File</span>
                  
                  <div className="border border-dashed border-white/10 hover:border-[#1877F2]/40 rounded-2xl p-4 bg-black/20 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors relative group/upload">
                    <input 
                      type="file" 
                      accept="image/*,video/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={handlePostFileChange}
                    />
                    {newPostData.mediaUrl && newPostData.mediaUrl.startsWith('data:') ? (
                      <div className="w-full flex items-center justify-between gap-3 text-xs text-zinc-300 relative z-20">
                        <div className="flex items-center gap-2 truncate">
                          {newPostData.mediaType === 'video' ? (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-black flex-shrink-0">
                              <video src={newPostData.mediaUrl} className="w-full h-full object-cover" preload="metadata" muted />
                            </div>
                          ) : (
                            <img src={newPostData.mediaUrl} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" alt="preview" />
                          )}
                          <span className="truncate font-bold text-[#1877F2] text-[10px]">Ready to deploy</span>
                        </div>
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setNewPostData(prev => ({ ...prev, mediaUrl: '' }));
                          }} 
                          className="text-zinc-500 hover:text-rose-500 font-bold uppercase text-[9px] relative z-30"
                        >
                          Clear
                        </button>
                      </div>
                    ) : (
                      <>
                        <Camera size={20} className="text-zinc-500 group-hover/upload:text-[#1877F2] transition-colors" />
                        <span className="text-[9px] uppercase font-bold text-zinc-400 group-hover/upload:text-white transition-colors">Choose Local Photo / Video</span>
                        <span className="text-[7.5px] uppercase font-mono text-zinc-650">Max 50MB file size limit</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 py-2">
                  <input 
                    type="checkbox" 
                    id="new-post-pinned"
                    className="rounded bg-[#0B0F14] border-white/5 text-[#1877F2]" 
                    checked={newPostData.pinned}
                    onChange={(e) => setNewPostData(prev => ({ ...prev, pinned: e.target.checked }))}
                  />
                  <label htmlFor="new-post-pinned" className="text-[10px] font-bold uppercase text-zinc-400 select-none cursor-pointer flex items-center gap-1">
                    <Pin size={10} className="text-[#1877F2]" /> Pin to Top
                  </label>
                </div>

                {createPostError && (
                  <p className="text-[10px] uppercase font-bold text-rose-500 font-mono mt-1">{createPostError}</p>
                )}

                <button 
                  type="submit" 
                  disabled={createPostLoading}
                  className="w-full bg-[#1877F2] text-white font-bold uppercase py-4 rounded-xl text-[10px] tracking-widest shadow-lg flex items-center justify-center gap-2"
                >
                  {createPostLoading ? <Loader2 size={12} className="animate-spin" /> : "Post Now"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PHOTO FULL-SCREEN PREVIEW VIEW (POST VIEW MODAL) --- */}
      <AnimatePresence>
        {selectedPhotoPost && (
          <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121821] border border-white/10 w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[85vh] md:h-[75vh]"
            >
              
              {/* Photo Area Column (Left) */}
              <div className="flex-1 bg-black relative flex items-center justify-center border-b md:border-b-0 md:border-r border-white/5 h-[45%] md:h-full">
                <img 
                  src={selectedPhotoPost.image || selectedPhotoPost.mediaUrl || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800"} 
                  className="w-full h-full object-contain" 
                  alt="full view target" 
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=800"; }}
                />

                {/* Pinned overlay badge indicator */}
                {selectedPhotoPost.pinned && (
                  <div className="absolute top-4 left-4 py-1 px-2.5 rounded-lg bg-black/60 border border-white/10 text-[9px] font-black text-[#1877F2] uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                    <Pin size={11} className="transform rotate-45 text-[#1877F2]" />
                    <span>Pinned Post</span>
                  </div>
                )}
                
                {/* Close trigger anchor */}
                <button 
                  onClick={() => setSelectedPhotoPost(null)}
                  className="absolute top-4 right-4 p-2 bg-black/60 border border-white/15 hover:bg-rose-600 rounded-full text-white"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Description Feed & Live Comments view (Right Column) */}
              <div className="w-full md:w-[380px] bg-[#121821] flex flex-col h-[55%] md:h-full">
                
                {/* Creator node head bar */}
                <div className="p-5 border-b border-white/5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1877F2]/10 border border-[#1877F2]/25 overflow-hidden">
                    <img 
                      src={user?.avatar || "https://ui-avatars.com/api/?name=O&background=1877F2&color=fff"} 
                      className="w-full h-full object-cover" 
                      alt="avatar micro" 
                    />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">{user?.firstName} {user?.lastName}</h4>
                    <span className="text-[9px] text-[#1877F2] font-mono font-bold tracking-wider">@{user?.username || 'anando_c'}</span>
                  </div>
                </div>

                {/* Post body content script */}
                <div className="p-5 bg-black/15 font-medium leading-relaxed text-zinc-300 text-xs shrink-0 max-h-36 overflow-y-auto">
                  {selectedPhotoPost.text}
                </div>

                {/* Instant Real-Time Comments Stream Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <span className="text-[8.5px] font-bold text-zinc-650 uppercase tracking-widest block border-b border-white/5 pb-2">
                    Comment Section ({selectedPhotoPost.comments?.length || 0})
                  </span>
                  
                  {selectedPhotoPost.comments && selectedPhotoPost.comments.length > 0 ? (
                    selectedPhotoPost.comments.map((comm, idx) => (
                      <div key={comm.id || `photo-comment-${idx}`} className="text-xs leading-normal animate-slideIn">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-extrabold text-[#1877F2] hover:underline cursor-pointer">@{comm.user}</span>
                          <span className="text-[8px] font-bold text-zinc-650 font-mono">{comm.time}</span>
                        </div>
                        <p className="text-zinc-300 ml-1 font-medium bg-black/10 p-2 rounded-xl border border-white/[0.02]">{comm.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-zinc-600 font-bold uppercase text-[9px] tracking-wide">
                      Be the first to share a comment!
                    </div>
                  )}
                </div>

                {/* Stats & Interactive controls block */}
                <div className="p-5 border-t border-white/5 bg-black/20 self-end w-full">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] uppercase font-bold text-zinc-500 font-mono">
                      {new Date(selectedPhotoPost.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                    
                    <button 
                      onClick={() => handleLikePost(selectedPhotoPost._id, 'photos')}
                      className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                        selectedPhotoPost.likes?.includes(user?.username || "You") 
                        ? 'bg-rose-500/15 border-rose-500/25 text-rose-500' 
                        : 'bg-zinc-950 border-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Heart size={12} fill={selectedPhotoPost.likes?.includes(user?.username || "You") ? "currentColor" : "none"} />
                      <span>{selectedPhotoPost.likes?.length || 0} Likes</span>
                    </button>
                  </div>

                  {/* Comment submit bar */}
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Write a comment..." 
                      className="flex-1 bg-black/40 border border-white/5 p-3 rounded-xl text-xs text-white outline-none focus:border-[#1877F2]"
                      value={newCommentText} 
                      onChange={(e) => setNewCommentText(e.target.value)}
                    />
                    <button 
                      type="submit" 
                      className="bg-[#1877F2] text-white p-3.5 rounded-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <Send size={12} />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- HIGH FIDELITY VERTICAL VIDEO REELS STREAM PLAYER (VIDEO VIEW MODAL) --- */}
      <AnimatePresence>
        {selectedVideoPost && (
          <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121821] border border-white/10 w-full max-w-4xl h-[90vh] rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(24,119,242,0.15)] flex flex-col md:flex-row relative"
            >
              {/* Close Reels Main Anchor Trigger */}
              <button 
                onClick={() => {
                  setSelectedVideoPost(null);
                  setVideoCommentsVisible(true);
                }}
                className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-[#1877F2] rounded-full text-white z-50 transition-colors pointer-events-auto border border-white/10"
                title="Close video player"
              >
                <X size={18} />
              </button>

              {/* Vertical Video View Slot (Left Frame) - Optimized mobile view layout */}
              <div className="flex-1 bg-black relative flex items-center justify-center h-[50%] md:h-full group/video overflow-hidden">
                {/* Dynamically Blurred Ambient Theme Backdrop */}
                <div className="absolute inset-0 z-0 pointer-events-none opacity-50 select-none">
                  <img 
                    src={selectedVideoPost.image || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600"} 
                    className="w-full h-full object-cover blur-2xl scale-125" 
                    alt="backdrop theme" 
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600"; }}
                  />
                  <div className="absolute inset-0 bg-black/40" />
                </div>

                <video 
                  ref={videoRef}
                  src={selectedVideoPost.mediaUrl}
                  poster={selectedVideoPost.image || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600"}
                  className="w-full h-full object-contain cursor-pointer relative z-10"
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  onClick={() => setIsMuted(!isMuted)}
                />

                {/* Absolute Top row state badge */}
                <div className="absolute top-4 left-4 flex gap-2 pointer-events-none z-15">
                  <span className="px-2.5 py-1 bg-rose-600 rounded-lg text-white font-mono text-[9px] font-black uppercase tracking-widest animate-pulse">
                    {selectedVideoPost.badge || "Live Stream"}
                  </span>
                  {selectedVideoPost.pinned && (
                    <span className="px-2.5 py-1 bg-black/60 border border-white/10 rounded-lg text-[#1877F2] font-mono text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Pin size={8} className="transform rotate-45" /> PINNED
                    </span>
                  )}
                </div>

                {/* Bottom Video metadata overlay panel */}
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <img 
                      src={user?.avatar || "https://ui-avatars.com/api/?name=O"} 
                      className="w-7 h-7 rounded-full border border-white/20 object-cover" 
                      alt="avatar nano" 
                    />
                    <span className="text-white text-xs font-black">@{user?.username || 'drifter_node'}</span>
                  </div>
                  
                  <p className="text-zinc-200 text-xs font-medium max-w-md drop-shadow-md leading-relaxed line-clamp-2">
                    {selectedVideoPost.text}
                  </p>
                </div>

                {/* Left/Right Floating Quick sound controllers */}
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="absolute bottom-6 right-6 p-3 bg-black/60 hover:bg-[#1877F2] font-black text-white hover:scale-105 active:scale-95 rounded-full backdrop-blur-md border border-white/15 z-30 transition-transform pointer-events-auto shadow-lg"
                  title={isMuted ? "Unmute video feed" : "Mute video feed"}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
              </div>

              {/* Feed Description & Comments Panel (Right Slot) */}
              <div className="w-full md:w-[380px] bg-[#121821] flex flex-col h-[50%] md:h-full border-t md:border-t-0 md:border-l border-white/5">
                
                {/* Stats Summary & Likes counts */}
                <div className="p-5 border-b border-white/5 bg-black/10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-tight">Video Details</h4>
                    <span className="text-[8px] font-mono text-zinc-500 font-bold">ID: {selectedVideoPost._id}</span>
                  </div>

                  <button 
                    onClick={() => handleLikePost(selectedVideoPost._id, 'videos')}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all ${
                      selectedVideoPost.likes?.includes(user?.username || "You") 
                      ? 'bg-rose-500/15 border-rose-500/25 text-rose-500' 
                      : 'bg-zinc-950 border-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Heart size={12} fill={selectedVideoPost.likes?.includes(user?.username || "You") ? "currentColor" : "none"} />
                    <span>{selectedVideoPost.likes?.length || 0} Likes</span>
                  </button>
                </div>

                {/* Comments List Grid stream */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  <span className="text-[9px] font-black text-zinc-500 font-mono uppercase block tracking-widest border-b border-white/5 pb-2">
                    COMMENTS ({selectedVideoPost.comments?.length || 0})
                  </span>

                  {selectedVideoPost.comments && selectedVideoPost.comments.length > 0 ? (
                    selectedVideoPost.comments.map((comm, idx) => (
                      <div key={comm.id || `video-comment-${idx}`} className="text-xs animate-slideIn">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-extrabold text-[#1877F2]">@{comm.user}</span>
                          <span className="text-[8px] font-extrabold text-zinc-650 font-mono">{comm.time}</span>
                        </div>
                        <p className="text-zinc-300 ml-1 font-medium bg-black/20 p-2.5 rounded-xl border border-white/[0.03] leading-normal">{comm.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-zinc-600 font-bold uppercase text-[9px] tracking-widest font-mono">
                      No comments yet on this video.
                    </div>
                  )}
                </div>

                {/* Add Comment submit row */}
                <div className="p-5 border-t border-white/5 bg-black/20">
                  <form onSubmit={handleAddReelsComment} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Write a comment..." 
                      className="flex-1 bg-black/40 border border-white/5 p-3 rounded-xl text-xs text-white outline-none focus:border-[#1877F2] font-medium"
                      value={newReelsCommentText} 
                      onChange={(e) => setNewReelsCommentText(e.target.value)}
                    />
                    <button 
                      type="submit" 
                      className="bg-[#1877F2] text-white p-3.5 rounded-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      <Send size={12} />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyProfile;
