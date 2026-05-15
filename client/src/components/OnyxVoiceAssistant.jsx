import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaRobot } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { getOnyxResponse } from '../services/aiService';

const OnyxVoiceAssistant = ({ onMessageGenerated, isActive, chatData }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null); // Garbage collection বাগ থেকে বাঁচতে রেফারেন্স
  const initialGreetingDone = useRef(false);

  /* ==========================================================
      🎙️ VOICE OUTPUT ENGINE (ULTRA STABLE)
  ========================================================== */
  const speak = useCallback((text) => {
    if (!text || !isActive) return;

    // ১. কথা বলার সময় মাইক্রোফোন বন্ধ রাখা যাতে ইকো না হয়
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    
    if (!('speechSynthesis' in window)) return;

    // ২. আগের কোনো স্পিচ চলতে থাকলে তা পুরোপুরি বাতিল করা
    window.speechSynthesis.cancel();

    // ৩. সামান্য ডিলে (Delay) ব্রাউজারকে রিসেট হওয়ার সময় দেয়
    setTimeout(() => {
      // Utterance অবজেক্টকে রেফারেন্সে রাখা হয়েছে যাতে ব্রাউজার একে মেমোরি থেকে ডিলিট না করে
      utteranceRef.current = new SpeechSynthesisUtterance(text);
      
      // ভয়েস সেটআপ
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.name.includes("Google US English") || v.name.includes("Female") || v.name.includes("Zira")
      );
      
      if (preferredVoice) utteranceRef.current.voice = preferredVoice;

      // ল্যাঙ্গুয়েজ ডিটেকশন (বাংলা/ইংরেজি)
      const isBengali = /[\u0980-\u09FF]/.test(text);
      utteranceRef.current.lang = isBengali ? 'bn-BD' : 'en-US';
      
      utteranceRef.current.pitch = 1.1; 
      utteranceRef.current.rate = 1.0;

      utteranceRef.current.onstart = () => setIsSpeaking(true);
      
      utteranceRef.current.onend = () => {
        setIsSpeaking(false);
        // কথা শেষ হলে আবার লিসেনিং মোড অ্যাক্টিভ করবে
        if (isActive) safeStartRecognition();
      };

      utteranceRef.current.onerror = (err) => {
        if (err.error !== 'interrupted') {
          console.error("Neural Speech Error:", err.error);
        }
        setIsSpeaking(false);
        if (isActive) safeStartRecognition();
      };
      
      window.speechSynthesis.speak(utteranceRef.current);
    }, 250); 
  }, [isActive]);

  /* ==========================================================
      🎤 SAFE RECOGNITION START
  ========================================================== */
  const safeStartRecognition = () => {
    // কথা বলার সময় বা অলরেডি রানিং থাকলে নতুন করে স্টার্ট হবে না
    if (recognitionRef.current && isActive && !isSpeaking && !window.speechSynthesis.speaking) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already active
      }
    }
  };

  /* ==========================================================
      🧠 ONYX BRAIN (AI Logic)
  ========================================================== */
  const processOnyxIntelligence = async (input) => {
    const cmd = input.toLowerCase().trim();
    if (!cmd) return;

    // কুইক চেক: মেসেজ পড়া (আপনার চ্যাট ডাটা থেকে)
    if (cmd.includes("unread") || cmd.includes("message") || cmd.includes("মেসেজ")) {
      const lastMsg = chatData?.[0];
      if (lastMsg) {
        speak(`${lastMsg.fullName} sent you a message: ${lastMsg.lastMsg}`);
        return;
      }
    }

    setTranscript("Analyzing..."); 
    const aiReply = await getOnyxResponse(input); 
    
    setTranscript(aiReply);
    speak(aiReply);

    // ৫ সেকেন্ড পর ট্রান্সক্রিপ্ট ক্লিয়ার করে দেওয়া
    setTimeout(() => setTranscript(""), 5000);
  };

  /* ==========================================================
      🎤 SPEECH RECOGNITION SETUP
  ========================================================== */
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; 

      recognitionRef.current.onresult = (event) => {
        const current = event.results[event.results.length - 1];
        const text = current[0].transcript;
        setTranscript(text);

        if (current.isFinal) {
          processOnyxIntelligence(text);
        }
      };

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => {
        setIsListening(false);
        // অটোমেটিক রিস্টার্ট যদি সিস্টেম একটিভ থাকে এবং কথা না বলে
        if (isActive && !isSpeaking) {
          setTimeout(safeStartRecognition, 400);
        }
      };
    }

    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();
    };
  }, [isActive, isSpeaking]);

  /* ==========================================================
      🚀 INITIALIZATION & CLICK SYNC
  ========================================================= */
  useEffect(() => {
    if (isActive) {
      // Chrome এর জন্য ভয়েস লিস্ট লোড করা
      const loadVoices = () => window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();

      const startOnyx = () => {
        safeStartRecognition();
        if (!initialGreetingDone.current) {
          speak("Onyx system online. Neural link established. System is ready.");
          initialGreetingDone.current = true;
        }
      };

      // ব্রাউজার অডিও পলিসির জন্য একবার ক্লিক করলেই ভয়েস আনলক হবে
      window.addEventListener('click', startOnyx, { once: true });
      return () => window.removeEventListener('click', startOnyx);
    }
  }, [isActive, speak]);

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/60 backdrop-blur-3xl rounded-[3.5rem] border border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.15)] transition-all">
      <div className="relative">
        <AnimatePresence>
          {(isListening || isSpeaking) && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.6, opacity: 0.3 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
              className="absolute inset-0 bg-cyan-400 rounded-full blur-xl"
            />
          )}
        </AnimatePresence>

        <div 
          onClick={() => safeStartRecognition()}
          className={`w-28 h-28 rounded-full flex items-center justify-center border-2 cursor-pointer transition-all duration-700 ${
            isSpeaking ? 'bg-cyan-500 border-white shadow-[0_0_30px_#06b6d4]' : 'bg-black border-cyan-500/40 hover:border-cyan-400'
          }`}
        >
          <motion.div
            animate={isSpeaking ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.5 }}
          >
            <FaRobot className={`text-4xl ${isSpeaking ? 'text-black' : 'text-cyan-500'}`} />
          </motion.div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <h3 className="text-cyan-400 font-black tracking-[0.4em] uppercase text-[11px] mb-2">Onyx_Assistant</h3>
        <div className="h-12 px-4 flex items-center justify-center">
          <p className="text-zinc-300 text-[13px] font-semibold italic leading-tight max-w-[250px]">
            {transcript || (isSpeaking ? "Onyx is speaking..." : isListening ? "Listening to neural input..." : "Click anywhere to Sync")}
          </p>
        </div>
      </div>
      
      <div className="mt-4 flex gap-1">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            animate={isListening || isSpeaking ? { height: [4, 16, 4] } : { height: 4 }}
            transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
            className="w-1 bg-cyan-400 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};

export default OnyxVoiceAssistant;