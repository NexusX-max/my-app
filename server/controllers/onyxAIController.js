// controllers/onyxAIController.js
const axios = require('axios');

const generateOnyxResponse = async (taskType, userInput) => {
    let instruction = "";
    
    // টাস্ক অনুযায়ী ইনস্ট্রাকশন সেট করা
    if (taskType === "COPILOT") {
        instruction = "Convert this into a beautiful social media post with emojis and hashtags: ";
    } else if (taskType === "SUMMARY") {
        instruction = "Summarize these comments into one line: ";
    }

    try {
        const res = await axios.post('http://host.docker.internal:11434/api/generate', {
            model: "llama3",
            prompt: instruction + userInput,
            stream: false
        });
        return res.data.response;
    } catch (err) {
        return "AI is sleeping, try again later!";
    }
};