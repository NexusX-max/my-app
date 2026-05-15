import mongoose from 'mongoose';
import axios from 'axios';
import User from "../models/User.js"; 
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') }); 

const updateExistingUserEmbeddings = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(uri);
    console.log("✅ Connected.");

    const users = await User.find({ 
      $or: [
        { bio_embeddings: { $exists: false } },
        { bio_embeddings: { $size: 0 } }
      ]
    });

    console.log(`🧠 Debugging ${users.length} users...`);

    for (let user of users) {
      const text = `Name: ${user.firstName} ${user.lastName}. Bio: ${user.bio}`.trim();
      
      try {
        // সরাসরি v1beta এবং text-embedding-004 ট্রাই করা
        const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
        
        const response = await axios.post(url, {
          content: { parts: [{ text: text }] }
        });

        user.bio_embeddings = response.data.embedding.values;
        await user.save();
        console.log(`✅ Fixed: ${user.username}`);
        
      } catch (err) {
        // 🔥 এখানে আমরা আসল এররটা প্রিন্ট করছি
        console.error(`❌ REAL ERROR for ${user.username}:`, err.response?.data?.error?.message || err.message);
        break; // একটা এরর দেখলেই আমরা থেমে যাব যেন কনসোল ভরে না যায়
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Critical Failure:", error.message);
    process.exit(1);
  }
};

updateExistingUserEmbeddings();