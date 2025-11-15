// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

contract SwapFeeCollector is Ownable {
    IERC20 public gameToken;
    address public weth;
    address public treasury;
    ISwapRouter public swapRouter;

    uint256 public threshold = 10000 * 10**18;
    uint256 public collectedFees;

    event FeesCollected(uint256 amount);
    event BuybackExecuted(uint256 wethAmount, uint256 tokensReceived);
    event TokensBurned(uint256 amount);

    constructor(
        address _gameToken,
        address _weth,
        address _swapRouter,
        address _treasury
    ) Ownable(msg.sender) {
        gameToken = IERC20(_gameToken);
        weth = _weth;
        swapRouter = ISwapRouter(_swapRouter);
        treasury = _treasury;
    }

    function collectFees(uint256 amount) external {
        require(gameToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        collectedFees += amount;
        emit FeesCollected(amount);

        if (collectedFees >= threshold) {
            executeBuyback();
        }
    }

    function executeBuyback() public {
        uint256 amount = collectedFees;
        require(amount > 0, "No fees to process");

        collectedFees = 0;

        gameToken.approve(address(swapRouter), amount);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn: address(gameToken),
            tokenOut: weth,
            fee: 3000,
            recipient: address(this),
            deadline: block.timestamp + 300,
            amountIn: amount,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        });

        uint256 wethReceived = swapRouter.exactInputSingle(params);

        IERC20(weth).approve(address(swapRouter), wethReceived);

        ISwapRouter.ExactInputSingleParams memory buybackParams = ISwapRouter.ExactInputSingleParams({
            tokenIn: weth,
            tokenOut: address(gameToken),
            fee: 3000,
            recipient: address(this),
            deadline: block.timestamp + 300,
            amountIn: wethReceived,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0
        });

        uint256 tokensBought = swapRouter.exactInputSingle(buybackParams);

        uint256 burnAmount = tokensBought / 2;
        uint256 treasuryAmount = tokensBought - burnAmount;

        gameToken.transfer(address(0), burnAmount);
        gameToken.transfer(treasury, treasuryAmount);

        emit BuybackExecuted(wethReceived, tokensBought);
        emit TokensBurned(burnAmount);
    }

    function setThreshold(uint256 _threshold) external onlyOwner {
        threshold = _threshold;
    }

    function setTreasury(address _treasury) external onlyOwner {
        treasury = _treasury;
    }
}
