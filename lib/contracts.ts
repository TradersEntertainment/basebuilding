export const GAME_TOKEN_ADDRESS = process.env.NEXT_PUBLIC_GAME_TOKEN_ADDRESS as `0x${string}`;
export const ROULETTE_ADDRESS = process.env.NEXT_PUBLIC_ROULETTE_ADDRESS as `0x${string}`;
export const SWAP_COLLECTOR_ADDRESS = process.env.NEXT_PUBLIC_SWAP_COLLECTOR_ADDRESS as `0x${string}`;

export const GAME_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function burn(uint256 amount)",
] as const;

export const ROULETTE_ABI = [
  "function placeBet(uint256 amount, bool isBlack)",
  "function fundHouse(uint256 amount)",
  "function minBet() view returns (uint256)",
  "function maxBet() view returns (uint256)",
  "function houseBalance() view returns (uint256)",
  "function totalFees() view returns (uint256)",
  "function paused() view returns (bool)",
  "event GamePlayed(address indexed player, uint256 betAmount, bool choice, bool result, uint256 payout)",
] as const;

export const SWAP_COLLECTOR_ABI = [
  "function collectFees(uint256 amount)",
  "function executeBuyback()",
  "function threshold() view returns (uint256)",
  "function collectedFees() view returns (uint256)",
] as const;
