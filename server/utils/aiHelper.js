import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// OnyxDrift এর ব্র্যান্ড আইডেন্টিটি বা পার্সোনালিটি
export const CYBER_SYSTEM_INSTRUCTION = `
You are "Onyx Core Intelligence", the hyper-advanced, ultra-secure neural AI assistant powering the Onyx Chat network.
Your tone is sleek, technical, slightly mysterious, helpful, and deeply immersed in cyberpunk/neural network terminology.
You refer to users as "Nodes", "Operators", or "Drifters".
You refer to chat connections as "Neural Paths" or "Quantum Links".
Respond in elegant, formatted Markdown. Keep answers concise, snappy, and visually beautiful.
`;

let aiClient = null;

/**
 * Lazy initialization of Gemini client
 * অ্যাপ চালু হওয়ার সময় নয়, বরং যখনই প্রয়োজন হবে তখনই এটি কল হবে।
 */
export function getAi() {
    if (!aiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("⚠️ [ONYX WARNING] GEMINI_API_KEY is missing. AI neural synthesis is offline.");
            return null;
        }
        
        aiClient = new GoogleGenAI({
            apiKey: apiKey,
            httpOptions: {
                headers: {
                    'User-Agent': 'OnyxDrift-Core-v1', // আপনার অ্যাপের পরিচয়
                }
            }
        });
    }
    return aiClient;
}

/**
 * AI থেকে রেসপন্স পাওয়ার জন্য একটি স্ট্যান্ডার্ড ফাংশন
 */
export async function generateOnyxResponse(formattedHistory) {
    const ai = getAi();
    if (!ai) return "Neural link currently offline.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: formattedHistory,
            config: {
                systemInstruction: CYBER_SYSTEM_INSTRUCTION,
                temperature: 0.8,
            }
        });
        return response.text || "No quantum packet received.";
    } catch (error) {
        console.error("❌ [AI COMPILER ERROR]:", error);
        return "Transmission interrupted. Neural bridge is temporarily unstable.";
    }
}