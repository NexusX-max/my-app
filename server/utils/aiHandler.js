import { GoogleGenerativeAI } from "@google/generative-ai";

// ডট-এনভি কনফিগারেশন সাধারণত index.js এ থাকে, তাই এখানে আলাদা করে দরকার নেই।
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * ১. ইন্টেন্ট এক্সট্রাকশন (ইন্টেলিজেন্ট ফিল্টারিংয়ের জন্য)
 */
export const extractIntent = async (userQuery) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Extract search parameters from: "${userQuery}". Identify: location, skills, and role. Return ONLY JSON. Example: {"location": "Khulna", "skills": ["React"], "role": "Developer"}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // JSON ক্লিনআপ (ব্যাকটিক বা বাড়তি টেক্সট রিমুভ করা)
    const cleanJson = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("❌ Intent Extraction Error:", error.message);
    return { location: null, skills: [], role: null };
  }
};

/**
 * ২. ভেক্টর এমবেডিং জেনারেশন (সিমিলার প্রোফাইল খোঁজার জন্য)
 */
export const getEmbeddings = async (userQuery) => {
  try {
    const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await embeddingModel.embedContent(userQuery);
    return result.embedding.values;
  } catch (error) {
    console.error("❌ Embedding Generation Error:", error.message);
    return null;
  }
};

/**
 * ৩. কম্বাইন্ড ফাংশন (যদি একবারে ডাটা লাগে)
 */
export const getNeuralData = async (userQuery) => {
  try {
    const [intent, vector] = await Promise.all([
      extractIntent(userQuery),
      getEmbeddings(userQuery)
    ]);
    return { intent, vector };
  } catch (error) {
    console.error("❌ AI Handler Global Error:", error);
    return { intent: null, vector: null };
  }
};