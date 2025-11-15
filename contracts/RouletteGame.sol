// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RouletteGame is Ownable, ReentrancyGuard {
    IERC20 public gameToken;

    uint256 public minBet = 1 * 10**18;
    uint256 public maxBet = 1000 * 10**18;
    uint256 public houseBalance;
    uint256 public totalFees;
    uint256 public nonce;
    bool public paused;

    uint256 constant FEE_PERCENT = 1;
    uint256 constant PAYOUT_MULTIPLIER = 198;

    event GamePlayed(
        address indexed player,
        uint256 betAmount,
        bool choice,
        bool result,
        uint256 payout
    );

    event HouseFunded(address indexed funder, uint256 amount);
    event FeesWithdrawn(address indexed owner, uint256 amount);

    constructor(address _gameToken) Ownable(msg.sender) {
        gameToken = IERC20(_gameToken);
    }

    modifier notPaused() {
        require(!paused, "Game is paused");
        _;
    }

    function placeBet(uint256 amount, bool isBlack) external nonReentrant notPaused {
        require(amount >= minBet && amount <= maxBet, "Invalid bet amount");
        require(gameToken.balanceOf(msg.sender) >= amount, "Insufficient balance");

        uint256 fee = (amount * FEE_PERCENT) / 100;
        uint256 netBet = amount - fee;
        uint256 potentialPayout = (amount * PAYOUT_MULTIPLIER) / 100;

        require(houseBalance >= potentialPayout, "Insufficient house balance");
        require(gameToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        totalFees += fee;

        uint256 random = uint256(keccak256(abi.encodePacked(
            blockhash(block.number - 1),
            msg.sender,
            block.timestamp,
            nonce
        )));

        nonce++;

        bool isBlackResult = random % 2 == 0;
        bool won = isBlack == isBlackResult;

        uint256 payout = 0;

        if (won) {
            payout = potentialPayout;
            houseBalance -= (payout - netBet);
            require(gameToken.transfer(msg.sender, payout), "Payout failed");
        } else {
            houseBalance += netBet;
        }

        emit GamePlayed(msg.sender, amount, isBlack, isBlackResult, payout);
    }

    function fundHouse(uint256 amount) external {
        require(gameToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        houseBalance += amount;
        emit HouseFunded(msg.sender, amount);
    }

    function withdrawFees() external onlyOwner {
        uint256 amount = totalFees;
        require(amount > 0, "No fees to withdraw");
        totalFees = 0;
        require(gameToken.transfer(owner(), amount), "Transfer failed");
        emit FeesWithdrawn(owner(), amount);
    }

    function setMinMaxBet(uint256 _minBet, uint256 _maxBet) external onlyOwner {
        require(_minBet < _maxBet, "Invalid bet limits");
        minBet = _minBet;
        maxBet = _maxBet;
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = gameToken.balanceOf(address(this));
        require(gameToken.transfer(owner(), balance), "Transfer failed");
    }
}
