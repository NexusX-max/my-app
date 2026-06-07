import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome, FaEnvelope, FaCompass, FaCog, FaSignOutAlt, 
  FaUserPlus, FaFire
} from 'react-icons/fa'; 
import { HiOutlineChartBar } from 'react-icons/hi';
import { AuthContext } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useContext(AuthContext);

  const menuItems = [
    { name: 'Feed', icon: <FaHome />, path: '/feed' },
    { name: 'For You', icon: <FaFire />, path: '/reels' },
    { name: 'Following', icon: <FaUserPlus />, path: '/following' }, 
    { name: 'Analytics', icon: <HiOutlineChartBar />, path: '/analytics' },
    { name: 'Messages', icon: <FaEnvelope />, path: '/messages' },
    { name: 'Explore', icon: <FaCompass />, path: '/explorer' },
    { name: 'Settings', icon: <FaCog />, path: '/settings' },
  ];

  return (
    // ১. এখানে z-[100] এবং relative নিশ্চিত করা হয়েছে যাতে ক্লিক মিস না হয়
    <div className="flex flex-col h-full py-6 justify-between bg-black/40 backdrop-blur-2xl border-r border-cyan-900/20 relative z-[100] overflow-hidden">
      
      <div className="space-y-1 relative z-20"> {/* মেইন মেনু আইটেমগুলোকে উপরে রাখার জন্য z-20 */}
        {/* ব্র্যান্ডিং সেকশন */}
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_15px_#06b6d4] animate-pulse" />
          <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.4em] italic select-none">
            Onyx_Drift
          </p>
        </div>
        
        {/* মেনু আইটেম সমূহ */}
        {menuItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            // ২. active ক্লাসে drop-shadow এবং glow বাড়ানো হয়েছে
            className={({ isActive }) => `
              flex items-center gap-4 px-6 py-4 transition-all duration-500 relative group
              ${isActive ? 'text-cyan-400 bg-cyan-500/5' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 w-[2px] h-3/5 top-1/2 -translate-y-1/2 bg-cyan-500 shadow-[4px_0_20px_#06b6d4]" />
                )}
                <span className={`text-xl transition-all duration-300 group-hover:scale-125 ${isActive ? 'drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]' : ''}`}>
                  {item.icon}
                </span>
                <span className="text-[12px] font-black uppercase tracking-wider italic font-mono">
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* লগআউট সেকশন */}
      <div className="px-4 mt-auto relative z-20">
        <button 
          onClick={() => logout()}
          className="w-full flex items-center gap-4 px-6 py-4 text-zinc-600 hover:text-rose-500 transition-all duration-300 uppercase italic font-bold text-[11px] group border-t border-white/5"
        >
          <FaSignOutAlt size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="tracking-tighter">Disconnect_Node</span>
        </button>
      </div>

      {/* ৩. ব্যাকগ্রাউন্ড ডেকোরেশন - pointer-events-none অবশ্যই লাগবে */}
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-[60px] pointer-events-none z-0" />
    </div>
  );
};

export default Sidebar;