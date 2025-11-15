"use client";

import { motion } from "framer-motion";
import { useStats } from "@/hooks/useStats";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

export default function StatsBoard() {
  const { address } = useAccount();
  const { userStats, recentGames, totalVolume, houseBalance, totalFees, totalSupply } = useStats();

  const statsCards = [
    {
      title: "Total Volume",
      value: totalVolume ? `${parseFloat(formatUnits(totalVolume, 18)).toFixed(2)} CASINO` : "0",
      gradient: "from-neon-purple to-neon-pink",
    },
    {
      title: "House Balance",
      value: houseBalance ? `${parseFloat(formatUnits(houseBalance, 18)).toFixed(2)} CASINO` : "0",
      gradient: "from-neon-cyan to-neon-purple",
    },
    {
      title: "Total Fees",
      value: totalFees ? `${parseFloat(formatUnits(totalFees, 18)).toFixed(2)} CASINO` : "0",
      gradient: "from-neon-pink to-neon-purple",
    },
    {
      title: "Total Supply",
      value: totalSupply ? `${parseFloat(formatUnits(totalSupply, 18)).toFixed(2)} CASINO` : "0",
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent"
        >
          Statistics
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-800 p-6"
            >
              <div className="text-sm text-gray-400 mb-2">{card.title}</div>
              <div className={`text-2xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                {card.value}
              </div>
            </motion.div>
          ))}
        </div>

        {address && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-800 p-6 mb-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-white">Your Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">Games Played</div>
                <div className="text-xl font-bold text-white">{userStats.gamesPlayed}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                <div className="text-xl font-bold text-green-500">{userStats.winRate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Total Wagered</div>
                <div className="text-xl font-bold text-white">
                  {parseFloat(formatUnits(userStats.totalWagered, 18)).toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">Net Profit</div>
                <div
                  className={`text-xl font-bold ${
                    userStats.totalWon > userStats.totalLost ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {(parseFloat(formatUnits(userStats.totalWon, 18)) - parseFloat(formatUnits(userStats.totalLost, 18))).toFixed(2)}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-800 p-6"
        >
          <h2 className="text-2xl font-bold mb-6 text-white">Recent Games</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
                  <th className="pb-3">Player</th>
                  <th className="pb-3">Bet</th>
                  <th className="pb-3">Choice</th>
                  <th className="pb-3">Result</th>
                  <th className="pb-3">Payout</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentGames.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No games yet
                    </td>
                  </tr>
                ) : (
                  recentGames.map((game, index) => (
                    <tr key={index} className="border-b border-gray-800/50">
                      <td className="py-3 font-mono text-sm">
                        {game.player.slice(0, 6)}...{game.player.slice(-4)}
                      </td>
                      <td className="py-3">{parseFloat(formatUnits(game.betAmount, 18)).toFixed(2)}</td>
                      <td className="py-3">
                        <div
                          className={`w-6 h-6 rounded-full ${
                            game.choice ? "bg-black" : "bg-red-600"
                          }`}
                        />
                      </td>
                      <td className="py-3">
                        <div
                          className={`w-6 h-6 rounded-full ${
                            game.result ? "bg-black" : "bg-red-600"
                          }`}
                        />
                      </td>
                      <td className={`py-3 font-semibold ${game.payout > 0n ? "text-green-500" : "text-red-500"}`}>
                        {game.payout > 0n
                          ? `+${parseFloat(formatUnits(game.payout, 18)).toFixed(2)}`
                          : `-${parseFloat(formatUnits(game.betAmount, 18)).toFixed(2)}`}
                      </td>
                      <td className="py-3 text-sm text-gray-400">
                        {new Date(game.timestamp * 1000).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
