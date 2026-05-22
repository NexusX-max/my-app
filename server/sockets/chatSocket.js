
import Message from '../models/Message.js';
const { createClient } = require('redis');

module.exports = function (io) {
    // Redis ক্লায়েন্ট ইনিশিয়ালাইজেশন (মেমরি ক্যাশ এবং সকেট ম্যাপিং)
    const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    redisClient.connect().catch(console.error);

    io.on('connection', (socket) => {
        
        // ইউজার অনলাইনে এলে তার সকেট আইডি ম্যাপ করা
        socket.on('user_online', async (userId) => {
            socket.userId = userId;
            socket.join(userId); // ইউজারের নিজস্ব ইউনিক রুম
            
            // Redis-এ অনলাইন স্ট্যাটাস সেভ
            await redisClient.hSet('online_users', userId, socket.id);
            io.emit('user_status', { userId, status: 'online' });
        });

        // ১. ইনস্ট্যান্ট মেসেজ হ্যান্ডলিং (টার্গেট: <১০০ms)
        socket.on('send_msg', async (data) => {
            const { messageId, conversationId, receiverId, content, type, replyTo } = data;

            // অপটিমিস্টিক আর্কিটেকচার: ডাটাবেজে সেভ হওয়ার আগেই রিসিভারকে পুশ করা
            socket.to(receiverId).emit('receive_msg', {
                messageId,
                conversationId,
                senderId: socket.userId,
                content,
                messageType: type,
                replyTo,
                createdAt: new Date()
            });

            // সেন্ডারকে ডেলিভারি স্ট্যাটাস কনফার্ম করা
            socket.emit('msg_status', { messageId, status: 'delivered' });

            // [Todo]: ব্যাকগ্রাউন্ডে নন-ব্লকিং ওয়েতে MongoDB-তে মেসেজ সেভ করার লজিক এখানে কল হবে
        });

        // ২. টাইপিং ইন্ডিকেটর (মাখনের মতো মসৃণ)
        socket.on('typing', (data) => {
            const { receiverId, isTyping } = data;
            socket.to(receiverId).emit('display_typing', { senderId: socket.userId, isTyping });
        });

        // ৩. মেসেজ সিন স্ট্যাটাস (Seen Indicator)
        socket.on('msg_seen', (data) => {
            const { conversationId, senderId } = data;
            socket.to(senderId).emit('msg_seen_confirm', { conversationId, seenBy: socket.userId });
        });

        // ডিসকানেক্ট হলে অনলাইন স্ট্যাটাস ক্লিন করা
        socket.on('disconnect', async () => {
            if (socket.userId) {
                await redisClient.hDel('online_users', socket.userId);
                io.emit('user_status', { userId: socket.userId, status: 'offline' });
            }
        });
    });
};