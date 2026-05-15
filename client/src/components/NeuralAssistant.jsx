import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaRobot, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const NeuralAssistant = ({ api }) => {
  const [isListening, setIsListening] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Speech Recognition Setup
  const recognition = useMemo(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.lang = 'en-US';
    return rec;
  }, []);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      setIsOpen(true);
      setAiResponse("Processing command..."); // এখন "Syncing" বদলে "Processing" কারণ এটা অনেক ফাস্ট

      try {
        // ব্যাকএন্ডে রিকোয়েস্ট পাঠানো (যা এখন Groq ব্যবহার করছে)
        const res = await api.post("/ai/process-voice", { prompt: transcript });
        const result = res.data.result;

        if (result.startsWith("ACTION_POST:")) {
          const postContent = result.replace("ACTION_POST:", "").trim();
          setAiResponse(`Drafting Post: ${postContent}`);
          // এখানে তোমার পোস্ট করার লজিক কল করতে পারো
        } else if (result.startsWith("ACTION_NAV:")) {
          const path = result.replace("ACTION_NAV:", "").trim();
          setAiResponse(`Navigating to ${path}...`);
          setTimeout(() => {
            navigate(path);
            setIsOpen(false);
          }, 1200);
        } else {
          setAiResponse(result);
        }
      } catch (err) {
        console.error("Neural Error:", err);
        setAiResponse("Neural Cloud Link Error. Check Backend.");
        toast.error("AI is currently unreachable.");
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech Error:", event.error);
      setIsListening(false);
      if(event.error !== 'no-speech') toast.error("Voice failed. Try again.");
    };

    recognition.onend = () => setIsListening(false);
  }, [recognition, api, navigate]);

  const startListening = () => {
    if (!recognition) return toast.error("Browser not supported");
    if (isListening) {
      recognition.stop();
      return;
    }
    setIsListening(true);
    setAiResponse("Listening...");
    recognition.start();
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-24 right-0 w-80 bg-zinc-950/90 backdrop-blur-2xl border border-cyan-500/30 p-5 rounded-3xl shadow-[0_20px_50px_rgba(6,182,212,0.3)]"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <FaRobot className="text-cyan-500 animate-pulse" size={18} />
                <span className="text-[10px] uppercase tracking-[2px] text-cyan-500/70 font-bold">Onyx Neural Link</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-all text-zinc-500 hover:text-white">
                <FaTimes />
              </button>
            </div>
            <div className="min-h-[50px] flex items-center">
               <p className="text-sm text-cyan-50 text-left font-medium leading-relaxed italic">
                 "{aiResponse}"
               </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }} 
        whileTap={{ scale: 0.9 }}
        onClick={startListening}
        className={`p-5 rounded-full shadow-2xl transition-all relative z-10 ${
          isListening 
          ? 'bg-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.6)]' 
          : 'bg-cyan-500 shadow-[0_0_25px_rgba(6,182,212,0.6)]'
        }`}
      >
        {isListening && (
            <motion.div 
                className="absolute inset-0 rounded-full bg-rose-500/40"
                animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
            />
        )}
        <div className="relative z-20">
            <FaMicrophone className={isListening ? "text-white" : "text-black"} size={24} />
        </div>
      </motion.button>
    </div>
  );
};

export default NeuralAssistant;