# 💣 Minesweeper Battle

Multiplayer blockchain minesweeper game on Base network. Battle against other players, avoid mines, and win ETH prizes!

## 🎮 Features

- **Multiplayer**: 2-10 players in turn-based battles
- **Dynamic Scaling**: Grid and mine count adjust based on player count
- **Round System**: Difficulty increases each round (+20% mines)
- **Pure ETH**: No custom tokens, just ETH prizes
- **Smart Contract**: Fully decentralized game logic
- **Real-time UI**: Live updates with event listening

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, Framer Motion
- **Smart Contracts**: Solidity 0.8.20, Hardhat, OpenZeppelin
- **Web3**: wagmi v2, viem, RainbowKit
- **Network**: Base (Mainnet & Sepolia)

## 📦 Installation

```bash
npm install
```

## 🔧 Configuration

1. Copy environment variables:
```bash
cp .env.local.example .env.local
```

2. Fill in your `.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id
PRIVATE_KEY=your_private_key
BASESCAN_API_KEY=your_basescan_api_key
```

## 🚀 Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Smart Contract

### Compile
```bash
npm run compile
```

### Test
```bash
npm run test
```

### Deploy

**Base Sepolia (Testnet)**
```bash
npm run deploy:sepolia
```

**Base Mainnet**
```bash
npm run deploy:base
```

## 🎯 Game Rules

### Grid Scaling
- 2 players → 5x5 grid, 3 mines
- 3-4 players → 6x6 grid, 5 mines
- 5-6 players → 8x8 grid, 8 mines
- 7-8 players → 10x10 grid, 12 mines
- 9-10 players → 12x12 grid, 18 mines

### Rounds
- Each round adds 20% more mines
- New random seed per round
- Surviving players advance

### Winning
- Last player(s) standing split prize pool
- 99% to winners, 1% platform fee
- Winners must claim their prize

## 📂 Project Structure

```
├── contracts/
│   └── MinesweeperBattle.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── MinesweeperBattle.test.js
├── app/
│   ├── page.tsx
│   ├── lobby/page.tsx
│   ├── room/[id]/page.tsx
│   └── leaderboard/page.tsx
├── components/
│   ├── Navbar.tsx
│   ├── GameBoard.tsx
│   ├── PlayerList.tsx
│   ├── TurnTimer.tsx
│   ├── CreateGameModal.tsx
│   ├── LobbyList.tsx
│   ├── WinnerModal.tsx
│   ├── InviteModal.tsx
│   └── ChatBox.tsx
├── hooks/
│   ├── useGame.ts
│   ├── useGameState.ts
│   └── useTurnTimer.ts
└── lib/
    ├── wagmi.ts
    ├── contracts.ts
    └── utils.ts
```

## 🔐 Security

- ReentrancyGuard on all payable functions
- Pausable for emergency stops
- Input validation (player count, fees, coordinates)
- Turn timeout enforcement
- Owner-only admin functions

## 📄 License

MIT

---

Built with ❤️ on Base
