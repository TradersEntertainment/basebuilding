# Base Roulette Casino

Token-based roulette casino web application on Base network.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, Framer Motion
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Web3**: Wagmi, RainbowKit, Viem

## Smart Contracts

### GameToken.sol
ERC20 token with burn functionality and owner minting capability.

### RouletteGame.sol
Roulette game with black/red betting system, block hash randomness, and 1% fee.

### SwapFeeCollector.sol
Uniswap V3 integration for automatic fee collection and buyback with burn mechanism.

## Project Structure

```
├── contracts/          # Solidity smart contracts
├── scripts/           # Deployment scripts
├── app/              # Next.js app router pages
├── components/       # React components
├── hooks/           # Custom React hooks
└── lib/             # Utilities and configurations
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.local.example .env.local
```

3. Fill in your environment variables in `.env.local`

4. Compile contracts:
```bash
npx hardhat compile
```

5. Deploy contracts:
```bash
npm run deploy:contracts
```

6. Start development server:
```bash
npm run dev
```

## Environment Variables

```
NEXT_PUBLIC_GAME_TOKEN_ADDRESS=
NEXT_PUBLIC_ROULETTE_ADDRESS=
NEXT_PUBLIC_SWAP_COLLECTOR_ADDRESS=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
PRIVATE_KEY=
BASESCAN_API_KEY=
```

## Features

- **Swap Interface**: Trade ETH for CASINO tokens
- **Roulette Game**: Bet on black or red with 1.98x payout
- **Statistics Dashboard**: Track volume, house balance, and player stats
- **Responsive Design**: Mobile-first with glassmorphism UI
- **Wallet Integration**: RainbowKit for seamless wallet connections

## Security

- ReentrancyGuard protection
- Emergency pause mechanism
- Input validation
- Rate limiting on frontend

## License

MIT
