const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  const GameToken = await hre.ethers.getContractFactory("GameToken");
  const gameToken = await GameToken.deploy();
  await gameToken.waitForDeployment();
  const gameTokenAddress = await gameToken.getAddress();
  console.log("GameToken deployed to:", gameTokenAddress);

  const RouletteGame = await hre.ethers.getContractFactory("RouletteGame");
  const rouletteGame = await RouletteGame.deploy(gameTokenAddress);
  await rouletteGame.waitForDeployment();
  const rouletteGameAddress = await rouletteGame.getAddress();
  console.log("RouletteGame deployed to:", rouletteGameAddress);

  const wethAddress = "0x4200000000000000000000000000000000000006";
  const swapRouterAddress = "0x2626664c2603336E57B271c5C0b26F421741e481";
  const treasuryAddress = deployer.address;

  const SwapFeeCollector = await hre.ethers.getContractFactory("SwapFeeCollector");
  const swapFeeCollector = await SwapFeeCollector.deploy(
    gameTokenAddress,
    wethAddress,
    swapRouterAddress,
    treasuryAddress
  );
  await swapFeeCollector.waitForDeployment();
  const swapFeeCollectorAddress = await swapFeeCollector.getAddress();
  console.log("SwapFeeCollector deployed to:", swapFeeCollectorAddress);

  const fundAmount = hre.ethers.parseUnits("100000", 18);
  await gameToken.approve(rouletteGameAddress, fundAmount);
  await rouletteGame.fundHouse(fundAmount);
  console.log("House funded with 100,000 tokens");

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("GameToken:", gameTokenAddress);
  console.log("RouletteGame:", rouletteGameAddress);
  console.log("SwapFeeCollector:", swapFeeCollectorAddress);
  console.log("\nAdd these to your .env.local:");
  console.log(`NEXT_PUBLIC_GAME_TOKEN_ADDRESS=${gameTokenAddress}`);
  console.log(`NEXT_PUBLIC_ROULETTE_ADDRESS=${rouletteGameAddress}`);
  console.log(`NEXT_PUBLIC_SWAP_COLLECTOR_ADDRESS=${swapFeeCollectorAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
