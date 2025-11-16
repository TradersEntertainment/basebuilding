"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import LobbyList from "@/components/LobbyList";
import CreateGameModal from "@/components/CreateGameModal";
import { motion } from "framer-motion";

export default function LobbyPage() {
  const { isConnected } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Game Lobby
            </h1>
            <p className="text-gray-400">
              Join an existing game or create your own
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateModalOpen(true)}
            disabled={!isConnected}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Game
          </motion.button>
        </div>

        {!isConnected && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
            <p className="text-yellow-500 text-center font-semibold">
              Connect your wallet to create or join games
            </p>
          </div>
        )}

        <LobbyList />

        <CreateGameModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </div>
  );
}
