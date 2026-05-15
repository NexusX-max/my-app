// server/socket.js
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";

let io;

export const initSocket = async (httpServer) => {
  // ১. Redis ক্লায়েন্ট সেটআপ (স্কেলেবিলিটির জন্য)
  const pubClient = createClient({ url: "redis://localhost:6379" });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  // ২. Socket.io ইনিশিয়ালাইজেশন
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL, // তোমার ফ্রন্টএন্ড URL (যেমন: http://localhost:5173)
      methods: ["GET", "POST"],
    },
  });

  // ৩. Redis অ্যাডাপ্টার কানেক্ট করা
  io.adapter(createAdapter(pubClient, subClient));

  const users = new Map(); // অনলাইন ইউজার ট্র্যাক করার জন্য

  io.on("connection", (socket) => {
    console.log("A neural link established:", socket.id);

    // ইউজার অনলাইন হলে তাকে ম্যাপে সেভ করা
    socket.on("addUser", (userId) => {
      users.set(userId, socket.id);
      io.emit("getOnlineUsers", Array.from(users.keys()));
    });

    // মেসেজ আদান-প্রদান (Main Logic)
    socket.on("sendMessage", ({ senderId, receiverId, text, status }) => {
      const receiverSocketId = users.get(receiverId);
      
      if (receiverSocketId) {
        // রিসিভারকে রিয়েল-টাইমে পাঠানো
        io.to(receiverSocketId).emit("getMessage", {
          senderId,
          text,
          status: "delivered", // সাথে সাথে ডেলিভারড স্ট্যাটাস
        });
      }
    });

    // ডিসকানেক্ট হলে
    socket.on("disconnect", () => {
      for (let [userId, socketId] of users.entries()) {
        if (socketId === socket.id) {
          users.delete(userId);
          break;
        }
      }
      io.emit("getOnlineUsers", Array.from(users.keys()));
    });
  });

  return io;
};