"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useReadContract } from "wagmi";
import { GAME_TOKEN_ADDRESS, GAME_TOKEN_ABI } from "@/lib/contracts";
import { formatUnits } from "viem";

export default function Navbar() {
  const pathname = usePathname();
  const { address } = useAccount();

  const { data: tokenBalance } = useReadContract({
    address: GAME_TOKEN_ADDRESS,
    abi: GAME_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const tabs = [
    { name: "Swap", path: "/swap" },
    { name: "Roulette", path: "/roulette" },
    { name: "Stats", path: "/stats" },
  ];

  return (
    <nav className="border-b border-gray-800 bg-gray-900/80 backdrop-blur-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon-purple to-neon-pink" />
              <span className="text-xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
                Base Casino
              </span>
            </Link>

            <div className="flex gap-1">
              {tabs.map((tab) => (
                <Link
                  key={tab.path}
                  href={tab.path}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    pathname === tab.path
                      ? "bg-neon-purple text-white"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`}
                >
                  {tab.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {address && tokenBalance && (
              <div className="px-4 py-2 rounded-lg bg-gray-800 border border-gray-700">
                <span className="text-sm text-gray-400">Balance: </span>
                <span className="text-white font-semibold">
                  {parseFloat(formatUnits(tokenBalance, 18)).toFixed(2)} CASINO
                </span>
              </div>
            )}

            <ConnectButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
