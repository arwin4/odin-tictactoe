/* eslint-disable no-console */

// This program takes heavy inspiration from
// https://www.ayweb.dev/blog/building-a-house-from-the-inside-out

// TODO: Add underscore to private variables

const playerFactory = (name, marker) => {
  const getName = () => name;
  const getMarker = () => marker;

  return { getName, getMarker };
};

const gameBoard = (() => {
  // Initialize empty board, a two-dimensional array
  // null = blank cell.
  const gameBoardArray = [];
  for (let i = 0; i < 3; i += 1) {
    gameBoardArray[i] = [];
    for (let j = 0; j < 3; j += 1) {
      gameBoardArray[i].push(null);
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

    // Check for horizontal wins
    for (let i = 0; i < 3; i += 1) {
      const row = gameBoardArray[i];
      if (row.every((cell) => cell === marker)) {
        return true;
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
        return true;
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
      return true;
    }

    // If there's no winner but the board is full, it's a draw.
    // Check whether every cell isn't still null.
    if (gameBoardArray.every((row) => row.every((cell) => cell !== null))) {
      return false;
    }

    // No game ending state found
    return undefined;
  }

  const getGameBoard = () => gameBoardArray;

  function printGameBoard() {
    console.log(gameBoardArray[0]);
    console.log(gameBoardArray[1]);
    console.log(gameBoardArray[2]);
  }

  return { getGameBoard, makeMove, printGameBoard, checkForWin };
})();

const gameController = (() => {
  // function setPlayers(player1, marker1, player2, marker2) {
  //   // set player properties from DOM

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
    // Have user try again if their move was invalid.
    if (gameBoard.makeMove(x, y, activePlayer.getMarker()) === false) {
      console.log("Sorry, that move isn't valid. Please try again.");
      printNewRound();
      return false;
    }

    // Check for a win or draw
    switch (gameBoard.checkForWin(activePlayer.getMarker())) {
      case true:
        console.log(`${activePlayer.getName()} wins!`);
        screenController.deactivateClickableBoard();
        break;
      case false:
        console.log("It's a draw.");
        screenController.deactivateClickableBoard();
        break;
      case undefined:
        console.log('No win or draw detected');
        // No win or draw detected, game continues.
        break;
      default:
        break;
    }

    console.log(`${activePlayer.getName()} made this move:`);
    printNewRound();
    switchPlayerTurn();
    return true;
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
      board.appendChild(cell);
    }
  }

  function updateScreen(button) {
    const btn = button;
    console.log(`It's ${gameController.getActivePlayer().getName()}'s turn.`);

    // Show the move on the board
    // TODO: remove need for the active player's marker swap (allow direct
    // passing of the marker)
    if (gameController.getActivePlayer().getMarker() === 'X') {
      btn.textContent = 'O';
    } else {
      btn.textContent = 'X';
    }
  }

  function clickHandlerBoard(e) {
    const xPosition = e.target.getAttribute('xPosition');
    const yPosition = e.target.getAttribute('yPosition');
    // Update the screen if the move was valid
    if (gameController.playRound(xPosition, yPosition) === true) {
      updateScreen(e.target);
    }
  }

  function activateClickableBoard() {
    board.addEventListener('click', clickHandlerBoard);
  }

  function deactivateClickableBoard() {
    board.removeEventListener('click', clickHandlerBoard);
  }

  activateClickableBoard();

  return { updateScreen, deactivateClickableBoard };
})();
