import React, { useState, useEffect } from 'react';
import { Battery, Wifi, Signal } from 'lucide-react';

export default function MobileFrame({ children }) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // early hours
      setTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative mx-auto my-4 w-full max-w-[410px] h-[840px] bg-neutral-950 rounded-[55px] border-[12px] border-neutral-900 shadow-2xl overflow-hidden flex flex-col ring-8 ring-neutral-900/50">
      {/* Speaker and Camera Notch Panel */}
      <div className="absolute top-0 inset-x-0 h-8 flex justify-center items-center z-50 pointer-events-none">
        <div className="w-[140px] h-5 bg-neutral-950 rounded-b-2xl flex items-center justify-between px-4 pb-1">
          {/* Lens */}
          <div className="w-3.5 h-3.5 bg-neutral-900 rounded-full border border-neutral-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-blue-950 rounded-full" />
          </div>
          {/* Speaker bar */}
          <div className="w-14 h-1 bg-neutral-800 rounded-full" />
        </div>
      </div>

      {/* Screen Status Bar */}
      <div className="h-10 bg-neutral-950 flex items-end justify-between px-7 pb-1 text-xs font-semibold text-white select-none z-40">
        <div>{time}</div>
        <div className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5 text-white" />
          <Wifi className="w-3.5 h-3.5 text-white" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px]">71%</span>
            <Battery className="w-4 h-4 text-white rotate-0" />
          </div>
        </div>
      </div>

      {/* Actual App Screen View Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-neutral-950 relative">
        {children}
      </div>

      {/* Bottom Home Indicator Bar */}
      <div className="h-5 bg-neutral-950 flex justify-center items-center select-none pointer-events-none z-40">
        <div className="w-32 h-1 bg-white/40 rounded-full" />
      </div>
    </div>
  );
}
