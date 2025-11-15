import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useWatchContractEvent } from "wagmi";
import { ROULETTE_ADDRESS, ROULETTE_ABI, GAME_TOKEN_ADDRESS, GAME_TOKEN_ABI } from "@/lib/contracts";
import { parseUnits } from "viem";
import { useState, useEffect } from "react";

export interface GameResult {
  player: string;
  betAmount: bigint;
  choice: boolean;
  result: boolean;
  payout: bigint;
}

export function useRoulette() {
  const { address } = useAccount();
  const [lastGameResult, setLastGameResult] = useState<GameResult | null>(null);

  const { data: minBet } = useReadContract({
    address: ROULETTE_ADDRESS,
    abi: ROULETTE_ABI,
    functionName: "minBet",
  });

  const { data: maxBet } = useReadContract({
    address: ROULETTE_ADDRESS,
    abi: ROULETTE_ABI,
    functionName: "maxBet",
  });

  const { data: houseBalance } = useReadContract({
    address: ROULETTE_ADDRESS,
    abi: ROULETTE_ABI,
    functionName: "houseBalance",
  });

  const { data: isPaused } = useReadContract({
    address: ROULETTE_ADDRESS,
    abi: ROULETTE_ABI,
    functionName: "paused",
  });

  const { data: tokenBalance } = useReadContract({
    address: GAME_TOKEN_ADDRESS,
    abi: GAME_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: allowance } = useReadContract({
    address: GAME_TOKEN_ADDRESS,
    abi: GAME_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, ROULETTE_ADDRESS] : undefined,
  });

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: placeBetContract, data: placeBetHash } = useWriteContract();

  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isPlacingBet } = useWaitForTransactionReceipt({
    hash: placeBetHash,
  });

  useWatchContractEvent({
    address: ROULETTE_ADDRESS,
    abi: ROULETTE_ABI,
    eventName: "GamePlayed",
    onLogs(logs) {
      const log = logs[0];
      if (log && log.args) {
        setLastGameResult({
          player: log.args.player as string,
          betAmount: log.args.betAmount as bigint,
          choice: log.args.choice as boolean,
          result: log.args.result as boolean,
          payout: log.args.payout as bigint,
        });
      }
    },
  });

  const approveTokens = async (amount: string) => {
    const amountBigInt = parseUnits(amount, 18);
    approve({
      address: GAME_TOKEN_ADDRESS,
      abi: GAME_TOKEN_ABI,
      functionName: "approve",
      args: [ROULETTE_ADDRESS, amountBigInt],
    });
  };

  const placeBet = async (amount: string, isBlack: boolean) => {
    const amountBigInt = parseUnits(amount, 18);
    placeBetContract({
      address: ROULETTE_ADDRESS,
      abi: ROULETTE_ABI,
      functionName: "placeBet",
      args: [amountBigInt, isBlack],
    });
  };

  const needsApproval = (amount: string) => {
    if (!allowance) return true;
    const amountBigInt = parseUnits(amount, 18);
    return allowance < amountBigInt;
  };

  return {
    minBet,
    maxBet,
    houseBalance,
    isPaused,
    tokenBalance,
    allowance,
    approveTokens,
    placeBet,
    needsApproval,
    isApproving,
    isPlacingBet,
    lastGameResult,
  };
}
