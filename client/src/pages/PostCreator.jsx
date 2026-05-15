import React, { useState } from 'react';
import { Image as ImageIcon, Film, PlayCircle, Send, X, Sparkles } from 'lucide-react';
import axios from 'axios';

const PostCreator = ({ onPostCreated }) => {
  const [postType, setPostType] = useState('photo');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // ১. AI দিয়ে টেক্সট সুন্দর করা
  const enhanceAI = async () => {
    if (!content) return;
    setLoading(true);
    try {
      // তোমার AI এন্ডপয়েন্ট
      const res = await axios.post('https://onyx-drift-app-final-u29m.onrender.com/api/ai/enhance', 
        { prompt: content },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setContent(res.data.enhancedText);
    } catch (err) { 
      console.error("AI Error", err); 
    } finally { 
      setLoading(false); 
    }
  };

  // ফাইল সিলেক্ট এবং প্রিভিউ তৈরি
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // ২. ডাটা ট্রান্সমিট (FormData Version - Multer compatible)
  const handleTransmit = async () => {
    if (!content && !file) return alert("System requires data to transmit!");
    setLoading(true);
    
    // 💡 FormData ব্যবহার করা হয়েছে কারণ ব্যাকএন্ডে Multer আছে
    const formData = new FormData();
    formData.append("text", content);
    if (file) {
      formData.append("media", file); // ব্যাকএন্ডের upload.single("media") এর সাথে মিল রেখে
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}` // টোকেন পাঠানো জরুরি
        }
      };

      // তোমার ব্যাকএন্ড পোস্ট রুট
      await axios.post('https://onyx-drift-app-final.onrender.com/api/posts', formData, config);

      alert("🛰️ Signal Transmitted to Neural Grid!");
      
      // স্টেট ক্লিয়ার করা
      setFile(null);
      setPreview(null);
      setContent('');
      
      // ফিড রিফ্রেশ করার জন্য কলব্যাক
      if (onPostCreated) onPostCreated();

    } catch (err) {
      console.error("Transmission Error:", err.response?.data);
      alert("❌ Transmission Severed: " + (err.response?.data?.msg || "Internal Anomaly"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#151515] rounded-[2.5rem] border border-white/5 p-6 shadow-xl mb-8">
      {/* Post Type Selectors */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => { setPostType('photo'); setFile(null); setPreview(null); }} 
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black tracking-widest flex items-center justify-center gap-2 transition-all ${postType === 'photo' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-400'}`}
        >
          <ImageIcon size={16}/> PHOTO
        </button>
        <button 
          onClick={() => { setPostType('video'); setFile(null); setPreview(null); }} 
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black tracking-widest flex items-center justify-center gap-2 transition-all ${postType === 'video' ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400'}`}
        >
          <Film size={16}/> VIDEO
        </button>
        <button 
          onClick={() => { setPostType('reel'); setFile(null); setPreview(null); }} 
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black tracking-widest flex items-center justify-center gap-2 transition-all ${postType === 'reel' ? 'bg-rose-500 text-white' : 'bg-white/5 text-gray-400'}`}
        >
          <PlayCircle size={16}/> REELS
        </button>
      </div>

      <textarea 
        className="w-full bg-transparent border-none outline-none text-gray-300 placeholder:text-gray-600 text-sm resize-none h-20"
        placeholder={`What's drifting in your mind, Drifter? #${postType}...`}
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* Preview Section */}
      {preview && (
        <div className="relative mb-4 rounded-2xl overflow-hidden border border-white/10 bg-black/20">
          {postType === 'photo' ? (
            <img src={preview} className="w-full h-64 object-contain" alt="preview" />
          ) : (
            <video src={preview} className="w-full h-64 object-contain" controls />
          )}
          <button 
            onClick={() => { setFile(null); setPreview(null); }} 
            className="absolute top-3 right-3 p-2 bg-black/60 backdrop-blur-md rounded-full hover:bg-rose-500 transition-all"
          >
            <X size={16} className="text-white"/>
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex gap-2">
            <label className="cursor-pointer p-3 bg-white/5 rounded-xl text-cyan-400 hover:bg-white/10 transition-all">
                <ImageIcon size={20} />
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange} 
                  accept={postType === 'photo' ? 'image/*' : 'video/*'} 
                />
            </label>
            <button 
              onClick={enhanceAI} 
              disabled={loading || !content}
              className="p-3 bg-white/5 rounded-xl text-yellow-400 hover:bg-white/10 transition-all disabled:opacity-30"
            >
                <Sparkles size={20} />
            </button>
        </div>
        
        <button 
            onClick={handleTransmit}
            disabled={loading}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-cyan-400 transition-all disabled:opacity-50"
        >
          {loading ? 'Transmitting...' : 'Transmit'} <Send size={14} />
        </button>
      </div>
    </div>
  );
};

export default PostCreator;