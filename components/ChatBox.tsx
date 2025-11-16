"use client";

import { useState, useEffect, useRef } from "react";
import { formatAddress } from "@/lib/utils";
import { motion } from "framer-motion";

interface Message {
  id: string;
  player: string;
  text: string;
  timestamp: number;
  type: "chat" | "system";
}

interface ChatBoxProps {
  gameId: bigint;
  myAddress?: string;
}

export default function ChatBox({ gameId, myAddress }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !myAddress) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      player: myAddress,
      text: input.trim(),
      timestamp: Date.now(),
      type: "chat",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  const addSystemMessage = (text: string) => {
    const systemMessage: Message = {
      id: Date.now().toString(),
      player: "System",
      text,
      timestamp: Date.now(),
      type: "system",
    };
    setMessages((prev) => [...prev, systemMessage]);
  };

  return (
    <div className="flex flex-col h-96 bg-gray-900/50 border border-purple-500/30 rounded-xl overflow-hidden">
      <div className="p-3 border-b border-purple-500/30">
        <h3 className="text-lg font-semibold text-white">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm text-center">No messages yet</p>
        )}
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${
              msg.type === "system"
                ? "text-center text-gray-400 text-sm italic"
                : ""
            }`}
          >
            {msg.type === "chat" && (
              <div className="space-y-1">
                <p className="text-xs text-gray-400">
                  {msg.player.toLowerCase() === myAddress?.toLowerCase()
                    ? "You"
                    : formatAddress(msg.player)}
                </p>
                <p className="text-white text-sm bg-gray-800/50 rounded-lg p-2">
                  {msg.text}
                </p>
              </div>
            )}
            {msg.type === "system" && <p>{msg.text}</p>}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-purple-500/30">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
            maxLength={100}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
