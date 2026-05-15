// server/utils/notificationHelper.js
import Notification from '../models/Notification.js';
import { io, onlineUsers } from '../index.js'; // index.js থেকে সকেট ইমপোর্ট

/**
 * 💡 গ্লোবাল নোটিফিকেশন হেল্পার (Database + Real-time Sync)
 * @param {ObjectId} recipient - যাকে পাঠানো হচ্ছে
 * @param {ObjectId} sender - যে পাঠাচ্ছে (req.user._id)
 * @param {String} type - 'like', 'comment', 'follow', etc.
 * @param {ObjectId} post - (Optional) যদি কোনো পোস্টের সাথে জড়িত থাকে
 * @param {String} content - নোটিফিকেশন টেক্সট
 */
export const sendNotification = async (recipient, sender, type, post = null, content = '') => {
    try {
        // ১. নিজের অ্যাকশনে নিজেকে নোটিফিকেশন পাঠানোর দরকার নেই
        if (recipient.toString() === sender.toString()) return;

        // ২. ডাটাবেসে নোটিফিকেশন সেভ করা
        const newNotif = await Notification.create({
            recipient,
            sender,
            type,
            post,
            content
        });

        // ৩. প্রেরকের ডিটেইলস (নাম, ছবি) পপুলেট করা যাতে ফ্রন্টএন্ডে দেখানো যায়
        const populatedNotif = await newNotif.populate('sender', 'firstName lastName profilePic avatar nickname');

        console.log(`✅ Notification stored in DB: ${type}`);

        // ৪. রিয়েল-টাইম পুশ লজিক (Socket.io)
        // অনলাইন ইউজারদের মধ্যে প্রাপককে খুঁজে বের করা
        const receiver = onlineUsers.find((user) => user.userId === recipient.toString());

        if (receiver) {
            // যদি ইউজার অনলাইনে থাকে, তবে তার নির্দিষ্ট socketId তে সিগন্যাল পাঠানো
            io.to(receiver.socketId).emit("getNotification", populatedNotif);
            console.log(`📡 Neural Signal pushed to online node: ${recipient}`);
        } else {
            console.log(`💤 Target node offline, stored for later.`);
        }
        
    } catch (err) {
        console.error("❌ Notification Helper Error:", err);
    }
};