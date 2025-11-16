export const MINESWEEPER_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export const MINESWEEPER_ABI = [
  "function createGame(uint256 _entryFee, uint8 _maxPlayers, uint256 _turnDuration, bool _isPublic) payable returns (uint256)",
  "function joinGame(uint256 _gameId) payable",
  "function startGame(uint256 _gameId)",
  "function revealTile(uint256 _gameId, uint8 x, uint8 y)",
  "function skipTurn(uint256 _gameId)",
  "function claimWinnings(uint256 _gameId)",
  "function getGameState(uint256 _gameId) view returns (uint256 id, address creator, address[] players, uint256 entryFee, uint256 prizePool, uint8 maxPlayers, uint8 currentRound, address currentPlayer, uint256 turnDeadline, uint256 turnDuration, bool isPublic, bool started, bool finished, uint8 gridSize, uint8 mineCount)",
  "function getActiveGames() view returns (uint256[])",
  "function getPlayerStatus(uint256 _gameId, address _player) view returns (bool isInGame, bool isEliminated, bool hasClaimed)",
  "function getGameMoves(uint256 _gameId) view returns (tuple(address player, uint8 x, uint8 y, bool hitMine, uint256 timestamp)[])",
  "function isTileRevealed(uint256 _gameId, uint8 x, uint8 y) view returns (bool)",
  "function totalFeesCollected() view returns (uint256)",
  "event GameCreated(uint256 indexed gameId, address indexed creator, uint256 entryFee, uint8 maxPlayers, bool isPublic)",
  "event PlayerJoined(uint256 indexed gameId, address indexed player)",
  "event GameStarted(uint256 indexed gameId, uint256 timestamp)",
  "event TileRevealed(uint256 indexed gameId, address indexed player, uint8 x, uint8 y, bool hitMine)",
  "event PlayerEliminated(uint256 indexed gameId, address indexed player)",
  "event TurnSkipped(uint256 indexed gameId, address indexed player)",
  "event RoundCompleted(uint256 indexed gameId, uint8 round)",
  "event GameFinished(uint256 indexed gameId, address[] winners, uint256 prizePerWinner)",
] as const;
