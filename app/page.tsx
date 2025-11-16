"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center p-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-8">
            <motion.span
              className="text-8xl md:text-9xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              💣
            </motion.span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Minesweeper Battle
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-4 max-w-3xl mx-auto">
            Multiplayer blockchain minesweeper where skill meets strategy
          </p>
          <p className="text-lg text-gray-400 mb-12">
            Compete for real ETH prizes on Base Network
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6"
            >
              <div className="text-4xl mb-4">⚔️</div>
              <h3 className="text-xl font-bold mb-2 text-white">Multiplayer</h3>
              <p className="text-gray-400">2-10 players battle simultaneously</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6"
            >
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2 text-white">ETH Prizes</h3>
              <p className="text-gray-400">Winner takes all the prize pool</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-gray-900/50 backdrop-blur-lg rounded-xl border border-purple-500/30 p-6"
            >
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2 text-white">Skill-Based</h3>
              <p className="text-gray-400">Strategy and timing matter</p>
            </motion.div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/lobby">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl font-bold text-lg text-white shadow-lg shadow-purple-500/50"
              >
                Enter Lobby
              </motion.button>
            </Link>
            <Link href="/leaderboard">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-4 bg-gray-800/80 backdrop-blur-lg border border-gray-700 rounded-xl font-bold text-lg text-white hover:bg-gray-700/80 transition-colors"
              >
                Leaderboard
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
