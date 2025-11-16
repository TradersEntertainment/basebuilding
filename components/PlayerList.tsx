"use client";

import { formatAddress } from "@/lib/utils";
import { motion } from "framer-motion";

interface PlayerListProps {
  players: string[];
  eliminatedPlayers: string[];
  currentPlayer: string;
  myAddress?: string;
}

export default function PlayerList({
  players,
  eliminatedPlayers,
  currentPlayer,
  myAddress,
}: PlayerListProps) {
  const isEliminated = (player: string) =>
    eliminatedPlayers.some(
      (p) => p.toLowerCase() === player.toLowerCase()
    );

  const isCurrentPlayer = (player: string) =>
    currentPlayer?.toLowerCase() === player.toLowerCase();

  const isMe = (player: string) =>
    myAddress?.toLowerCase() === player.toLowerCase();

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-300 mb-3">Players</h3>
      <div className="space-y-2">
        {players.map((player, index) => {
          const eliminated = isEliminated(player);
          const current = isCurrentPlayer(player);
          const me = isMe(player);

          return (
            <motion.div
              key={player}
              className={`
                flex items-center justify-between p-3 rounded-lg
                border backdrop-blur-sm transition-all
                ${
                  eliminated
                    ? "bg-red-500/10 border-red-500/30 opacity-50"
                    : current
                    ? "bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/50"
                    : "bg-gray-800/50 border-gray-700"
                }
              `}
              animate={current ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 1, repeat: current ? Infinity : 0 }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">
                  {eliminated ? "❌" : current ? "🎯" : "✅"}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">
                    Player {index + 1} {me && "(You)"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatAddress(player)}
                  </p>
                </div>
              </div>
              {current && !eliminated && (
                <span className="text-xs px-2 py-1 bg-purple-500 rounded-full text-white font-semibold">
                  TURN
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
