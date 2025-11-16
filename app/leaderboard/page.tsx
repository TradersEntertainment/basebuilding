"use client";

import { formatAddress, formatEth } from "@/lib/utils";
import { motion } from "framer-motion";

interface LeaderboardEntry {
  rank: number;
  address: string;
  totalWinnings: bigint;
  gamesPlayed: number;
  winRate: number;
  biggestWin: bigint;
}

export default function LeaderboardPage() {
  const mockData: LeaderboardEntry[] = [];

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-gray-400">Top players by total winnings</p>
        </div>

        <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Total Winnings
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Games
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Win Rate
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Biggest Win
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {mockData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-gray-400 text-lg">
                        No players yet. Be the first!
                      </p>
                    </td>
                  </tr>
                ) : (
                  mockData.map((entry, index) => (
                    <motion.tr
                      key={entry.address}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {entry.rank <= 3 ? (
                            <span className="text-2xl">
                              {entry.rank === 1
                                ? "🥇"
                                : entry.rank === 2
                                ? "🥈"
                                : "🥉"}
                            </span>
                          ) : (
                            <span className="text-gray-400 font-semibold">
                              #{entry.rank}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white font-medium">
                          {formatAddress(entry.address)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-cyan-400 font-semibold">
                          {formatEth(entry.totalWinnings)} ETH
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white">{entry.gamesPlayed}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white">
                          {entry.winRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-green-400 font-semibold">
                          {formatEth(entry.biggestWin)} ETH
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Leaderboard updates in real-time as games complete
          </p>
        </div>
      </div>
    </div>
  );
}
