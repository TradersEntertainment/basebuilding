"use client";

import { useParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useGameState, usePlayerStatus } from "@/hooks/useGameState";
import { useGame } from "@/hooks/useGame";
import { useState, useEffect } from "react";
import { formatEth } from "@/lib/utils";
import GameBoard from "@/components/GameBoard";
import PlayerList from "@/components/PlayerList";
import TurnTimer from "@/components/TurnTimer";
import InviteModal from "@/components/InviteModal";
import WinnerModal from "@/components/WinnerModal";
import ChatBox from "@/components/ChatBox";
import { motion } from "framer-motion";

export default function RoomPage() {
  const params = useParams();
  const gameId = BigInt(params.id as string);
  const { address } = useAccount();

  const { gameState, isLoading } = useGameState(gameId);
  const { playerStatus } = usePlayerStatus(gameId, address);
  const { joinGame, startGame, revealTile, skipTurn, isPending } = useGame();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  useEffect(() => {
    if (
      gameState?.finished &&
      playerStatus?.isInGame &&
      !playerStatus?.isEliminated &&
      !playerStatus?.hasClaimed
    ) {
      setShowWinnerModal(true);
    }
  }, [gameState?.finished, playerStatus]);

  if (isLoading || !gameState) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  const {
    creator,
    players,
    entryFee,
    prizePool,
    maxPlayers,
    currentRound,
    currentPlayer,
    turnDeadline,
    started,
    finished,
    gridSize,
  } = gameState;

  const isCreator = address?.toLowerCase() === creator.toLowerCase();
  const isInGame = playerStatus?.isInGame || false;
  const isEliminated = playerStatus?.isEliminated || false;

  const eliminatedPlayers = players.filter((p) =>
    gameState ? (playerStatus?.isEliminated && p === address) : false
  );

  const handleJoin = async () => {
    if (!address) return;
    try {
      await joinGame(gameId, entryFee);
    } catch (error) {
      console.error("Failed to join game:", error);
    }
  };

  const handleStart = async () => {
    try {
      await startGame(gameId);
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  const handleTileClick = async (x: number, y: number) => {
    try {
      await revealTile(gameId, x, y);
    } catch (error) {
      console.error("Failed to reveal tile:", error);
    }
  };

  const handleSkip = async () => {
    try {
      await skipTurn(gameId);
    } catch (error) {
      console.error("Failed to skip turn:", error);
    }
  };

  const winners = players.filter((p) => !eliminatedPlayers.includes(p));
  const prizePerWinner =
    winners.length > 0
      ? (prizePool * BigInt(99)) / BigInt(100) / BigInt(winners.length)
      : BigInt(0);

  if (!started) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-8 backdrop-blur-sm">
            <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Waiting Room
            </h1>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Room</span>
                  <span className="text-white font-semibold">
                    #{gameId.toString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Players</span>
                  <span className="text-white font-semibold">
                    {players.length}/{maxPlayers}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Entry Fee</span>
                  <span className="text-white font-semibold">
                    {formatEth(entryFee)} ETH
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Prize Pool</span>
                  <span className="text-cyan-400 font-semibold text-lg">
                    {formatEth(prizePool)} ETH
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <PlayerList
                players={players}
                eliminatedPlayers={[]}
                currentPlayer={currentPlayer}
                myAddress={address}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {!isInGame && (
                <button
                  onClick={handleJoin}
                  disabled={isPending || players.length >= maxPlayers}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Joining..." : "Join Game"}
                </button>
              )}

              {isCreator && players.length >= 2 && (
                <button
                  onClick={handleStart}
                  disabled={isPending}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Starting..." : "Start Game"}
                </button>
              )}

              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
              >
                Invite Friends
              </button>
            </div>
          </div>
        </div>

        <InviteModal
          isOpen={isInviteModalOpen}
          gameId={gameId}
          onClose={() => setIsInviteModalOpen(false)}
        />
      </div>
    );
  }

  if (finished) {
    return (
      <div className="min-h-screen pt-20 pb-12 px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-12 backdrop-blur-sm"
          >
            <h1 className="text-4xl font-bold mb-6">Game Over!</h1>
            <p className="text-xl text-gray-300 mb-8">
              {winners.length > 0
                ? `Winner${winners.length > 1 ? "s" : ""}: ${winners.length} player${winners.length > 1 ? "s" : ""}`
                : "No winners"}
            </p>
            <button
              onClick={() => (window.location.href = "/lobby")}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl font-semibold"
            >
              Back to Lobby
            </button>
          </motion.div>
        </div>

        {!isEliminated && isInGame && (
          <WinnerModal
            isOpen={showWinnerModal}
            gameId={gameId}
            prizeAmount={prizePerWinner}
            onClose={() => setShowWinnerModal(false)}
          />
        )}
      </div>
    );
  }

  const isMyTurn = currentPlayer?.toLowerCase() === address?.toLowerCase();

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 bg-gradient-to-br from-black via-purple-900/20 to-black">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-6 mb-6 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">
                Round {currentRound}
              </h2>
              <p className="text-gray-400">
                Prize Pool: {formatEth(prizePool)} ETH
              </p>
            </div>

            <TurnTimer turnDeadline={turnDeadline} />

            {isMyTurn && !isEliminated && (
              <button
                onClick={handleSkip}
                disabled={isPending}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Skip Turn
              </button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
              {isEliminated ? (
                <div className="text-center py-12">
                  <p className="text-2xl mb-4">💥</p>
                  <p className="text-xl text-red-400 font-semibold">
                    You were eliminated!
                  </p>
                  <p className="text-gray-400 mt-2">
                    Watch the game continue...
                  </p>
                </div>
              ) : (
                <GameBoard
                  gameId={gameId}
                  gridSize={gridSize}
                  currentPlayer={currentPlayer}
                  myAddress={address}
                  onTileClick={handleTileClick}
                  isPending={isPending}
                />
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm">
              <PlayerList
                players={players}
                eliminatedPlayers={eliminatedPlayers}
                currentPlayer={currentPlayer}
                myAddress={address}
              />
            </div>

            <ChatBox gameId={gameId} myAddress={address} />
          </div>
        </div>
      </div>
    </div>
  );
}
