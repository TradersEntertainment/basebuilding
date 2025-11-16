const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying MinesweeperBattle with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  const MinesweeperBattle = await hre.ethers.getContractFactory("MinesweeperBattle");
  const minesweeperBattle = await MinesweeperBattle.deploy();
  await minesweeperBattle.waitForDeployment();
  const contractAddress = await minesweeperBattle.getAddress();

  console.log("\n=================================");
  console.log("MinesweeperBattle deployed to:", contractAddress);
  console.log("=================================");
  console.log("\nAdd this to your .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("\nVerify with:");
  console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
