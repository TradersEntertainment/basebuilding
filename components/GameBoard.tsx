"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useGameMoves } from "@/hooks/useGameState";

interface GameBoardProps {
  gameId: bigint;
  gridSize: number;
  currentPlayer: string;
  myAddress?: string;
  onTileClick: (x: number, y: number) => void;
  isPending: boolean;
}

export default function GameBoard({
  gameId,
  gridSize,
  currentPlayer,
  myAddress,
  onTileClick,
  isPending,
}: GameBoardProps) {
  const { moves } = useGameMoves(gameId);
  const [revealedTiles, setRevealedTiles] = useState<Map<string, { revealed: boolean; hitMine: boolean }>>(new Map());

  useEffect(() => {
    const newRevealed = new Map<string, { revealed: boolean; hitMine: boolean }>();
    moves.forEach((move: any) => {
      const key = `${move.x}-${move.y}`;
      newRevealed.set(key, { revealed: true, hitMine: move.hitMine });
    });
    setRevealedTiles(newRevealed);
  }, [moves]);

  const isMyTurn = currentPlayer?.toLowerCase() === myAddress?.toLowerCase();

  const handleClick = (x: number, y: number) => {
    const key = `${x}-${y}`;
    if (!isMyTurn || isPending || revealedTiles.get(key)?.revealed) return;
    onTileClick(x, y);
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div
        className="grid gap-1 sm:gap-2"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: gridSize * gridSize }).map((_, index) => {
          const x = Math.floor(index / gridSize);
          const y = index % gridSize;
          const key = `${x}-${y}`;
          const tileState = revealedTiles.get(key);
          const isRevealed = tileState?.revealed || false;
          const hitMine = tileState?.hitMine || false;

          return (
            <motion.button
              key={key}
              onClick={() => handleClick(x, y)}
              disabled={!isMyTurn || isPending || isRevealed}
              className={`
                w-8 h-8 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded
                transition-all duration-200
                ${
                  isRevealed
                    ? hitMine
                      ? "bg-red-500/20 border-red-500"
                      : "bg-green-500/20 border-green-500"
                    : "bg-gray-800/50 border-purple-500/50 hover:bg-purple-500/30"
                }
                border backdrop-blur-sm
                ${isMyTurn && !isRevealed && !isPending ? "cursor-pointer hover:scale-105" : "cursor-not-allowed"}
              `}
              whileTap={isMyTurn && !isRevealed ? { scale: 0.95 } : {}}
              animate={
                hitMine
                  ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }
                  : {}
              }
              transition={{ duration: 0.3 }}
            >
              {isRevealed && (
                <span className="text-2xl sm:text-3xl">
                  {hitMine ? "💣" : "✓"}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
