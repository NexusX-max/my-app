import React, { useState, useEffect } from 'react';
import { FaMicrophone, FaSearch, FaTimes } from 'react-icons/fa';
import { RiDoubleQuotesL, RiDoubleQuotesR } from 'react-icons/ri';
import toast from 'react-hot-toast';

const AISearchBar = ({ onSearchExecute }) => {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ১. ভয়েস রিকগনিশন ইঞ্জিন সেটআপ
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.lang = 'bn-BD'; // বাংলা এবং ইংরেজি মিক্সড ল্যাঙ্গুয়েজ সাপোর্ট করবে
    recognition.interimResults = false;
  }

  const handleVoiceSearch = () => {
    if (!recognition) {
      toast.error("Speech Recognition not supported in this browser");
      return;
    }

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      executeNeuralSearch(transcript); // সরাসরি এআই সার্চে পাঠিয়ে দিবে
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Neural link failed: Voice not captured");
    };
  };

  const executeNeuralSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setIsProcessing(true);
    
    try {
      // এখানে তোমার ব্যাকএন্ড এপিআই কল হবে
      await onSearchExecute(searchQuery);
    } catch (err) {
      toast.error("AI Sync failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="relative group">
        {/* মেইন সার্চ বার */}
        <div className={`relative flex items-center bg-zinc-900/50 backdrop-blur-xl border ${isListening ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]' : 'border-white/10'} rounded-2xl p-2 transition-all duration-500`}>
          
          <div className="pl-4 text-zinc-500">
            <FaSearch size={18} className={isProcessing ? 'animate-spin text-cyan-500' : ''} />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeNeuralSearch(query)}
            placeholder={isListening ? "Listening for intent..." : "Search anything with AI..."}
            className="w-full bg-transparent border-none outline-none px-4 py-3 text-white font-medium placeholder:text-zinc-600"
          />

          {/* ভয়েস বাটন */}
          <button
            onClick={handleVoiceSearch}
            className={`p-3 rounded-xl transition-all ${isListening ? 'bg-cyan-500 text-black scale-110' : 'bg-white/5 text-cyan-500 hover:bg-white/10'}`}
          >
            <FaMicrophone className={isListening ? 'animate-pulse' : ''} size={20} />
          </button>
        </div>

        {/* Neural Suggestions (সাজেশন এরিয়া) */}
        {isListening && (
          <div className="absolute -bottom-16 left-0 right-0 flex justify-center animate-bounce">
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-500 bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20">
              Capturing Neural Input...
            </p>
          </div>
        )}
      </div>

      {/* কুইক সাজেস্টিভ মোড */}
      {!query && (
        <div className="mt-6 flex flex-wrap gap-2 justify-center opacity-50 hover:opacity-100 transition-opacity">
          <p className="text-[10px] text-zinc-500 w-full text-center mb-2 font-black uppercase tracking-tighter">Quick Intent Suggestions</p>
          {["React Devs in Khulna", "UI Designer", "Onyx drift news"].map((tag) => (
            <button 
              key={tag}
              onClick={() => { setQuery(tag); executeNeuralSearch(tag); }}
              className="text-[10px] bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg text-zinc-400 hover:border-cyan-500/50 hover:text-cyan-400 transition-all"
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AISearchBar;