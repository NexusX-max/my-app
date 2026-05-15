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
    🧠 ১. ONYX BRAIN (General AI Response)
========================================================== */
router.post("/onyx-brain", protect, async (req, res) => {
    try {
        const { prompt, chatHistory = [] } = req.body;

        if (!prompt) {
            return res.status(400).json({ reply: "I'm listening, but I didn't hear anything." });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are Onyx, the futuristic AI brain of OnyxDrift social app. 
                    - Keep replies under 15 words. 
                    - Be helpful, witty, and minimalist. 
                    - Speak like a cool, advanced tech assistant.`
                },
                ...chatHistory,
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 100,
        });

        const reply = completion.choices[0]?.message?.content || "Neural link stable, but no data received.";
        res.json({ reply: reply.trim() });

    } catch (err) {
        console.error("📡 [Brain Error]:", err.message);
        res.status(500).json({ reply: "My neural network is currently calibrating. Try again shortly." });
    }
});

/* ==========================================================
    🎙️ ২. ONYX VOICE (ElevenLabs TTS Integration)
========================================================== */
router.post("/onyx-voice", protect, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "No text provided" });

        // আপনার .env ফাইলের সাথে মিল রেখে নাম পরিবর্তন করা হয়েছে
        const API_KEY = process.env.ELEVEN_LABS_API_KEY; 
        const VOICE_ID = "EXAVITQu4vr4xnSDxMaL"; 

        if (!API_KEY) {
            console.error("🎙️ Missing ElevenLabs API Key in Environment Variables");
            return res.status(500).json({ error: "Voice configuration missing on server" });
        }

        const response = await axios({
            method: 'POST',
            url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            data: {
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: { 
                    stability: 0.5, 
                    similarity_boost: 0.75 
                }
            },
            headers: {
                'xi-api-key': API_KEY,
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
        // বিস্তারিত এরর ট্র্যাকিং
        const errorMsg = err.response?.data ? Buffer.from(err.response.data).toString() : err.message;
        console.error("🎙️ [Voice Error]:", errorMsg);
        res.status(500).json({ error: "Voice synthesis failed" });
    }
});

/* ==========================================================
    🧠 ৩. SMART REPLIES GENERATOR
========================================================== */
router.post("/smart-replies", protect, async (req, res) => {
    try {
        const { lastMessage } = req.body;

        if (!lastMessage) {
            return res.json({ suggestions: ["Roger that 🫡", "Got it!", "Talk soon"] });
        }

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Analyze user's message. Provide exactly 3 futuristic reply suggestions. 
                    - Max 3 words per suggestion. 
                    - Return ONLY a JSON array of strings: ["Short Reply 1", "Short Reply 2", "Short Reply 3"].`
                },
                { role: "user", content: `The message is: "${lastMessage}"` }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
            max_tokens: 50,
        });

        let rawContent = completion.choices[0]?.message?.content || "[]";
        const jsonMatch = rawContent.match(/\[.*\]/);
        const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : ["Roger that 🫡", "Neural sync active", "Cool! 🔥"];

        res.json({ suggestions });

    } catch (err) {
        console.error("📡 [AI Suggestion Error]:", err.message);
        res.json({ suggestions: ["Copy that", "Got it", "On it!"] });
    }
});

/* ==========================================================
    🎙️ ৪. PROCESS VOICE (Autopilot Actions)
========================================================== */
router.post("/process-voice", protect, async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) return res.status(400).json({ msg: "No voice prompt detected" });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are the Onyx Neural Assistant. 
                    Rules:
                    1. For posting: Respond ONLY "ACTION_POST: [content]".
                    2. For navigation: Respond ONLY "ACTION_NAV: /[route]".
                    3. For chat: Response under 10 words.
                    No quotes, no bold.`
                },
                { role: "user", content: prompt }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.5,
            max_tokens: 100,
        });

        let aiResult = chatCompletion.choices[0]?.message?.content || "";
        aiResult = aiResult.trim().replace(/^["']|["']$/g, '');

        res.json({ result: aiResult });

    } catch (err) {
        console.error("📡 [Groq Interface Error]:", err.message);
        res.status(500).json({ msg: "Neural Cloud Link Error" });
    }
});

export default router;