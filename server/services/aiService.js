import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateSmartReplies = async (incomingMessage) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      You are the AI assistant of OnyxDrift social media. 
      Analyze this message: "${incomingMessage}"
      Generate 3 very short, professional, yet friendly replies (max 3-4 words each).
      Format the output as a simple JSON array of strings.
      Example: ["Sounds good!", "I'm on it", "Let's talk later"]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("AI Sync Error:", error);
    return ["Okay", "Received", "Got it"]; // Fallback replies
  }
};