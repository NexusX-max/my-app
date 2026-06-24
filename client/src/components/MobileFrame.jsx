import React from 'react';

export default function MobileFrame({ children }) {
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

      {/* Actual App Screen View Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-neutral-950 relative mt-4">
        {children}
      </div>

      {/* Bottom Home Indicator Bar */}
      <div className="h-5 bg-neutral-950 flex justify-center items-center select-none pointer-events-none z-40">
        <div className="w-32 h-1 bg-white/40 rounded-full" />
      </div>
    </div>
  );
}
