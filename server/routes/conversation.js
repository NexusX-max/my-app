// routes/conversation.js
const express = require('express');
const router = express.Router();
// আপনার কনভারসেশন কন্ট্রোলার বা লজিক এখানে ইম্পোর্ট করুন
const { createConversation } = require('../controllers/conversationController'); 

// এই লাইনটি আপনার রিকোয়েস্ট পাথ ঠিক করবে
router.post('/create', createConversation); 

router.post('/create', async (req, res) => {
    try {
        console.log("Request received for:", req.body);
        // এখানে আপনার ডাটাবেস লজিক লিখুন
        res.status(200).json({ message: "Conversation created successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router;