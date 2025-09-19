// create 25  bxes for game
const grid = document.querySelector(".grid");
for (let i = 0; i < 25; i++) {
  const div = document.createElement("div");
  grid.appendChild(div);
}

// select  home boxes
const cells = Array.from(grid.children);
const hFOur = cells[22]; // for yellow
const hThree = cells[14]; // for blue
const hTwo = cells[10]; // for green
const hOne = cells[2]; // for red
const winBox = cells[12];

// Set home and win boxes color
const boxes = [
  { el: hOne, color: "rgba(240, 118, 118, 1)" }, // red
  { el: hTwo, color: "rgb(80, 237, 75)" }, // green
  { el: hThree, color: "rgba(102, 138, 221, 1)" }, // blue
  { el: hFOur, color: "rgb(228, 231, 99)" }, // yellow
  { el: winBox, color: "rgb(231, 99, 220)" }, // win box
];

boxes.forEach(({ el, color }) => {
  el.style.background = color;
  el.style.display = "flex";
  el.style.flexWrap = "wrap";
  el.style.boxSizing = "border-box";
});

// collision not occured
const safeCells = [hOne, hTwo, hThree, hFOur, winBox];

// create  peices for  players
function createPiece(color, parent) {
  const piece = document.createElement("span");
  piece.classList.add("piece", color);
  piece.style.width = "3vmin";
  piece.style.height = "3vmin";
  piece.style.margin = "0.1vmin";
  piece.style.borderRadius = "50%";
  piece.style.border = "0.3vmin solid black";
  piece.style.boxSizing = "border-box";
  piece.style.background = color;
  piece.style.display = "flex";
  piece.style.flexWrap = "wrap";
  piece.style.zIndex = "9999"; // Ensure pieces are above the grid

  parent.appendChild(piece);
}

// it gives the number of peices of each player
for (let i = 0; i < 4; i++) createPiece("red", hOne);
for (let i = 0; i < 4; i++) createPiece("green", hTwo);
for (let i = 0; i < 4; i++) createPiece("blue", hThree);
for (let i = 0; i < 4; i++) createPiece("yellow", hFOur);
for (let i = 0; i < 16; i++) createPiece("hotpink", winBox);

// Movement paths of players
const redPath = [
  2, 1, 0, 5, 10, 15, 20, 21, 22, 23, 24, 19, 14, 9, 4, 3, 8, 13, 18, 17, 16,
  11, 6, 7, 12,
];
const greenPath = [
  10, 15, 20, 21, 22, 23, 24, 19, 14, 9, 4, 3, 2, 1, 0, 5, 6, 7, 8, 13, 18, 17,
  16, 11, 12,
];
const yellowPath = [
  22, 23, 24, 19, 14, 9, 4, 3, 2, 1, 0, 5, 10, 15, 20, 21, 16, 11, 6, 7, 8, 13,
  18, 17, 12,
];
const bluePath = [
  14, 9, 4, 3, 2, 1, 0, 5, 10, 15, 20, 21, 22, 23, 24, 19, 18, 17, 16, 11, 6, 7,
  8, 13, 12,
];

// arrange the pieces in win box
const winBoxSlots = {
  red: [0, 1, 2, 3],
  green: [4, 5, 8, 9],
  blue: [6, 7, 10, 11],
  yellow: [12, 13, 14, 15],
};

const winCounter = {
  red: 0,
  green: 0,
  blue: 0,
  yellow: 0,
};

// Make players array mutable
let players = ["red", "blue", "yellow", "green"];

// fetch player path
function getPathForPiece(piece) {
  if (piece.classList.contains("red")) return redPath;
  if (piece.classList.contains("green")) return greenPath;
  if (piece.classList.contains("yellow")) return yellowPath;
  if (piece.classList.contains("blue")) return bluePath;
  return [];
}

let currentRollValue = null;

let lastDiceValue = null;
function generateDiceValue() {
  let value;
  do {
    value = Math.floor(Math.random() * 4) + 1;
  } while (value === lastDiceValue);
  lastDiceValue = value;
   return value; // 👈 For testing, always return 4
//  return 24; // 👈 For testing, always return 4
}

function rollBtn(player) {
  // Prevent rolling if player is finished
  if (winCounter[player] >= 4) {
    updateTurn();
  }

  const randomValue = generateDiceValue();
  currentRollValue = randomValue; // 👈 Store it globally
  // Animate mini dice and main dice, then show dots
  const miniDice = document.getElementById(`${player}MiniDice`);
  const mainDice = document.getElementById("dice");
  animateDiceRoll(miniDice, () => renderMiniDice(player, randomValue));
  animateDiceRoll(mainDice, () => rollDice(randomValue));

  if (miniDice) {
    miniDice.pointerEvents = "none"; // Disable pointer events
    miniDice.innerHTML = ""; // Clear previous dots
    miniDice.style.opacity = "0.5";
    miniDice.style.cursor = "not-allowed";
  // Disable the roll button after one click
  const btnWrapper = document.getElementById(`${player}Btn`);
  const buttonEl = btnWrapper?.querySelector("button");
  if (buttonEl) {
    buttonEl.disabled = true;
    buttonEl.style.opacity = "0.5";
    buttonEl.style.cursor = "not-allowed";
  }

  const outputId = `${player}YouGet`;
  const outputElement = document.getElementById(outputId);
  if (outputElement) {
    outputElement.textContent = `You got: ${randomValue}`;
  }

  // Update the visual dice too
  rollDice(randomValue);

  playSound("sounds/diceSound.mp3"); // Play dice sound

  // Auto-move last piece if 3 are in win box
  if (winCounter[player] === 3) {
    autoMoveLastPiece(player, randomValue, () => {
      updateTurn();
    });
    return;
  }

  enablePlayerPieces(player);
}
}
// (stray removePlayerFromGame(color); removed)
function rollDice(value) {
  const dice = document.getElementById("dice");
  dice.innerHTML = ""; // clear old dots

  // 3x3 grid positions for dice dots
  const positions = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
  };

  // Create 9 cells for 3x3 grid
  for (let i = 0; i < 9; i++) {
    const dot = document.createElement("div");
    dot.className = "dot";
    // Show dot only if this index is in positions[value]
    if (positions[value] && positions[value].includes(i)) {
      dot.style.visibility = "visible";
    } else {
      dot.style.visibility = "hidden";
    }
    dice.appendChild(dot);
  }

  if (players.length === 0) return;
}

function isInWinBox(piece) {
  return piece.parentElement.classList.contains("win-box");
}

function enablePlayerPieces(player) {
  const pieces = document.querySelectorAll(`.piece.${player}`);
  pieces.forEach((piece) => {
    //  if (piece.closest(".grid") === winBox) return;

    if (isInWinBox(piece)) return;
    piece.addEventListener("click", handlePieceClick);
    piece.style.outline = "0.3vmin dotted white";
    piece.style.cursor = "pointer";
    piece.style.width = "4vmin";
    piece.style.height = "4vmin";
  });
}

function highlightCurrentPlayerPieces() {
  // Remove glow from all pieces
  document.querySelectorAll(".piece").forEach((piece) => {
    piece.classList.remove("glow");
  });

  // Add glow to current player's pieces
  document.querySelectorAll(`.piece.${currentPlayer}`).forEach((piece) => {
    piece.classList.add("glow");
  });
}

function deactivateAllPieces() {
  document.querySelectorAll(".piece").forEach((piece) => {
    if (isInWinBox(piece)) return;
    piece.removeEventListener("click", handlePieceClick);

    piece.style.outline = "none";
    piece.style.cursor = "default";
    piece.style.width = "3vmin";
    piece.style.height = "3vmin";
  });
}

function handlePieceClick(event) {
  const piece = event.target;
  const path = getPathForPiece(piece);
  if (!path.length) return;

  let currentPos = parseInt(piece.dataset.position || 0);
  const moveTo = currentPos + currentRollValue;

  if (moveTo >= path.length) {
    // Deselect this piece, do not allow move
    piece.style.outline = "none";
    piece.style.cursor = "not-allowed";
    // Check if ANY piece of the current player can move
    const movable = Array.from(
      document.querySelectorAll(`.piece.${currentPlayer}`)
    ).some((p) => {
      if (isInWinBox(p)) return false;
      const pPath = getPathForPiece(p);
      const pCurrentPos = parseInt(p.dataset.position || 0);
      const pMoveTo = pCurrentPos + currentRollValue;
      return pMoveTo < pPath.length;
    });
    if (!movable) {
      // No piece can move, deactivate all and update turn ONCE
      deactivateAllPieces();
      setTimeout(() => updateTurn(), 300);
    }
    return;
  }

  deactivateAllPieces(); // disable all clicks during animation

  // Step-by-step move with bounce
  for (let step = 1; step <= moveTo - currentPos; step++) {
    setTimeout(() => {
      const nextCell = cells[path[currentPos + step]];
      nextCell.appendChild(piece);
      playSound("sounds/stepSound.mp3"); // Play sound for each step
      // Bounce animation for current player's moving piece
      piece.classList.add("bouncing");
      piece.addEventListener(
        "animationend",
        () => {
          piece.classList.remove("bouncing");
        },
        { once: true }
      );
      2;

      // If last step, then check collision + win
      if (step === moveTo - currentPos) {
        piece.dataset.position = moveTo;

        // ✅ Collision check (enemy bounce handled inside handleCollision)
        const collisionHappened = handleCollision(piece);
        if (collisionHappened) {
          console.log("Collision happened! Enemy sent home.");
          //enableDiceForCurrentPlayer();
        }

        // ✅ Win box check
        if (path[moveTo] === 12) {
          reachWinBox(piece, moveTo);
          return;
        }

        // ✅ Extra turn check (rolled 4 OR collision)
        if (checkExtraTurn(currentRollValue, collisionHappened)) {
          console.log("get extra turn");
          // Only enable dice if extra turn (rolled 4 or collision)
          enableDiceForCurrentPlayer();
        } else {
          // Clear mini dice for this player after move
          const miniDice = document.getElementById(`${currentPlayer}MiniDice`);
          if (miniDice) miniDice.innerHTML = "";
          updateTurn();
        }
      }
    }, step * 300); // 300ms delay per step
  }
}

let currentPlayerIndex = 0;
let currentPlayer = players[currentPlayerIndex];

function updateTurn(firstTurn = false) {
  let prevPlayer = currentPlayer;
  if (!firstTurn) {
    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    currentPlayer = players[currentPlayerIndex];
  }
  console.log("Current turn:", currentPlayer);

  // Clear only the value after 'You got:' for the previous player
  const prevOutput = document.getElementById(`${prevPlayer}YouGet`);
  if (prevOutput) prevOutput.textContent = "You got:";

  // Sab dice disable karo
  players.forEach((player) => {
    const btnWrapper = document.getElementById(`${player}Btn`);
    const buttonEl = btnWrapper?.querySelector("button");
    if (buttonEl) {
      buttonEl.disabled = true;
      buttonEl.style.opacity = "1";
      buttonEl.style.cursor = "not-allowed";
    }
  });

  // Reset previous player's button color to default
  const btnColors = {
    red: "rgba(222, 50, 50, 0.877)",
    green: "rgba(6, 128, 18, 0.659)",
    blue: "rgba(81, 81, 203, 0.937)",
    yellow: "#cbcb20d6",
  };
  const prevBtnWrapper = document.getElementById(`${prevPlayer}Btn`);
  const prevButton = prevBtnWrapper?.querySelector("button");
  if (prevButton) {
    prevButton.style.background = btnColors[prevPlayer];
    prevButton.classList.remove("glow-btn");
  }

  // Highlight current player's button with their home cell color
  const homeCellColors = {
    red: "rgba(240, 118, 118, 1)",
    green: "rgb(80, 237, 75)",
    blue: "rgba(102, 138, 221, 1)",
    yellow: "rgb(228, 231, 99)",
  };
  const currentBtnWrapper = document.getElementById(`${currentPlayer}Btn`);
  const currentButton = currentBtnWrapper?.querySelector("button");
  if (currentButton) {
    currentButton.disabled = false;
    currentButton.style.opacity = "1";
    currentButton.style.cursor = "pointer";
    currentButton.style.background = homeCellColors[currentPlayer];
    currentButton.classList.add("glow-btn");
  }
  highlightCurrentPlayerPieces();
}

// Check if reached win box
function reachWinBox(piece, moveTo) {
  const path = getPathForPiece(piece);
  if (path[moveTo] === 12) {
    playSound("sounds/reachSound.mp3"); // Play win sound
    const color = piece.classList[1];
    const slotIndices = winBoxSlots[color];
    const slotIndex = winCounter[color];
    const finalIndex = slotIndices[slotIndex];
    const winChildren = winBox.children;
    const oldPiece = winChildren[finalIndex];
    if (oldPiece && oldPiece.classList.contains("hotpink")) {
      winBox.replaceChild(piece, oldPiece);
    } else {
      winBox.appendChild(piece); // backup
    }
    //  delete piece.dataset.position;
    winCounter[color]++;
    piece.removeEventListener("click", handlePieceClick);
    // Remove all CSS classes except the color class
    if (piece.classList.length > 1) {
      const colorClass = piece.classList[1];
      piece.className = colorClass;
    }
    piece.style.outline = "none";
    piece.style.cursor = "default";
    piece.style.width = "3vmin";
    piece.style.height = "3vmin";
    // If all 4 pieces of this color have reached the win box, disable their roll button and remove from game
    if (winCounter[color] >= 4) {
      const btnWrapper = document.getElementById(`${color}Btn`);
      const buttonEl = btnWrapper?.querySelector("button");
      if (buttonEl) {
        buttonEl.disabled = true;
        buttonEl.style.opacity = "0.5";
        buttonEl.style.cursor = "not-allowed";
      }
      removePlayerFromGame(color); // <-- ensure finish order and The End logic runs
      return;
    }
    enableDiceForCurrentPlayer();
  }
}

function handleCollision(piece) {
  const path = getPathForPiece(piece);
  const currentCell = cells[parseInt(path[piece.dataset.position])];
  const allPiecesHere = Array.from(currentCell.querySelectorAll(".piece"));

  // Safe cell par kuch nahi karna
  if (safeCells.includes(currentCell)) {
    return false;
  }

  // Enemy piece find karo
  const enemyPiece = allPiecesHere.find(
    (p) => !p.classList.contains(piece.classList[1])
  );

  if (enemyPiece) {
    const enemyColor = enemyPiece.classList[1];
    let homeCell = null;
    let enemyPath = null;
    if (enemyColor === "red") {
      homeCell = hOne;
      enemyPath = redPath;
    }
    if (enemyColor === "green") {
      homeCell = hTwo;
      enemyPath = greenPath;
    }
    if (enemyColor === "blue") {
      homeCell = hThree;
      enemyPath = bluePath;
    }
    if (enemyColor === "yellow") {
      homeCell = hFOur;
      enemyPath = yellowPath;
    }

    if (homeCell && enemyPath) {
      // Find current position of enemy piece on its path
      let enemyPos = parseInt(enemyPiece.dataset.position || 0);
      // Animate step by step to home cell (first cell in path)
      for (let step = enemyPos; step > 0; step--) {
        setTimeout(() => {
          playSound("sounds/killSound.mp3"); // Play sound for collision
          const cellIndex = enemyPath[step - 1];
          cells[cellIndex].appendChild(enemyPiece);
          enemyPiece.classList.add("bouncing");
          enemyPiece.addEventListener(
            "animationend",
            () => {
              enemyPiece.classList.remove("bouncing");
            },
            { once: true }
          );
        }, (enemyPos - step) * 200);
      }
      // After animation, move to home cell and reset position
      setTimeout(() => {
        homeCell.appendChild(enemyPiece);
        delete enemyPiece.dataset.position;
      }, enemyPos * 200 + 200);
    }
    return true; // collision hua
  }
  return false; // collision nahi hua
}

function movePieceStep(piece, targetCell, delay) {
  setTimeout(() => {
    targetCell.appendChild(piece);

    // Bounce class add karo
    piece.classList.add("bouncing");
    // Animation end hone par class remove
    piece.addEventListener(
      "animationend",
      () => {
        piece.classList.remove("bouncing");
      },
      { once: true }
    );
  }, delay);
}

function animatePieceMove(piece, startPos, endPos, path) {
  for (let step = 1; step <= endPos - startPos; step++) {
    const cellIndex = path[startPos + step];
    movePieceStep(piece, cells[cellIndex], step * 300);
  }
}

//this function help us to start game with red player
function startGame() {
  // Start from Red
  currentPlayerIndex = 0;
  currentPlayer = players[currentPlayerIndex];

  // Disable all players' dice
  players.forEach((player) => {
    const btnWrapper = document.getElementById(`${player}Btn`);
    const buttonEl = btnWrapper?.querySelector("button");
    if (buttonEl) {
      buttonEl.disabled = true;
      buttonEl.style.opacity = "0.5";
      buttonEl.style.cursor = "not-allowed";
    }
  });

  // Enable Red player's dice and set its color to home cell color
  const redBtnWrapper = document.getElementById(`redBtn`);
  const redButton = redBtnWrapper?.querySelector("button");
  if (redButton) {
    redButton.disabled = false;
    redButton.style.opacity = "1";
    redButton.style.cursor = "pointer";
    redButton.style.background = "rgba(240, 118, 118, 1)";
    redButton.classList.add("glow-btn");
  }

  // Highlight red pieces
  highlightCurrentPlayerPieces();

  console.log("Game started! First turn: Red");
}
// Call once when page loads
startGame();

function checkExtraTurn(rolledNumber, collisionHappened) {
  return rolledNumber === 4 || collisionHappened;
}
function enableDiceForCurrentPlayer() {
  const btnWrapper = document.getElementById(`${currentPlayer}Btn`);
  const buttonEl = btnWrapper?.querySelector("button");
  if (buttonEl) {
    buttonEl.disabled = false;
    buttonEl.style.opacity = "1";
    buttonEl.style.cursor = "pointer";
  }
}
// Render mini dice for a player
function renderMiniDice(player, value) {
  const miniDice = document.getElementById(`${player}MiniDice`);
  if (!miniDice) return;
  miniDice.innerHTML = "";
  const inner = document.createElement("div");
  inner.className = "mini-dice-inner";
  const positions = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
  };
  const dots = positions[value] || [];
  for (let i = 0; i < 9; i++) {
    const dot = document.createElement("div");
    dot.style.width = "6px";
    dot.style.height = "6px";
    dot.style.borderRadius = "50%";
    dot.style.background = dots.includes(i) ? "#000" : "transparent";
    inner.appendChild(dot);
  }
  miniDice.appendChild(inner);
}

// Animate dice rolling effect
function animateDiceRoll(diceEl, cb) {
  if (!diceEl) return cb && cb();
  diceEl.classList.add("rolling");
  setTimeout(() => {
    diceEl.classList.remove("rolling");
    if (cb) cb();
  }, 600);
}

// Track finish order
let finishOrder = [];

function displayFinishRank(color, rank) {
  // Map color to home cell
  const homeCellMap = {
    red: hOne,
    green: hTwo,
    blue: hThree,
    yellow: hFOur,
  };
  const cell = homeCellMap[color];
  if (cell) {
    let rankDiv = cell.querySelector(".finish-rank");
    if (!rankDiv) {
      rankDiv = document.createElement("div");
      rankDiv.className = "finish-rank";

      cell.style.position = "relative";
      cell.appendChild(rankDiv);
    }
    rankDiv.textContent = rank;
  }
}

function removePlayerFromGame(color) {
  // Add to finish order and display rank
  if (!finishOrder.includes(color)) {
    finishOrder.push(color);
    displayFinishRank(color, finishOrder.length);
  }

  // Remove player from turn order and update turn if needed
  const idx = players.indexOf(color);
  if (idx !== -1) {
    players.splice(idx, 1);
    // If the removed player is before or at the currentPlayerIndex, adjust currentPlayerIndex
    if (idx <= currentPlayerIndex) {
      currentPlayerIndex =
        (currentPlayerIndex - 1 + players.length) % players.length;
    }
    // Disable their dice button
    const btnWrapper = document.getElementById(`${color}Btn`);
    const buttonEl = btnWrapper?.querySelector("button");
    if (buttonEl) {
      buttonEl.disabled = true;
      buttonEl.style.opacity = "0.5";
      buttonEl.style.cursor = "not-allowed";
    }
  }

  // Show 'The End' if first three players finished
  if (finishOrder.length === 3) {
    setGameOver();
  }
  
}

// Automatically move the last piece of the current player when only one piece remains outside the win box
function autoMoveLastPiece(player, steps, callback) {
  // Find the only piece not in win box
  const pieces = Array.from(document.querySelectorAll(`.piece.${player}`));
  const lastPiece = pieces.find((p) => !isInWinBox(p));
  if (!lastPiece) {
    if (callback) callback();
    return;
  }
  const path = getPathForPiece(lastPiece);
  let currentPos = parseInt(lastPiece.dataset.position || 0);
  const moveTo = currentPos + steps;
  if (moveTo >= path.length) {
    if (callback) callback();
    return;
  } // Can't move out of bounds

  let collisionHappened = false;

  // Animate step by step
  for (let step = 1; step <= moveTo - currentPos; step++) {
    setTimeout(() => {
      playSound("sounds/stepSound.mp3"); // Play sound for each step
      const nextCell = cells[path[currentPos + step]];
      nextCell.appendChild(lastPiece);
      lastPiece.classList.add("bouncing");
      lastPiece.addEventListener(
        "animationend",
        () => {
          lastPiece.classList.remove("bouncing");
        },
        { once: true }
      );

      // On last step, check for collision and win
      if (step === moveTo - currentPos) {
        lastPiece.dataset.position = moveTo;
        // Check for collision (enemy piece)
        const collision = handleCollision(lastPiece);
        if (collision) collisionHappened = true;
        // Check win box
        if (path[moveTo] === 12) {
          reachWinBox(lastPiece, moveTo);
          playSound("sounds/playerwinSound.mp3"); // Play win sound
        }
        // Extra move if rolled 4 or collision
        if (steps === 4 || collisionHappened) {
          enableDiceForCurrentPlayer();
        } else {
          if (callback) setTimeout(callback, 350);
        }
      }
    }, step * 300);
  }
}

// Game over flag
let gameOver = false;
// Call this to end the game and block all further actions
function setGameOver() {
  gameOver = true;
  // Disable all dice buttons
  players.forEach((player) => {
    const btnWrapper = document.getElementById(`${player}Btn`);
    const buttonEl = btnWrapper?.querySelector("button");
    if (buttonEl) {
      buttonEl.disabled = true;
      buttonEl.style.opacity = "0.5";
      buttonEl.style.cursor = "not-allowed";
    }
  });
  // Remove all piece click events
  document.querySelectorAll(".piece").forEach((piece) => {
    piece.removeEventListener("click", handlePieceClick);
    piece.style.cursor = "default";
  });
  // Show end message
  const endDiv = document.createElement("div");
  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset Game";
  resetButton.className = "reset-button";
  resetButton.style.zIndex = "9999";
  resetButton.addEventListener("click", () => {
    location.reload();
  });
  endDiv.textContent = `The End! Finish order: ${finishOrder.join(", ")}`;
  endDiv.className = "the-end-message";
  document.body.appendChild(endDiv);
  endDiv.appendChild(resetButton);
  console.log("finish order:", finishOrder);
}

let audioContext = null;
// General sound function: pass filename each time you want to play a sound
function playSound(filename) {
  if (!audioContext)
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  fetch(filename)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
    .then((buffer) => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.destination);
      source.start(0);
    });
}


