import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Bot, Loader2, RefreshCw, Copy, Flame } from "lucide-react";

export default function AssistantChat({ onApplyScriptFromChat }) {
  const [messages, setMessages] = useState([
    { 
      role: "bot", 
      text: "Hi! I am Onyx Drift AI Copilot. Ask me to generate scripts, description captions, high-converting tag arrays, or click-generating titles. Try speaking in English or Bengali/Banglish!" 
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const userMsg = inputText;
    setInputText("");
    
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    
    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMsg })
      });
      if (response.ok) {
        const data = await response.json();
        
        // Format the bot output nicely
        let formattedResText = `🤖 Here is your customized script configuration:\n\n` +
          `🔥 Hook Title: "${data.hook}"\n\n` +
          `📝 Narrative Timeline Draft:\n` +
          (data.script?.map((s, idx) => `  Scene ${idx+1} (${s.duration || '5s'}) - [Tone: ${s.tone}]: "${s.text}"`).join("\n") || "") +
          `\n\n💬 Social Description:\n"${data.captionTemplate || ""}"\n\n` +
          `🏷️ Viral Hashtags:\n${data.tags?.join(" ")}`;

        setMessages(prev => [
          ...prev, 
          { 
            role: "bot", 
            text: formattedResText,
            rawObj: data 
          }
        ]);
      } else {
        setMessages(prev => [...prev, { role: "bot", text: "I ran into a server error. Please try again!" }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "bot", text: "Connection error. Make sure the backend serves the environment properly." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 h-[500px] flex flex-col justify-between" id="assistant-chat-panel">
      
      {/* Panel title */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <Bot className="text-cyan-400 animate-pulse" size={16} />
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-300">ChatGPT Style Assistant</h3>
        </div>
        <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-850 font-mono text-[8px] text-zinc-500 uppercase tracking-tighter">
          ONLINE GPT-V4
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.map((m, idx) => (
          <div 
            key={idx}
            className={`flex gap-3 text-xs leading-relaxed max-w-[90%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            {/* Avatar icon */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${m.role === "user" ? "bg-zinc-900 border-zinc-850 text-white" : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"}`}>
              {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>

            <div className="space-y-2">
              <div className={`p-4 rounded-2xl border text-xs whitespace-pre-line font-medium ${m.role === "user" ? "bg-zinc-900 border-zinc-850 text-white rounded-tr-none" : "bg-zinc-95/40 border-zinc-900 text-zinc-300 rounded-tl-none"}`}>
                {m.text}
              </div>
              
              {/* If bot returned actual objects we can apply, show an action button */}
              {m.rawObj && (
                <button 
                  onClick={() => onApplyScriptFromChat(m.rawObj)}
                  className="px-3 py-1.5 bg-cyan-500 text-black font-black uppercase text-[9px] tracking-wider rounded-lg hover:bg-cyan-400 transition-colors flex items-center gap-1"
                >
                  <Flame size={10} />
                  Inject into active editor timeline
                </button>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3 text-xs text-zinc-500 mr-auto">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/10 flex items-center justify-center text-cyan-400 shrink-0">
              <Loader2 className="animate-spin" size={12} />
            </div>
            <div className="p-3 bg-zinc-95/40 border border-zinc-900 text-zinc-500 font-mono italic rounded-2xl rounded-tl-none">
              Onyx AI thinking and compiling script...
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input bar */}
      <div className="shrink-0 mt-3 pt-3 border-t border-zinc-900 flex gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="e.g., 'Make a fitness reel script about squats'"
          className="flex-1 bg-zinc-900 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
        />
        <button 
          onClick={handleSendMessage}
          disabled={loading || !inputText.trim()}
          className="p-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-zinc-805 disabled:text-zinc-650 text-black rounded-xl transition-all active:scale-95"
        >
          <Send size={14} />
        </button>
      </div>

    </div>
  );
}
