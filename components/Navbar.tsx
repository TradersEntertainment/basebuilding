"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-purple-500/20 bg-black/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">💣</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Minesweeper Battle
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/lobby"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Lobby
            </Link>
            <Link
              href="/leaderboard"
              className="text-gray-300 hover:text-white transition-colors"
            >
              Leaderboard
            </Link>
          </div>

          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}
