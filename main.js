/* eslint-disable no-console */

// This program takes heavy inspiration from
// https://www.ayweb.dev/blog/building-a-house-from-the-inside-out

// TODO: Add underscore to private variables
// TODO: Make player 1 always go first (even after the new game button is used)

const playerFactory = (name, marker) => {
  const getName = () => name;
  const getMarker = () => marker;

  return { getName, getMarker };
};

const gameBoard = (() => {
  const gameBoardArray = [];

  function resetBoard() {
    // Initialize empty board, a two-dimensional array
    // null = blank cell.
    for (let i = 0; i < 3; i += 1) {
      gameBoardArray[i] = [];
      for (let j = 0; j < 3; j += 1) {
        gameBoardArray[i].push(null);
      }
    }
  }

  function makeMove(x, y, marker) {
    // Discard move if coordinate is outside board
    if (
      gameBoardArray[y - 1] === undefined ||
      gameBoardArray[x - 1] === undefined
    )
      return false;

    // Place marker if cell is blank
    if (gameBoardArray[y - 1][x - 1] === null) {
      gameBoardArray[y - 1][x - 1] = marker;
      // also return checkForWin(marker)
      return true;
    }
    return false;
  }

  function checkForWin(marker) {
    // Check for a win first. If there's none, check for a draw.
    // NOTE: I realize it's faster to check against a list of all win
    // conditions, since that's a fairly short one, but to practice, I wanted to
    // write down more of the actual logic of the game.

    const result = { gameFinished: false, isResultDraw: false };

    // Check for horizontal wins
    for (let i = 0; i < 3; i += 1) {
      const row = gameBoardArray[i];
      if (row.every((cell) => cell === marker)) {
        result.gameFinished = true;
        result.isResultDraw = false;
        return result;
      }
    }

    // Check for vertical wins
    // TODO: find wins like horizontal using every()
    for (let i = 0; i < 3; i += 1) {
      if (
        gameBoardArray[0][i] === marker &&
        gameBoardArray[1][i] === marker &&
        gameBoardArray[2][i] === marker
      ) {
        result.gameFinished = true;
        result.isResultDraw = false;
        return result;
      }
    }

    // Check for diagonal wins
    if (
      (gameBoardArray[0][0] === marker &&
        gameBoardArray[1][1] === marker &&
        gameBoardArray[2][2] === marker) ||
      (gameBoardArray[0][2] === marker &&
        gameBoardArray[1][1] === marker &&
        gameBoardArray[2][0] === marker)
    ) {
      result.gameFinished = true;
      result.isResultDraw = false;
      return result;
    }

    // If there's no winner but the board is full, it's a draw.
    // Check whether every cell isn't still null.
    if (gameBoardArray.every((row) => row.every((cell) => cell !== null))) {
      result.gameFinished = true;
      result.isResultDraw = true;
      return result;
    }

    // No game ending state found
    return result;
  }

  const getGameBoard = () => gameBoardArray;

  function printGameBoard() {
    console.log(gameBoardArray[0]);
    console.log(gameBoardArray[1]);
    console.log(gameBoardArray[2]);
  }

  resetBoard();

  return { getGameBoard, makeMove, printGameBoard, checkForWin, resetBoard };
})();

const gameController = (() => {
  function setPlayers() {
    const player1 = playerFactory('Player 1', 'X');
    const player2 = playerFactory('Player 2', 'O');

    return [player1, player2];
  }

  const players = setPlayers();
  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  function printNewRound() {
    gameBoard.printGameBoard();
    // console.log(`It's ${activePlayer.getName()}'s turn.`);
  }

  function playRound(x, y) {
    let roundResult = { validMove: null };

    // If the move is invalid, pass that on
    if (gameBoard.makeMove(x, y, activePlayer.getMarker()) === false) {
      roundResult.validMove = false;
      console.log(roundResult);
      return roundResult;
    }

    // If the move is valid, check for a win
    roundResult.validMove = true;

    roundResult = gameBoard.checkForWin(activePlayer.getMarker());
    if (roundResult.gameFinished === true) {
      // End the game
      console.log(activePlayer.getName());
      console.log(roundResult);
      roundResult.winner = activePlayer.getName();
      switchPlayerTurn();
      return roundResult;
    }

    // If the move was valid, but there's no win or draw, continue.
    switchPlayerTurn();
    console.log(roundResult);
    return roundResult;
  }

  function getActivePlayer() {
    return activePlayer;
  }

  printNewRound();

  return { playRound, getActivePlayer };
})();

const screenController = (() => {
  // Render the board
  const board = document.querySelector('.gameboard');

  // Create the cells with coordinate attributes so that they can be passed on
  // to gameRound(x, y)

  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 3; j += 1) {
      const cell = document.createElement('button');
      cell.setAttribute('xPosition', j + 1);
      cell.setAttribute('yPosition', i + 1);
      cell.classList.add('cell');
      board.appendChild(cell);
    }
  }

  const allCells = board.childNodes;

  function endGame(roundResult) {
    // Deactivate the board and show win message
    deactivateClickableBoard();

    const { isResultDraw } = roundResult;
    const { winner } = roundResult;

    // Show win message
    const winMessage = document.createElement('div');
    if (isResultDraw === false) {
      winMessage.textContent = `${winner} wins this round!`;
    } else {
      winMessage.textContent = "Tic-tac-TIE!! I'll see myself out...";
    }

    const winMessageDiv = document.querySelector('.win-message');
    winMessageDiv.appendChild(winMessage);
  }

  function updateScreen(button) {
    const btn = button;
    const xPosition = button.getAttribute('xPosition');
    const yPosition = button.getAttribute('yPosition');
    const roundResult = gameController.playRound(xPosition, yPosition);
    console.log(roundResult);

    // If the move was invalid, ignore it
    if (roundResult.validMove === false) return;

    // Show the move on the board
    // TODO: remove need for the active player's marker swap (allow direct
    // passing of the marker)
    if (gameController.getActivePlayer().getMarker() === 'X') {
      btn.classList.toggle('circle');
    } else {
      btn.classList.toggle('cross');
    }

    btn.disabled = true;

    if (roundResult.gameFinished === true) endGame(roundResult);
  }

  function clickHandlerBoard(e) {
    updateScreen(e.target);
  }

  function activateClickableBoard() {
    allCells.forEach((cell) => {
      const tempCell = cell;
      tempCell.disabled = false;
      tempCell.classList.remove('closed');
    });
  }

  function deactivateClickableBoard() {
    allCells.forEach((cell) => {
      const tempCell = cell;
      tempCell.disabled = true;
      tempCell.classList.add('closed');
    });
  }

  function newGame() {
    gameBoard.resetBoard();
    activateClickableBoard();

    // Empty all the cells on screen
    allCells.forEach((cell) => {
      const tempCell = cell;
      tempCell.classList.remove('circle', 'cross');
    });
  }

  function handleControls() {
    board.addEventListener('click', clickHandlerBoard);

    const newGameBtn = document.querySelector('.new-game');
    newGameBtn.addEventListener('click', newGame);
  }

  handleControls();
})();
