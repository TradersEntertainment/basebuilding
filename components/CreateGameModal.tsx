"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/hooks/useGame";

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateGameModal({ isOpen, onClose }: CreateGameModalProps) {
  const [entryFee, setEntryFee] = useState("0.01");
  const [maxPlayers, setMaxPlayers] = useState(5);
  const [turnDuration, setTurnDuration] = useState(15);
  const [isPublic, setIsPublic] = useState(true);

  const { createGame, isPending } = useGame();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createGame(entryFee, maxPlayers, turnDuration, isPublic);
      onClose();
    } catch (error) {
      console.error("Failed to create game:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Create New Game
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Entry Fee (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={entryFee}
                    onChange={(e) => setEntryFee(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Players: {maxPlayers}
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Turn Duration: {turnDuration}s
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    value={turnDuration}
                    onChange={(e) => setTurnDuration(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPublic" className="text-sm text-gray-300">
                    Public Game
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    disabled={isPending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all disabled:opacity-50"
                  >
                    {isPending ? "Creating..." : "Create Game"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
