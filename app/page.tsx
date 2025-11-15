"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-neon-purple via-neon-pink to-neon-cyan bg-clip-text text-transparent">
            Base Casino
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-12">
            Experience the thrill of decentralized gaming on Base network
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-800 p-6"
            >
              <div className="text-4xl mb-4">💱</div>
              <h3 className="text-xl font-bold mb-2">Swap</h3>
              <p className="text-gray-400">Trade ETH for CASINO tokens instantly</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-800 p-6"
            >
              <div className="text-4xl mb-4">🎰</div>
              <h3 className="text-xl font-bold mb-2">Roulette</h3>
              <p className="text-gray-400">Bet on black or red and win big</p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gray-900/80 backdrop-blur-lg rounded-xl border border-gray-800 p-6"
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Stats</h3>
              <p className="text-gray-400">Track your performance and history</p>
            </motion.div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link href="/swap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-neon-purple to-neon-pink rounded-xl font-semibold text-lg"
              >
                Get Started
              </motion.button>
            </Link>
            <Link href="/roulette">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-lg transition-colors"
              >
                Play Now
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
