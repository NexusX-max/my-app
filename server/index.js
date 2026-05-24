import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import cors from "cors";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

// DATABASE + MODELS
import connectAllDB from "./config/db.js";
import Message from "./models/Message.js";
import Group from "./models/Group.js";

// ROUTES
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/user.js";
import profileRoutes from "./routes/profile.js";
import postRoutes from "./routes/posts.js";
import reelRoutes from "./routes/reels.js";
import storyRoute from "./routes/story.js";
import groupRoutes from "./routes/group.js";
import marketRoutes from "./routes/market.js";
import adminRoutes from "./routes/admin.js";
import messageRoutes from "./routes/messages.js";
import aiRoutes from "./routes/aiRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

import { getNeuralFeed } from "./controllers/feedController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const server = http.createServer(app);

app.set("trust proxy", 1);

// =====================================================
// ALLOWED ORIGINS
// =====================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://onyx-drift.com",
  "https://www.onyx-drift.com",
  "https://api.onyx-drift.com",
  "https://onyx-messenger.vercel.app"
];

// =====================================================
// SOCKET.IO
// =====================================================

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  },

  transports: ["websocket", "polling"],

  pingTimeout: 60000,
  pingInterval: 25000,

  maxHttpBufferSize: 1e8
});

// =====================================================
// REDIS
// =====================================================

const pubClient = createClient({
  url:
    process.env.REDIS_URL ||
    "redis://localhost:6379"
});

const subClient = pubClient.duplicate();

pubClient.on("error", (err) => {
  console.error("Redis Pub Error:", err);
});

subClient.on("error", (err) => {
  console.error("Redis Sub Error:", err);
});

// =====================================================
// ONLINE USERS MAP
// =====================================================

const onlineUsers = new Map();

function addUser(userId, socketId) {
  if (!userId || !socketId) return;

  onlineUsers.set(userId.toString(), {
    socketId,
    lastSeen: Date.now()
  });

  io.emit(
    "getOnlineUsers",
    Array.from(onlineUsers.keys())
  );

  console.log(
    `📡 User Connected: ${userId}`
  );
}

function getUserSocket(userId) {
  return onlineUsers.get(userId?.toString());
}

// =====================================================
// EXPRESS MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
      } else {
        callback(
          new Error(
            "Unauthorized Origin"
          )
        );
      }
    },

    credentials: true
  })
);

app.use(
  express.json({
    limit: "150mb"
  })
);

app.use(
  express.urlencoded({
    limit: "150mb",
    extended: true
  })
);

// =====================================================
// UPLOADS
// =====================================================

const uploadDir = path.join(
  __dirname,
  "uploads"
);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true
  });
}

app.use(
  "/uploads",
  express.static(uploadDir)
);

// =====================================================
// AUTH MIDDLEWARE
// =====================================================

const protect = async (
  req,
  res,
  next
) => {
  try {
    const token =
      req.headers.authorization?.split(
        " "
      )[1];

    if (!token) {
      return res
        .status(401)
        .json({
          error: "Token missing"
        });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const userId =
      decoded.id ||
      decoded._id ||
      decoded.userId;

    req.user = {
      id: userId,
      _id: userId
    };

    next();
  } catch (err) {
    return res
      .status(401)
      .json({
        error: "Unauthorized"
      });
  }
};

// =====================================================
// API ROUTES
// =====================================================

app.get("/", (req, res) => {
  res.json({
    status: "ACTIVE",
    system: "ONYX CORE"
  });
});

app.use("/api/auth", authRoutes);

app.use(
  "/api/profile",
  protect,
  profileRoutes
);

app.use(
  "/api/users",
  protect,
  userRoutes
);

app.use(
  "/api/posts",
  protect,
  postRoutes
);

app.use(
  "/api/reels",
  protect,
  reelRoutes
);

app.use(
  "/api/story",
  protect,
  storyRoute
);

app.use(
  "/api/groups",
  protect,
  groupRoutes
);

app.use(
  "/api/messages",
  protect,
  messageRoutes
);

app.use(
  "/api/market",
  protect,
  marketRoutes
);

app.use(
  "/api/admin",
  protect,
  adminRoutes
);

app.use(
  "/api/notifications",
  protect,
  notificationRoutes
);

app.use(
  "/api/ai",
  protect,
  aiRoutes
);

app.use(
  "/api/v1/search",
  protect,
  searchRoutes
);

app.get(
  "/api/feed",
  protect,
  getNeuralFeed
);

// =====================================================
// SOCKET AUTH
// =====================================================

io.use((socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token;

    if (!token) {
      return next(
        new Error("Unauthorized")
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    socket.user = decoded;

    next();
  } catch (err) {
    next(new Error("Unauthorized"));
  }
});

// =====================================================
// SOCKET SYSTEM
// =====================================================

const setupSocket = async () => {
  try {
    await pubClient.connect();
    await subClient.connect();

    io.adapter(
      createAdapter(
        pubClient,
        subClient
      )
    );

    console.log(
      "💎 Redis Adapter Connected"
    );
  } catch (err) {
    console.error(
      "❌ Redis Failed:",
      err
    );
  }

  io.on("connection", (socket) => {

    const userId =
      socket.handshake.query.userId;

    if (
      userId &&
      userId !== "undefined"
    ) {
      addUser(userId, socket.id);
    }

    // =========================================
    // ADD USER
    // =========================================

    socket.on(
      "addNewUser",
      (userId) => {
        addUser(userId, socket.id);
      }
    );

    // =========================================
    // DIRECT MESSAGE
    // =========================================

    socket.on(
      "sendMessage",
      async (message) => {
        try {

          const receiver =
            getUserSocket(
              message.receiverId
            );

          const payload = {
            ...message,
            delivered:
              !!receiver,
            createdAt:
              new Date()
          };

          if (receiver) {

            io.to(
              receiver.socketId
            ).emit(
              "getMessage",
              payload
            );

            io.to(
              receiver.socketId
            ).emit(
              "getNotification",
              {
                senderId:
                  message.senderId,

                senderName:
                  message.senderName ||
                  "User",

                text:
                  message.text ||
                  "New message",

                isRead: false,

                createdAt:
                  new Date()
              }
            );
          }

          socket.emit(
            "messageDelivered",
            {
              messageId:
                message.id,

              delivered:
                !!receiver
            }
          );

        } catch (err) {

          console.error(
            "❌ sendMessage:",
            err
          );

        }
      }
    );

    // =========================================
    // MESSAGE SEEN
    // =========================================

    socket.on(
      "messageSeen",
      ({
        senderId,
        receiverId
      }) => {

        const senderSocket =
          getUserSocket(
            senderId
          );

        if (senderSocket) {

          io.to(
            senderSocket.socketId
          ).emit(
            "messagesSeen",
            {
              by: receiverId
            }
          );

        }

      }
    );

    // =========================================
    // TYPING
    // =========================================

    socket.on(
      "typing",
      ({
        to,
        userId,
        isTyping
      }) => {

        const receiver =
          getUserSocket(to);

        if (!receiver) return;

        io.to(
          receiver.socketId
        ).emit(
          "typing",
          {
            userId,
            isTyping
          }
        );

      }
    );

    // =========================================
    // GROUP ROOM JOIN
    // =========================================

    socket.on(
      "join_group_room",
      ({ groupId }) => {

        if (!groupId) return;

        socket.join(
          `group_${groupId}`
        );

      }
    );

    // =========================================
    // GROUP MESSAGE
    // =========================================

    socket.on(
      "send_group_message",
      async (payload) => {

        try {

          const {
            groupId,
            text,
            mediaUrl,
            sender,
            tempId
          } = payload;

          if (
            !groupId ||
            !sender?._id
          )
            return;

          let processedMediaUrl =
            null;

          if (
            mediaUrl &&
            mediaUrl.startsWith(
              "data:"
            )
          ) {

            const matches =
              mediaUrl.match(
                /^data:([A-Za-z-+/]+);base64,(.+)$/
              );

            if (
              matches &&
              matches.length === 3
            ) {

              const ext =
                matches[1].split(
                  "/"
                )[1];

              const buffer =
                Buffer.from(
                  matches[2],
                  "base64"
                );

              const filename =
                `onyx_${Date.now()}.${ext}`;

              const fullPath =
                path.join(
                  uploadDir,
                  filename
                );

              fs.writeFileSync(
                fullPath,
                buffer
              );

              processedMediaUrl =
                `${
                  process.env
                    .VITE_API_URL
                }/uploads/${filename}`;
            }

          } else {
            processedMediaUrl =
              mediaUrl;
          }

          const newMessage =
            await Message.create({
              groupId:
                new mongoose.Types.ObjectId(
                  groupId
                ),

              sender:
                new mongoose.Types.ObjectId(
                  sender._id
                ),

              text:
                text || "",

              mediaUrl:
                processedMediaUrl
            });

          const populated =
            await Message.findById(
              newMessage._id
            ).populate(
              "sender",
              "fullName username profilePic"
            );

          io.to(
            `group_${groupId}`
          ).emit(
            "receive_group_message",
            {
              _id:
                populated._id,

              tempId,

              groupId,

              text:
                populated.text,

              mediaUrl:
                populated.mediaUrl,

              sender:
                populated.sender,

              createdAt:
                populated.createdAt,

              reactions: []
            }
          );

        } catch (err) {

          console.error(
            "❌ Group Message Error:",
            err
          );

        }
      }
    );

    // =========================================
    // GROUP TYPING
    // =========================================

    socket.on(
      "group_typing_signal",
      ({
        groupId,
        username,
        isTyping
      }) => {

        socket.to(
          `group_${groupId}`
        ).emit(
          "group_typing_broadcast",
          {
            username,
            isTyping
          }
        );

      }
    );

    // =========================================
    // CALL USER
    // =========================================

    socket.on(
      "callUser",
      (data) => {

        try {

          const receiver =
            getUserSocket(
              data.userToCall
            );

          if (!receiver) {

            socket.emit(
              "callOffline",
              {
                message:
                  "User offline"
              }
            );

            return;
          }

          io.to(
            receiver.socketId
          ).emit(
            "incomingCall",
            {
              signal:
                data.signalData,

              from:
                data.from,

              name:
                data.name,

              avatar:
                data.avatar,

              type:
                data.type,

              roomId:
                data.roomId,

              createdAt:
                Date.now()
            }
          );

          setTimeout(() => {

            io.to(
              socket.id
            ).emit(
              "callTimeout",
              {
                roomId:
                  data.roomId
              }
            );

          }, 30000);

        } catch (err) {

          console.error(
            "❌ callUser:",
            err
          );

        }
      }
    );

    // =========================================
    // ANSWER CALL
    // =========================================

    socket.on(
      "answerCall",
      (data) => {

        const caller =
          getUserSocket(
            data.to
          );

        if (!caller) return;

        io.to(
          caller.socketId
        ).emit(
          "callAccepted",
          {
            signal:
              data.signal,

            answerBy:
              data.answerBy
          }
        );

      }
    );

    // =========================================
    // REJECT CALL
    // =========================================

    socket.on(
      "rejectCall",
      ({ to }) => {

        const caller =
          getUserSocket(to);

        if (!caller) return;

        io.to(
          caller.socketId
        ).emit(
          "callRejected"
        );

      }
    );

    // =========================================
    // END CALL
    // =========================================

    socket.on(
      "endCall",
      ({ to }) => {

        const receiver =
          getUserSocket(to);

        if (!receiver) return;

        io.to(
          receiver.socketId
        ).emit(
          "callEnded"
        );

      }
    );

    // =========================================
    // DISCONNECT
    // =========================================

    socket.on(
      "disconnect",
      () => {

        for (const [
          userId,
          value
        ] of onlineUsers.entries()) {

          if (
            value.socketId ===
            socket.id
          ) {

            onlineUsers.delete(
              userId
            );

            break;
          }
        }

        io.emit(
          "getOnlineUsers",
          Array.from(
            onlineUsers.keys()
          )
        );

        console.log(
          "🛑 User disconnected"
        );

      }
    );

  });

  // =========================================
  // HEARTBEAT CLEANER
  // =========================================

  setInterval(() => {

    for (const [
      userId,
      value
    ] of onlineUsers.entries()) {

      if (
        Date.now() -
          value.lastSeen >
        1000 * 60 * 5
      ) {

        onlineUsers.delete(
          userId
        );

      }

    }

  }, 60000);

};

// =====================================================
// START SERVER
// =====================================================

const startApp = async () => {

  try {

    await connectAllDB();

    await setupSocket();

    const PORT =
      process.env.PORT || 5005;

    server.listen(
      PORT,
      "0.0.0.0",
      () => {

        console.log(
          `🚀 ONYX CORE ACTIVE ON ${PORT}`
        );

      }
    );

  } catch (err) {

    console.error(
      "❌ START FAILURE:",
      err
    );

    setTimeout(
      startApp,
      3000
    );

  }

};

startApp();