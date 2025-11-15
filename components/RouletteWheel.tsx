"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRoulette } from "@/hooks/useRoulette";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import Confetti from "react-confetti";

export default function RouletteWheel() {
  const { address } = useAccount();
  const {
    minBet,
    maxBet,
    tokenBalance,
    approveTokens,
    placeBet,
    needsApproval,
    isApproving,
    isPlacingBet,
    lastGameResult,
  } = useRoulette();

  const [betAmount, setBetAmount] = useState("");
  const [selectedColor, setSelectedColor] = useState<boolean | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [gameHistory, setGameHistory] = useState<boolean[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [lastResult, setLastResult] = useState<{ won: boolean; amount: string } | null>(null);

  useEffect(() => {
    if (lastGameResult && lastGameResult.player.toLowerCase() === address?.toLowerCase()) {
      const won = lastGameResult.payout > 0n;
      const amount = formatUnits(won ? lastGameResult.payout : lastGameResult.betAmount, 18);

      setIsSpinning(false);
      setLastResult({ won, amount });
      setGameHistory((prev) => [lastGameResult.result, ...prev.slice(0, 9)]);

      if (won) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  }, [lastGameResult, address]);

  const handleSpin = async () => {
    if (!betAmount || selectedColor === null) return;

    const amount = parseFloat(betAmount);
    if (minBet && amount < parseFloat(formatUnits(minBet, 18))) return;
    if (maxBet && amount > parseFloat(formatUnits(maxBet, 18))) return;

    if (needsApproval(betAmount)) {
      await approveTokens(betAmount);
      return;
    }

    setIsSpinning(true);
    setLastResult(null);
    await placeBet(betAmount, selectedColor);
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === "Space" && !isSpinning && betAmount && selectedColor !== null) {
      e.preventDefault();
      handleSpin();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [betAmount, selectedColor, isSpinning]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

      <div className="absolute inset-0 bg-gradient-radial from-neon-purple/20 via-transparent to-transparent opacity-50" />

      <div className="max-w-4xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-800 p-8 shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
            Roulette
          </h2>

          {lastResult && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`mb-6 p-4 rounded-xl text-center ${
                lastResult.won
                  ? "bg-green-500/20 border border-green-500"
                  : "bg-red-500/20 border border-red-500"
              }`}
            >
              <div className="text-2xl font-bold mb-2">
                {lastResult.won ? "🎉 YOU WON!" : "😢 TRY AGAIN"}
              </div>
              <div className="text-xl">
                {lastResult.won ? "+" : "-"}
                {parseFloat(lastResult.amount).toFixed(2)} CASINO
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedColor(true)}
              className={`h-32 rounded-xl font-bold text-2xl transition-all ${
                selectedColor === true
                  ? "bg-black text-white ring-4 ring-neon-cyan"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              BLACK
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedColor(false)}
              className={`h-32 rounded-xl font-bold text-2xl transition-all ${
                selectedColor === false
                  ? "bg-red-600 text-white ring-4 ring-neon-cyan"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              RED
            </motion.button>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Bet Amount</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-neon-purple"
              />
              <button
                onClick={() => {
                  if (tokenBalance) {
                    setBetAmount(formatUnits(tokenBalance, 18));
                  }
                }}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors"
              >
                MAX
              </button>
            </div>
            {minBet && maxBet && (
              <div className="text-sm text-gray-400 mt-2">
                Min: {formatUnits(minBet, 18)} | Max: {formatUnits(maxBet, 18)} CASINO
              </div>
            )}
          </div>

          {!address ? (
            <button className="w-full py-4 bg-gray-800 text-gray-400 rounded-xl font-semibold cursor-not-allowed">
              Connect Wallet
            </button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSpin}
              disabled={!betAmount || selectedColor === null || isSpinning || isApproving || isPlacingBet}
              className="w-full py-4 bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
            >
              {isSpinning ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  ⭕
                </motion.div>
              ) : isApproving ? (
                "Approving..."
              ) : isPlacingBet ? (
                "Placing Bet..."
              ) : needsApproval(betAmount) && betAmount ? (
                "Approve CASINO"
              ) : (
                "SPIN (Space)"
              )}
            </motion.button>
          )}

          {gameHistory.length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm text-gray-400 mb-3">Recent Results</h3>
              <div className="flex gap-2 flex-wrap">
                {gameHistory.map((isBlack, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`w-8 h-8 rounded-full ${
                      isBlack ? "bg-black" : "bg-red-600"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {tokenBalance && (
            <div className="mt-6 text-center">
              <div className="text-sm text-gray-400">Your Balance</div>
              <div className="text-2xl font-bold text-white">
                {parseFloat(formatUnits(tokenBalance, 18)).toFixed(2)} CASINO
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
