"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSwap } from "@/hooks/useSwap";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

export default function SwapInterface() {
  const { address } = useAccount();
  const { ethBalance, tokenBalance, needsApproval, approveTokens, isApproving, isSwapping, slippage, setSlippage, getEstimatedOutput } = useSwap();

  const [isETHtoToken, setIsETHtoToken] = useState(true);
  const [amountIn, setAmountIn] = useState("");
  const [showSlippage, setShowSlippage] = useState(false);

  const handleSwap = async () => {
    if (!amountIn || parseFloat(amountIn) <= 0) return;

    if (!isETHtoToken && needsApproval(amountIn)) {
      await approveTokens(amountIn);
      return;
    }
  };

  const getMaxBalance = () => {
    if (isETHtoToken && ethBalance) {
      const reserve = 0.001;
      const max = parseFloat(formatUnits(ethBalance.value, 18)) - reserve;
      return max > 0 ? max.toString() : "0";
    }
    if (!isETHtoToken && tokenBalance) {
      return formatUnits(tokenBalance, 18);
    }
    return "0";
  };

  const estimatedOutput = amountIn ? getEstimatedOutput(amountIn, isETHtoToken) : "0";

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-gray-800 p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Swap</h2>
            <button
              onClick={() => setShowSlippage(!showSlippage)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ⚙️
            </button>
          </div>

          {showSlippage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 p-4 bg-gray-800 rounded-lg"
            >
              <label className="text-sm text-gray-400">Slippage Tolerance</label>
              <div className="flex gap-2 mt-2">
                {[0.5, 1, 2].map((value) => (
                  <button
                    key={value}
                    onClick={() => setSlippage(value)}
                    className={`px-3 py-1 rounded ${
                      slippage === value
                        ? "bg-neon-purple text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <div className="space-y-2">
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">From</span>
                <span className="text-sm text-gray-400">
                  Balance: {parseFloat(getMaxBalance()).toFixed(4)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={amountIn}
                  onChange={(e) => setAmountIn(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-2xl text-white outline-none"
                />
                <button
                  onClick={() => setAmountIn(getMaxBalance())}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                >
                  MAX
                </button>
                <div className="px-3 py-1 bg-gray-700 rounded-lg font-semibold">
                  {isETHtoToken ? "ETH" : "CASINO"}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => setIsETHtoToken(!isETHtoToken)}
                className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors"
              >
                ⇅
              </button>
            </div>

            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-400">To</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={estimatedOutput}
                  readOnly
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-2xl text-white outline-none"
                />
                <div className="px-3 py-1 bg-gray-700 rounded-lg font-semibold">
                  {isETHtoToken ? "CASINO" : "ETH"}
                </div>
              </div>
            </div>
          </div>

          {!address ? (
            <button className="w-full mt-6 py-4 bg-gray-800 text-gray-400 rounded-xl font-semibold cursor-not-allowed">
              Connect Wallet
            </button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSwap}
              disabled={!amountIn || parseFloat(amountIn) <= 0 || isApproving || isSwapping}
              className="w-full mt-6 py-4 bg-gradient-to-r from-neon-purple to-neon-pink text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isApproving
                ? "Approving..."
                : isSwapping
                ? "Swapping..."
                : !isETHtoToken && needsApproval(amountIn)
                ? "Approve CASINO"
                : "Swap"}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
