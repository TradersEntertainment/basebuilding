import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { GAME_TOKEN_ADDRESS, GAME_TOKEN_ABI } from "@/lib/contracts";
import { parseUnits, formatUnits } from "viem";
import { useState } from "react";

const UNISWAP_V3_ROUTER = "0x2626664c2603336E57B271c5C0b26F421741e481";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";

export function useSwap() {
  const { address } = useAccount();
  const [slippage, setSlippage] = useState(0.5);

  const { data: ethBalance } = useBalance({
    address,
  });

  const { data: tokenBalance } = useReadContract({
    address: GAME_TOKEN_ADDRESS,
    abi: GAME_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: allowance } = useReadContract({
    address: GAME_TOKEN_ADDRESS,
    abi: GAME_TOKEN_ABI,
    functionName: "allowance",
    args: address ? [address, UNISWAP_V3_ROUTER as `0x${string}`] : undefined,
  });

  const { writeContract: approve, data: approveHash } = useWriteContract();
  const { writeContract: swap, data: swapHash } = useWriteContract();

  const { isLoading: isApproving } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { isLoading: isSwapping } = useWaitForTransactionReceipt({
    hash: swapHash,
  });

  const approveTokens = async (amount: string) => {
    const amountBigInt = parseUnits(amount, 18);
    approve({
      address: GAME_TOKEN_ADDRESS,
      abi: GAME_TOKEN_ABI,
      functionName: "approve",
      args: [UNISWAP_V3_ROUTER as `0x${string}`, amountBigInt],
    });
  };

  const needsApproval = (amount: string) => {
    if (!allowance) return true;
    const amountBigInt = parseUnits(amount, 18);
    return allowance < amountBigInt;
  };

  const getEstimatedOutput = (amountIn: string, isETHtoToken: boolean): string => {
    return (parseFloat(amountIn) * 1000).toString();
  };

  return {
    ethBalance,
    tokenBalance,
    allowance,
    approveTokens,
    needsApproval,
    isApproving,
    isSwapping,
    slippage,
    setSlippage,
    getEstimatedOutput,
  };
}
