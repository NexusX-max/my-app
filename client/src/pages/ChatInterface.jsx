import React, {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback
} from "react";

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import CryptoJS from "crypto-js";

import {
  FaArrowLeft,
  FaPhone,
  FaVideo,
  FaPaperPlane,
  FaMicrophone,
  FaLock,
  FaPlus,
  FaCheck,
  FaCheckDouble
} from "react-icons/fa";

import { AuthContext } from "../context/AuthContext";

const ONYX_SECRET_KEY = "onyx_neural_shield_2026";

const encryptMessage = (text) => {
  return CryptoJS.AES.encrypt(
    text,
    ONYX_SECRET_KEY
  ).toString();
};

const decryptMessage = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(
      cipherText,
      ONYX_SECRET_KEY
    );

    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "⚠️ Decryption Error";
  }
};

const getAvatarUrl = (target) => {
  if (!target)
    return `https://ui-avatars.com/api/?name=User`;

  const pic =
    target.profilePic ||
    target.avatar ||
    target.profileImage;

  if (pic?.startsWith("http")) return pic;

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    target.fullName || target.name || "User"
  )}&background=06b6d4&color=fff`;
};

const ChatInterface = ({
  activeChat,
  onBack,
  isGroup = false
}) => {
  const { user, socket } = useContext(AuthContext);

  const navigate = useNavigate();

  const scrollRef = useRef(null);

  const chatId = activeChat?._id || activeChat?.id;

  const storageKey = isGroup
    ? `group_chat_${chatId}`
    : `chat_${chatId}`;

  const [msg, setMsg] = useState("");

  const [isListening, setIsListening] =
    useState(false);

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(storageKey);

    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "system-1",
            text: "Neural encryption enabled 🔐",
            sender: "system"
          }
        ];
  });

  // =========================
  // Notification Permission
  // =========================

  useEffect(() => {
    if (
      "Notification" in window &&
      Notification.permission !== "granted"
    ) {
      Notification.requestPermission();
    }
  }, []);

  // =========================
  // Auto Scroll
  // =========================

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  // =========================
  // Save Messages
  // =========================

  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify(messages)
    );
  }, [messages, storageKey]);

  // =========================
  // Seen Event
  // =========================

  useEffect(() => {
    if (!socket || !chatId || !user?._id) return;

    socket.emit("messageSeen", {
      senderId: chatId,
      receiverId: user._id
    });
  }, [chatId, socket, user]);

  // =========================
  // Incoming Message
  // =========================

  const handleIncomingMessage = useCallback(
    (data) => {
      if (data.senderId !== chatId) return;

      // CALL SIGNAL FILTER
      if (
        data.isIncomingCall ||
        data.isCallSignal ||
        data.type === "audio" ||
        data.type === "video"
      ) {
        return;
      }

      const exists = messages.find(
        (m) => m.id === data.id
      );

      if (exists) return;

      const decrypted =
        data.type === "media"
          ? data.text
          : decryptMessage(data.text);

      const newMsg = {
        ...data,
        text: decrypted,
        sender: "them"
      };

      setMessages((prev) => [...prev, newMsg]);

      socket.emit("messageSeen", {
        senderId: data.senderId,
        receiverId: user._id
      });

      // Push Notification
      if (
        document.hidden &&
        Notification.permission === "granted"
      ) {
        new Notification(
          activeChat?.fullName || "New Message",
          {
            body: decrypted,
            icon: getAvatarUrl(activeChat)
          }
        );
      }
    },
    [chatId, messages, socket, user, activeChat]
  );

  // =========================
  // Incoming Call
  // =========================

  const handleIncomingCall = useCallback(
    (data) => {
      if (data.userToCall !== user._id) return;

      navigate(
        `/call/${data.roomId}?type=${data.callType}&mode=incoming`,
        {
          state: data
        }
      );
    },
    [navigate, user]
  );

  // =========================
  // Socket Listeners
  // =========================

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "getMessage",
      handleIncomingMessage
    );

    socket.on(
      "$incomingCall",
      handleIncomingCall
    );

    return () => {
      socket.off(
        "getMessage",
        handleIncomingMessage
      );

      socket.off(
        "$incomingCall",
        handleIncomingCall
      );
    };
  }, [
    socket,
    handleIncomingMessage,
    handleIncomingCall
  ]);

  // =========================
  // Send Message
  // =========================

  const handleSend = (
    content = msg,
    type = "text",
    extra = {}
  ) => {
    if (!content.trim()) return;

    const messageId = `${Date.now()}-${Math.random()}`;

    const isCall =
      extra.isIncomingCall ||
      extra.isCallSignal;

    const encrypted =
      type === "text" && !isCall
        ? encryptMessage(content)
        : content;

    const payload = {
      id: messageId,
      senderId: user._id,
      receiverId: chatId,
      senderName: user.fullName,
      text: encrypted,
      type,
      timestamp: new Date().toISOString(),
      ...extra
    };

    if (socket?.connected) {
      if (isCall) {
        socket.emit("$incomingCall", payload);
      } else {
        socket.emit("sendMessage", payload);
      }
    }

    if (!isCall) {
      setMessages((prev) => [
        ...prev,
        {
          ...payload,
          text: content,
          sender: "me",
          status: "sent"
        }
      ]);
    }

    setMsg("");
  };

  // =========================
  // Call Handler
  // =========================

  const handleCallClick = (type) => {
    if (!socket?.connected) {
      alert("Connection unstable");
      return;
    }

    const roomId = [user._id, chatId]
      .sort()
      .join("_");

    const callPayload = {
      isIncomingCall: true,
      isCallSignal: true,
      userToCall: chatId,
      from: user._id,
      name: user.fullName,
      avatar: getAvatarUrl(user),
      callType: type,
      roomId
    };

    socket.emit("$incomingCall", callPayload);

    navigate(
      `/call/${roomId}?type=${type}&mode=outgoing`,
      {
        state: callPayload
      }
    );
  };

  // =========================
  // Voice Recognition
  // =========================

  const startVoiceCapture = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition =
      new SpeechRecognition();

    recognition.onstart = () =>
      setIsListening(true);

    recognition.onend = () =>
      setIsListening(false);

    recognition.onresult = (e) => {
      setMsg(e.results[0][0].transcript);
    };

    recognition.start();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed inset-0 bg-[#020617] flex flex-col z-[9999]"
    >
      {/* HEADER */}

      <header className="p-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl bg-white/5"
          >
            <FaArrowLeft />
          </button>

          <img
            src={getAvatarUrl(activeChat)}
            className="w-11 h-11 rounded-2xl"
            alt=""
          />

          <div>
            <h2 className="text-white font-bold">
              {activeChat?.fullName}
            </h2>

            <p className="text-cyan-400 text-[10px] flex items-center gap-1">
              <FaLock />
              End-to-End Encrypted
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() =>
              handleCallClick("audio")
            }
            className="p-3 rounded-2xl bg-zinc-900 text-cyan-400"
          >
            <FaPhone />
          </button>

          <button
            onClick={() =>
              handleCallClick("video")
            }
            className="p-3 rounded-2xl bg-zinc-900 text-cyan-400"
          >
            <FaVideo />
          </button>
        </div>
      </header>

      {/* CHAT */}

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.sender === "me"
                ? "justify-end"
                : m.sender === "system"
                ? "justify-center"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-3xl ${
                m.sender === "me"
                  ? "bg-cyan-500/10 text-white"
                  : m.sender === "system"
                  ? "bg-transparent text-zinc-600 text-xs"
                  : "bg-zinc-900 text-zinc-200"
              }`}
            >
              {m.text}

              {m.sender !== "system" && (
                <div className="flex justify-end items-center gap-1 text-[10px] mt-2 opacity-50">
                  {m.status === "seen" ? (
                    <FaCheckDouble />
                  ) : (
                    <FaCheck />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        <div ref={scrollRef} />
      </main>

      {/* FOOTER */}

      <footer className="p-4 border-t border-white/5 bg-black/40">
        <div className="flex items-center gap-2 bg-zinc-900 rounded-full px-3 py-2">
          <button className="text-zinc-500">
            <FaPlus />
          </button>

          <input
            value={msg}
            onChange={(e) =>
              setMsg(e.target.value)
            }
            placeholder="Type message..."
            className="flex-1 bg-transparent outline-none text-white"
            onKeyDown={(e) =>
              e.key === "Enter" &&
              handleSend()
            }
          />

          <button
            onClick={startVoiceCapture}
            className={
              isListening
                ? "text-red-500"
                : "text-zinc-500"
            }
          >
            <FaMicrophone />
          </button>

          <button
            onClick={() => handleSend()}
            className="bg-cyan-500 p-3 rounded-full text-white"
          >
            <FaPaperPlane />
          </button>
        </div>
      </footer>
    </motion.div>
  );
};

export default ChatInterface;