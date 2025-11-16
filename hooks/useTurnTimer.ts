import { useState, useEffect } from "react";
import { getTimeRemaining } from "@/lib/utils";

export function useTurnTimer(turnDeadline: bigint | undefined) {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!turnDeadline) {
      setTimeRemaining(0);
      return;
    }

    const updateTimer = () => {
      const remaining = getTimeRemaining(Number(turnDeadline));
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [turnDeadline]);

  const progress = turnDeadline ? (timeRemaining / Number(turnDeadline)) * 100 : 0;
  const isLow = timeRemaining > 0 && timeRemaining <= 5;
  const isExpired = timeRemaining === 0;

  return {
    timeRemaining,
    progress,
    isLow,
    isExpired,
  };
}
