// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract MinesweeperBattle is Ownable, ReentrancyGuard, Pausable {
    uint256 private gameIdCounter;
    uint256 public totalFeesCollected;
    uint256 private constant PLATFORM_FEE_PERCENT = 1;
    uint256 private constant MIN_PLAYERS = 2;
    uint256 private constant MAX_PLAYERS = 10;
    uint256 private constant MIN_TURN_DURATION = 10;
    uint256 private constant MAX_TURN_DURATION = 30;

    struct Game {
        uint256 id;
        address creator;
        address[] players;
        uint256 entryFee;
        uint256 prizePool;
        uint8 maxPlayers;
        uint8 currentRound;
        uint8 currentTurnIndex;
        uint256 turnDeadline;
        uint256 turnDuration;
        bool isPublic;
        bool started;
        bool finished;
        bytes32 minesSeed;
        uint8 gridSize;
        uint8 mineCount;
    }

    struct PlayerMove {
        address player;
        uint8 x;
        uint8 y;
        bool hitMine;
        uint256 timestamp;
    }

    mapping(uint256 => Game) public games;
    mapping(uint256 => mapping(address => bool)) public eliminated;
    mapping(uint256 => mapping(address => bool)) public hasJoined;
    mapping(uint256 => mapping(address => bool)) public hasClaimedWinnings;
    mapping(uint256 => PlayerMove[]) public gameMoves;
    mapping(uint256 => mapping(uint8 => mapping(uint8 => bool))) public revealedTiles;
    uint256[] private activeGameIds;

    event GameCreated(uint256 indexed gameId, address indexed creator, uint256 entryFee, uint8 maxPlayers, bool isPublic);
    event PlayerJoined(uint256 indexed gameId, address indexed player);
    event GameStarted(uint256 indexed gameId, uint256 timestamp);
    event TileRevealed(uint256 indexed gameId, address indexed player, uint8 x, uint8 y, bool hitMine);
    event PlayerEliminated(uint256 indexed gameId, address indexed player);
    event TurnSkipped(uint256 indexed gameId, address indexed player);
    event RoundCompleted(uint256 indexed gameId, uint8 round);
    event GameFinished(uint256 indexed gameId, address[] winners, uint256 prizePerWinner);

    constructor() Ownable(msg.sender) {}

    function createGame(
        uint256 _entryFee,
        uint8 _maxPlayers,
        uint256 _turnDuration,
        bool _isPublic
    ) external payable nonReentrant whenNotPaused returns (uint256) {
        require(_maxPlayers >= MIN_PLAYERS && _maxPlayers <= MAX_PLAYERS, "Invalid player count");
        require(_turnDuration >= MIN_TURN_DURATION && _turnDuration <= MAX_TURN_DURATION, "Invalid turn duration");
        require(msg.value == _entryFee, "Entry fee mismatch");
        require(_entryFee > 0, "Entry fee must be positive");

        uint256 gameId = gameIdCounter++;
        Game storage game = games[gameId];

        game.id = gameId;
        game.creator = msg.sender;
        game.entryFee = _entryFee;
        game.maxPlayers = _maxPlayers;
        game.turnDuration = _turnDuration;
        game.isPublic = _isPublic;
        game.currentRound = 1;
        game.prizePool = _entryFee;

        game.players.push(msg.sender);
        hasJoined[gameId][msg.sender] = true;

        activeGameIds.push(gameId);

        emit GameCreated(gameId, msg.sender, _entryFee, _maxPlayers, _isPublic);
        emit PlayerJoined(gameId, msg.sender);

        return gameId;
    }

    function joinGame(uint256 _gameId) external payable nonReentrant whenNotPaused {
        Game storage game = games[_gameId];

        require(!game.started, "Game already started");
        require(!game.finished, "Game finished");
        require(game.players.length < game.maxPlayers, "Game full");
        require(!hasJoined[_gameId][msg.sender], "Already joined");
        require(msg.value == game.entryFee, "Incorrect entry fee");

        game.players.push(msg.sender);
        hasJoined[_gameId][msg.sender] = true;
        game.prizePool += msg.value;

        emit PlayerJoined(_gameId, msg.sender);
    }

    function startGame(uint256 _gameId) external nonReentrant whenNotPaused {
        Game storage game = games[_gameId];

        require(msg.sender == game.creator, "Only creator can start");
        require(!game.started, "Already started");
        require(game.players.length >= MIN_PLAYERS, "Not enough players");

        game.started = true;
        game.turnDeadline = block.timestamp + game.turnDuration;

        _initializeRound(_gameId);

        emit GameStarted(_gameId, block.timestamp);
    }

    function revealTile(uint256 _gameId, uint8 x, uint8 y) external nonReentrant whenNotPaused {
        Game storage game = games[_gameId];

        require(game.started && !game.finished, "Game not active");
        require(!eliminated[_gameId][msg.sender], "Player eliminated");
        require(game.players[game.currentTurnIndex] == msg.sender, "Not your turn");
        require(block.timestamp <= game.turnDeadline, "Turn expired");
        require(x < game.gridSize && y < game.gridSize, "Invalid coordinates");
        require(!revealedTiles[_gameId][x][y], "Tile already revealed");

        revealedTiles[_gameId][x][y] = true;
        bool hitMine = _isMine(_gameId, x, y);

        gameMoves[_gameId].push(PlayerMove({
            player: msg.sender,
            x: x,
            y: y,
            hitMine: hitMine,
            timestamp: block.timestamp
        }));

        emit TileRevealed(_gameId, msg.sender, x, y, hitMine);

        if (hitMine) {
            eliminated[_gameId][msg.sender] = true;
            emit PlayerEliminated(_gameId, msg.sender);

            _checkGameEnd(_gameId);
        } else {
            _nextTurn(_gameId);
        }
    }

    function skipTurn(uint256 _gameId) external nonReentrant whenNotPaused {
        Game storage game = games[_gameId];

        require(game.started && !game.finished, "Game not active");
        require(!eliminated[_gameId][msg.sender], "Player eliminated");
        require(game.players[game.currentTurnIndex] == msg.sender || block.timestamp > game.turnDeadline, "Cannot skip");

        emit TurnSkipped(_gameId, game.players[game.currentTurnIndex]);
        _nextTurn(_gameId);
    }

    function claimWinnings(uint256 _gameId) external nonReentrant {
        Game storage game = games[_gameId];

        require(game.finished, "Game not finished");
        require(!eliminated[_gameId][msg.sender], "Player was eliminated");
        require(hasJoined[_gameId][msg.sender], "Not a player");
        require(!hasClaimedWinnings[_gameId][msg.sender], "Already claimed");

        address[] memory winners = _getWinners(_gameId);
        require(winners.length > 0, "No winners");

        uint256 platformFee = (game.prizePool * PLATFORM_FEE_PERCENT) / 100;
        uint256 netPrize = game.prizePool - platformFee;
        uint256 prizePerWinner = netPrize / winners.length;

        hasClaimedWinnings[_gameId][msg.sender] = true;
        totalFeesCollected += platformFee / winners.length;

        (bool success, ) = payable(msg.sender).call{value: prizePerWinner}("");
        require(success, "Transfer failed");
    }

    function getGameState(uint256 _gameId) external view returns (
        uint256 id,
        address creator,
        address[] memory players,
        uint256 entryFee,
        uint256 prizePool,
        uint8 maxPlayers,
        uint8 currentRound,
        address currentPlayer,
        uint256 turnDeadline,
        uint256 turnDuration,
        bool isPublic,
        bool started,
        bool finished,
        uint8 gridSize,
        uint8 mineCount
    ) {
        Game storage game = games[_gameId];
        address currentPlayerAddr = game.started && !game.finished && game.players.length > 0
            ? game.players[game.currentTurnIndex]
            : address(0);

        return (
            game.id,
            game.creator,
            game.players,
            game.entryFee,
            game.prizePool,
            game.maxPlayers,
            game.currentRound,
            currentPlayerAddr,
            game.turnDeadline,
            game.turnDuration,
            game.isPublic,
            game.started,
            game.finished,
            game.gridSize,
            game.mineCount
        );
    }

    function getActiveGames() external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < activeGameIds.length; i++) {
            if (!games[activeGameIds[i]].finished) {
                count++;
            }
        }

        uint256[] memory active = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < activeGameIds.length; i++) {
            if (!games[activeGameIds[i]].finished) {
                active[index] = activeGameIds[i];
                index++;
            }
        }

        return active;
    }

    function getPlayerStatus(uint256 _gameId, address _player) external view returns (
        bool isInGame,
        bool isEliminated,
        bool hasClaimed
    ) {
        return (
            hasJoined[_gameId][_player],
            eliminated[_gameId][_player],
            hasClaimedWinnings[_gameId][_player]
        );
    }

    function getGameMoves(uint256 _gameId) external view returns (PlayerMove[] memory) {
        return gameMoves[_gameId];
    }

    function isTileRevealed(uint256 _gameId, uint8 x, uint8 y) external view returns (bool) {
        return revealedTiles[_gameId][x][y];
    }

    function withdrawFees() external onlyOwner {
        uint256 amount = totalFeesCollected;
        require(amount > 0, "No fees to withdraw");

        totalFeesCollected = 0;

        (bool success, ) = payable(owner()).call{value: amount}("");
        require(success, "Transfer failed");
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _initializeRound(uint256 _gameId) internal {
        Game storage game = games[_gameId];

        (uint8 gridSize, uint8 mineCount) = _calculateGridParams(game.players.length);

        if (game.currentRound > 1) {
            mineCount = uint8((uint256(mineCount) * 120) / 100);
        }

        game.gridSize = gridSize;
        game.mineCount = mineCount;

        game.minesSeed = keccak256(abi.encodePacked(
            block.prevrandao,
            block.timestamp,
            _gameId,
            game.currentRound,
            block.number
        ));
    }

    function _calculateGridParams(uint256 playerCount) internal pure returns (uint8 gridSize, uint8 mineCount) {
        if (playerCount <= 2) return (5, 3);
        if (playerCount <= 4) return (6, 5);
        if (playerCount <= 6) return (8, 8);
        if (playerCount <= 8) return (10, 12);
        return (12, 18);
    }

    function _isMine(uint256 _gameId, uint8 x, uint8 y) internal view returns (bool) {
        Game storage game = games[_gameId];

        uint256 minesGenerated = 0;
        uint256 gridTotal = uint256(game.gridSize) * uint256(game.gridSize);

        for (uint256 i = 0; i < gridTotal && minesGenerated < game.mineCount; i++) {
            bytes32 hash = keccak256(abi.encodePacked(game.minesSeed, i));
            uint8 mineX = uint8(uint256(hash) % game.gridSize);
            uint8 mineY = uint8(uint256(hash >> 8) % game.gridSize);

            if (mineX == x && mineY == y) {
                return true;
            }
            minesGenerated++;
        }

        return false;
    }

    function _nextTurn(uint256 _gameId) internal {
        Game storage game = games[_gameId];

        uint8 startIndex = game.currentTurnIndex;
        uint8 attempts = 0;

        do {
            game.currentTurnIndex = uint8((game.currentTurnIndex + 1) % game.players.length);
            attempts++;

            if (attempts >= game.players.length) {
                _handleRoundComplete(_gameId);
                return;
            }
        } while (eliminated[_gameId][game.players[game.currentTurnIndex]]);

        game.turnDeadline = block.timestamp + game.turnDuration;
    }

    function _handleRoundComplete(uint256 _gameId) internal {
        Game storage game = games[_gameId];

        emit RoundCompleted(_gameId, game.currentRound);

        game.currentRound++;
        game.currentTurnIndex = 0;

        while (game.currentTurnIndex < game.players.length &&
               eliminated[_gameId][game.players[game.currentTurnIndex]]) {
            game.currentTurnIndex++;
        }

        _initializeRound(_gameId);
        game.turnDeadline = block.timestamp + game.turnDuration;
    }

    function _checkGameEnd(uint256 _gameId) internal {
        Game storage game = games[_gameId];

        address[] memory winners = _getWinners(_gameId);

        if (winners.length <= 1) {
            game.finished = true;

            uint256 platformFee = (game.prizePool * PLATFORM_FEE_PERCENT) / 100;
            uint256 netPrize = game.prizePool - platformFee;
            uint256 prizePerWinner = winners.length > 0 ? netPrize / winners.length : 0;

            emit GameFinished(_gameId, winners, prizePerWinner);
        } else {
            _nextTurn(_gameId);
        }
    }

    function _getWinners(uint256 _gameId) internal view returns (address[] memory) {
        Game storage game = games[_gameId];

        uint256 winnerCount = 0;
        for (uint256 i = 0; i < game.players.length; i++) {
            if (!eliminated[_gameId][game.players[i]]) {
                winnerCount++;
            }
        }

        address[] memory winners = new address[](winnerCount);
        uint256 index = 0;
        for (uint256 i = 0; i < game.players.length; i++) {
            if (!eliminated[_gameId][game.players[i]]) {
                winners[index] = game.players[i];
                index++;
            }
        }

        return winners;
    }
}
