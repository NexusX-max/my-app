import express from 'express';
const router = express.Router();
import User from "../models/User.js"; 
import { extractIntent, getEmbeddings } from "../utils/aiHandler.js";

/* ==========================================================
    🧠 ONYX DRIFT: HYBRID NEURAL SEARCH ENGINE
   ========================================================== */

/**
 * @ROUTE: POST /api/v1/search/neural
 * @DESC: Hybrid search using Vector and Intent Extraction
 */
router.post("/neural", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ message: "Neural input required" });

    console.log(`📡 Processing Neural Request for: "${query}"`);

    // ১. এআই দিয়ে ইন্টেন্ট এবং ভেক্টর জেনারেশন (Parallel execution)
    const [intent, vector] = await Promise.all([
      extractIntent(query).catch(err => { 
        console.error("❌ Intent Extraction Error:", err.message); 
        return { location: null, skills: [], role: null }; // Default intent on failure
      }),
      getEmbeddings(query).catch(err => { 
        console.error("❌ Embedding Error:", err.message); 
        return null; // Fallback to regular regex search
      })
    ]);

    console.log("🔍 Intent Captured:", intent);

    // ২. হাইব্রিড সার্চ পাইপলাইন শুরু
    let pipeline = [];

    // ক) ভেক্টর সার্চ স্টেজ (Semantic Similarity) - যদি ভেক্টর জেনারেট হয়
    if (vector) {
      pipeline.push({
        "$vectorSearch": {
          "index": "default", 
          "path": "bio_embeddings",
          "queryVector": vector,
          "numCandidates": 100,
          "limit": 20
        }
      });
    }

    // ৩. রিফাইনমেন্ট স্টেজ (ইন্টেন্ট অনুযায়ী ফিল্টারিং)
    const matchConditions = [];
    
    // লোকেশন ফিল্টার
    if (intent?.location) {
      matchConditions.push({ "location": { "$regex": intent.location, "$options": "i" } });
    }
    
    // স্কিল ফিল্টার
    if (intent?.skills && Array.isArray(intent.skills) && intent.skills.length > 0) {
      matchConditions.push({ "skills": { "$in": intent.skills.map(s => new RegExp(s, "i")) } });
    }

    // নাম বা রোলের জন্য স্মার্ট সার্চ (Regex Fallback)
    const searchKey = intent?.role || query; 
    if (searchKey) {
      matchConditions.push({ 
        "$or": [
          { "fullName": { "$regex": searchKey, "$options": "i" } },
          { "firstName": { "$regex": searchKey, "$options": "i" } },
          { "lastName": { "$regex": searchKey, "$options": "i" } },
          { "username": { "$regex": searchKey, "$options": "i" } },
          { "bio": { "$regex": searchKey, "$options": "i" } }
        ]
      });
    }

    // পাইপলাইনে ফিল্টার কন্ডিশন যোগ করা
    if (matchConditions.length > 0) {
      if (pipeline.length === 0) {
        // যদি AI এমবেডিং কাজ না করে, তবে সরাসরি ডাটাবেস থেকে সাধারণ রেগুলার সার্চ করবে
        pipeline.push({ "$match": { "$and": matchConditions } });
      } else {
        // যদি ভেক্টর থাকে, তবে ভেক্টর রেজাল্ট থেকে রিফাইন করবে (OR ব্যবহার করা হয়েছে আবিষ্কার করার সুবিধার্থে)
        pipeline.push({ "$match": { "$or": matchConditions } });
      }
    }

    // ৪. রেজাল্ট প্রজেকশন (ফ্রন্টএন্ডের জন্য ক্লিন ডাটা)
    pipeline.push({
      "$project": {
        "_id": 1,
        "username": 1,
        "fullName": 1,
        "firstName": 1,
        "lastName": 1,
        "avatar": 1,
        "profilePic": 1,
        "location": 1,
        "skills": 1,
        "score": { "$meta": "searchScore" }
      }
    });

    const results = await User.aggregate(pipeline);

    console.log(`✅ Search Complete. Found ${results.length} nodes.`);

    res.json({ 
      success: true, 
      intent, 
      results,
      count: results.length 
    });

  } catch (error) {
    console.error("❌ Neural Link Broken:", error);
    res.status(500).json({ success: false, message: "Transmission failed" });
  }
});

/* ==========================================================
    🔗 ALIAS ROUTES (404 Error Fix)
    আপনার ফ্রন্টএন্ড থেকে /api/user/search এ রিকোয়েস্ট আসলেও এটি হ্যান্ডেল করবে
   ========================================================== */
router.get("/search", async (req, res) => {
    // Redirect to neural search or handle simple get
    const query = req.query.q;
    res.status(200).json({ message: "Use POST /neural for deep search", suggestion: query });
});

export default router;