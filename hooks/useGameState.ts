import { useReadContract, useBlockNumber, useWatchContractEvent } from "wagmi";
import { MINESWEEPER_ADDRESS, MINESWEEPER_ABI } from "@/lib/contracts";
import { useEffect, useState } from "react";

export interface GameState {
  id: bigint;
  creator: string;
  players: string[];
  entryFee: bigint;
  prizePool: bigint;
  maxPlayers: number;
  currentRound: number;
  currentPlayer: string;
  turnDeadline: bigint;
  turnDuration: bigint;
  isPublic: boolean;
  started: boolean;
  finished: boolean;
  gridSize: number;
  mineCount: number;
}

export interface PlayerStatus {
  isInGame: boolean;
  isEliminated: boolean;
  hasClaimed: boolean;
}

export interface GameMove {
  player: string;
  x: number;
  y: number;
  hitMine: boolean;
  timestamp: bigint;
}

export function useGameState(gameId: bigint | undefined) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: blockNumber } = useBlockNumber({ watch: true });

  const { data: gameState, isLoading, refetch } = useReadContract({
    address: MINESWEEPER_ADDRESS,
    abi: MINESWEEPER_ABI,
    functionName: "getGameState",
    args: gameId !== undefined ? [gameId] : undefined,
    query: {
      enabled: gameId !== undefined,
      refetchInterval: 2000,
    },
  });

  useWatchContractEvent({
    address: MINESWEEPER_ADDRESS,
    abi: MINESWEEPER_ABI,
    eventName: "TileRevealed",
    onLogs: () => {
      setRefreshTrigger(prev => prev + 1);
    },
  });

  useWatchContractEvent({
    address: MINESWEEPER_ADDRESS,
    abi: MINESWEEPER_ABI,
    eventName: "PlayerEliminated",
    onLogs: () => {
      setRefreshTrigger(prev => prev + 1);
    },
  });

  useWatchContractEvent({
    address: MINESWEEPER_ADDRESS,
    abi: MINESWEEPER_ABI,
    eventName: "GameStarted",
    onLogs: () => {
      setRefreshTrigger(prev => prev + 1);
    },
  });

  useWatchContractEvent({
    address: MINESWEEPER_ADDRESS,
    abi: MINESWEEPER_ABI,
    eventName: "PlayerJoined",
    onLogs: () => {
      setRefreshTrigger(prev => prev + 1);
    },
  });

  useEffect(() => {
    if (refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  useEffect(() => {
    refetch();
  }, [blockNumber, refetch]);

  if (!gameState || isLoading || !Array.isArray(gameState)) {
    return { gameState: null, isLoading };
  }

  const [
    id,
    creator,
    players,
    entryFee,
    prizePool,
    maxPlayers,
    currentRound,
    currentPlayer,
    turnDeadline,
    turnDuration,
    isPublic,
    started,
    finished,
    gridSize,
    mineCount,
  ] = gameState as [
    bigint,
    string,
    string[],
    bigint,
    bigint,
    number,
    number,
    string,
    bigint,
    bigint,
    boolean,
    boolean,
    boolean,
    number,
    number
  ];

  return {
    gameState: {
      id,
      creator,
      players,
      entryFee,
      prizePool,
      maxPlayers,
      currentRound,
      currentPlayer,
      turnDeadline,
      turnDuration,
      isPublic,
      started,
      finished,
      gridSize,
      mineCount,
    } as GameState,
    isLoading: false,
    refetch,
  };
}

export function usePlayerStatus(gameId: bigint | undefined, playerAddress: string | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: MINESWEEPER_ADDRESS,
    abi: MINESWEEPER_ABI,
    functionName: "getPlayerStatus",
    args: gameId !== undefined && playerAddress ? [gameId, playerAddress as `0x${string}`] : undefined,
    query: {
      enabled: gameId !== undefined && !!playerAddress,
      refetchInterval: 3000,
    },
  });

  if (!data || !Array.isArray(data)) {
    return { playerStatus: null, isLoading, refetch };
  }

  const [isInGame, isEliminated, hasClaimed] = data as [boolean, boolean, boolean];

  return {
    playerStatus: { isInGame, isEliminated, hasClaimed } as PlayerStatus,
    isLoading: false,
    refetch,
  };
}

export function useActiveGames() {
  const { data: gameIds, isLoading, refetch } = useReadContract({
    address: MINESWEEPER_ADDRESS,
    abi: MINESWEEPER_ABI,
    functionName: "getActiveGames",
    query: {
      refetchInterval: 5000,
    },
  });

  useWatchContractEvent({
    address: MINESWEEPER_ADDRESS,
    abi: MINESWEEPER_ABI,
    eventName: "GameCreated",
    onLogs: () => {
      refetch();
    },
  });

  return { gameIds: gameIds || [], isLoading, refetch };
}

export function useGameMoves(gameId: bigint | undefined) {
  const { data: moves, isLoading, refetch } = useReadContract({
    address: MINESWEEPER_ADDRESS,
    abi: MINESWEEPER_ABI,
    functionName: "getGameMoves",
    args: gameId !== undefined ? [gameId] : undefined,
    query: {
      enabled: gameId !== undefined,
      refetchInterval: 2000,
    },
  });

  useWatchContractEvent({
    address: MINESWEEPER_ADDRESS,
    abi: MINESWEEPER_ABI,
    eventName: "TileRevealed",
    onLogs: () => {
      refetch();
    },
  });

  return { moves: moves || [], isLoading, refetch };
}

export function useTileRevealed(gameId: bigint | undefined, x: number, y: number) {
  const { data: isRevealed } = useReadContract({
    address: MINESWEEPER_ADDRESS,
    abi: MINESWEEPER_ABI,
    functionName: "isTileRevealed",
    args: gameId !== undefined ? [gameId, x, y] : undefined,
    query: {
      enabled: gameId !== undefined,
    },
  });

  return isRevealed || false;
}
