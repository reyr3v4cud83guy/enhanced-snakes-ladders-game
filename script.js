// Enhanced Snakes & Ladders Game
class EnhancedSnakesAndLadders {
  constructor() {
    this.initializeElements();
    this.initializeGameState();
    this.initializeSettings();
    this.initializeAchievements();
    this.setupEventListeners();
    this.initializeGame();
    this.startGameTimer();
  }

  initializeElements() {
    // Game elements
    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.wrapper = document.querySelector(".wrapper");
    this.playerDisplay = document.querySelector(".playerName");
    this.message = document.querySelector(".message");
    this.diceDisplay = document.querySelector("#diceThrow");
    this.resetButton = document.querySelector("#reset");

    // New interactive elements
    this.settingsPanel = document.getElementById("settingsPanel");
    this.settingsBtn = document.getElementById("settingsBtn");
    this.rollCountDisplay = document.getElementById("rollCount");
    this.scoreDisplay = document.getElementById("score");
    this.gameTimeDisplay = document.getElementById("gameTime");
    this.diceStreak = document.getElementById("diceStreak");
    this.powerupsDisplay = document.getElementById("powerupsDisplay");
    this.achievementList = document.getElementById("achievementList");
    this.gameOverModal = document.getElementById("gameOverModal");
    this.boardOverlay = document.getElementById("boardOverlay");

    // Settings elements
    this.difficultySelect = document.getElementById("difficulty");
    this.soundToggle = document.getElementById("soundToggle");
    this.player1NameInput = document.getElementById("player1Name");
    this.player1ColorInput = document.getElementById("player1Color");
  }

  initializeGameState() {
    // Canvas setup
    this.width = 500;
    this.height = 500;
    this.gridSize = 50;
    this.gridMid = 25;

    // Game state
    this.locked = false;
    this.walkSpeed = 300;
    this.slideSpeed = 0.8;
    this.rollSpeed = 80;
    this.gameStartTime = Date.now();
    this.totalRolls = 0;
    this.currentStreak = 0;
    this.bestStreak = 0;
    this.gameTime = 0;
    this.gameTimer = null;
    this.isPaused = false;

    // Players
    this.player1 = {
      current: 0,
      target: 0,
      x: 0,
      y: 0,
      colour: "#ff3366",
      id: "You",
      score: 0,
      powerups: { doubleDice: 0, skipSnake: 0, extraLadder: 0 },
    };

    this.player2 = {
      current: 0,
      target: 0,
      x: 0,
      y: 0,
      colour: "#33ff66",
      id: "AutoBot",
      score: 0,
      powerups: { doubleDice: 0, skipSnake: 0, extraLadder: 0 },
    };

    this.activePlayer = this.player1;
    this.walkSequence = this.generateWalkSequence(10, 10);

    // Special squares
    this.specialSquares = this.generateSpecialSquares();
  }

  initializeSettings() {
    this.settings = {
      difficulty: "normal",
      soundEnabled: true,
      player1Name: "You",
      player1Color: "#ff3366",
    };

    this.obstacles = this.getObstaclesForDifficulty("normal");
  }

  initializeAchievements() {
    this.achievements = [
      {
        id: "firstWin",
        name: "First Victory",
        description: "Win your first game",
        unlocked: false,
      },
      {
        id: "speedRunner",
        name: "Speed Runner",
        description: "Win in under 2 minutes",
        unlocked: false,
      },
      {
        id: "luckyRoller",
        name: "Lucky Roller",
        description: "Roll three 6s in a row",
        unlocked: false,
      },
      {
        id: "snakeCharmer",
        name: "Snake Charmer",
        description: "Hit 5 snakes in one game",
        unlocked: false,
      },
      {
        id: "ladderClimber",
        name: "Ladder Climber",
        description: "Use 5 ladders in one game",
        unlocked: false,
      },
      {
        id: "powerUser",
        name: "Power User",
        description: "Use all three power-ups in one game",
        unlocked: false,
      },
    ];

    this.renderAchievements();
  }

  setupEventListeners() {
    // Existing listeners
    this.diceDisplay.addEventListener("click", () => this.rollDice());
    this.resetButton.addEventListener("click", () => this.resetGame());

    // New listeners
    this.settingsBtn.addEventListener("click", () => this.toggleSettings());
    document
      .getElementById("applySettings")
      .addEventListener("click", () => this.applySettings());
    document
      .getElementById("closeSettings")
      .addEventListener("click", () => this.toggleSettings());
    document
      .getElementById("pauseBtn")
      .addEventListener("click", () => this.togglePause());
    document
      .getElementById("playAgainModal")
      .addEventListener("click", () => this.resetGame());
    document
      .getElementById("closeModal")
      .addEventListener("click", () => this.closeModal());

    // Power-up listeners
    document
      .getElementById("doubleDice")
      .addEventListener("click", () => this.usePowerup("doubleDice"));
    document
      .getElementById("skipSnake")
      .addEventListener("click", () => this.usePowerup("skipSnake"));
    document
      .getElementById("extraLadder")
      .addEventListener("click", () => this.usePowerup("extraLadder"));

    // Keyboard controls
    document.addEventListener("keydown", (e) => this.handleKeyPress(e));
  }

  generateWalkSequence(cols, rows) {
    let sequence = [];
    for (let row = 0; row < rows; row++) {
      let rowSquares = Array.apply(null, Array(cols)).map((x, col) => {
        return {
          id: col + row * cols,
          y: this.height - this.gridSize - row * this.gridSize,
          x: col * this.gridSize,
        };
      });
      rowSquares = row % 2 ? rowSquares.reverse() : rowSquares;
      sequence = [...sequence, ...rowSquares];
    }
    return sequence;
  }

  getObstaclesForDifficulty(difficulty) {
    const baseObstacles = [
      { type: "snake", start: 97, end: 78 },
      { type: "snake", start: 95, end: 56 },
      { type: "snake", start: 88, end: 24 },
      { type: "snake", start: 62, end: 18 },
      { type: "ladder", start: 1, end: 38 },
      { type: "ladder", start: 4, end: 14 },
      { type: "ladder", start: 21, end: 42 },
      { type: "ladder", start: 71, end: 92 },
    ];

    switch (difficulty) {
      case "easy":
        return [
          ...baseObstacles,
          { type: "ladder", start: 8, end: 30 },
          { type: "ladder", start: 28, end: 76 },
          { type: "ladder", start: 50, end: 67 },
          { type: "ladder", start: 80, end: 99 },
        ];
      case "hard":
        return [
          ...baseObstacles,
          { type: "snake", start: 48, end: 26 },
          { type: "snake", start: 36, end: 6 },
          { type: "snake", start: 32, end: 10 },
          { type: "snake", start: 74, end: 53 },
        ];
      default:
        return [
          ...baseObstacles,
          { type: "snake", start: 48, end: 26 },
          { type: "ladder", start: 28, end: 76 },
          { type: "ladder", start: 50, end: 67 },
        ];
    }
  }

  generateSpecialSquares() {
    const specialSquares = [];
    const powerupSquares = [15, 25, 35, 45, 55, 65, 75, 85];
    const bonusSquares = [12, 23, 34, 56, 67, 78, 89];

    powerupSquares.forEach((square) => {
      specialSquares.push({ square, type: "powerup", used: false });
    });

    bonusSquares.forEach((square) => {
      specialSquares.push({ square, type: "bonus", used: false });
    });

    return specialSquares;
  }

  initializeGame() {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.wrapper.style.maxWidth = `${this.width + 100}px`;
    this.ctx.strokeStyle = "#555";
    this.ctx.lineWidth = 2;

    this.setPlayerDisplay();
    this.drawPlayers();
    this.updatePowerupsDisplay();
    this.renderSpecialSquares();
  }

  startGameTimer() {
    this.gameTimer = setInterval(() => {
      if (!this.isPaused) {
        this.gameTime++;
        this.updateGameTimeDisplay();
      }
    }, 1000);
  }

  updateGameTimeDisplay() {
    const minutes = Math.floor(this.gameTime / 60);
    const seconds = this.gameTime % 60;
    this.gameTimeDisplay.textContent = `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  setPlayerDisplay(msg = "") {
    this.playerDisplay.innerHTML = `${this.activePlayer.id} ${msg}`;
    this.message.innerHTML = "Click dice to play";
    document.body.className = `player${this.activePlayer.id.replace(" ", "")}`;

    // Update stats
    this.rollCountDisplay.textContent = this.totalRolls;
    this.scoreDisplay.textContent = this.activePlayer.score;
  }

  drawPlayers() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw player 1
    if (this.player1.current > 0) {
      this.ctx.fillStyle = this.player1.colour;
      this.ctx.beginPath();
      this.ctx.arc(
        this.player1.x + this.gridMid,
        this.player1.y + this.gridMid,
        18,
        0,
        2 * Math.PI
      );
      this.ctx.fill();
      this.ctx.stroke();

      // Add player name
      this.ctx.fillStyle = "#fff";
      this.ctx.font = "12px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "P1",
        this.player1.x + this.gridMid,
        this.player1.y + this.gridMid + 4
      );
    }

    // Draw player 2
    if (this.player2.current > 0) {
      this.ctx.fillStyle = this.player2.colour;
      this.ctx.beginPath();
      if (this.player2.current === this.player1.current) {
        this.ctx.arc(
          this.player2.x + this.gridMid + 10,
          this.player2.y + this.gridMid,
          18,
          0,
          2 * Math.PI
        );
      } else {
        this.ctx.arc(
          this.player2.x + this.gridMid,
          this.player2.y + this.gridMid,
          18,
          0,
          2 * Math.PI
        );
      }
      this.ctx.fill();
      this.ctx.stroke();

      // Add player name
      this.ctx.fillStyle = "#fff";
      this.ctx.font = "12px Arial";
      this.ctx.textAlign = "center";
      const xOffset = this.player2.current === this.player1.current ? 10 : 0;
      this.ctx.fillText(
        "P2",
        this.player2.x + this.gridMid + xOffset,
        this.player2.y + this.gridMid + 4
      );
    }
  }

  rollDice(evt) {
    if (evt) evt.preventDefault();
    if (this.locked || this.isPaused) return;

    this.setLocked(true);
    this.totalRolls++;

    this.message.innerHTML =
      this.activePlayer === this.player1 ? "Rolling..." : "Auto rolling...";

    // Add dice rolling animation
    this.diceDisplay.classList.add("dice-rolling");

    let rollCount = 0;
    const rollMax = Math.random() * 10 + 15;
    const rolling = setInterval(() => {
      const rolled = Math.floor(Math.random() * 6 + 1);
      this.displayDiceRoll(rolled);

      if (rollCount++ >= rollMax) {
        clearInterval(rolling);
        this.diceDisplay.classList.remove("dice-rolling");
        this.handleDiceResult(rolled);
      }
    }, this.rollSpeed);

    this.playSound("diceRoll");
  }

  handleDiceResult(rolled) {
    this.message.innerHTML = "Moving...";

    // Check for streak
    if (rolled === 6) {
      this.currentStreak++;
      this.bestStreak = Math.max(this.bestStreak, this.currentStreak);
      this.updateStreakDisplay();

      if (this.currentStreak >= 3) {
        this.unlockAchievement("luckyRoller");
      }
    } else {
      this.currentStreak = 0;
      this.updateStreakDisplay();
    }

    // Apply double dice power-up
    if (this.activePlayer.powerups.doubleDice > 0) {
      rolled *= 2;
      this.activePlayer.powerups.doubleDice--;
      this.updatePowerupsDisplay();
      this.message.innerHTML += " (Double Dice!)";
    }

    this.activePlayer.target = Math.min(
      100,
      this.activePlayer.current + rolled
    );
    this.activePlayer.score += rolled * 10;

    this.startWalking();
  }

  startWalking() {
    const walking = setInterval(() => {
      this.walk(walking);
    }, this.walkSpeed);
  }

  walk(walkingInterval) {
    let activeCounter = this.activePlayer.current++;
    let sliding = false;

    this.activePlayer.x = this.walkSequence[activeCounter].x;
    this.activePlayer.y = this.walkSequence[activeCounter].y;
    this.drawPlayers();

    // Check for special squares
    this.checkSpecialSquare(this.activePlayer.current);

    if (this.activePlayer.current === 100) {
      clearInterval(walkingInterval);
      this.showWinner();
      return;
    }

    if (this.activePlayer.current >= this.activePlayer.target) {
      clearInterval(walkingInterval);

      // Check obstacles
      sliding = this.checkObstacles();

      if (!sliding) {
        this.resetTurn();
        this.togglePlayer();
      }
    }
  }

  checkObstacles() {
    for (let obstacle of this.obstacles) {
      if (obstacle.start === this.activePlayer.target) {
        // Check skip snake power-up
        if (
          obstacle.type === "snake" &&
          this.activePlayer.powerups.skipSnake > 0
        ) {
          this.activePlayer.powerups.skipSnake--;
          this.updatePowerupsDisplay();
          this.message.innerHTML = "Snake skipped with power-up!";
          this.playSound("powerup");
          setTimeout(() => {
            this.resetTurn();
            this.togglePlayer();
          }, 1000);
          return true;
        }

        let endSquare = obstacle.end;

        // Apply extra ladder power-up
        if (
          obstacle.type === "ladder" &&
          this.activePlayer.powerups.extraLadder > 0
        ) {
          endSquare = Math.min(100, endSquare + 10);
          this.activePlayer.powerups.extraLadder--;
          this.updatePowerupsDisplay();
          this.message.innerHTML = "Extra ladder boost!";
        }

        this.activePlayer.target = endSquare;
        this.slide(
          this.activePlayer,
          this.walkSequence[endSquare - 1].x,
          this.walkSequence[endSquare - 1].y,
          this.slideSpeed
        );

        this.playSound(obstacle.type === "snake" ? "snake" : "ladder");
        return true;
      }
    }
    return false;
  }

  checkSpecialSquare(square) {
    const specialSquare = this.specialSquares.find(
      (s) => s.square === square && !s.used
    );
    if (specialSquare) {
      specialSquare.used = true;

      if (specialSquare.type === "powerup") {
        this.grantRandomPowerup();
        this.playSound("powerup");
      } else if (specialSquare.type === "bonus") {
        this.activePlayer.score += 100;
        this.message.innerHTML += " Bonus points!";
        this.playSound("bonus");
      }

      this.renderSpecialSquares();
    }
  }

  grantRandomPowerup() {
    const powerups = ["doubleDice", "skipSnake", "extraLadder"];
    const randomPowerup = powerups[Math.floor(Math.random() * powerups.length)];
    this.activePlayer.powerups[randomPowerup]++;
    this.updatePowerupsDisplay();
    this.message.innerHTML += ` Power-up gained: ${randomPowerup}!`;
  }

  slide(element, dX, dY, dur = 1) {
    gsap.to(element, {
      x: dX,
      y: dY,
      duration: dur,
      delay: 0.25,
      onUpdate: () => this.drawPlayers(),
      onComplete: () => {
        this.activePlayer.current = this.activePlayer.target;
        this.drawPlayers();
        this.resetTurn();
        this.togglePlayer();
      },
    });
  }

  showWinner() {
    clearInterval(this.gameTimer);

    const winnerText =
      this.activePlayer.id === "You"
        ? "Congratulations! You won!"
        : "AutoBot wins!";

    // Update modal content
    document.querySelector(".winner-text").textContent = winnerText;
    document.getElementById("finalRolls").textContent = this.totalRolls;
    document.getElementById("finalTime").textContent =
      this.gameTimeDisplay.textContent;
    document.getElementById("finalScore").textContent = this.activePlayer.score;

    // Show modal
    this.gameOverModal.classList.add("show");

    // Unlock achievements
    this.unlockAchievement("firstWin");
    if (this.gameTime < 120) {
      this.unlockAchievement("speedRunner");
    }

    this.playSound("win");
  }

  resetTurn() {
    this.setLocked(false);
  }

  togglePlayer() {
    this.activePlayer =
      this.activePlayer.id === this.player1.id ? this.player2 : this.player1;
    this.setPlayerDisplay();

    if (this.activePlayer === this.player2) {
      setTimeout(() => this.rollDice(), 1000);
    }
  }

  setLocked(locked) {
    this.locked = locked;
  }

  displayDiceRoll(spots) {
    this.diceDisplay.className = `s${spots}`;
    this.diceDisplay.querySelector(".dice-number").textContent = spots;
  }

  updateStreakDisplay() {
    this.diceStreak.innerHTML = `<span>Streak: ${this.currentStreak}</span>`;
    if (this.currentStreak > 0) {
      this.diceStreak.classList.add("pulse");
    } else {
      this.diceStreak.classList.remove("pulse");
    }
  }

  updatePowerupsDisplay() {
    document.querySelector("#doubleDice .powerup-count").textContent =
      this.activePlayer.powerups.doubleDice;
    document.querySelector("#skipSnake .powerup-count").textContent =
      this.activePlayer.powerups.skipSnake;
    document.querySelector("#extraLadder .powerup-count").textContent =
      this.activePlayer.powerups.extraLadder;

    // Enable/disable powerups based on availability
    ["doubleDice", "skipSnake", "extraLadder"].forEach((powerup) => {
      const element = document.getElementById(powerup);
      if (this.activePlayer.powerups[powerup] > 0) {
        element.classList.remove("disabled");
      } else {
        element.classList.add("disabled");
      }
    });
  }

  usePowerup(type) {
    if (
      this.activePlayer.powerups[type] > 0 &&
      this.activePlayer === this.player1
    ) {
      // Power-ups are used automatically during gameplay
      this.message.innerHTML = `${type} will be used on next action!`;
    }
  }

  renderSpecialSquares() {
    this.boardOverlay.innerHTML = "";

    this.specialSquares.forEach((special) => {
      if (!special.used) {
        const square = this.walkSequence[special.square - 1];
        const element = document.createElement("div");
        element.className = `special-square ${special.type}`;
        element.style.left = `${square.x + 12.5}px`;
        element.style.top = `${square.y + 12.5}px`;
        this.boardOverlay.appendChild(element);
      }
    });
  }

  renderAchievements() {
    this.achievementList.innerHTML = "";

    this.achievements.forEach((achievement) => {
      const element = document.createElement("div");
      element.className = `achievement ${
        achievement.unlocked ? "unlocked" : ""
      }`;
      element.innerHTML = `
        <i class="fas fa-medal"></i>
        <span>${achievement.name}</span>
      `;
      element.title = achievement.description;
      this.achievementList.appendChild(element);
    });
  }

  unlockAchievement(id) {
    const achievement = this.achievements.find((a) => a.id === id);
    if (achievement && !achievement.unlocked) {
      achievement.unlocked = true;
      this.renderAchievements();

      // Show achievement notification
      this.showNotification(`Achievement Unlocked: ${achievement.name}!`);
    }
  }

  showNotification(text) {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = text;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(45deg, #ffd700, #ffed4e);
      color: #333;
      padding: 15px 25px;
      border-radius: 25px;
      font-weight: bold;
      z-index: 3000;
      animation: slideInRight 0.5s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.5s ease-in";
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  toggleSettings() {
    this.settingsPanel.classList.toggle("show");
  }

  applySettings() {
    this.settings.difficulty = this.difficultySelect.value;
    this.settings.soundEnabled = this.soundToggle.checked;
    this.settings.player1Name = this.player1NameInput.value || "You";
    this.settings.player1Color = this.player1ColorInput.value;

    // Apply settings
    this.player1.id = this.settings.player1Name;
    this.player1.colour = this.settings.player1Color;
    this.obstacles = this.getObstaclesForDifficulty(this.settings.difficulty);

    this.toggleSettings();
    this.setPlayerDisplay();
    this.drawPlayers();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    const pauseBtn = document.getElementById("pauseBtn");
    pauseBtn.innerHTML = this.isPaused
      ? '<i class="fas fa-play"></i>'
      : '<i class="fas fa-pause"></i>';

    if (this.isPaused) {
      this.message.innerHTML = "Game Paused";
    } else {
      this.setPlayerDisplay();
    }
  }

  closeModal() {
    this.gameOverModal.classList.remove("show");
  }

  resetGame() {
    // Reset players
    this.player1.current = 0;
    this.player1.target = 0;
    this.player1.x = 0;
    this.player1.y = 0;
    this.player1.score = 0;
    this.player1.powerups = { doubleDice: 0, skipSnake: 0, extraLadder: 0 };

    this.player2.current = 0;
    this.player2.target = 0;
    this.player2.x = 0;
    this.player2.y = 0;
    this.player2.score = 0;
    this.player2.powerups = { doubleDice: 0, skipSnake: 0, extraLadder: 0 };

    // Reset game state
    this.activePlayer = this.player1;
    this.locked = false;
    this.totalRolls = 0;
    this.currentStreak = 0;
    this.gameTime = 0;
    this.isPaused = false;

    // Reset special squares
    this.specialSquares.forEach((square) => (square.used = false));

    // Reset UI
    this.displayDiceRoll(6);
    this.setPlayerDisplay();
    this.drawPlayers();
    this.updatePowerupsDisplay();
    this.updateStreakDisplay();
    this.renderSpecialSquares();
    this.resetButton.classList.add("hidden");
    this.closeModal();

    // Restart timer
    if (this.gameTimer) clearInterval(this.gameTimer);
    this.startGameTimer();
  }

  handleKeyPress(e) {
    switch (e.key) {
      case " ":
        e.preventDefault();
        if (this.activePlayer === this.player1) this.rollDice();
        break;
      case "p":
      case "P":
        this.togglePause();
        break;
      case "r":
      case "R":
        if (e.ctrlKey) this.resetGame();
        break;
      case "s":
      case "S":
        this.toggleSettings();
        break;
    }
  }

  playSound(type) {
    if (!this.settings.soundEnabled) return;

    // Create audio context for sound effects
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    switch (type) {
      case "diceRoll":
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          200,
          audioContext.currentTime + 0.1
        );
        break;
      case "snake":
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          100,
          audioContext.currentTime + 0.3
        );
        break;
      case "ladder":
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          600,
          audioContext.currentTime + 0.2
        );
        break;
      case "powerup":
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          800,
          audioContext.currentTime + 0.1
        );
        break;
      case "bonus":
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        break;
      case "win":
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(
          800,
          audioContext.currentTime + 0.5
        );
        break;
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.3
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }
}

// Initialize the game when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new EnhancedSnakesAndLadders();
});
