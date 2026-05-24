import express from 'express';
import Groq from 'groq-sdk';
import axios from 'axios';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Groq API Initialize
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "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" 
});

/* ==========================================================
    🧠 ১. ONYX BRAIN (Local Ollama or Groq Cloud)
========================================================== */
router.post("/onyx-brain", protect, async (req, res) => {
    try {
        const { prompt, chatHistory = [], useLocal = false } = req.body;

        if (!prompt) return res.status(400).json({ reply: "I'm listening..." });

        // অপশন ১: লোকাল Ollama ব্যবহার করলে (যদি আপনার পিসিতে রান থাকে)
        if (useLocal) {
            try {
                const ollamaRes = await axios.post('http://localhost:11434/api/generate', {
                    model: "llama3",
                    prompt: `You are the Onyx Assistant. User says: "${prompt}". Give a concise response.`,
                    stream: false
                });
                return res.json({ reply: ollamaRes.data.response.trim() });
            } catch (err) {
                console.error("Ollama Offline, falling back to Groq...");
            }
        }

        // অপশন ২: Groq Cloud (এটি দ্রুত এবং রিলায়েবল)
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are Onyx, the futuristic AI brain of OnyxDrift. Keep replies under 15 words and very cool."
                },
                ...chatHistory,
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
        });

        res.json({ reply: completion.choices[0]?.message?.content.trim() });

    } catch (err) {
        console.error("📡 [Brain Error]:", err.message);
        res.status(500).json({ reply: "Neural link recalibrating. Try again." });
    }
});

/* ==========================================================
    🎙️ ২. ONYX VOICE (ElevenLabs TTS)
========================================================== */
router.post("/onyx-voice", protect, async (req, res) => {
    try {
        const { text } = req.body;
        const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
        const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; // Bella or Custom Voice

        const response = await axios({
            method: 'POST',
            url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            data: {
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: { stability: 0.5, similarity_boost: 0.75 }
            },
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'accept': 'audio/mpeg',
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        });

        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': response.data.length
        });
        res.send(Buffer.from(response.data));

    } catch (err) {
        console.error("🎙️ [Voice Error]:", err.message);
        res.status(500).json({ error: "Voice synthesis failed" });
    }
});

/* ==========================================================
    🧠 ৩. SMART REPLIES (Chat Suggestions)
========================================================== */
router.post("/smart-replies", protect, async (req, res) => {
    try {
        const { lastMessage } = req.body;
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Return exactly 3 futuristic reply suggestions for the following message as a JSON array of strings. Max 3 words each."
                },
                { role: "user", content: lastMessage || "Hello" }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
        });

        res.json({ suggestions: JSON.parse(completion.choices[0]?.message?.content || "[]") });
    } catch (err) {
        res.json({ suggestions: ["Roger that", "Got it", "On it!"] });
    }
});

/* ==========================================================
    🎙️ ৪. PROCESS VOICE (Autopilot Actions)
========================================================== */
router.post("/process-voice", protect, async (req, res) => {
    try {
        const { prompt } = req.body;
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Analyze voice intent. Actions: ACTION_POST, ACTION_NAV. If none, just reply briefly."
                },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
        });
        res.json({ result: chatCompletion.choices[0]?.message?.content.trim() });
    } catch (err) {
        res.status(500).json({ msg: "Neural Cloud Error" });
    }
});

router.post('/generate-caption', async (req, res) => {
  const { mediaUrl } = req.body;
  try {
    // এখানে আপনার AI লজিক বা OpenAI API কল থাকবে
    // মিডিয়া অ্যানালাইসিস করে টেক্সট রিটার্ন করবে
    const caption = await callVisionAI(mediaUrl); 
    res.json({ success: true, caption });
  } catch (error) {
    res.status(500).json({ success: false, message: "AI Engine Busy" });
  }
});
export default router;