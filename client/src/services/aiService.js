// aiService.js
const API_BASE_URL = "https://api.onyx-drift.com";

/**
 * 🧠 Onyx Brain থেকে AI টেক্সট রেসপন্স নিয়ে আসে
 */
export const getOnyxResponse = async (prompt, chatHistory = []) => {
  try {
    const token = localStorage.getItem("onyx_token"); 
    
    const response = await fetch(`${API_BASE_URL}/api/ai/onyx-brain`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ prompt, chatHistory })
    });

    if (!response.ok) throw new Error("Brain connection failed");

    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error("📡 [Brain Error]:", error);
    return "I'm having trouble connecting to my neural network.";
  }
};

/**
 * 🎙️ Onyx Voice (ElevenLabs Backup/Placeholder)
 * বর্তমানে ব্রাউজারের TTS ব্যবহার করা হচ্ছে, তবে ব্যাকেন্ড সার্ভিস চেক করার জন্য এটি রাখা হলো।
 */
export const getOnyxVoice = async (text) => {
  try {
    const token = localStorage.getItem("onyx_token"); 

    if (!token) {
      console.error("No auth token found in localStorage under 'onyx_token'");
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/api/ai/onyx-voice`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ text })
    });

    // যদি ElevenLabs এরর দেয় (যেমন unusual activity), তবে এটি null রিটার্ন করবে
    // এবং ফ্রন্টেন্ড স্বয়ংক্রিয়ভাবে ব্রাউজারের ভয়েস ব্যবহার করবে।
    if (!response.ok) return null;

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("🎙️ ElevenLabs Fetch Error:", error);
    return null;
  }
};

/**
 * 💡 Smart Replies জেনারেট করার জন্য
 */
export const getSmartReplies = async (lastMessage) => {
  try {
    const token = localStorage.getItem("onyx_token");
    const response = await fetch(`${API_BASE_URL}/api/ai/smart-replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ lastMessage })
    });
    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    return ["Roger that", "Got it", "Cool"];
  }
};