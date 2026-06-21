import React, { useState, useEffect } from "react";
import { Share2, FileText, CheckCircle, Clock, Link, Check, X } from "lucide-react";

export default function PublishModal({
  selectedCaption,
  coverUrl,
  soundTitle,
  isDraftOption = false,
  onClose
}) {
  const [captionText, setCaptionText] = useState(selectedCaption || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [isDraft, setIsDraft] = useState(isDraftOption);

  // Sync state if selected caption updates
  useEffect(() => {
    if (selectedCaption) {
      setCaptionText(selectedCaption);
    }
  }, [selectedCaption]);

  const handlePublish = async () => {
    setLoading(true);
    try {
      const res = await fetch("/publish-reel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption: captionText,
          coverUrl: coverUrl || "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=300",
          soundId: soundTitle,
          isDraft
        })
      });
      const data = await res.json();
      if (data.success) {
        setResult(data);
      }
    } catch (err) {
      console.error("Publish error: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="publish-modal-root" className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#0a0f1d] border border-white/10 rounded-[30px] p-6 space-y-4 select-none relative shadow-2xl">
        {/* Close Button */}
        <button
          id="btn-close-publish-x"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {!result ? (
          /* PREPUBLISH PREVIEW & SETUP */
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-1.5 border-b border-white/5 pb-2.5">
              <Share2 className="w-5 h-5 text-orange-500" />
              <h2 className="text-sm font-extrabold text-white tracking-widest uppercase font-mono">
                Launch Drift Reel
              </h2>
            </div>

            {/* Thumbnail and Title banner */}
            <div className="flex gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
              <img
                src={coverUrl || "https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=150&auto=format&fit=crop&q=80"}
                alt="Selected Cover Card"
                className="w-16 h-28 object-cover rounded-lg border border-white/5 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex flex-col justify-between shrink min-w-0">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono text-white/50 uppercase">Creator Audio:</p>
                  <p className="text-xs font-bold text-amber-500 truncate max-w-[170px]">
                    🎵 {soundTitle || "No soundtrack selected"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-mono text-white/30 uppercase">Distribution:</p>
                  <p className="text-[10px] text-white/70">Onyx Drifter Community Hub</p>
                </div>
              </div>
            </div>

            {/* Editable Caption area */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-white/50 uppercase block">
                Final Review Caption Copy & Tags:
              </label>
              <textarea
                id="textarea-publish-caption"
                rows="4"
                value={captionText}
                onChange={(e) => setCaptionText(e.target.value)}
                placeholder="Give this slide a viral title..."
                className="w-full p-3 text-xs bg-black/40 rounded-xl text-white placeholder-white/20 border border-white/10 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium resize-none leading-relaxed"
              />
            </div>

            {/* Toggle Draft option */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 select-none">
              <span className="text-xs font-semibold text-white/80">Save as Creator Draft</span>
              <button
                id="btn-toggle-draft"
                onClick={() => setIsDraft(!isDraft)}
                className={`w-10 h-5 rounded-full relative p-0.5 transition-colors duration-200
                  ${isDraft ? "bg-orange-500" : "bg-white/10"}
                `}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-all duration-200
                  ${isDraft ? "translate-x-5" : "translate-x-0"}
                `} />
              </button>
            </div>

            {/* Button Launch Actions */}
            <div className="space-y-2 pt-2">
              <button
                id="btn-submit-publish"
                onClick={handlePublish}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Laying asphalt signals...</span>
                  </>
                ) : (
                  <span>{isDraft ? "Save Creator Draft" : "Launch Now to Live Feed"}</span>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* SUCCESS RESPONSE RESULT */
          <div className="space-y-4 text-center py-5">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono">
                {isDraft ? "DRAFT STORED!" : "LIVE FEED INJECTED!"}
              </h3>
              <p className="text-[10px] text-white/40 leading-relaxed">
                {result.message}
              </p>
            </div>

            {/* Metrics cards */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-left text-xs font-mono space-y-1.5 text-white/70">
              <div className="flex justify-between">
                <span>Publish Token:</span>
                <span className="text-white font-bold">{result.publishId}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-bold uppercase ${isDraft ? "text-amber-400" : "text-emerald-400"}`}>
                  {result.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="text-white font-bold text-[10px]">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>

            {/* Launch live site links */}
            {!isDraft && (
              <a
                id="link-publish-feed"
                href={result.feedUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-[10px] font-mono"
              >
                <Link className="w-3.5 h-3.5" />
                <span>Simulated Feed Address</span>
              </a>
            )}

            <button
              id="btn-confirm-done"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-[11px] font-mono tracking-widest uppercase transition-colors"
            >
              Back to Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
