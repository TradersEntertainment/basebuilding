"use client";

import { useActiveGames, useGameState } from "@/hooks/useGameState";
import { useRouter } from "next/navigation";
import { formatEth } from "@/lib/utils";
import { motion } from "framer-motion";

function GameCard({ gameId }: { gameId: bigint }) {
  const { gameState } = useGameState(gameId);
  const router = useRouter();

  if (!gameState) return null;

  const {
    players,
    maxPlayers,
    entryFee,
    prizePool,
    started,
    finished,
    isPublic,
  } = gameState;

  if (finished) return null;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">
            Room #{gameId.toString()}
          </h3>
          <p className="text-sm text-gray-400">
            {isPublic ? "Public" : "Private"}
          </p>
        </div>
        {started && (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full">
            LIVE
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Players</span>
          <span className="text-white font-semibold">
            {players.length}/{maxPlayers}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Entry Fee</span>
          <span className="text-white font-semibold">
            {formatEth(entryFee)} ETH
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Prize Pool</span>
          <span className="text-cyan-400 font-semibold">
            {formatEth(prizePool)} ETH
          </span>
        </div>
      </div>

      <button
        onClick={() => router.push(`/room/${gameId}`)}
        className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all font-semibold"
      >
        {started ? "Watch" : "Join"}
      </button>
    </motion.div>
  );
}

export default function LobbyList() {
  const { gameIds, isLoading } = useActiveGames();

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Loading games...</p>
      </div>
    );
  }

  const gameIdsArray = Array.isArray(gameIds) ? gameIds : [];

  if (gameIdsArray.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No active games</p>
        <p className="text-gray-500 mt-2">Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {gameIdsArray.map((gameId) => (
        <GameCard key={gameId.toString()} gameId={gameId} />
      ))}
    </div>
  );
}
