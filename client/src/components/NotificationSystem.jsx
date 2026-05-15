import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaHeart, FaComment, FaUserPlus, FaEnvelope, FaPhone } from 'react-icons/fa';
import toast from "react-hot-toast";

const NotificationSystem = () => {
  const { api, socket } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // ডাটাবেস থেকে পুরনো নোটিফিকেশন আনা
    const fetchNotifs = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch notifications");
      }
    };
    fetchNotifs();

    // রিয়েল-টাইম সকেট লিসেনার
    if (socket) {
      socket.on('new_notification', (data) => {
        setNotifications(prev => [data, ...prev]);
        
        // টাইপ অনুযায়ী আলাদা টোস্ট মেসেজ
        if(data.type === 'message') toast.success(`New Signal: ${data.sender.firstName} sent a message`);
        else if(data.type === 'call') toast(`Incoming Call from ${data.sender.firstName}`, { icon: '📞' });
        else toast(`New ${data.type} on your node!`);
      });
    }
    return () => socket?.off('new_notification');
  }, [socket, api]);

  return (
    <div className="flex flex-col gap-1 max-h-64 overflow-y-auto custom-scrollbar">
      {notifications.length > 0 ? notifications.map((n) => (
        <div key={n._id} className="flex items-start gap-3 p-3 rounded-2xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all cursor-pointer group">
          {/* প্রোফাইল পিক */}
          <div className="relative">
            <img src={n.sender?.avatar || n.sender?.profilePic || "https://via.placeholder.com/40"} className="w-9 h-9 rounded-xl object-cover" alt="av" />
            <div className="absolute -bottom-1 -right-1 p-1 bg-black rounded-full border border-white/10 text-[8px]">
              {n.type === 'like' && <FaHeart className="text-rose-500" />}
              {n.type === 'comment' && <FaComment className="text-cyan-500" />}
              {n.type === 'follow' && <FaUserPlus className="text-green-500" />}
              {n.type === 'message' && <FaEnvelope className="text-blue-500" />}
              {n.type === 'call' && <FaPhone className="text-amber-500" />}
            </div>
          </div>

          {/* টেক্সট কন্টেন্ট */}
          <div className="flex-1">
            <p className="text-[11px] text-zinc-400 leading-tight">
              <span className="font-bold text-zinc-200">@{n.sender?.username}</span> 
              {n.type === 'follow' && " initiated a follow link."}
              {n.type === 'like' && " liked your transmission."}
              {n.type === 'comment' && " commented on your node."}
              {n.type === 'message' && " sent a neural signal."}
              {n.type === 'call' && " is calling your node."}
            </p>
            
            {/* স্পেশাল ফলো ব্যাক বাটন */}
            {n.type === 'follow' && (
              <button className="mt-2 text-[9px] bg-white text-black px-4 py-1 rounded-lg font-black uppercase hover:bg-cyan-500 transition-all">
                Sync Back
              </button>
            )}
          </div>
        </div>
      )) : (
        <div className="py-10 text-center text-[10px] text-zinc-600 font-mono tracking-widest uppercase opacity-50">
          Grid_Empty
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;