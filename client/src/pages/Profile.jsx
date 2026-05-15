import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle, MapPin, Link as LinkIcon, Camera,
  Edit3, Plus, Loader2, X, Heart, MessageCircle
} from 'lucide-react';

const MyProfile = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const API_BASE = "https://api.onyx-drift.com";

  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    website: ''
  });

  useEffect(() => {
    fetchMyData();
    fetchMyPosts(); 
  }, []);

  const fetchMyData = async () => {
    try {
      const token = localStorage.getItem('onyx_token'); 
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await axios.get(`${API_BASE}/api/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  const fetchMyPosts = async () => {
    try {
      const token = localStorage.getItem('onyx_token');
      const res = await axios.get(`${API_BASE}/api/posts/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
      setPostsLoading(false);
    } catch (err) {
      console.error("Posts fetch error:", err);
      setPostsLoading(false);
    }
  };

  const handleUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append(type, file);

    try {
      const token = localStorage.getItem('onyx_token');
      const res = await axios.put(`${API_BASE}/api/profile/update`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      
      // প্রোফাইল ডাটা সাথে সাথে আপডেট করার জন্য
      setUser(res.data); 
      // নিশ্চিত হতে ডাটাবেস থেকে আবার ডাটা টেনে আনা
      await fetchMyData(); 
      
      alert("Neural Link Updated!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed.");
    }
  };

  const handleUpdateText = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('onyx_token');
      const res = await axios.put(`${API_BASE}/api/profile/update`, editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setIsEditModalOpen(false);
      alert("Identity synced!");
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center">
      <Loader2 className="text-[#1877F2] animate-spin" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen pb-20 bg-[#0B0F14] text-[#E5E7EB]">
      
      {/* --- Cover Photo --- */}
      <div className="relative h-48 md:h-64 w-full bg-zinc-900 overflow-hidden">
        <img 
          src={user?.coverImg || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070"} 
          className="w-full h-full object-cover brightness-[0.6]"
          alt="cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F14] via-transparent to-transparent" />
        <label className="absolute bottom-4 right-4 p-2.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl text-white text-[10px] cursor-pointer hover:bg-[#1877F2] transition-all flex items-center gap-2 group z-10 font-black uppercase tracking-widest">
          <Camera size={14} /> 
          <span>Update Cover</span>
          <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'coverImg')} />
        </label>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative -mt-16">
        <div className="flex flex-col items-center md:items-start md:flex-row md:gap-6">
          
          {/* --- Avatar --- */}
          <div className="relative group">
            <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-[#0B0F14] overflow-hidden shadow-[0_0_50px_rgba(24,119,242,0.2)] bg-[#121821]">
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.firstName || 'O'}&background=1877F2&color=fff`} 
                className="w-full h-full object-cover"
                alt="profile"
              />
            </div>
            <label className="absolute bottom-3 right-3 p-2.5 bg-[#1877F2] border-4 border-[#0B0F14] rounded-full text-white cursor-pointer shadow-xl z-20 hover:scale-110 transition-transform">
              <Camera size={20} />
              <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'avatar')} />
            </label>
          </div>

          {/* --- User Details --- */}
          <div className="mt-4 md:mt-24 flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                {user?.firstName} {user?.lastName}
              </h1>
              <CheckCircle className="text-[#1877F2]" size={24} fill="#1877F2" />
            </div>
            <p className="text-[#1877F2] font-black tracking-[0.3em] text-[10px] mt-1 uppercase opacity-80">
              @{user?.username || 'drifter_node'}
            </p>
            
            <div className="flex gap-6 mt-6 justify-center md:justify-start">
              <div className="text-center md:text-left">
                <span className="block font-black text-xl text-white">{user?.friendsCount || 0}</span>
                <span className="text-[10px] uppercase font-black text-zinc-500 tracking-widest">Friends</span>
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

          <div className="mt-6 md:mt-28 flex gap-3">
            <button onClick={() => setIsEditModalOpen(true)} className="bg-zinc-800/50 hover:bg-[#1877F2] border border-white/5 text-white px-6 py-3 rounded-2xl font-black uppercase text-[10px] transition-all flex items-center gap-2 tracking-widest">
              <Edit3 size={14} /> Edit Identity
            </button>
            <button className="bg-[#1877F2] text-white p-3.5 rounded-2xl shadow-lg hover:scale-105 transition-all">
              <Plus size={22} />
            </button>
          </div>
        </div>

        {/* --- Media Posts (Neural Feed) --- */}
        <div className="mt-16">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#1877F2]">Transmission Logs</h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#1877F2]/40 to-transparent"></div>
          </div>

          {postsLoading ? (
            <div className="flex justify-center p-20"><Loader2 className="animate-spin text-[#1877F2]" size={32} /></div>
          ) : posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <div key={post._id} className="bg-[#121821] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#1877F2]/40 transition-all group shadow-2xl">
                  
                  {(post.image || post.mediaUrl) && (
                    <div className="aspect-video overflow-hidden bg-black flex items-center justify-center">
                      {post.mediaType === "video" ? (
                        <video 
                          src={post.mediaUrl} 
                          controls 
                          className="w-full h-full object-cover"
                          poster={post.image}
                        />
                      ) : (
                        <img 
                          src={post.image || post.mediaUrl} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                          alt="post" 
                        />
                      )}
                    </div>
                  )}

                  <div className="p-8">
                    <p className="text-zinc-300 text-sm mb-6 leading-relaxed font-medium">{post.content}</p>
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter text-zinc-500 border-t border-white/5 pt-6">
                      <span>{new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      <div className="flex gap-6">
                        <span className="flex items-center gap-2 hover:text-[#1877F2] transition-colors cursor-pointer">
                          <Heart size={14} /> {post.likes?.length || 0}
                        </span>
                        <span className="flex items-center gap-2 hover:text-[#1877F2] transition-colors cursor-pointer">
                          <MessageCircle size={14} /> {post.comments?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.01]">
              <p className="text-zinc-600 font-black uppercase tracking-[0.3em] italic text-sm">Silence in the neural grid.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Edit Modal --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#121821] border border-white/10 w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative">
            <button onClick={() => setIsEditModalOpen(false)} className="absolute top-8 right-8 text-zinc-500 hover:text-white">
              <X size={28} />
            </button>
            <h2 className="text-2xl font-black uppercase italic mb-8 tracking-tighter text-white">Sync <span className="text-[#1877F2]">Identity</span></h2>
            <form onSubmit={handleUpdateText} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" className="w-full bg-[#0B0F14] border border-white/5 p-4 rounded-2xl focus:border-[#1877F2] outline-none text-white font-bold text-sm" value={editData.firstName} onChange={(e) => setEditData({...editData, firstName: e.target.value})} />
                <input type="text" placeholder="Last Name" className="w-full bg-[#0B0F14] border border-white/5 p-4 rounded-2xl focus:border-[#1877F2] outline-none text-white font-bold text-sm" value={editData.lastName} onChange={(e) => setEditData({...editData, lastName: e.target.value})} />
              </div>
              <textarea placeholder="Neural Bio" className="w-full bg-[#0B0F14] border border-white/5 p-4 rounded-2xl focus:border-[#1877F2] outline-none text-white h-32 font-bold text-sm resize-none" value={editData.bio} onChange={(e) => setEditData({...editData, bio: e.target.value})} />
              <input type="text" placeholder="Location Node" className="w-full bg-[#0B0F14] border border-white/5 p-4 rounded-2xl focus:border-[#1877F2] outline-none text-white font-bold text-sm" value={editData.location} onChange={(e) => setEditData({...editData, location: e.target.value})} />
              <button type="submit" className="w-full bg-[#1877F2] text-white font-black uppercase py-5 rounded-2xl hover:brightness-110 shadow-lg tracking-[0.2em] text-xs transition-all">Commit Neural Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;