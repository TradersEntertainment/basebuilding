"use client";

import { useTurnTimer } from "@/hooks/useTurnTimer";
import { formatTimeRemaining } from "@/lib/utils";
import { motion } from "framer-motion";

interface TurnTimerProps {
  turnDeadline: bigint;
}

export default function TurnTimer({ turnDeadline }: TurnTimerProps) {
  const { timeRemaining, isLow, isExpired } = useTurnTimer(turnDeadline);

  return (
    <div className="flex flex-col items-center space-y-2">
      <motion.div
        className={`
          relative w-24 h-24 rounded-full border-4
          ${isExpired ? "border-red-500" : isLow ? "border-yellow-500" : "border-green-500"}
        `}
        animate={isLow ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1, repeat: isLow ? Infinity : 0 }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`
              text-2xl font-bold
              ${isExpired ? "text-red-500" : isLow ? "text-yellow-500" : "text-green-500"}
            `}
          >
            {formatTimeRemaining(timeRemaining)}
          </span>
        </div>
      </motion.div>

      {isLow && !isExpired && (
        <motion.p
          className="text-sm text-yellow-500 font-semibold"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          Hurry up!
        </motion.p>
      )}

      {isExpired && (
        <p className="text-sm text-red-500 font-semibold">Time's up!</p>
      )}
    </div>
  );
}
