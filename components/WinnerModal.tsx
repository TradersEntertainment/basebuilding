"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame";
import { formatEth } from "@/lib/utils";
import Confetti from "react-confetti";
import { useState, useEffect } from "react";

interface WinnerModalProps {
  isOpen: boolean;
  gameId: bigint;
  prizeAmount: bigint;
  onClose: () => void;
}

export default function WinnerModal({
  isOpen,
  gameId,
  prizeAmount,
  onClose,
}: WinnerModalProps) {
  const router = useRouter();
  const { claimWinnings, isPending } = useGame();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClaim = async () => {
    try {
      await claimWinnings(gameId);
    } catch (error) {
      console.error("Failed to claim winnings:", error);
    }
  };

  const handleShare = () => {
    const text = `I just won ${formatEth(prizeAmount)} ETH playing Minesweeper Battle! 💣💰\nThink you can beat me?`;
    const url = window.location.origin;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {showConfetti && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={false}
              numberOfPieces={500}
            />
          )}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-gradient-to-br from-gray-900 to-purple-900/50 border-2 border-yellow-500 rounded-xl p-8 shadow-2xl text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <h2 className="text-4xl font-bold mb-2">🎉 YOU WON! 🎉</h2>
              </motion.div>

              <div className="my-8">
                <p className="text-gray-300 mb-2">Your Prize</p>
                <p className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  {formatEth(prizeAmount)} ETH
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleClaim}
                  disabled={isPending}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all font-semibold text-lg disabled:opacity-50"
                >
                  {isPending ? "Claiming..." : "Claim Winnings"}
                </button>

                <button
                  onClick={() => router.push("/lobby")}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all font-semibold"
                >
                  Play Again
                </button>

                <button
                  onClick={handleShare}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  Share on Twitter
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
