import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaMicrophoneSlash, FaRobot, FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const OnyxAI = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const navigate = useNavigate();

  // Web Speech API Setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US'; // বাংলা ব্যবহার করতে চাইলে 'bn-BD' দিতে পারেন
  }

  // Voice Command Logic (আপনার গেম প্ল্যান অনুযায়ী)
  const handleVoiceCommand = useCallback(async (transcript) => {
    const command = transcript.toLowerCase();
    console.log("Neural Signal Received:", command);

    // ১. নেভিগেশন কমান্ড: "Open Messenger"
    if (command.includes("open messenger") || command.includes("go to message")) {
      toast.success("Opening Neural Comms...");
      navigate("/messages");
      return;
    }

    // ২. স্পেসিফিক ইউজার সার্চ ও মেসেজ: "Text Anando Hello"
    if (command.startsWith("text")) {
      const words = command.split(" ");
      const name = words[1]; // target name
      const msg = words.slice(2).join(" "); // message content
      toast.success(`Searching for ${name}...`);
      navigate(`/following?search=${name}`);
      // এখানে আপনার ব্যাকএন্ড লজিক অনুযায়ী অটো-মেসেজ ট্রিগার করা যাবে
      return;
    }

    // ৩. ডাইরেক্ট পোস্ট কমান্ড: "Post I am feeling good"
    if (command.startsWith("post")) {
      const content = command.replace("post", "").trim();
      setInput(content);
      handleAIAction('COPILOT', content);
      return;
    }

    // ৪. প্রোফাইল ওপেন: "Open My Profile"
    if (command.includes("profile")) {
      navigate("/profile");
      return;
    }

    // সাধারণ এআই প্রসেসিং
    setInput(transcript);
    handleAIAction('COPILOT', transcript);
  }, [navigate]);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleVoiceCommand(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Neural Link Interrupted");
    };
  }, [handleVoiceCommand]);

  const toggleListening = () => {
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      if (!recognition) {
        toast.error("Browser doesn't support Speech API");
        return;
      }
      recognition.start();
      setIsListening(true);
      toast("Listening for Neural Signals...", { icon: '🎙️' });
    }
  };

  const handleAIAction = async (taskType, customContent = null) => {
    const textToProcess = customContent || input;
    if (!textToProcess) return;

    setLoading(true);
    try {
      const res = await axios.post('https://api.onyx-drift.com/api/ai/process', {
        taskType: taskType,
        content: textToProcess
      });
      setResponse(res.data.data);
      
      if (taskType === 'COPILOT' && customContent) {
        toast.success("Neural Spark Transmitted!");
      }
    } catch (error) {
      setResponse("এআই এখন ঘুমাচ্ছে! ব্যাকএন্ড চেক করো।");
      toast.error("Connection Failed");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 border border-white/10 rounded-[2rem] bg-black/40 backdrop-blur-3xl text-white shadow-2xl max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 rounded-2xl">
            <FaRobot className="text-cyan-400 text-xl animate-pulse" />
          </div>
          <div>
            <h3 className="font-black italic uppercase tracking-tighter text-lg">Onyx_AI Co-Pilot</h3>
            <p className="text-[8px] text-cyan-500/50 uppercase tracking-[0.3em]">Neural Interface v3.0</p>
          </div>
        </div>
        
        {/* মেইন ভয়েস ট্রিগার বাটন */}
        <button 
          onClick={toggleListening}
          className={`p-4 rounded-full transition-all duration-500 ${isListening ? 'bg-red-500 animate-ping shadow-[0_0_30px_red]' : 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-110'}`}
        >
          {isListening ? <FaMicrophoneSlash className="text-white" /> : <FaMicrophone className="text-black" />}
        </button>
      </div>
      
      <div className="relative group">
        <textarea 
          rows="3" 
          className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs font-bold tracking-widest outline-none focus:border-cyan-500/40 transition-all backdrop-blur-3xl placeholder:text-zinc-700"
          placeholder={isListening ? "LISTENING..." : "COMMAND OR TYPE..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>

      <div className="mt-4 flex gap-3">
        <button 
          onClick={() => handleAIAction('COPILOT')} 
          disabled={loading}
          className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'SYNCING...' : <><FaPaperPlane /> Transmit Post</>}
        </button>
        <button 
          onClick={() => handleAIAction('SUMMARY')} 
          className="px-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-purple-500 transition-all"
        >
          Summary
        </button>
      </div>

      {response && (
        <div className="mt-6 p-4 bg-white/[0.02] rounded-2xl border-l-2 border-cyan-500 animate-in fade-in slide-in-from-bottom duration-500">
          <strong className="text-[9px] text-cyan-500 uppercase tracking-widest">Onyx Response:</strong>
          <p className="text-xs text-zinc-300 mt-2 leading-relaxed italic">"{response}"</p>
        </div>
      )}
    </div>
  );
};

export default OnyxAI;