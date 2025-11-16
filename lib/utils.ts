import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEth(value: bigint, decimals: number = 4): string {
  const eth = Number(value) / 1e18;
  return eth.toFixed(decimals);
}

export function getGridParams(playerCount: number): { gridSize: number; mineCount: number } {
  if (playerCount <= 2) return { gridSize: 5, mineCount: 3 };
  if (playerCount <= 4) return { gridSize: 6, mineCount: 5 };
  if (playerCount <= 6) return { gridSize: 8, mineCount: 8 };
  if (playerCount <= 8) return { gridSize: 10, mineCount: 12 };
  return { gridSize: 12, mineCount: 18 };
}

export function calculateRoundMines(baseMineCount: number, round: number): number {
  return Math.floor(baseMineCount * Math.pow(1.2, round - 1));
}

export function getTimeRemaining(deadline: number): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, deadline - now);
}

export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}
