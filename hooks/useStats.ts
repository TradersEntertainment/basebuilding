import { useAccount, useReadContract, usePublicClient } from "wagmi";
import { ROULETTE_ADDRESS, ROULETTE_ABI, GAME_TOKEN_ADDRESS, GAME_TOKEN_ABI } from "@/lib/contracts";
import { useState, useEffect } from "react";
import { formatUnits } from "viem";

export interface UserStats {
  gamesPlayed: number;
  totalWagered: bigint;
  totalWon: bigint;
  totalLost: bigint;
  winRate: number;
}

export interface RecentGame {
  player: string;
  betAmount: bigint;
  choice: boolean;
  result: boolean;
  payout: bigint;
  timestamp: number;
  blockNumber: bigint;
}

export function useStats() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [userStats, setUserStats] = useState<UserStats>({
    gamesPlayed: 0,
    totalWagered: 0n,
    totalWon: 0n,
    totalLost: 0n,
    winRate: 0,
  });
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [totalVolume, setTotalVolume] = useState<bigint>(0n);

  const { data: houseBalance } = useReadContract({
    address: ROULETTE_ADDRESS,
    abi: ROULETTE_ABI,
    functionName: "houseBalance",
  });

  const { data: totalFees } = useReadContract({
    address: ROULETTE_ADDRESS,
    abi: ROULETTE_ABI,
    functionName: "totalFees",
  });

  const { data: totalSupply } = useReadContract({
    address: GAME_TOKEN_ADDRESS,
    abi: GAME_TOKEN_ABI,
    functionName: "totalSupply",
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!publicClient || !address) return;

      try {
        const logs = await publicClient.getLogs({
          address: ROULETTE_ADDRESS,
          event: {
            type: "event",
            name: "GamePlayed",
            inputs: [
              { type: "address", indexed: true, name: "player" },
              { type: "uint256", indexed: false, name: "betAmount" },
              { type: "bool", indexed: false, name: "choice" },
              { type: "bool", indexed: false, name: "result" },
              { type: "uint256", indexed: false, name: "payout" },
            ],
          },
          fromBlock: "earliest",
          toBlock: "latest",
        });

        const userGames = logs.filter((log) => log.args.player?.toLowerCase() === address.toLowerCase());

        let gamesPlayed = 0;
        let totalWagered = 0n;
        let totalWon = 0n;
        let totalLost = 0n;
        let wins = 0;

        userGames.forEach((log) => {
          if (!log.args) return;
          gamesPlayed++;
          totalWagered += log.args.betAmount as bigint;
          if ((log.args.payout as bigint) > 0n) {
            totalWon += log.args.payout as bigint;
            wins++;
          } else {
            totalLost += log.args.betAmount as bigint;
          }
        });

        const winRate = gamesPlayed > 0 ? (wins / gamesPlayed) * 100 : 0;

        setUserStats({
          gamesPlayed,
          totalWagered,
          totalWon,
          totalLost,
          winRate,
        });

        let volume = 0n;
        logs.forEach((log) => {
          if (log.args) {
            volume += log.args.betAmount as bigint;
          }
        });
        setTotalVolume(volume);

        const recent = await Promise.all(
          logs.slice(-10).reverse().map(async (log) => {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
            return {
              player: log.args.player as string,
              betAmount: log.args.betAmount as bigint,
              choice: log.args.choice as boolean,
              result: log.args.result as boolean,
              payout: log.args.payout as bigint,
              timestamp: Number(block.timestamp),
              blockNumber: log.blockNumber,
            };
          })
        );

        setRecentGames(recent);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [publicClient, address]);

  return {
    userStats,
    recentGames,
    totalVolume,
    houseBalance,
    totalFees,
    totalSupply,
  };
}
