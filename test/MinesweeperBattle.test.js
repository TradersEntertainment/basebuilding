const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MinesweeperBattle", function () {
  let minesweeperBattle;
  let owner;
  let player1;
  let player2;
  let player3;

  const ENTRY_FEE = ethers.parseEther("0.01");
  const TURN_DURATION = 15;

  beforeEach(async function () {
    [owner, player1, player2, player3] = await ethers.getSigners();

    const MinesweeperBattle = await ethers.getContractFactory("MinesweeperBattle");
    minesweeperBattle = await MinesweeperBattle.deploy();
    await minesweeperBattle.waitForDeployment();
  });

  describe("Game Creation", function () {
    it("Should create a new game", async function () {
      const tx = await minesweeperBattle.connect(player1).createGame(
        ENTRY_FEE,
        5,
        TURN_DURATION,
        true,
        { value: ENTRY_FEE }
      );

      await expect(tx)
        .to.emit(minesweeperBattle, "GameCreated")
        .withArgs(0, player1.address, ENTRY_FEE, 5, true);

      const [id, creator, players, entryFee, , maxPlayers] = await minesweeperBattle.getGameState(0);

      expect(id).to.equal(0);
      expect(creator).to.equal(player1.address);
      expect(players.length).to.equal(1);
      expect(entryFee).to.equal(ENTRY_FEE);
      expect(maxPlayers).to.equal(5);
    });

    it("Should reject invalid player count", async function () {
      await expect(
        minesweeperBattle.connect(player1).createGame(ENTRY_FEE, 1, TURN_DURATION, true, { value: ENTRY_FEE })
      ).to.be.revertedWith("Invalid player count");

      await expect(
        minesweeperBattle.connect(player1).createGame(ENTRY_FEE, 11, TURN_DURATION, true, { value: ENTRY_FEE })
      ).to.be.revertedWith("Invalid player count");
    });

    it("Should reject invalid turn duration", async function () {
      await expect(
        minesweeperBattle.connect(player1).createGame(ENTRY_FEE, 5, 5, true, { value: ENTRY_FEE })
      ).to.be.revertedWith("Invalid turn duration");
    });
  });

  describe("Joining Games", function () {
    beforeEach(async function () {
      await minesweeperBattle.connect(player1).createGame(
        ENTRY_FEE,
        3,
        TURN_DURATION,
        true,
        { value: ENTRY_FEE }
      );
    });

    it("Should allow players to join", async function () {
      await expect(
        minesweeperBattle.connect(player2).joinGame(0, { value: ENTRY_FEE })
      ).to.emit(minesweeperBattle, "PlayerJoined").withArgs(0, player2.address);

      const [, , players] = await minesweeperBattle.getGameState(0);
      expect(players.length).to.equal(2);
    });

    it("Should reject joining with incorrect fee", async function () {
      await expect(
        minesweeperBattle.connect(player2).joinGame(0, { value: ethers.parseEther("0.02") })
      ).to.be.revertedWith("Incorrect entry fee");
    });

    it("Should reject joining when game is full", async function () {
      await minesweeperBattle.connect(player2).joinGame(0, { value: ENTRY_FEE });
      await minesweeperBattle.connect(player3).joinGame(0, { value: ENTRY_FEE });

      const [player4] = await ethers.getSigners();
      await expect(
        minesweeperBattle.connect(player4).joinGame(0, { value: ENTRY_FEE })
      ).to.be.revertedWith("Game full");
    });

    it("Should reject duplicate joins", async function () {
      await minesweeperBattle.connect(player2).joinGame(0, { value: ENTRY_FEE });

      await expect(
        minesweeperBattle.connect(player2).joinGame(0, { value: ENTRY_FEE })
      ).to.be.revertedWith("Already joined");
    });
  });

  describe("Starting Games", function () {
    beforeEach(async function () {
      await minesweeperBattle.connect(player1).createGame(
        ENTRY_FEE,
        3,
        TURN_DURATION,
        true,
        { value: ENTRY_FEE }
      );
      await minesweeperBattle.connect(player2).joinGame(0, { value: ENTRY_FEE });
    });

    it("Should allow creator to start game", async function () {
      await expect(
        minesweeperBattle.connect(player1).startGame(0)
      ).to.emit(minesweeperBattle, "GameStarted");

      const [, , , , , , , , , , , started] = await minesweeperBattle.getGameState(0);
      expect(started).to.be.true;
    });

    it("Should reject non-creator starting game", async function () {
      await expect(
        minesweeperBattle.connect(player2).startGame(0)
      ).to.be.revertedWith("Only creator can start");
    });

    it("Should reject starting with insufficient players", async function () {
      await minesweeperBattle.connect(player1).createGame(
        ENTRY_FEE,
        3,
        TURN_DURATION,
        true,
        { value: ENTRY_FEE }
      );

      await expect(
        minesweeperBattle.connect(player1).startGame(1)
      ).to.be.revertedWith("Not enough players");
    });
  });

  describe("Game Flow", function () {
    beforeEach(async function () {
      await minesweeperBattle.connect(player1).createGame(
        ENTRY_FEE,
        2,
        TURN_DURATION,
        true,
        { value: ENTRY_FEE }
      );
      await minesweeperBattle.connect(player2).joinGame(0, { value: ENTRY_FEE });
      await minesweeperBattle.connect(player1).startGame(0);
    });

    it("Should allow current player to reveal tile", async function () {
      const [, , , , , , , currentPlayer] = await minesweeperBattle.getGameState(0);

      const player = currentPlayer === player1.address ? player1 : player2;

      await expect(
        minesweeperBattle.connect(player).revealTile(0, 0, 0)
      ).to.emit(minesweeperBattle, "TileRevealed");
    });

    it("Should reject wrong player revealing tile", async function () {
      const [, , , , , , , currentPlayer] = await minesweeperBattle.getGameState(0);

      const wrongPlayer = currentPlayer === player1.address ? player2 : player1;

      await expect(
        minesweeperBattle.connect(wrongPlayer).revealTile(0, 0, 0)
      ).to.be.revertedWith("Not your turn");
    });

    it("Should reject invalid coordinates", async function () {
      const [, , , , , , , currentPlayer] = await minesweeperBattle.getGameState(0);
      const player = currentPlayer === player1.address ? player1 : player2;

      await expect(
        minesweeperBattle.connect(player).revealTile(0, 10, 10)
      ).to.be.revertedWith("Invalid coordinates");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to pause", async function () {
      await minesweeperBattle.connect(owner).pause();

      await expect(
        minesweeperBattle.connect(player1).createGame(ENTRY_FEE, 5, TURN_DURATION, true, { value: ENTRY_FEE })
      ).to.be.revertedWithCustomError(minesweeperBattle, "EnforcedPause");
    });

    it("Should allow owner to unpause", async function () {
      await minesweeperBattle.connect(owner).pause();
      await minesweeperBattle.connect(owner).unpause();

      await expect(
        minesweeperBattle.connect(player1).createGame(ENTRY_FEE, 5, TURN_DURATION, true, { value: ENTRY_FEE })
      ).to.emit(minesweeperBattle, "GameCreated");
    });
  });
});
