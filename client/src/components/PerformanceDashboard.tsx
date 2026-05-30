/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Cpu, Database, Zap, Archive, RefreshCw, X
} from 'lucide-react';

interface ServerNode {
  name: string;
  cpu: number;
  ram: number;
  connections: number;
  status: 'healthy' | 'stressed' | 'overloaded';
}

interface PerformanceDashboardProps {
  onClose: () => void;
}

export default function PerformanceDashboard({ onClose }: PerformanceDashboardProps) {
  const [nodes, setNodes] = useState<ServerNode[]>([
    { name: 'Node-Asia-East (Main Gateway)', cpu: 32, ram: 42, connections: 124000, status: 'healthy' },
    { name: 'Node-EU-Central (WebRTC Edge)', cpu: 27, ram: 38, connections: 98000, status: 'healthy' },
    { name: 'Node-US-East (Database Mirror)', cpu: 45, ram: 55, connections: 84000, status: 'healthy' },
    { name: 'Node-US-West (Redis Sync Cache)', cpu: 18, ram: 22, connections: 45000, status: 'healthy' },
  ]);

  const [compressionRatio, setCompressionRatio] = useState(88); // video compression slider percentage
  const [offlineQueue, setOfflineQueue] = useState<string[]>([
    'redis_cache_flush_01', 'media_cdn_pre_warm_idx', 'message_id_sync_994'
  ]);
  const [cdnHits] = useState(99.4);
  const [networkUtilization, setNetworkUtilization] = useState(14.5); // MB/s
  const [isSyncing, setIsSyncing] = useState(false);

  // Animate mock socket load variation dynamically over time
  useEffect(() => {
    const timer = setInterval(() => {
      setNodes(prev => prev.map(node => {
        const cpuDelta = Math.floor(Math.random() * 8 - 4);
        const ramDelta = Math.floor(Math.random() * 4 - 2);
        const connDelta = Math.floor(Math.random() * 800 - 400);

        let nextCpu = node.cpu + cpuDelta;
        let nextRam = node.ram + ramDelta;
        nextCpu = nextCpu > 100 ? 95 : nextCpu < 10 ? 15 : nextCpu;
        nextRam = nextRam > 100 ? 90 : nextRam < 10 ? 15 : nextRam;

        let status: 'healthy' | 'stressed' | 'overloaded' = 'healthy';
        if (nextCpu > 80) status = 'overloaded';
        else if (nextCpu > 60) status = 'stressed';

        return {
          ...node,
          cpu: nextCpu,
          ram: nextRam,
          connections: node.connections + connDelta,
          status
        };
      }));

      // Random jittering stats
      setNetworkUtilization(prev => {
        const next = prev + (Math.random() * 2 - 1);
        return next < 2 ? 2.5 : next > 24 ? 22 : Number(next.toFixed(1));
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  const triggerManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setOfflineQueue([]);
    }, 1500);
  };

  return (
    <div id="performance-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#090909]/95 rounded-2xl overflow-hidden shadow-2xl border border-white/10 text-[#E0E0E0] flex flex-col max-h-[90vh]">
        
        {/* Header bar */}
        <div className="p-6 bg-black/40 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm tracking-widest uppercase font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">System Diagnostics Console</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Diagnostics Display Grid */}
        <div className="p-8 overflow-y-auto flex flex-col gap-6 scrollbar-thin">
          
          {/* Top Quick Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#E0E0E0]/55 block mb-1">Total Payload</span>
              <span className="text-xl font-bold font-mono text-white">3.52M</span>
              <span className="text-[10px] text-green-400 font-mono block mt-1">100% SECURE</span>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#E0E0E0]/55 block mb-1">CDN Hitrate</span>
              <span className="text-xl font-bold font-mono text-white">{cdnHits}%</span>
              <span className="text-[10px] text-blue-400 font-mono block mt-1">CLOUDFLARE</span>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#E0E0E0]/55 block mb-1">Network Rate</span>
              <span className="text-xl font-bold font-mono text-white">{networkUtilization} MBs</span>
              <span className="text-[10px] text-purple-400 font-mono block mt-1">WEBRTC P2P</span>
            </div>

            <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#E0E0E0]/55 block mb-1">Cache RAM</span>
              <span className="text-xl font-bold font-mono text-white">1.42 GB</span>
              <span className="text-[10px] text-amber-500 font-mono block mt-1">REDIS SYNCED</span>
            </div>

          </div>

          {/* Core Cluster Nodes Matrix */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h4 className="font-bold text-xs uppercase tracking-widest font-mono text-slate-200 mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>CLUSTER WEBSOCKET NODES</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nodes.map((node, index) => (
                <div key={index} className="bg-black/30 p-4 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">{node.name}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      node.status === 'healthy' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
                      node.status === 'stressed' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' : 'bg-red-500/10 border border-red-500/20 text-red-500'
                    }`}>
                      {node.status.toUpperCase()}
                    </span>
                  </div>

                  {/* Diagnostic tracking bars */}
                  <div className="mt-4 flex flex-col gap-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>CPU UTILIZATION</span>
                        <span>{node.cpu}%</span>
                      </div>
                      <div className="w-full h-1 bg-[#050505] rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full duration-300 rounded-full ${
                            node.cpu > 70 ? 'bg-red-500' : node.cpu > 50 ? 'bg-amber-400' : 'bg-blue-500'
                          }`}
                          style={{ width: `${node.cpu}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>MEMORY POOL</span>
                        <span>{node.ram}%</span>
                      </div>
                      <div className="w-full h-1 bg-[#050505] rounded-full mt-1.5 overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full duration-300" style={{ width: `${node.ram}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-2 border-t border-white/5 flex justify-between text-[10px] font-mono text-[#E0E0E0]/30">
                    <span>Active Sockets:</span>
                    <span className="text-gray-400 font-bold">{(node.connections / 1000).toFixed(1)}K</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video / File HD compression simulator */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <h4 className="font-bold text-xs uppercase tracking-widest font-mono text-slate-200 mb-2 flex items-center gap-2">
              <Archive className="w-4 h-4 text-emerald-400" />
              <span>EDGE COMPRESSION SIMULATOR</span>
            </h4>
            <p className="text-gray-400 text-xs mb-4 leading-relaxed">
              Optimize files down before sending across highly secure data corridors to conserve bandwidth.
            </p>

            <div className="bg-black/30 p-5 rounded-xl border border-white/5 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-200 font-mono">SAVINGS RATE:</span>
                  <span className="text-[#22C55E] font-mono font-bold">-{compressionRatio}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="95"
                  value={compressionRatio}
                  onChange={(e) => setCompressionRatio(Number(e.target.value))}
                  className="w-full h-1 bg-[#050505] rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-[#050505] p-3 rounded-lg border border-white/5">
                  <span className="text-[9px] uppercase text-[#E0E0E0]/40 font-mono block">Raw Payload</span>
                  <span className="text-white font-bold mt-1 block">154.2 MB (4K UHD)</span>
                </div>
                <div className="bg-[#050505] p-3 rounded-lg border border-white/5">
                  <span className="text-[9px] uppercase text-[#E0E0E0]/40 font-mono block">VP9 Optimized</span>
                  <span className="text-emerald-400 font-bold mt-1 block">
                    {((154.2 * (100 - compressionRatio)) / 100).toFixed(1)} MB
                  </span>
                </div>
                <div className="bg-[#050505] p-3 rounded-lg border border-white/5">
                  <span className="text-[9px] uppercase text-[#E0E0E0]/40 font-mono block">R2 Upload Time</span>
                  <span className="text-blue-400 font-bold mt-1 block">
                    {((5.8 * (100 - compressionRatio)) / 100).toFixed(1)}s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Local / Offline Database IndexedDB Queue Sync status */}
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4 gap-4">
              <h4 className="font-bold text-xs uppercase tracking-widest font-mono text-slate-200 flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>OFFLINE DATABASE STREAM</span>
              </h4>
              <button
                onClick={triggerManualSync}
                disabled={isSyncing || offlineQueue.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 font-bold text-xs text-white rounded-lg cursor-pointer flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>SYNCHRONIZE</span>
              </button>
            </div>

            {offlineQueue.length === 0 ? (
              <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium flex items-center gap-2">
                <span>✓ Local indexed state is fully synchronized with secure storage nodes.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 font-mono text-xs">
                {offlineQueue.map((item, index) => (
                  <div key={index} className="bg-black/30 p-3 rounded-lg border border-white/5 flex items-center justify-between text-gray-400">
                    <span className="text-slate-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                      <span>{item}</span>
                    </span>
                    <span className="text-[10px] text-amber-500 font-bold">PENDING TRANSLATION</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer actions */}
        <div className="p-6 bg-black/40 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 hover:bg-blue-500 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all cursor-pointer font-sans"
          >
            Clear Log Frame
          </button>
        </div>

      </div>
    </div>
  );
}
