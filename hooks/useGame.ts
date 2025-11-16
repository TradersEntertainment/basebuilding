import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MINESWEEPER_ADDRESS, MINESWEEPER_ABI } from "@/lib/contracts";
import { parseEther } from "viem";

export function useGame() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createGame = async (entryFee: string, maxPlayers: number, turnDuration: number, isPublic: boolean) => {
    const entryFeeWei = parseEther(entryFee);

    writeContract({
      address: MINESWEEPER_ADDRESS,
      abi: MINESWEEPER_ABI,
      functionName: "createGame",
      args: [entryFeeWei, maxPlayers, turnDuration, isPublic],
      value: entryFeeWei,
    });
  };

  const joinGame = async (gameId: bigint, entryFee: bigint) => {
    writeContract({
      address: MINESWEEPER_ADDRESS,
      abi: MINESWEEPER_ABI,
      functionName: "joinGame",
      args: [gameId],
      value: entryFee,
    });
  };

  const startGame = async (gameId: bigint) => {
    writeContract({
      address: MINESWEEPER_ADDRESS,
      abi: MINESWEEPER_ABI,
      functionName: "startGame",
      args: [gameId],
    });
  };

  const revealTile = async (gameId: bigint, x: number, y: number) => {
    writeContract({
      address: MINESWEEPER_ADDRESS,
      abi: MINESWEEPER_ABI,
      functionName: "revealTile",
      args: [gameId, x, y],
    });
  };

  const skipTurn = async (gameId: bigint) => {
    writeContract({
      address: MINESWEEPER_ADDRESS,
      abi: MINESWEEPER_ABI,
      functionName: "skipTurn",
      args: [gameId],
    });
  };

  const claimWinnings = async (gameId: bigint) => {
    writeContract({
      address: MINESWEEPER_ADDRESS,
      abi: MINESWEEPER_ABI,
      functionName: "claimWinnings",
      args: [gameId],
    });
  };

  return {
    createGame,
    joinGame,
    startGame,
    revealTile,
    skipTurn,
    claimWinnings,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
